/**
 * Slack Integration
 * Provides Slack SDK configuration and component generation
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export interface GenerationResult {
  success: boolean;
  files: string[];
  errors?: string[];
  warnings?: string[];
}

export interface IntegrationOptions {
  projectName: string;
  outputPath?: string;
  framework?: 'react' | 'nextjs' | 'remix' | 'svelte' | 'vue';
  typescript?: boolean;
  features?: ('bot' | 'webhook' | 'notifications' | 'slash-commands' | 'interactive' | 'oauth')[];
  botToken?: string;
  appToken?: string;
  signingSecret?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
}

export interface SlackConfig {
  botToken: string;
  appToken: string;
  signingSecret: string;
  clientId: string;
  clientSecret: string;
  socketMode: boolean;
  scopes: string[];
  features: {
    bot: boolean;
    webhook: boolean;
    notifications: boolean;
    slashCommands: boolean;
    interactive: boolean;
    oauth: boolean;
  };
}

/**
 * Slack SDK Configuration
 */
export class SlackSdkConfig {
  private config: SlackConfig;

  constructor(options: Partial<IntegrationOptions> = {}) {
    this.config = {
      botToken: options.botToken || process.env.SLACK_BOT_TOKEN || '',
      appToken: options.appToken || process.env.SLACK_APP_TOKEN || '',
      signingSecret: options.signingSecret || process.env.SLACK_SIGNING_SECRET || '',
      clientId: options.clientId || process.env.SLACK_CLIENT_ID || '',
      clientSecret: options.clientSecret || process.env.SLACK_CLIENT_SECRET || '',
      socketMode: !!options.appToken,
      scopes: options.scopes || [
        'chat:write',
        'channels:read',
        'groups:read',
        'im:read',
        'mpim:read',
        'users:read',
        'commands',
      ],
      features: {
        bot: options.features?.includes('bot') ?? true,
        webhook: options.features?.includes('webhook') ?? true,
        notifications: options.features?.includes('notifications') ?? true,
        slashCommands: options.features?.includes('slash-commands') ?? true,
        interactive: options.features?.includes('interactive') ?? true,
        oauth: options.features?.includes('oauth') ?? false,
      },
    };
  }

  getConfig(): SlackConfig {
    return this.config;
  }

  getScopes(): string[] {
    return this.config.scopes;
  }

  isSocketMode(): boolean {
    return this.config.socketMode;
  }
}

/**
 * Generate Slack integration component
 */
