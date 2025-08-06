/**
 * Dashboard Example Page
 * Demonstrates how to combine multiple blocks together
 * Shows real-world usage of the component blocks
 */

import React, { useState } from 'react';
import { DashboardSidebar } from '../sidebar-01/sidebar';
import { GlobalSearch } from '../global-search/global-search';
import { Tabs } from '../tabs-01/tabs';
import { ChatInterface, ChatMessage, ChatUser } from '../chat-interface/chat-interface';
import { Chatbot } from '../chatbot/chatbot';
import { ProductFilter } from '../filter-01/filter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card/card';
import { Button } from '../../components/button/button';

export const DashboardExample: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [filterValues, setFilterValues] = useState({});
  const [showChatbot, setShowChatbot] = useState(false);

  // Mock data for chat
  const currentUser: ChatUser = {
    id: '1',
    name: 'Ola Nordmann',
    avatar: '/avatars/user.jpg',
    status: 'online'
  };

  const participants: ChatUser[] = [
    currentUser,
    { id: '2', name: 'Kari Hansen', status: 'online' },
    { id: '3', name: 'Per Olsen', status: 'away' }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Velkommen til teamchatten!',
      sender: participants[1],
      timestamp: new Date(Date.now() - 3600000),
      status: 'read'
    }
  ]);

  // Tab content
  const tabContent = [
    {
      id: 'overview',
      label: 'Oversikt',
      icon: '📊',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Brukere</CardTitle>
              <CardDescription>Aktive denne måneden</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12,543</div>
              <p className="text-sm text-muted-foreground">+12% fra forrige måned</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Omsetning</CardTitle>
              <CardDescription>Total denne måneden</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">kr 892,450</div>
              <p className="text-sm text-muted-foreground">+23% fra forrige måned</p>
            </CardContent>
          </Card>
          
          <Card nsmClassification="RESTRICTED">
            <CardHeader>
              <CardTitle>Systemstatus</CardTitle>
              <CardDescription>Oppetid og ytelse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-muted-foreground">Ingen problemer</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Oppgaver</CardTitle>
              <CardDescription>Venter på handling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-sm text-muted-foreground">3 høy prioritet</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'products',
      label: 'Produkter',
      icon: '📦',
      badge: '124',
      content: (
        <div className="flex gap-6">
          <div className="w-80">
            <ProductFilter
              values={filterValues}
              onChange={setFilterValues}
              showApplyButton={false}
            />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Product cards would go here */}
              <Card>
                <CardHeader>
                  <CardTitle>Eksempelprodukt</CardTitle>
                  <CardDescription>kr 299</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Produktbeskrivelse her...</p>
                  <Button className="w-full mt-4">Legg i handlekurv</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'team',
      label: 'Team',
      icon: '👥',
      content: (
        <div className="h-[600px]">
          <ChatInterface
            messages={messages}
            currentUser={currentUser}
            participants={participants}
            onSendMessage={(content) => {
              const newMessage: ChatMessage = {
                id: Date.now().toString(),
                content,
                sender: currentUser,
                timestamp: new Date(),
                status: 'sending'
              };
              setMessages([...messages, newMessage]);
            }}
            enableAttachments={true}
            enableReactions={true}
          />
        </div>
      )
    },
    {
      id: 'analytics',
      label: 'Analyse',
      icon: '📈',
      nsmClassification: 'CONFIDENTIAL',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Salgsanalyse</CardTitle>
              <CardDescription>Detaljert salgsstatistikk og trender</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analysediagrammer vil vises her...</p>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  // Search handler
  const handleSearch = async (query: string) => {
    // Mock search results
    return [
      {
        id: '1',
        title: 'Dashboard oversikt',
        description: 'Hovedside med nøkkeltall og statistikk',
        category: 'Sider',
        url: '/dashboard',
        icon: '📊'
      },
      {
        id: '2',
        title: 'Brukerinnstillinger',
        description: 'Administrer brukerprofil og preferanser',
        category: 'Innstillinger',
        url: '/settings/profile',
        icon: '👤',
        nsmClassification: 'RESTRICTED' as const
      }
    ];
  };

  // Chatbot handler
  const handleChatbotMessage = async (message: string) => {
    // Mock AI response
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: Date.now().toString(),
      content: `Jeg forstår at du spør om: "${message}". La meg hjelpe deg med det.`,
      sender: 'bot' as const,
      timestamp: new Date(),
      actions: [
        { id: '1', label: 'Se dokumentasjon', value: 'docs' },
        { id: '2', label: 'Kontakt support', value: 'support' }
      ]
    };
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar
        activeItemId={activeView}
        onItemClick={(item) => setActiveView(item.id)}
        header={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              X
            </div>
            <div>
              <h1 className="font-semibold">Xaheen UI</h1>
              <p className="text-xs text-muted-foreground">Design System</p>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Ola Nordmann</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b px-6 flex items-center justify-between bg-card">
          <div className="flex-1 max-w-xl">
            <GlobalSearch
              onSearch={handleSearch}
              onResultClick={(result) => console.log('Navigate to:', result.url)}
              showFilters={false}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChatbot(!showChatbot)}
              aria-label="Åpne chatbot"
            >
              🤖
            </Button>
            
            <Button variant="ghost" size="icon">
              🔔
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
              <p className="text-muted-foreground">
                Velkommen tilbake! Her er en oversikt over systemet.
              </p>
            </div>

            <Tabs
              tabs={tabContent}
              defaultTab="overview"
              variant="default"
              size="lg"
              animated={true}
            />
          </div>
        </main>
      </div>

      {/* Chatbot */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 z-50">
          <Chatbot
            onSendMessage={handleChatbotMessage}
            position="fixed"
            minimizable={true}
            onActionClick={(action) => console.log('Action clicked:', action)}
            onFeedback={(messageId, feedback) => console.log('Feedback:', messageId, feedback)}
          />
        </div>
      )}
    </div>
  );
};