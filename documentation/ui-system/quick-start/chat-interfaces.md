# Chat Interface Quick Start Guide

> **Build modern AI chat interfaces with Xala UI System's specialized chat components**

## Table of Contents

- [Chat Interface Setup](#chat-interface-setup)
- [Core Chat Components](#core-chat-components)
- [Message Handling](#message-handling)
- [AI Integration](#ai-integration)
- [Code Display & Execution](#code-display--execution)
- [Action Systems](#action-systems)
- [Norwegian Compliance](#norwegian-compliance)
- [Advanced Features](#advanced-features)

## Chat Interface Setup

### Basic Chat Layout

```tsx
import {
  DesignSystemProvider,
  PageLayout,
  ScrollArea,
  Box,
  Stack,
  MessageBubble,
  ActionBar,
  CodeBlock,
  Separator,
} from '@xala-technologies/ui-system';

export function ChatInterface(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  return (
    <DesignSystemProvider locale="nb-NO">
      <PageLayout>
        <Box display="flex" direction="col" h="100vh">
          {/* Chat Header */}
          <Box variant="outline" p="4">
            <Stack direction="row" gap="3" align="center">
              <Avatar src="/ai-assistant.png" fallback="AI" size="sm" />
              <Stack direction="col" gap="1">
                <Text weight="medium">Xala AI Assistant</Text>
                <Text size="sm" color="muted-foreground">
                  Norsk enterprise AI med compliance
                </Text>
              </Stack>
              <ClassificationIndicator level="ÅPEN" size="sm" />
            </Stack>
          </Box>

          {/* Messages Area */}
          <Box flex="1" overflow="hidden">
            <ScrollArea h="full">
              <Stack direction="col" gap="4" p="4">
                {messages.map((message, index) => (
                  <ChatMessage key={message.id} message={message} showSeparator={index > 0} />
                ))}

                {isTyping && <TypingIndicator />}
              </Stack>
            </ScrollArea>
          </Box>

          {/* Input Area */}
          <Box variant="outline" p="4">
            <ChatInput onSendMessage={handleSendMessage} />
          </Box>
        </Box>
      </PageLayout>
    </DesignSystemProvider>
  );
}
```

### Message Types

```tsx
interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  classification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
  metadata?: {
    model?: string;
    tokens?: number;
    confidence?: number;
    sources?: string[];
  };
  attachments?: Attachment[];
  codeBlocks?: CodeBlock[];
  actions?: ActionConfig[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  classification?: string;
}

interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  executable?: boolean;
}
```

## Core Chat Components

### Message Bubble Component

```tsx
import { MessageBubble, ActionBar } from '@xala-technologies/ui-system';

export function ChatMessage({ message, showSeparator }: ChatMessageProps): React.ReactElement {
  const handleCopyMessage = (): void => {
    navigator.clipboard.writeText(message.content);
    showToast('Melding kopiert');
  };

  const handleRegenerateResponse = (): void => {
    regenerateAIResponse(message.id);
  };

  return (
    <>
      {showSeparator && <Separator />}

      <MessageBubble
        variant={message.type === 'user' ? 'user' : 'assistant'}
        classification={message.classification}
        avatar={{
          src: message.type === 'user' ? user.avatar : '/ai-assistant.png',
          fallback: message.type === 'user' ? user.initials : 'AI',
        }}
        metadata={{
          timestamp: message.timestamp,
          model: message.metadata?.model,
          tokens: message.metadata?.tokens,
          confidence: message.metadata?.confidence,
        }}
      >
        <MessageContent message={message} />

        {/* Action Bar for Assistant Messages */}
        {message.type === 'assistant' && (
          <ActionBar
            actions={['copy', 'regenerate', 'edit', 'save', 'share', 'report']}
            customActions={[
              {
                key: 'export-pdf',
                label: 'Eksporter til PDF',
                icon: 'file-text',
                action: () => exportToPDF(message.id),
              },
            ]}
            onAction={action => handleMessageAction(action, message)}
          />
        )}
      </MessageBubble>
    </>
  );
}
```

### Message Content Renderer

```tsx
import { CodeBlock, Box, Text, Stack } from '@xala-technologies/ui-system';

export function MessageContent({ message }: { message: Message }): React.ReactElement {
  const parsedContent = parseMessageContent(message.content);

  return (
    <Stack direction="col" gap="4">
      {parsedContent.map((block, index) => {
        switch (block.type) {
          case 'text':
            return (
              <Text key={index} variant="body">
                {block.content}
              </Text>
            );

          case 'code':
            return (
              <CodeBlock
                key={index}
                language={block.language || 'text'}
                filename={block.filename}
                collapsible={block.content.length > 500}
                showLineNumbers={true}
                allowCopy={true}
                allowDownload={true}
                executable={block.executable}
                onExecute={block.executable ? executeCode : undefined}
              >
                {block.content}
              </CodeBlock>
            );

          case 'list':
            return (
              <Box key={index} as="ul" pl="4">
                {block.items.map((item, itemIndex) => (
                  <Box key={itemIndex} as="li" py="1">
                    <Text>{item}</Text>
                  </Box>
                ))}
              </Box>
            );

          case 'link':
            return (
              <Button key={index} variant="link" size="sm" onClick={() => openLink(block.url)}>
                {block.text}
              </Button>
            );

          default:
            return null;
        }
      })}

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <AttachmentList attachments={message.attachments} />
      )}
    </Stack>
  );
}
```

### Typing Indicator

```tsx
import { Box, Stack, Text, Avatar } from '@xala-technologies/ui-system';

export function TypingIndicator(): React.ReactElement {
  return (
    <Box display="flex" gap="3" align="start">
      <Avatar src="/ai-assistant.png" fallback="AI" size="sm" />

      <Box variant="filled" radius="lg" p="3" maxW="200px">
        <Stack direction="row" gap="1" align="center">
          <Text size="sm" color="muted-foreground">
            Skriver
          </Text>
          <Box display="flex" gap="1">
            <TypingDot delay={0} />
            <TypingDot delay={200} />
            <TypingDot delay={400} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function TypingDot({ delay }: { delay: number }): React.ReactElement {
  return (
    <Box
      w="4px"
      h="4px"
      bg="primary"
      radius="full"
      style={{
        animation: `typing-bounce 1.4s ease-in-out ${delay}ms infinite both`,
      }}
    />
  );
}
```

## Message Handling

### Chat Input Component

```tsx
import {
  Box,
  Stack,
  Textarea,
  Button,
  IconButton,
  FileUpload,
  Tooltip,
} from '@xala-technologies/ui-system';

export function ChatInput({ onSendMessage }: ChatInputProps): React.ReactElement {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = async (): Promise<void> => {
    if (!message.trim() && attachments.length === 0) return;

    const messageData = {
      content: message,
      attachments: attachments,
      timestamp: new Date(),
    };

    await onSendMessage(messageData);

    setMessage('');
    setAttachments([]);
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Stack direction="col" gap="3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <AttachmentPreview
          attachments={attachments}
          onRemove={index => setAttachments(prev => prev.filter((_, i) => i !== index))}
        />
      )}

      {/* Input Area */}
      <Stack direction="row" gap="2" align="end">
        <Box flex="1">
          <Textarea
            value={message}
            onChange={setMessage}
            onKeyDown={handleKeyPress}
            placeholder="Skriv en melding... (Enter for å sende, Shift+Enter for ny linje)"
            rows={1}
            resize="none"
            autoResize
            maxRows={10}
          />
        </Box>

        <Stack direction="row" gap="1">
          <Tooltip content="Legg ved fil">
            <FileUpload
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              multiple
              onFileSelect={handleFileUpload}
              disabled={isUploading}
            >
              <IconButton icon="paperclip" label="Legg ved fil" variant="ghost" size="sm" />
            </FileUpload>
          </Tooltip>

          <Tooltip content="Send melding (Enter)">
            <IconButton
              icon="send"
              label="Send"
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={!message.trim() && attachments.length === 0}
            />
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
}
```

### Message History Management

```tsx
import { useState, useEffect, useCallback } from 'react';

export function useChatHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMessages = useCallback(async (offset = 0): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.getChatHistory({
        offset,
        limit: 50,
        classification: getCurrentUserClassification(),
      });

      if (offset === 0) {
        setMessages(response.messages);
      } else {
        setMessages(prev => [...response.messages, ...prev]);
      }

      setHasMore(response.hasMore);
    } catch (error) {
      showErrorToast('Kunne ikke laste meldingshistorikk');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMessage = useCallback((message: Message): void => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>): void => {
    setMessages(prev => prev.map(msg => (msg.id === messageId ? { ...msg, ...updates } : msg)));
  }, []);

  const deleteMessage = useCallback((messageId: string): void => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    isLoading,
    hasMore,
    loadMessages,
    addMessage,
    updateMessage,
    deleteMessage,
  };
}
```

## AI Integration

### OpenAI Integration

```tsx
import { OpenAI } from 'openai';

export class XalaAIService {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.systemPrompt = `
Du er Xala AI Assistant, en norsk enterprise AI-assistent som hjelper med:
- Norsk språk og kultur
- GDPR og personvernlovgivning
- NSM sikkerhetsstandarder
- Norske forretningsprosesser
- Teknisk dokumentasjon på norsk

Svar alltid på norsk og følg norske compliance-krav.
Klassifiser sensitiv informasjon i henhold til NSM-standarder.
`;
  }

  async sendMessage(
    messages: Message[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      classification?: string;
    } = {}
  ): Promise<{
    content: string;
    tokens: number;
    model: string;
    classification: string;
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages.map(msg => ({
            role: msg.type === 'user' ? ('user' as const) : ('assistant' as const),
            content: msg.content,
          })),
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
      });

      const content = response.choices[0].message.content || '';
      const classification = this.determineClassification(content);

      return {
        content,
        tokens: response.usage?.total_tokens || 0,
        model: response.model,
        classification,
      };
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  private determineClassification(content: string): string {
    // Norwegian classification logic
    const sensitivePatterns = [
      /fødselsnummer/i,
      /organisasjonsnummer/i,
      /personnummer/i,
      /kontonummer/i,
      /konfidensielt/i,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(content)) {
        return 'KONFIDENSIELT';
      }
    }

    return 'ÅPEN';
  }
}
```

### Streaming Responses

```tsx
import { useEffect, useState } from 'react';

export function useStreamingResponse() {
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  const streamResponse = async (
    messages: Message[],
    onComplete: (message: Message) => void
  ): Promise<void> => {
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Kunne ikke starte streaming');

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedContent += data.content;
                setStreamingMessage(accumulatedContent);
              }
            } catch (error) {
              console.warn('Kunne ikke parse streaming data:', error);
            }
          }
        }
      }

      // Create final message
      const finalMessage: Message = {
        id: generateId(),
        type: 'assistant',
        content: accumulatedContent,
        timestamp: new Date(),
        classification: 'ÅPEN',
      };

      onComplete(finalMessage);
    } catch (error) {
      showErrorToast('Feil ved streaming av respons');
    } finally {
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  return {
    streamingMessage,
    isStreaming,
    streamResponse,
  };
}
```

## Code Display & Execution

### Advanced Code Block

```tsx
import { CodeBlock } from '@xala-technologies/ui-system';

export function ChatCodeBlock({
  code,
  language,
  filename,
  executable = false,
}: CodeBlockProps): React.ReactElement {
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async (): Promise<void> => {
    if (!executable) return;

    setIsExecuting(true);
    try {
      const result = await executeCode(code, language);
      setOutput(result);
    } catch (error) {
      setOutput(`Feil: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownload = (): void => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${getFileExtension(language)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack direction="col" gap="0">
      <CodeBlock
        language={language}
        filename={filename}
        showLineNumbers={true}
        allowCopy={true}
        allowDownload={true}
        executable={executable}
        isExecuting={isExecuting}
        onExecute={handleExecute}
        onDownload={handleDownload}
        collapsible={code.length > 1000}
        maxHeight="400px"
      >
        {code}
      </CodeBlock>

      {/* Output Panel */}
      {output && (
        <Box
          variant="outline"
          p="3"
          bg="muted"
          borderTop="none"
          radius="none"
          style={{ borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}
        >
          <Text size="sm" color="muted-foreground" mb="2">
            Utdata:
          </Text>
          <Text size="sm" family="mono">
            {output}
          </Text>
        </Box>
      )}
    </Stack>
  );
}
```

### Code Execution Service

```tsx
export class CodeExecutionService {
  private static readonly SUPPORTED_LANGUAGES = [
    'javascript',
    'typescript',
    'python',
    'sql',
    'bash',
    'powershell',
  ];

  static async executeCode(code: string, language: string): Promise<string> {
    if (!this.SUPPORTED_LANGUAGES.includes(language)) {
      throw new Error(`Språket ${language} støttes ikke for kjøring`);
    }

    // Security: Run in sandboxed environment
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
        timeout: 5000, // 5 second timeout
        classification: 'ÅPEN', // Only allow open classification
      }),
    });

    if (!response.ok) {
      throw new Error('Kunne ikke kjøre kode');
    }

    const result = await response.json();
    return result.output;
  }

  static getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      sql: 'sql',
      bash: 'sh',
      powershell: 'ps1',
      json: 'json',
      yaml: 'yml',
      markdown: 'md',
    };

    return extensions[language] || 'txt';
  }
}
```

## Action Systems

### Message Actions

```tsx
import { ActionBar } from '@xala-technologies/ui-system';

export function MessageActionBar({ message, onAction }: MessageActionBarProps): React.ReactElement {
  const baseActions = [
    'copy', // Kopier melding
    'edit', // Rediger melding (kun bruker)
    'regenerate', // Generer på nytt (kun AI)
    'save', // Lagre melding
    'share', // Del melding
    'report', // Rapporter problem
  ];

  const customActions = [
    {
      key: 'export-pdf',
      label: 'Eksporter til PDF',
      icon: 'file-text',
      action: () => exportMessageToPDF(message),
    },
    {
      key: 'create-task',
      label: 'Opprett oppgave',
      icon: 'plus-circle',
      action: () => createTaskFromMessage(message),
    },
    {
      key: 'add-note',
      label: 'Legg til notat',
      icon: 'sticky-note',
      action: () => addNoteToMessage(message),
    },
  ];

  // Filter actions based on message type and user permissions
  const availableActions = baseActions.filter(action => {
    switch (action) {
      case 'edit':
        return message.type === 'user' && canEditMessage(message);
      case 'regenerate':
        return message.type === 'assistant' && canRegenerateMessage(message);
      case 'report':
        return message.type === 'assistant';
      default:
        return true;
    }
  });

  return (
    <ActionBar
      actions={availableActions}
      customActions={customActions}
      size="sm"
      variant="subtle"
      onAction={action => onAction(action, message)}
      maxVisible={6}
    />
  );
}
```

### Bulk Actions

```tsx
import {
  ActionBar,
  Checkbox,
  Stack,
  Button,
  Modal,
  ModalContent,
} from '@xala-technologies/ui-system';

export function ChatWithBulkActions(): React.ReactElement {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const bulkActions = [
    {
      key: 'export-all',
      label: 'Eksporter alle',
      icon: 'download',
      action: () => exportSelectedMessages(selectedMessages),
    },
    {
      key: 'delete-all',
      label: 'Slett alle',
      icon: 'trash',
      variant: 'destructive',
      action: () => deleteSelectedMessages(selectedMessages),
    },
    {
      key: 'archive-all',
      label: 'Arkiver alle',
      icon: 'archive',
      action: () => archiveSelectedMessages(selectedMessages),
    },
  ];

  const handleSelectMessage = (messageId: string, selected: boolean): void => {
    setSelectedMessages(prev =>
      selected ? [...prev, messageId] : prev.filter(id => id !== messageId)
    );
  };

  const handleSelectAll = (): void => {
    setSelectedMessages(messages.map(msg => msg.id));
  };

  const handleDeselectAll = (): void => {
    setSelectedMessages([]);
  };

  return (
    <Stack direction="col" gap="0" h="full">
      {/* Bulk Action Bar */}
      {selectedMessages.length > 0 && (
        <Box variant="filled" p="3" borderBottom="1px solid" borderColor="border">
          <Stack direction="row" gap="4" align="center" justify="between">
            <Stack direction="row" gap="3" align="center">
              <Text size="sm" weight="medium">
                {selectedMessages.length} meldinger valgt
              </Text>
              <Button variant="outline" size="xs" onClick={handleDeselectAll}>
                Fjern valg
              </Button>
            </Stack>

            <ActionBar customActions={bulkActions} size="sm" variant="filled" />
          </Stack>
        </Box>
      )}

      {/* Messages with Selection */}
      <ScrollArea flex="1">
        <Stack direction="col" gap="4" p="4">
          {messages.map(message => (
            <Stack key={message.id} direction="row" gap="3" align="start">
              <Checkbox
                checked={selectedMessages.includes(message.id)}
                onChange={checked => handleSelectMessage(message.id, checked)}
                size="sm"
                mt="1"
              />

              <Box flex="1">
                <ChatMessage message={message} />
              </Box>
            </Stack>
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
```

## Norwegian Compliance

### Classification System

```tsx
import { ClassificationIndicator, Alert } from '@xala-technologies/ui-system';

export function ClassifiedChatInterface(): React.ReactElement {
  const [currentClassification, setCurrentClassification] = useState<string>('ÅPEN');

  const getClassificationLevel = (content: string): string => {
    // Norwegian classification logic
    const patterns = {
      HEMMELIG: [/hemmelig/i, /statshemmelighet/i],
      KONFIDENSIELT: [/konfidensielt/i, /fødselsnummer/i, /personnummer/i],
      BEGRENSET: [/begrenset/i, /intern/i, /ikke offentlig/i],
      ÅPEN: [],
    };

    for (const [level, patternList] of Object.entries(patterns)) {
      if (patternList.some(pattern => pattern.test(content))) {
        return level;
      }
    }

    return 'ÅPEN';
  };

  const handleMessageSend = (message: string): void => {
    const classification = getClassificationLevel(message);

    if (classification !== 'ÅPEN') {
      showClassificationWarning(classification);
    }

    sendMessage({
      content: message,
      classification,
      timestamp: new Date(),
    });
  };

  return (
    <Stack direction="col" gap="4" h="full">
      {/* Classification Header */}
      <Box variant="outline" p="4">
        <Stack direction="row" gap="4" align="center" justify="between">
          <Stack direction="row" gap="3" align="center">
            <ClassificationIndicator level={currentClassification} showDescription={true} />
            <Text size="sm" color="muted-foreground">
              Alle meldinger klassifiseres automatisk i henhold til NSM-standarder
            </Text>
          </Stack>

          <Button variant="outline" size="sm" onClick={() => showClassificationHelp()}>
            Hjelp om klassifisering
          </Button>
        </Stack>
      </Box>

      {/* GDPR Compliance Notice */}
      <Alert variant="info">
        <AlertTitle>Personvern og GDPR</AlertTitle>
        <AlertDescription>
          Denne samtalen følger norsk personvernlovgivning. Personopplysninger behandles i henhold
          til GDPR og lagres kun så lenge det er nødvendig.
        </AlertDescription>
      </Alert>

      {/* Chat Messages */}
      <ChatMessages
        onMessageSend={handleMessageSend}
        classificationFilter={currentClassification}
      />
    </Stack>
  );
}
```

### Audit Logging

```tsx
export class ChatAuditLogger {
  private static instance: ChatAuditLogger;

  static getInstance(): ChatAuditLogger {
    if (!this.instance) {
      this.instance = new ChatAuditLogger();
    }
    return this.instance;
  }

  async logChatAction(action: {
    type: 'message_sent' | 'message_received' | 'message_deleted' | 'file_uploaded';
    userId: string;
    sessionId: string;
    classification: string;
    metadata?: any;
    timestamp?: Date;
  }): Promise<void> {
    const logEntry = {
      ...action,
      timestamp: action.timestamp || new Date(),
      ip: await this.getClientIP(),
      userAgent: navigator.userAgent,
      compliance: {
        gdpr: true,
        nsm: true,
        dataRetention: this.calculateRetentionPeriod(action.classification),
      },
    };

    // Log to secure audit system
    await fetch('/api/audit/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(logEntry),
    });
  }

  private calculateRetentionPeriod(classification: string): number {
    // Norwegian data retention requirements
    const retentionPeriods = {
      ÅPEN: 90, // 90 days
      BEGRENSET: 365, // 1 year
      KONFIDENSIELT: 1095, // 3 years
      HEMMELIG: 3650, // 10 years
    };

    return retentionPeriods[classification] || 90;
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}
```

## Advanced Features

### Voice Integration

```tsx
import {
  Button,
  IconButton,
  Stack,
  Modal,
  useVoiceRecognition,
} from '@xala-technologies/ui-system';

export function VoiceEnabledChat(): React.ReactElement {
  const { isListening, transcript, startListening, stopListening, isSupported } =
    useVoiceRecognition({
      language: 'nb-NO', // Norwegian language
      continuous: false,
      interimResults: true,
    });

  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleVoiceMessage = (): void => {
    if (isListening) {
      stopListening();
      if (transcript) {
        sendMessage(transcript);
      }
      setShowVoiceModal(false);
    } else {
      setShowVoiceModal(true);
      startListening();
    }
  };

  if (!isSupported) {
    return null; // Hide voice features if not supported
  }

  return (
    <>
      <IconButton
        icon={isListening ? 'mic-off' : 'mic'}
        label={isListening ? 'Stopp opptak' : 'Start taleopptak'}
        variant={isListening ? 'destructive' : 'outline'}
        onClick={handleVoiceMessage}
      />

      <Modal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)}>
        <ModalContent>
          <Stack direction="col" gap="6" align="center" p="6">
            <Box
              w="80px"
              h="80px"
              bg={isListening ? 'primary' : 'muted'}
              radius="full"
              display="flex"
              align="center"
              justify="center"
              style={{
                animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            >
              <Icon
                name="mic"
                size="32"
                color={isListening ? 'primary-foreground' : 'muted-foreground'}
              />
            </Box>

            <Stack direction="col" gap="2" align="center">
              <Text weight="medium">{isListening ? 'Lytter...' : 'Trykk for å snakke'}</Text>

              {transcript && (
                <Text size="sm" color="muted-foreground" align="center">
                  "{transcript}"
                </Text>
              )}
            </Stack>

            <Stack direction="row" gap="3">
              <Button variant="outline" onClick={() => setShowVoiceModal(false)}>
                Avbryt
              </Button>

              {transcript && (
                <Button
                  variant="primary"
                  onClick={() => {
                    sendMessage(transcript);
                    setShowVoiceModal(false);
                  }}
                >
                  Send melding
                </Button>
              )}
            </Stack>
          </Stack>
        </ModalContent>
      </Modal>
    </>
  );
}
```

### File Upload with Preview

```tsx
import {
  FileUpload,
  Stack,
  Card,
  CardContent,
  Button,
  Progress,
} from '@xala-technologies/ui-system';

export function ChatFileUpload(): React.ReactElement {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleFileSelect = (selectedFiles: File[]): void => {
    const filesWithPreview = selectedFiles.map(file => ({
      file,
      id: generateId(),
      preview: createFilePreview(file),
      classification: determineFileClassification(file),
    }));

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const handleFileUpload = async (fileData: FileWithPreview): Promise<void> => {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('classification', fileData.classification);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        onUploadProgress: progress => {
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: progress.percentage,
          }));
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Add file reference to message
        addFileToMessage(result.fileId, fileData);
      }
    } catch (error) {
      showErrorToast(`Feil ved opplasting av ${fileData.file.name}`);
    }
  };

  return (
    <Stack direction="col" gap="4">
      <FileUpload
        accept=".pdf,.doc,.docx,.txt,.jpg,.png,.csv,.xlsx"
        multiple
        maxSize={10 * 1024 * 1024} // 10MB
        onFileSelect={handleFileSelect}
        dropzone
      >
        <Box
          variant="outline"
          style={{ borderStyle: 'dashed' }}
          p="6"
          display="flex"
          direction="col"
          gap="2"
          align="center"
          justify="center"
          minH="120px"
        >
          <Icon name="upload" size="24" color="muted-foreground" />
          <Text align="center" color="muted-foreground">
            Dra og slipp filer her, eller klikk for å velge
          </Text>
          <Text size="sm" color="muted-foreground">
            Støttede formater: PDF, DOC, TXT, JPG, PNG, CSV, XLSX (maks 10MB)
          </Text>
        </Box>
      </FileUpload>

      {/* File Preview List */}
      {files.length > 0 && (
        <Stack direction="col" gap="3">
          {files.map(fileData => (
            <Card key={fileData.id} variant="outline">
              <CardContent p="3">
                <Stack direction="row" gap="3" align="center">
                  <FileIcon type={fileData.file.type} size="sm" />

                  <Stack direction="col" gap="1" flex="1">
                    <Text size="sm" weight="medium">
                      {fileData.file.name}
                    </Text>
                    <Text size="xs" color="muted-foreground">
                      {formatFileSize(fileData.file.size)}
                    </Text>
                  </Stack>

                  <ClassificationIndicator level={fileData.classification} size="xs" />

                  {uploadProgress[fileData.id] !== undefined ? (
                    <Stack direction="col" gap="1" minW="100px">
                      <Progress value={uploadProgress[fileData.id]} max={100} size="sm" />
                      <Text size="xs" color="muted-foreground">
                        {uploadProgress[fileData.id]}%
                      </Text>
                    </Stack>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleFileUpload(fileData)}>
                      Last opp
                    </Button>
                  )}

                  <IconButton
                    icon="x"
                    label="Fjern fil"
                    size="xs"
                    variant="ghost"
                    onClick={() => removeFile(fileData.id)}
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
```

## Best Practices

1. **Message classification** - Automatically classify all content according to NSM standards
2. **GDPR compliance** - Implement proper consent and data retention
3. **Accessibility** - Ensure keyboard navigation and screen reader support
4. **Performance** - Use virtualization for long chat histories
5. **Error handling** - Graceful fallbacks for AI service failures
6. **Security** - Validate and sanitize all user inputs
7. **Norwegian localization** - All UI text in Norwegian with proper formatting
8. **Audit logging** - Comprehensive logging for compliance requirements

## Next Steps

- **[Web Applications Guide](./web-applications.md)** - Integrate chat into web apps
- **[Mobile Applications Guide](./mobile-applications.md)** - Mobile chat interfaces
- **[Component Reference](../components/README.md)** - Explore all chat components
- **[Norwegian Compliance](../norwegian-compliance.md)** - Deep dive into compliance features