export async function generateSlackComponent(options: IntegrationOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      framework = 'react',
      typescript = true,
      features = ['notifications', 'webhook'],
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'components', 'slack');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const extension = typescript ? '.tsx' : '.jsx';

    // Slack Notification Component
    if (features.includes('notifications')) {
      const notificationContent = `import React, { useState } from 'react';
${typescript ? `
interface SlackNotificationProps {
  defaultChannel?: string;
  allowChannelSelection?: boolean;
  onSuccess?: (result: { channel: string; messageId: string }) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
}
` : ''}

/**
 * Slack Notification Component
 * Sends notifications to Slack channels
 */
export const SlackNotification${typescript ? ': React.FC<SlackNotificationProps>' : ''} = ({
  defaultChannel = '',
  allowChannelSelection = true,
  onSuccess,
  onError,
  className = '',
}) => {
  const [channel, setChannel] = useState(defaultChannel);
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState${typescript ? '<SlackChannel[]>' : ''}([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState${typescript ? '<any[]>' : ''}([]);

  // Load channels on component mount
  React.useEffect(() => {
    if (allowChannelSelection) {
      loadChannels();
    }
  }, [allowChannelSelection]);

  const loadChannels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/slack/channels');
      if (!response.ok) throw new Error('Failed to load channels');
      
      const data = await response.json();
      setChannels(data.channels);
      
      // Set default channel if not specified
      if (!channel && data.channels.length > 0) {
        setChannel(data.channels[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!channel || !message.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/slack/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          text: message,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      onSuccess?.(result);
      
      // Reset form
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsSending(false);
    }
  };

  const addAttachment = () => {
    setAttachments([...attachments, {
      color: '#36a64f',
      title: '',
      text: '',
      fields: [],
    }]);
  };

  const updateAttachment = (index${typescript ? ': number' : ''}, field${typescript ? ': string' : ''}, value${typescript ? ': any' : ''}) => {
    const updated = [...attachments];
    updated[index] = { ...updated[index], [field]: value };
    setAttachments(updated);
  };

  const removeAttachment = (index${typescript ? ': number' : ''}) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className={\`slack-notification \${className}\`}>
      <div className="space-y-4">
        {allowChannelSelection && (
          <div>
            <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-2">
              Channel
            </label>
            {isLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : (
              <select
                id="channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSending}
              >
                <option value="">Select a channel</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.is_private ? '🔒' : '#'} {ch.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isSending}
          />
          <p className="text-sm text-gray-500 mt-1">
            You can use Slack markdown formatting
          </p>
        </div>

        {/* Attachments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Attachments
            </label>
            <button
              type="button"
              onClick={addAttachment}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              + Add Attachment
            </button>
          </div>

          {attachments.map((attachment, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium">Attachment {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <input
                type="text"
                value={attachment.title}
                onChange={(e) => updateAttachment(index, 'title', e.target.value)}
                placeholder="Title"
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
              />
              
              <textarea
                value={attachment.text}
                onChange={(e) => updateAttachment(index, 'text', e.target.value)}
                placeholder="Text"
                rows={2}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
              />
              
              <select
                value={attachment.color}
                onChange={(e) => updateAttachment(index, 'color', e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="#36a64f">Good (Green)</option>
                <option value="#ff9f00">Warning (Orange)</option>
                <option value="#d00000">Danger (Red)</option>
                <option value="#439fe0">Info (Blue)</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setMessage('');
              setAttachments([]);
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSending}
          >
            Clear
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isSending || !channel || !message.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};`;

      fs.writeFileSync(path.join(outputDir, `SlackNotification${extension}`), notificationContent, 'utf-8');
      result.files.push(path.join(outputDir, `SlackNotification${extension}`));
    }

    // Slack OAuth Component
    if (features.includes('oauth')) {
      const oauthContent = `import React, { useState, useEffect } from 'react';
${typescript ? `
interface SlackOAuthProps {
  onSuccess?: (workspace: SlackWorkspace) => void;
  onError?: (error: Error) => void;
  scopes?: string[];
  className?: string;
}

interface SlackWorkspace {
  id: string;
  name: string;
  domain: string;
  icon?: {
    image_34: string;
    image_44: string;
    image_68: string;
    image_88: string;
  };
  access_token: string;
  bot_user_id?: string;
}
` : ''}

/**
 * Slack OAuth Component
 * Handles Slack workspace authentication
 */
export const SlackOAuth${typescript ? ': React.FC<SlackOAuthProps>' : ''} = ({
  onSuccess,
  onError,
  scopes = ['chat:write', 'channels:read', 'users:read'],
  className = '',
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [workspace, setWorkspace] = useState${typescript ? '<SlackWorkspace | null>' : ''}(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      setError(\`Authentication failed: \${error}\`);
      onError?.(new Error(error));
    } else if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code${typescript ? ': string' : ''}, state${typescript ? ': string' : ''}) => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/slack/oauth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        throw new Error('OAuth callback failed');
      }

      const data = await response.json();
      setWorkspace(data.workspace);
      onSuccess?.(data.workspace);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      const message = error${typescript ? ' as Error' : ''}.message || 'Authentication failed';
      setError(message);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsConnecting(false);
    }
  };

  const initiateOAuth = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const response = await fetch('/api/slack/oauth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scopes }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth');
      }

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      const message = error${typescript ? ' as Error' : ''}.message || 'Failed to start authentication';
      setError(message);
      onError?.(error${typescript ? ' as Error' : ''});
      setIsConnecting(false);
    }
  };

  const disconnectWorkspace = async () => {
    if (!workspace) return;

    try {
      await fetch('/api/slack/oauth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });

      setWorkspace(null);
    } catch (error) {
      console.error('Failed to disconnect workspace:', error);
    }
  };

  if (workspace) {
    return (
      <div className={\`slack-oauth connected \${className}\`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {workspace.icon && (
                <img
                  src={workspace.icon.image_68}
                  alt={workspace.name}
                  className="w-12 h-12 rounded"
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{workspace.name}</h3>
                <p className="text-sm text-gray-500">{workspace.domain}.slack.com</p>
              </div>
            </div>
            <button
              onClick={disconnectWorkspace}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={\`slack-oauth \${className}\`}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect to Slack
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your Slack workspace to enable notifications and integrations
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          onClick={initiateOAuth}
          disabled={isConnecting}
          className="inline-flex items-center px-6 py-3 bg-[#4A154B] text-white rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
              Add to Slack
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 mt-3">
          We'll request the following permissions: {scopes.join(', ')}
        </p>
      </div>
    </div>
  );
};`;

      fs.writeFileSync(path.join(outputDir, `SlackOAuth${extension}`), oauthContent, 'utf-8');
      result.files.push(path.join(outputDir, `SlackOAuth${extension}`));
    }

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Slack component generation failed: ${error.message}`);
  }

  return result;
}

/**
 * Generate Slack service
 */
export async function generateSlackService(options: IntegrationOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      typescript = true,
      features = ['bot', 'webhook', 'notifications'],
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'services', 'slack');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const serviceContent = `${typescript ? `import type { 
  Block, 
  KnownBlock, 
  MessageAttachment,
  ChatPostMessageArguments,
  WebAPICallResult 
} from '@slack/web-api';
import type { SlashCommand, InteractiveMessage } from '@slack/bolt';` : ''}
import { WebClient } from '@slack/web-api';
${features.includes('bot') ? "import { App } from '@slack/bolt';" : ''}
import crypto from 'crypto';

