# Communication Components Wireframes

## 1. Chatbot Interface (Floating Chat Bubble)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                              [💬]                  │
│                                                                     │
│                                                                     │
│                                                                     │
│                                            [Chat Bubble]            │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe - Collapsed State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                          ┌─────────────────┐       │
│                                          │   💬  Need      │       │
│                                          │      Help?      │       │
│                                          │                 │       │
│                                          │    [Chat Now]   │       │
│                                          └─────────────────┘       │
│                                             ┌─────────┐             │
│                                             │    ×    │             │
│                                             └─────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe - Expanded State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                        ┌─────────────────────────────────────────┐  │
│                        │ 🤖 AI Assistant          [—] [×]       │  │
│                        ├─────────────────────────────────────────┤  │
│                        │                                         │  │
│                        │ 🤖 Hi! I'm here to help. What can I    │  │
│                        │    do for you today?                    │  │
│                        │                                         │  │
│                        │                        You: How do I    │  │
│                        │                           reset my      │  │
│                        │                           password? 👤  │  │
│                        │                                         │  │
│                        │ 🤖 I can help you reset your password. │  │
│                        │    Would you like me to:               │  │
│                        │                                         │  │
│                        │    ┌─────────────────────────────────┐  │  │
│                        │    │ Send reset link to your email  │  │  │
│                        │    └─────────────────────────────────┘  │  │
│                        │    ┌─────────────────────────────────┐  │  │
│                        │    │ Guide you through the process  │  │  │
│                        │    └─────────────────────────────────┘  │  │
│                        │                                         │  │
│                        ├─────────────────────────────────────────┤  │
│                        │ ┌─────────────────────┐ ┌────┐ ┌────┐  │  │
│                        │ │Type your message... │ │📎  │ │ ➤ │  │  │
│                        │ └─────────────────────┘ └────┘ └────┘  │  │
│                        └─────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Chat Bubble (Collapsed)**:
  - Default: Floating button with subtle animation
  - Hover: Slight scale increase, enhanced shadow
  - Focus: High contrast outline for keyboard users
  - Notification: Badge indicator for new messages
- **Chat Window (Expanded)**:
  - Header: Minimize, close controls
  - Message Area: Scrollable conversation history
  - Input Area: Text input, attachment, send button
- **Quick Actions**: Predefined response buttons

### Animation & Transitions
- **Bubble Entrance**: Slide up from bottom-right with bounce
- **Expand Animation**: Smooth height/width expansion (400ms)
- **Message Animations**: Messages slide in from appropriate side
- **Typing Indicator**: Animated dots while AI responds

### Responsive Behavior
- **Desktop (>1024px)**: Fixed position bottom-right, 320px width
- **Tablet (768-1024px)**: Responsive width, maintained position
- **Mobile (<768px)**: Full-screen overlay when expanded

### Accessibility Considerations
- **ARIA Structure**: `dialog` role when expanded, proper labeling
- **Keyboard Navigation**: Tab navigation through all interactive elements
- **Screen Reader**: Messages announced as they arrive
- **Focus Management**: Focus trapped in chat window when expanded
- **High Contrast**: Clear visual separation between user/bot messages

### Content Hierarchy
1. **Chat Trigger**: Initial entry point and attention grabber
2. **Conversation Flow**: Clear user/bot message distinction
3. **Input Controls**: Message composition and sending
4. **Quick Actions**: Common task shortcuts
5. **Window Controls**: Minimize, maximize, close options

### Spacing & Sizing Guidelines
- **Bubble Size**: 60px × 60px floating button
- **Expanded Window**: 320px × 480px on desktop
- **Message Padding**: 12px horizontal, 8px vertical
- **Input Height**: 48px with 12px padding
- **Bubble Position**: 24px from bottom-right corner

### Component Variants
- **Simple Bubble**: Basic floating chat button
- **Proactive**: Bubble with preview messages or prompts
- **Contextual**: Chat adapts based on current page/section
- **Multi-agent**: Different bots for different purposes

---

## 2. Chat Window (Full Chat Interface)

