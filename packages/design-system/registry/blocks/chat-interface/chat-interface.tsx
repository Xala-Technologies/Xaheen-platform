/**
 * Chat Interface Component Block
 * WCAG AAA compliant chat UI with Norwegian language
 * Real-time messaging with typing indicators and read receipts
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';

export interface ChatMessage {
  readonly id: string;
  readonly content: string;
  readonly sender: ChatUser;
  readonly timestamp: Date;
  readonly status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  readonly replyTo?: string;
  readonly attachments?: ChatAttachment[];
  readonly reactions?: ChatReaction[];
  readonly edited?: boolean;
  readonly editedAt?: Date;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface ChatUser {
  readonly id: string;
  readonly name: string;
  readonly avatar?: string;
  readonly status?: 'online' | 'offline' | 'away' | 'busy';
  readonly typing?: boolean;
}

export interface ChatAttachment {
  readonly id: string;
  readonly name: string;
  readonly type: 'image' | 'file' | 'video' | 'audio';
  readonly url: string;
  readonly size: number;
}

export interface ChatReaction {
  readonly emoji: string;
  readonly users: string[];
}

export interface ChatInterfaceTexts {
  readonly placeholder: string;
  readonly editPlaceholder: string;
  readonly sendLabel: string;
  readonly saveLabel: string;
  readonly cancelLabel: string;
  readonly participantsTitle: string;
  readonly participantCount: string;
  readonly statusOnline: string;
  readonly statusOffline: string;
  readonly statusAway: string;
  readonly statusBusy: string;
  readonly todayLabel: string;
  readonly yesterdayLabel: string;
  readonly replyToLabel: string;
  readonly editedLabel: string;
  readonly editingIndicator: string;
  readonly typingIndicator: string;
  readonly attachFileLabel: string;
  readonly selectFilesLabel: string;
  readonly addReactionLabel: string;
  readonly editMessageLabel: string;
  readonly deleteMessageLabel: string;
  readonly messageSentAnnouncement: string;
  readonly filesAddedAnnouncement: string;
}

export interface ChatInterfaceState {
  readonly message: string;
  readonly editingMessageId: string | null;
  readonly selectedFiles: File[];
  readonly showEmojiPicker: string | null;
}

export interface ChatInterfaceCallbacks {
  readonly onSendMessage: (content: string, attachments?: File[]) => void;
  readonly onEditMessage?: (messageId: string, content: string) => void;
  readonly onDeleteMessage?: (messageId: string) => void;
  readonly onReaction?: (messageId: string, emoji: string) => void;
  readonly onTyping?: (isTyping: boolean) => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onMessageChange?: (message: string) => void;
  readonly onEditingChange?: (messageId: string | null) => void;
  readonly onFilesChange?: (files: File[]) => void;
  readonly onEmojiPickerChange?: (messageId: string | null) => void;
  readonly onScrollToBottom?: () => void;
  readonly onFileSelect?: (files: File[]) => void;
}

export interface ChatInterfaceProps {
  readonly messages: ChatMessage[];
  readonly currentUser: ChatUser;
  readonly participants: ChatUser[];
  readonly texts?: Partial<ChatInterfaceTexts>;
  readonly callbacks: ChatInterfaceCallbacks;
  readonly state?: Partial<ChatInterfaceState>;
  readonly className?: string;
  readonly showParticipants?: boolean;
  readonly enableAttachments?: boolean;
  readonly enableReactions?: boolean;
  readonly formatDate?: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  readonly isLargeScreen?: boolean;
  readonly commonReactions?: string[];
}

const defaultTexts: ChatInterfaceTexts = {
  placeholder: 'Write a message...',
  editPlaceholder: 'Edit message...',
  sendLabel: 'Send',
  saveLabel: 'Save',
  cancelLabel: 'Cancel',
  participantsTitle: 'Participants',
  participantCount: 'participants',
  statusOnline: 'Online',
  statusOffline: 'Offline',
  statusAway: 'Away',
  statusBusy: 'Busy',
  todayLabel: 'Today',
  yesterdayLabel: 'Yesterday',
  replyToLabel: 'Reply to message...',
  editedLabel: '(edited)',
  editingIndicator: 'Editing message',
  typingIndicator: 'typing...',
  attachFileLabel: 'Attach file',
  selectFilesLabel: 'Select files',
  addReactionLabel: 'Add reaction',
  editMessageLabel: 'Edit message',
  deleteMessageLabel: 'Delete message',
  messageSentAnnouncement: 'Message sent',
  filesAddedAnnouncement: 'files added'
};

const defaultState: ChatInterfaceState = {
  message: '',
  editingMessageId: null,
  selectedFiles: [],
  showEmojiPicker: null
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentUser,
  participants,
  texts = {},
  callbacks,
  state = {},
  className,
  showParticipants = true,
  enableAttachments = true,
  enableReactions = true,
  formatDate,
  isLargeScreen = false,
  commonReactions = ['👍', '❤️', '😊', '😂', '😮', '😢', '🎉']
}) => {
  // Merge with default texts and state
  const t = { ...defaultTexts, ...texts };
  const currentState = { ...defaultState, ...state };
  const {
    message,
    editingMessageId, 
    selectedFiles,
    showEmojiPicker
  } = currentState;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const announce = (text: string) => {
    callbacks.onAnnounce?.(text);
  };
  
  const defaultFormatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => 
    new Intl.DateTimeFormat('en-US', options).format(date);
  
  const dateFormatter = formatDate || defaultFormatDate;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    callbacks.onScrollToBottom?.();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (message && callbacks.onTyping) {
      callbacks.onTyping(true);
      const timer = setTimeout(() => callbacks.onTyping?.(false), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message, callbacks.onTyping]);

  // Send message
  const handleSend = useCallback(() => {
    if (!message.trim() && selectedFiles.length === 0) return;

    if (editingMessageId) {
      callbacks.onEditMessage?.(editingMessageId, message);
      callbacks.onEditingChange?.(null);
    } else {
      callbacks.onSendMessage(message, selectedFiles);
    }

    callbacks.onMessageChange?.('');
    callbacks.onFilesChange?.([]);
    inputRef.current?.focus();
    announce(t.messageSentAnnouncement);
  }, [message, selectedFiles, editingMessageId, callbacks, announce, t]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...selectedFiles, ...files];
    callbacks.onFilesChange?.(newFiles);
    callbacks.onFileSelect?.(files);
    announce(`${files.length} ${t.filesAddedAnnouncement}`);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  // Message change handler
  const handleMessageChange = (newMessage: string) => {
    callbacks.onMessageChange?.(newMessage);
  };

  // Editing handlers
  const handleStartEdit = (messageId: string, content: string) => {
    callbacks.onEditingChange?.(messageId);
    callbacks.onMessageChange?.(content);
    inputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    callbacks.onEditingChange?.(null);
    callbacks.onMessageChange?.('');
  };

  // File removal handler  
  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    callbacks.onFilesChange?.(newFiles);
  };

  // Emoji picker handlers
  const handleShowEmojiPicker = (messageId: string) => {
    callbacks.onEmojiPickerChange?.(messageId);
  };

  const handleEmojiSelect = (messageId: string, emoji: string) => {
    callbacks.onReaction?.(messageId, emoji);
    callbacks.onEmojiPickerChange?.(null);
  };

  // Get typing users
  const typingUsers = participants.filter(p => p.typing && p.id !== currentUser.id);

  return (
    <div className={cn('flex h-full bg-background', className)}>
      {/* Participants Sidebar */}
      {showParticipants && isLargeScreen && (
        <div className="w-64 border-r border-border p-4">
          <h2 className="font-semibold mb-4">{t.participantsTitle} ({participants.length})</h2>
          <div className="space-y-2">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {participant.avatar ? (
                      <img src={participant.avatar} alt={participant.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  {participant.status === 'online' && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {participant.status === 'online' ? t.statusOnline : 
                     participant.status === 'away' ? t.statusAway :
                     participant.status === 'busy' ? t.statusBusy : t.statusOffline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-2">
                  {new Date(date).toDateString() === new Date().toDateString() ? t.todayLabel :
                   new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString() ? t.yesterdayLabel :
                   dateFormatter(new Date(date), { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Messages for this date */}
              {dateMessages.map((msg, index) => {
                const isCurrentUser = msg.sender.id === currentUser.id;
                const previousMsg = index > 0 ? dateMessages[index - 1] : null;
                const showAvatar = !previousMsg || previousMsg.sender.id !== msg.sender.id;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3',
                      isCurrentUser && 'flex-row-reverse'
                    )}
                  >
                    {/* Avatar */}
                    {showAvatar ? (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {msg.sender.avatar ? (
                          <img src={msg.sender.avatar} alt={msg.sender.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-medium">
                            {msg.sender.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-8" />
                    )}

                    {/* Message Content */}
                    <div className={cn('flex flex-col gap-1 max-w-[70%]', isCurrentUser && 'items-end')}>
                      {showAvatar && !isCurrentUser && (
                        <span className="text-xs text-muted-foreground px-2">
                          {msg.sender.name}
                        </span>
                      )}

                      <div
                        className={cn(
                          'relative group',
                          msg.nsmClassification && 'border-l-4',
                          msg.nsmClassification === 'OPEN' && 'border-l-green-600',
                          msg.nsmClassification === 'RESTRICTED' && 'border-l-yellow-600',
                          msg.nsmClassification === 'CONFIDENTIAL' && 'border-l-red-600',
                          msg.nsmClassification === 'SECRET' && 'border-l-gray-800'
                        )}
                      >
                        <div
                          className={cn(
                            'px-4 py-2 rounded-lg',
                            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
                            editingMessageId === msg.id && 'ring-2 ring-primary'
                          )}
                        >
                          {/* Reply Reference */}
                          {msg.replyTo && (
                            <div className="text-xs opacity-70 mb-1 pb-1 border-b border-current/10">
                              {t.replyToLabel}
                            </div>
                          )}

                          {/* Message Text */}
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map(attachment => (
                                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-background/10 rounded">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  <span className="text-sm truncate">{attachment.name}</span>
                                  <span className="text-xs opacity-70">
                                    {formatFileSize(attachment.size)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Timestamp and Status */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs opacity-70">
                              {dateFormatter(msg.timestamp, { hour: 'numeric', minute: 'numeric' })}
                            </span>
                            {msg.edited && (
                              <span className="text-xs opacity-70">{t.editedLabel}</span>
                            )}
                            {isCurrentUser && msg.status && (
                              <span className="text-xs">
                                {msg.status === 'sending' && '⏳'}
                                {msg.status === 'sent' && '✓'}
                                {msg.status === 'delivered' && '✓✓'}
                                {msg.status === 'read' && '👁'}
                                {msg.status === 'error' && '❌'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message Actions */}
                        <div className={cn(
                          'absolute top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                          isCurrentUser ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
                        )}>
                          {enableReactions && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleShowEmojiPicker(msg.id)}
                              aria-label={t.addReactionLabel}
                            >
                              😊
                            </Button>
                          )}
                          {isCurrentUser && callbacks.onEditMessage && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleStartEdit(msg.id, msg.content)}
                              aria-label={t.editMessageLabel}
                            >
                              ✏️
                            </Button>
                          )}
                          {isCurrentUser && callbacks.onDeleteMessage && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => callbacks.onDeleteMessage?.(msg.id)}
                              aria-label={t.deleteMessageLabel}
                            >
                              🗑️
                            </Button>
                          )}
                        </div>

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                onClick={() => callbacks.onReaction?.(msg.id, reaction.emoji)}
                                className={cn(
                                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                                  'bg-background/50 hover:bg-background/70',
                                  reaction.users.includes(currentUser.id) && 'ring-1 ring-primary'
                                )}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Emoji Picker */}
                        {showEmojiPicker === msg.id && (
                          <div className="absolute bottom-full mb-2 p-2 bg-card border rounded-lg shadow-lg">
                            <div className="flex gap-1">
                              {commonReactions.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleEmojiSelect(msg.id, emoji)}
                                  className="p-1 hover:bg-accent rounded"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-11">
              <div className="flex gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce animation-delay-200">•</span>
                <span className="animate-bounce animation-delay-400">•</span>
              </div>
              <span>
                {typingUsers.map(u => u.name).join(', ')} {t.typingIndicator}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-end gap-2">
            {enableAttachments && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label={t.selectFilesLabel}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={t.attachFileLabel}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </Button>
              </>
            )}

            <div className="flex-1">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={editingMessageId ? t.editPlaceholder : t.placeholder}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!message.trim() && selectedFiles.length === 0}
              aria-label={editingMessageId ? t.saveLabel : t.sendLabel}
            >
              {editingMessageId ? t.saveLabel : t.sendLabel}
            </Button>
          </div>

          {/* Edit Mode Indicator */}
          {editingMessageId && (
            <div className="flex items-center justify-between mt-2 px-2 text-sm text-muted-foreground">
              <span>{t.editingIndicator}</span>
              <button
                onClick={handleCancelEdit}
                className="text-primary hover:underline"
              >
                {t.cancelLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};