/**
 * Slack Service for ${projectName}
 * Handles Slack integrations and communications
 */
export class SlackService {
  private client${typescript ? ': WebClient' : ''};
  ${features.includes('bot') ? `private app${typescript ? ': App | null' : ''} = null;` : ''}
  private signingSecret${typescript ? ': string' : ''};
  private config${typescript ? ': SlackConfig' : ''};

  constructor(config${typescript ? ': SlackConfig' : ''}) {
    this.config = config;
    this.client = new WebClient(config.botToken);
    this.signingSecret = config.signingSecret;
    
    ${features.includes('bot') ? `
    if (config.features.bot) {
      this.initializeBot();
    }
    ` : ''}
  }

  ${features.includes('bot') ? `
  /**
   * Initialize Slack Bot
   */
  private async initializeBot() {
    try {
      this.app = new App({
        token: this.config.botToken,
        signingSecret: this.config.signingSecret,
        socketMode: this.config.socketMode,
        appToken: this.config.socketMode ? this.config.appToken : undefined,
      });

      // Register command handlers
      this.registerCommands();
      
      // Register event handlers
      this.registerEvents();
      
      // Register interactive handlers
      this.registerInteractive();

      // Start the app
      if (this.config.socketMode) {
        await this.app.start();
        console.log('⚡️ Slack bot is running in Socket Mode!');
      }
    } catch (error) {
      console.error('Failed to initialize Slack bot:', error);
    }
  }

  private registerCommands() {
    if (!this.app) return;

    // Example: /hello command
    this.app.command('/hello', async ({ command, ack, respond }) => {
      await ack();
      await respond(\`Hello <@\${command.user_id}>! 👋\`);
    });

    // Example: /status command
    this.app.command('/status', async ({ command, ack, respond }) => {
      await ack();
      
      const blocks${typescript ? ': KnownBlock[]' : ''} = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*System Status* 🟢',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*API:* Operational',
            },
            {
              type: 'mrkdwn',
              text: '*Database:* Healthy',
            },
            {
              type: 'mrkdwn',
              text: '*Cache:* Active',
            },
            {
              type: 'mrkdwn',
              text: '*Queue:* 0 pending',
            },
          ],
        },
      ];

      await respond({ blocks });
    });
  }

  private registerEvents() {
    if (!this.app) return;

    // Handle app mentions
    this.app.event('app_mention', async ({ event, say }) => {
      await say(\`Hi <@\${event.user}>! How can I help you?\`);
    });

    // Handle messages
    this.app.message('help', async ({ message, say }) => {
      await say({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Available Commands:*\\n• \`/hello\` - Say hello\\n• \`/status\` - Check system status\\n• Type "help" for this message',
            },
          },
        ],
      });
    });
  }

  private registerInteractive() {
    if (!this.app) return;

    // Handle button clicks
    this.app.action('button_click', async ({ body, ack, respond }) => {
      await ack();
      await respond('Button clicked!');
    });

    // Handle select menus
    this.app.action('select_option', async ({ body, ack, respond }) => {
      await ack();
      await respond('Option selected!');
    });
  }
  ` : ''}

