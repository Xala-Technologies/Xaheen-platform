/**
 * Chatbot Component Block
 * AI-powered chat assistant with Norwegian language support
 * WCAG AAA compliant with suggested actions and rich responses
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';
import { Card, CardContent } from '../../components/card/card';
// TODO: Replace with context/provider pattern
// import { useAccessibility } from '@/hooks/use-accessibility';
// import { useResponsive } from '@/hooks/use-responsive';

export interface ChatbotMessage {
  readonly id: string;
  readonly content: string;
  readonly sender: 'user' | 'bot';
  readonly timestamp: Date;
  readonly type?: 'text' | 'card' | 'options' | 'form' | 'image' | 'chart';
  readonly data?: any;
  readonly actions?: ChatbotAction[];
  readonly feedback?: 'positive' | 'negative';
  readonly loading?: boolean;
}

export interface ChatbotAction {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly type?: 'primary' | 'secondary' | 'link';
  readonly icon?: React.ReactNode;
}

export interface ChatbotSuggestion {
  readonly id: string;
  readonly text: string;
  readonly category?: string;
  readonly icon?: React.ReactNode;
}

export interface ChatbotProps {
  readonly onSendMessage: (message: string) => Promise<ChatbotMessage>;
  readonly onActionClick?: (action: ChatbotAction) => void;
  readonly onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  readonly suggestions?: ChatbotSuggestion[];
  readonly welcomeMessage?: string;
  readonly placeholder?: string;
  readonly className?: string;
  readonly minimizable?: boolean;
  readonly position?: 'fixed' | 'relative';
  readonly norwegianMode?: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  onSendMessage,
  onActionClick,
  onFeedback,
  suggestions = [],
  welcomeMessage = 'Hei! Jeg er din digitale assistent. Hvordan kan jeg hjelpe deg i dag?',
  placeholder = 'Skriv ditt spørsmål her...',
  className,
  minimizable = true,
  position = 'fixed',
  norwegianMode = true
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      id: '1',
      content: welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // TODO: Replace with proper context/provider
  const announce = (message: string) => console.log('Announce:', message);
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => 
    new Intl.DateTimeFormat('nb-NO', options).format(date);
  // Temporary fallbacks removed - using constants directly

  // Common suggestions in Norwegian
  const defaultSuggestions: ChatbotSuggestion[] = norwegianMode ? [
    { id: '1', text: 'Hvordan kan jeg logge inn?', category: 'Hjelp', icon: '🔐' },
    { id: '2', text: 'Vis mine siste dokumenter', category: 'Dokumenter', icon: '📄' },
    { id: '3', text: 'Kontakt kundeservice', category: 'Support', icon: '💬' },
    { id: '4', text: 'Sjekk min kontostatus', category: 'Konto', icon: '👤' }
  ] : [];

  const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: ChatbotMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);
    announce('Melding sendt');

    try {
      // Add typing indicator
      const typingMessage: ChatbotMessage = {
        id: 'typing',
        content: '',
        sender: 'bot',
        timestamp: new Date(),
        loading: true
      };
      setMessages(prev => [...prev, typingMessage]);

      const response = await onSendMessage(input);
      
      // Remove typing indicator and add response
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(response));
      announce('Svar mottatt');
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat({
        id: Date.now().toString(),
        content: 'Beklager, jeg kunne ikke behandle forespørselen din. Vennligst prøv igjen.',
        sender: 'bot',
        timestamp: new Date()
      }));
      announce('Feil ved sending av melding');
    } finally {
      setIsTyping(false);
    }
  }, [input, onSendMessage, announce]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: ChatbotSuggestion) => {
    setInput(suggestion.text);
    handleSend();
  };

  // Render message content based on type
  const renderMessageContent = (message: ChatbotMessage) => {
    switch (message.type) {
      case 'card':
        return (
          <Card className="max-w-sm">
            <CardContent className="p-4">
              {message.data?.image && (
                <img 
                  src={message.data.image} 
                  alt={message.data.title || ''} 
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              {message.data?.title && (
                <h4 className="font-semibold mb-2">{message.data.title}</h4>
              )}
              <p className="text-sm">{message.content}</p>
              {message.data?.link && (
                <Button variant="ghost" size="md" className="mt-3 p-0">
                  Les mer →
                </Button>
              )}
            </CardContent>
          </Card>
        );

      case 'options':
        return (
          <div>
            <p className="mb-3">{message.content}</p>
            <div className="space-y-2">
              {message.data?.options?.map((option: any) => (
                <button
                  key={option.id}
                  onClick={() => onActionClick?.({ 
                    id: option.id, 
                    label: option.label, 
                    value: option.value 
                  })}
                  className="block w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'chart':
        return (
          <div>
            <p className="mb-3">{message.content}</p>
            {/* Placeholder for chart */}
            <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Diagram kommer her</span>
            </div>
          </div>
        );

      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  if (position === 'fixed' && isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={cn(
          'fixed bottom-4 right-4 h-14 w-14 rounded-full',
          'bg-primary text-primary-foreground shadow-lg',
          'hover:scale-105 transition-transform',
          'flex items-center justify-center'
        )}
        aria-label="Åpne chat"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  const chatContent = (
    <div className={cn(
      'flex flex-col bg-card border border-border rounded-xl shadow-xl overflow-hidden',
      position === 'fixed' ? 'h-[600px] w-[400px]' : 'h-full w-full',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">Digital Assistent</h3>
            <p className="text-xs text-muted-foreground">
              {isTyping ? 'Skriver...' : 'Online'}
            </p>
          </div>
        </div>
        {minimizable && position === 'fixed' && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimer chat"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.sender === 'user' && 'flex-row-reverse'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
              message.sender === 'bot' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {message.sender === 'bot' ? '🤖' : '👤'}
            </div>

            {/* Message */}
            <div className={cn(
              'flex flex-col gap-1 max-w-[80%]',
              message.sender === 'user' && 'items-end'
            )}>
              <div className={cn(
                'rounded-lg p-3',
                message.sender === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground',
                message.loading && 'min-w-[60px]'
              )}>
                {message.loading ? (
                  <div className="flex gap-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce animation-delay-200">•</span>
                    <span className="animate-bounce animation-delay-400">•</span>
                  </div>
                ) : (
                  renderMessageContent(message)
                )}
              </div>

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.type === 'primary' ? 'primary' : 'outline'}
                      size="md"
                      onClick={() => onActionClick?.(action)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Feedback */}
              {message.sender === 'bot' && !message.loading && onFeedback && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Var dette hjelpsomt?
                  </span>
                  <button
                    onClick={() => onFeedback(message.id, 'positive')}
                    className={cn(
                      'text-xs hover:text-green-600',
                      message.feedback === 'positive' && 'text-green-600'
                    )}
                    aria-label="Nyttig svar"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => onFeedback(message.id, 'negative')}
                    className={cn(
                      'text-xs hover:text-red-600',
                      message.feedback === 'negative' && 'text-red-600'
                    )}
                    aria-label="Ikke nyttig svar"
                  >
                    👎
                  </button>
                </div>
              )}

              {/* Timestamp */}
              <span className="text-xs text-muted-foreground">
                {formatDate(message.timestamp, { hour: 'numeric', minute: 'numeric' })}
              </span>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && activeSuggestions.length > 0 && (
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Forslag:</p>
          <div className="flex flex-wrap gap-2">
            {activeSuggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background border border-border hover:bg-accent text-sm transition-colors"
              >
                {suggestion.icon && <span>{suggestion.icon}</span>}
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isTyping}
            className="flex-1"
            aria-label="Chat melding"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            aria-label="Send melding"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Drevet av AI • Svar kan være unøyaktige
        </p>
      </div>
    </div>
  );

  if (position === 'fixed') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {chatContent}
      </div>
    );
  }

  return chatContent;
};