### Structure & Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Chat Header: Title, Status, Controls]                             │
├─────────────────────────────────────────────────────────────────────┤
│ [Message History Area - Scrollable]                                │
│ [User Messages - Right Aligned]                                    │
│ [Bot/Agent Messages - Left Aligned]                                │
│ [System Messages - Centered]                                       │
├─────────────────────────────────────────────────────────────────────┤
│ [Input Area: Text Field, Attachments, Send]                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🤖 Customer Support Chat    ● Online    ┌─────┐ ┌─────┐ ┌─────┐    │
│ Agent: Sarah Martinez                    │  ?  │ │  —  │ │  ×  │    │
│                                          └─────┘ └─────┘ └─────┘    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                    System Message                               │ │
│ │              Chat session started at 2:30 PM                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🤖 Hello! I'm Sarah, your customer support agent.                  │
│    How can I help you today?                                       │
│    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│    │  Billing Help   │ │ Technical Issue │ │ General Question│    │
│    └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                         2:30 PM    │
│                                                                     │
│                                              Hi, I'm having issues │
│                                              with my account login. │
│                                              Can you help? 👤       │
│                                                         2:31 PM    │
│                                                                     │
│ 🤖 I'd be happy to help you with your login issues.                │
│    Can you tell me what happens when you try to log in?            │
│                                                         2:31 PM    │
│                                                                     │
│                                              When I enter my email │
│                                              and password, it says  │
│                                              "Invalid credentials"  │
│                                              but I'm sure they're   │
│                                              correct. 👤            │
│                                                         2:32 PM    │
│                                                                     │
│ 🤖 I understand how frustrating that can be. Let me check your     │
│    account status. Can you confirm the email address you're        │
│    using to log in?                                                 │
│                                                         2:32 PM    │
│                                                                     │
│ 🤖 Sarah is typing...                                               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────┐ ┌────┐ ┌────┐ ┌────┐  │
│ │ Type your message here...               │ │ 📎 │ │ 😊 │ │ ➤ │  │
│ └─────────────────────────────────────────┘ └────┘ └────┘ └────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements & States
- **Header Controls**:
  - Help: Context menu with chat features
  - Minimize: Collapse to small window
  - Close: End chat session with confirmation
- **Message Elements**:
  - User Messages: Right-aligned with user avatar/initial
  - Agent Messages: Left-aligned with agent avatar
  - System Messages: Centered, distinct styling
  - Timestamps: Subtle, positioned consistently
- **Input Controls**:
  - Text Area: Auto-expanding for longer messages
  - Attachment: File upload functionality
  - Emoji: Emoji picker for expression
  - Send: Primary action button

### Message Types & States
- **Text Messages**: Standard conversation messages
- **Quick Reply Buttons**: Predefined response options
- **File Attachments**: Images, documents with preview
- **System Messages**: Connection status, session info
- **Typing Indicators**: Real-time typing feedback
- **Delivery Status**: Sent, delivered, read indicators

### Responsive Behavior
- **Desktop (>1024px)**: Full chat interface, sidebar or overlay
- **Tablet (768-1024px)**: Adapted sizing, maintained functionality
- **Mobile (<768px)**: Full-screen chat experience

### Accessibility Considerations
- **ARIA Structure**: `log` region for messages, proper labeling
- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader**: Messages read in chronological order
- **Focus Management**: New messages announce, input remains focusable
- **High Contrast**: Clear visual distinction between message types

### Content Hierarchy
1. **Chat Context**: Agent info, status, session controls
2. **Conversation History**: Chronological message display
3. **Active Communication**: Current message exchange
4. **Input Interface**: Message composition tools
5. **System Information**: Status updates and meta information

### Spacing & Sizing Guidelines
- **Header Height**: 64px with agent information and controls
- **Message Padding**: 16px horizontal, 12px vertical
- **Message Spacing**: 16px between different senders, 8px same sender
- **Input Area**: 80px height with padding for controls
- **Avatar Size**: 32px × 32px for agent, 28px × 28px for user

### Component Variants
- **Customer Support**: Agent-based with rich features
- **AI Chatbot**: Automated responses with smart suggestions
- **Team Chat**: Multi-user conversation interface
- **Embedded**: Simplified version for website integration

---

## Additional Communication Features

### Message Features
- **Rich Text Formatting**: Bold, italic, links in messages
- **Code Snippets**: Formatted code blocks for technical support
- **Quick Actions**: Buttons for common tasks within messages
- **Message Search**: Find previous conversation content
- **Message Reactions**: Emoji reactions to messages

### Advanced Functionality
- **File Sharing**: Drag-and-drop file uploads with previews
- **Screen Sharing**: Remote assistance capabilities
- **Voice Messages**: Audio message recording and playback
- **Video Chat**: Escalate to video call when needed
- **Co-browsing**: Shared browser session for guidance

### Integration Features
- **CRM Integration**: Access customer information during chat
- **Knowledge Base**: Search and share help articles
- **Ticket Creation**: Convert chat to support ticket
- **Analytics**: Chat metrics and satisfaction surveys
- **Multi-language**: Real-time translation capabilities

### Notification Features
- **Sound Notifications**: Audio alerts for new messages
- **Desktop Notifications**: System notifications when away
- **Badge Indicators**: Unread message counts
- **Status Indicators**: Online, away, typing status
- **Queue Position**: Wait time information for support chats