import { create } from 'zustand';

interface MCPMessage {
  readonly id: string;
  readonly type: 'request' | 'response' | 'notification' | 'error';
  readonly method?: string;
  readonly params?: any;
  readonly result?: any;
  readonly error?: {
    readonly code: number;
    readonly message: string;
    readonly data?: any;
  };
}

interface GenerationProgress {
  readonly status: 'idle' | 'connecting' | 'generating' | 'completed' | 'error';
  readonly progress: number;
  readonly message: string;
  readonly generatedFiles?: string[];
  readonly error?: string;
}

interface WebSocketState {
  readonly socket: WebSocket | null;
  readonly isConnected: boolean;
  readonly connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  readonly lastError: string | null;
  readonly generationProgress: GenerationProgress;
  readonly messageQueue: MCPMessage[];
  
  // Actions
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly sendMessage: (message: MCPMessage) => void;
  readonly clearError: () => void;
  readonly updateProgress: (progress: Partial<GenerationProgress>) => void;
}

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'wss://mcp.xaheen.no/v1';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  lastError: null,
  generationProgress: {
    status: 'idle',
    progress: 0,
    message: '',
    generatedFiles: [],
  },
  messageQueue: [],

  connect: () => {
    const state = get();
    
    // Don't reconnect if already connected or connecting
    if (state.connectionStatus === 'connected' || state.connectionStatus === 'connecting') {
      return;
    }

    set({ connectionStatus: 'connecting', lastError: null });

    try {
      const socket = new WebSocket(MCP_SERVER_URL);
      let reconnectAttempts = 0;

      socket.onopen = () => {
        console.log('WebSocket connected to MCP server');
        set({ 
          socket, 
          isConnected: true, 
          connectionStatus: 'connected',
          lastError: null 
        });
        
        // Send any queued messages
        const queue = get().messageQueue;
        if (queue.length > 0) {
          queue.forEach(msg => socket.send(JSON.stringify(msg)));
          set({ messageQueue: [] });
        }
      };

      socket.onmessage = (event) => {
        try {
          const message: MCPMessage = JSON.parse(event.data);
          
          // Handle different message types
          switch (message.type) {
            case 'notification':
              if (message.method === 'generation/progress') {
                const { progress, message: progressMessage, status } = message.params || {};
                set(state => ({
                  generationProgress: {
                    ...state.generationProgress,
                    progress: progress || state.generationProgress.progress,
                    message: progressMessage || state.generationProgress.message,
                    status: status || state.generationProgress.status,
                  }
                }));
              } else if (message.method === 'generation/file-created') {
                const { file } = message.params || {};
                set(state => ({
                  generationProgress: {
                    ...state.generationProgress,
                    generatedFiles: [...(state.generationProgress.generatedFiles || []), file],
                  }
                }));
              }
              break;
              
            case 'response':
              if (message.result?.status === 'completed') {
                set(state => ({
                  generationProgress: {
                    ...state.generationProgress,
                    status: 'completed',
                    progress: 100,
                    message: 'Generation completed successfully!',
                  }
                }));
              }
              break;
              
            case 'error':
              set(state => ({
                lastError: message.error?.message || 'Unknown error occurred',
                generationProgress: {
                  ...state.generationProgress,
                  status: 'error',
                  error: message.error?.message,
                }
              }));
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ 
          lastError: 'WebSocket connection error',
          connectionStatus: 'error' 
        });
      };

      socket.onclose = () => {
        set({ 
          socket: null, 
          isConnected: false, 
          connectionStatus: 'disconnected' 
        });
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
          
          setTimeout(() => {
            get().connect();
          }, delay);
        } else {
          set({ 
            lastError: 'Maximum reconnection attempts reached',
            connectionStatus: 'error' 
          });
        }
      };

      set({ socket });
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      set({ 
        lastError: 'Failed to create WebSocket connection',
        connectionStatus: 'error' 
      });
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ 
        socket: null, 
        isConnected: false, 
        connectionStatus: 'disconnected' 
      });
    }
  },

  sendMessage: (message: MCPMessage) => {
    const { socket, isConnected } = get();
    
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      set(state => ({
        messageQueue: [...state.messageQueue, message]
      }));
      
      // Attempt to connect if not already connected
      if (!isConnected) {
        get().connect();
      }
    }
  },

  clearError: () => {
    set({ lastError: null });
  },

  updateProgress: (progress: Partial<GenerationProgress>) => {
    set(state => ({
      generationProgress: {
        ...state.generationProgress,
        ...progress,
      }
    }));
  },
}));

// Helper function to generate unique message IDs
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to send generation request
export function sendGenerationRequest(config: {
  prompt: string;
  platform: string;
  features: string[];
  nsmClassification: string;
}): void {
  const store = useWebSocketStore.getState();
  
  store.updateProgress({
    status: 'generating',
    progress: 0,
    message: 'Initializing generation...',
    generatedFiles: [],
    error: undefined,
  });
  
  store.sendMessage({
    id: generateMessageId(),
    type: 'request',
    method: 'generate',
    params: {
      type: 'multi-platform',
      name: 'ai-generated-project',
      prompt: config.prompt,
      platform: config.platform,
      features: config.features,
      compliance: {
        nsm: config.nsmClassification,
        gdpr: config.features.includes('gdpr'),
        wcag: config.features.includes('wcag') ? 'AAA' : 'AA',
        bankid: config.features.includes('bankid'),
        altinn: config.features.includes('altinn'),
      },
      options: {
        includeTests: true,
        includeStories: true,
        includeDocs: true,
        includeLocalization: true,
      }
    }
  });
}

// Auto-connect on initialization (in browser only)
if (typeof window !== 'undefined') {
  // Connect when the app loads
  setTimeout(() => {
    useWebSocketStore.getState().connect();
  }, 100);
}