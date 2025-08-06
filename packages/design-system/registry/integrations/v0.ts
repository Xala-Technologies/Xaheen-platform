/**
 * v0 AI Integration Layer for Xaheen Registry
 * Provides optimized exports and utilities for AI tools like v0.dev
 */

// Re-export from main registry for v0 compatibility
export * from '../index';

// Additional v0-specific helpers
export { getDependencies, isV0Compatible, getOptimalBundle } from '../lib/dependency-resolver';

// Component metadata for AI tools
export const V0_COMPONENT_METADATA = {
  registryName: '@xaheen-ai/design-system',
  version: '2.1.0',
  totalComponents: 12,
  architecture: 'LEGO-block modular system',
  
  features: {
    typescript: true,
    accessibility: 'WCAG AAA',
    localization: 'props-based',
    theming: 'CSS variables + Tailwind',
    animations: 'performance optimized',
    treeShaking: true,
    bundleSizes: 'optimized for production'
  },
  
  aiCompatibility: {
    v0Ready: true,
    copyPasteComponents: 6,
    complexComponents: 6,
    documentationCoverage: '100%',
    exampleCoverage: '100%'
  }
};

/**
 * Get component bundle size information for AI tools
 */
export const getComponentBundleSize = (componentName: string) => {
  const bundleSizes = {
    'Button': '2.1kb',
    'Input': '1.8kb', 
    'Card': '1.5kb',
    'LoadingSpinner': '0.8kb',
    'ThemeSwitcher': '3.2kb',
    'GlobalSearch': '12.4kb',
    'ChatInterface': '18.7kb',
    'Chatbot': '15.3kb',
    'Sidebar': '11.8kb',
    'Tabs': '6.2kb'
  };
  
  return bundleSizes[componentName as keyof typeof bundleSizes] || 'unknown';
};

/**
 * Generate boilerplate code for v0
 */
export const generateComponentBoilerplate = (pattern: string) => {
  const boilerplates = {
    'basic-search': `
import { GlobalSearch } from '@xaheen-ai/design-system';

export default function SearchExample() {
  const handleSearch = async (query: string) => {
    // Your search logic here
    return [];
  };

  return (
    <GlobalSearch
      onSearch={handleSearch}
      texts={{
        placeholder: "Search everything...",
        noResultsFound: "No results found for"
      }}
      callbacks={{
        onResultClick: (result) => console.log('Clicked:', result)
      }}
    />
  );
}`,
    
    'basic-chat': `
import { ChatInterface } from '@xaheen-ai/design-system';

export default function ChatExample() {
  const [messages, setMessages] = useState([]);
  const currentUser = { id: '1', name: 'You' };

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      sender: currentUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <ChatInterface
      messages={messages}
      currentUser={currentUser}
      participants={[currentUser]}
      callbacks={{ onSendMessage: handleSendMessage }}
      texts={{
        placeholder: "Type a message...",
        sendLabel: "Send"
      }}
    />
  );
}`
  };
  
  return boilerplates[pattern as keyof typeof boilerplates] || '';
};