  /**
   * Send a message to a Slack channel
   */
  async sendMessage(
    channel${typescript ? ': string' : ''}, 
    text${typescript ? ': string' : ''}, 
    options${typescript ? '?: Partial<ChatPostMessageArguments>' : ''} = {}
  )${typescript ? ': Promise<WebAPICallResult>' : ''} {
    try {
      const result = await this.client.chat.postMessage({
        channel,
        text,
        ...options,
      });

      return result;
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  }

  /**
   * Send a rich message with blocks
   */
  async sendBlockMessage(
    channel${typescript ? ': string' : ''}, 
    blocks${typescript ? ': KnownBlock[]' : ''}, 
    text${typescript ? ': string' : ''} = 'New message'
  )${typescript ? ': Promise<WebAPICallResult>' : ''} {
    try {
      const result = await this.client.chat.postMessage({
        channel,
        text, // Fallback text
        blocks,
      });

      return result;
    } catch (error) {
      console.error('Error sending block message:', error);
      throw error;
    }
  }

  /**
   * Send a message with attachments
   */
  async sendAttachmentMessage(
    channel${typescript ? ': string' : ''}, 
    attachments${typescript ? ': MessageAttachment[]' : ''}, 
    text${typescript ? ': string' : ''} = 'New message'
  )${typescript ? ': Promise<WebAPICallResult>' : ''} {
    try {
      const result = await this.client.chat.postMessage({
        channel,
        text,
        attachments,
      });

      return result;
    } catch (error) {
      console.error('Error sending attachment message:', error);
      throw error;
    }
  }

  /**
   * Send a threaded reply
   */
  async sendThreadReply(
    channel${typescript ? ': string' : ''}, 
    threadTs${typescript ? ': string' : ''}, 
    text${typescript ? ': string' : ''}, 
    options${typescript ? '?: Partial<ChatPostMessageArguments>' : ''} = {}
  )${typescript ? ': Promise<WebAPICallResult>' : ''} {
    try {
      const result = await this.client.chat.postMessage({
        channel,
        text,
        thread_ts: threadTs,
        ...options,
      });

      return result;
    } catch (error) {
      console.error('Error sending thread reply:', error);
      throw error;
    }
  }

  /**
   * Update an existing message
   */
  async updateMessage(
    channel${typescript ? ': string' : ''}, 
    ts${typescript ? ': string' : ''}, 
    text${typescript ? ': string' : ''}, 
    options${typescript ? '?: any' : ''} = {}
  )${typescript ? ': Promise<WebAPICallResult>' : ''} {
    try {
      const result = await this.client.chat.update({
        channel,
        ts,
        text,
        ...options,
      });

      return result;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(channel${typescript ? ': string' : ''}, ts${typescript ? ': string' : ''})${typescript ? ': Promise<WebAPICallResult>' : ''} {
    try {
      const result = await this.client.chat.delete({
        channel,
        ts,
      });

      return result;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Get channel list
   */
  async getChannels(includePrivate${typescript ? ': boolean' : ''} = false)${typescript ? ': Promise<any[]>' : ''} {
    try {
      const result = await this.client.conversations.list({
        types: includePrivate ? 'public_channel,private_channel' : 'public_channel',
        exclude_archived: true,
      });

      return result.channels || [];
    } catch (error) {
      console.error('Error getting channels:', error);
      throw error;
    }
  }

  /**
   * Get channel members
   */
  async getChannelMembers(channel${typescript ? ': string' : ''})${typescript ? ': Promise<string[]>' : ''} {
    try {
      const result = await this.client.conversations.members({
        channel,
      });

      return result.members || [];
    } catch (error) {
      console.error('Error getting channel members:', error);
      throw error;
    }
  }

  /**
   * Get user info
   */
  async getUserInfo(userId${typescript ? ': string' : ''})${typescript ? ': Promise<any>' : ''} {
    try {
      const result = await this.client.users.info({
        user: userId,
      });

      return result.user;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(
    channels${typescript ? ': string[]' : ''}, 
    file${typescript ? ': Buffer | string' : ''}, 
    filename${typescript ? ': string' : ''}, 
    options${typescript ? '?: any' : ''} = {}
  )${typescript ? ': Promise<WebAPICallResult>' : ''} {
    try {
      const result = await this.client.files.upload({
        channels: channels.join(','),
        file,
        filename,
        ...options,
      });

      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  ${features.includes('webhook') ? `
  /**
   * Verify Slack webhook signature
   */
  verifyWebhookSignature(
    signature${typescript ? ': string' : ''}, 
    timestamp${typescript ? ': string' : ''}, 
    body${typescript ? ': string' : ''}
  )${typescript ? ': boolean' : ''} {
    const hmac = crypto.createHmac('sha256', this.signingSecret);
    const data = \`v0:\${timestamp}:\${body}\`;
    hmac.update(data);
    const computedSignature = \`v0=\${hmac.digest('hex')}\`;
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(payload${typescript ? ': any' : ''})${typescript ? ': Promise<any>' : ''} {
    // Handle different webhook types
    switch (payload.type) {
      case 'url_verification':
        return { challenge: payload.challenge };
      
      case 'event_callback':
        await this.handleEvent(payload.event);
        return { ok: true };
      
      case 'interactive_message':
        await this.handleInteractive(payload);
        return { ok: true };
      
      case 'slash_command':
        return await this.handleSlashCommand(payload);
      
      default:
        console.warn('Unknown webhook type:', payload.type);
        return { ok: true };
    }
  }

  private async handleEvent(event${typescript ? ': any' : ''}) {
    console.log('Handling event:', event.type);
    // Implement event handling logic
  }

  private async handleInteractive(payload${typescript ? ': any' : ''}) {
    console.log('Handling interactive:', payload.callback_id);
    // Implement interactive message handling
  }

  private async handleSlashCommand(command${typescript ? ': any' : ''})${typescript ? ': Promise<any>' : ''} {
    console.log('Handling slash command:', command.command);
    // Implement slash command handling
    return { text: \`Command \${command.command} received\` };
  }
  ` : ''}

  /**
   * Send notification
   */
  async sendNotification(
    channel${typescript ? ': string' : ''}, 
    title${typescript ? ': string' : ''}, 
    message${typescript ? ': string' : ''}, 
    options${typescript ? '?: NotificationOptions' : ''} = {}
  ) {
    const { type = 'info', fields, actions } = options;
    
    const color = {
      info: '#439fe0',
      success: '#36a64f',
      warning: '#ff9f00',
      error: '#d00000',
    }[type];

    const attachment${typescript ? ': MessageAttachment' : ''} = {
      color,
      title,
      text: message,
      fields: fields?.map(f => ({
        title: f.title,
        value: f.value,
        short: f.short || false,
      })),
      actions,
      footer: '${projectName}',
      footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
      ts: Math.floor(Date.now() / 1000).toString(),
    };

    return this.sendAttachmentMessage(channel, [attachment]);
  }

  /**
   * Create notification blocks
   */
  createNotificationBlocks(
    title${typescript ? ': string' : ''}, 
    sections${typescript ? ': NotificationSection[]' : ''}
  )${typescript ? ': KnownBlock[]' : ''} {
    const blocks${typescript ? ': KnownBlock[]' : ''} = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true,
        },
      },
      {
        type: 'divider',
      },
    ];

    sections.forEach(section => {
      if (section.type === 'text') {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: section.content,
          },
        });
      } else if (section.type === 'fields') {
        blocks.push({
          type: 'section',
          fields: section.fields.map(f => ({
            type: 'mrkdwn',
            text: \`*\${f.title}*\\n\${f.value}\`,
          })),
        });
      } else if (section.type === 'context') {
        blocks.push({
          type: 'context',
          elements: section.elements.map(e => ({
            type: 'mrkdwn',
            text: e,
          })),
        });
      }
    });

    return blocks;
  }

  /**
   * OAuth Methods
   */
  ${features.includes('oauth') ? `
  generateOAuthUrl(state${typescript ? ': string' : ''}, redirectUri${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(' '),
      redirect_uri: redirectUri,
      state: state,
    });

    return \`https://slack.com/oauth/v2/authorize?\${params.toString()}\`;
  }

  async exchangeCodeForToken(code${typescript ? ': string' : ''}, redirectUri${typescript ? ': string' : ''})${typescript ? ': Promise<any>' : ''} {
    try {
      const result = await this.client.oauth.v2.access({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: redirectUri,
      });

      return result;
    } catch (error) {
      console.error('OAuth token exchange error:', error);
      throw error;
    }
  }
  ` : ''}

  /**
   * Utility Methods
   */
  formatMention(userId${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    return \`<@\${userId}>\`;
  }

  formatChannel(channelId${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    return \`<#\${channelId}>\`;
  }

  formatUrl(url${typescript ? ': string' : ''}, text${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    return \`<\${url}|\${text}>\`;
  }

  formatCode(code${typescript ? ': string' : ''}, multiline${typescript ? ': boolean' : ''} = false)${typescript ? ': string' : ''} {
    return multiline ? \`\\\`\\\`\\\`\${code}\\\`\\\`\\\`\` : \`\\\`\${code}\\\`\`;
  }
}

// Create and export service instance
export const slackService = new SlackService({
  botToken: process.env.SLACK_BOT_TOKEN || '',
  appToken: process.env.SLACK_APP_TOKEN || '',
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
  clientId: process.env.SLACK_CLIENT_ID || '',
  clientSecret: process.env.SLACK_CLIENT_SECRET || '',
  socketMode: !!process.env.SLACK_APP_TOKEN,
  scopes: ['chat:write', 'channels:read', 'users:read'],
  features: {
    bot: ${features.includes('bot')},
    webhook: ${features.includes('webhook')},
    notifications: ${features.includes('notifications')},
    slashCommands: ${features.includes('slash-commands')},
    interactive: ${features.includes('interactive')},
    oauth: ${features.includes('oauth')},
  },
});

${typescript ? `
// Type definitions
interface SlackConfig {
  botToken: string;
  appToken: string;
  signingSecret: string;
  clientId: string;
  clientSecret: string;
  socketMode: boolean;
  scopes: string[];
  features: {
    bot: boolean;
    webhook: boolean;
    notifications: boolean;
    slashCommands: boolean;
    interactive: boolean;
    oauth: boolean;
  };
}

interface NotificationOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  actions?: Array<{
    type: string;
    text: string;
    url?: string;
    value?: string;
  }>;
}

interface NotificationSection {
  type: 'text' | 'fields' | 'context';
  content?: string;
  fields?: Array<{
    title: string;
    value: string;
  }>;
  elements?: string[];
}
` : ''}`;

    const extension = typescript ? '.ts' : '.js';
    fs.writeFileSync(path.join(outputDir, `slack${extension}`), serviceContent, 'utf-8');
    result.files.push(path.join(outputDir, `slack${extension}`));

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Slack service generation failed: ${error.message}`);
  }

  return result;
}