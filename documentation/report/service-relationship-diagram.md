# Xaheen Platform - Service Relationship Diagram
## Visual Guide to System Interactions

**Date**: 2025-08-01

---

## 🎯 **High-Level Service Relationships**

```mermaid
graph TB
    User[👤 User] --> CLI[🖥️ CLI Interface]
    User --> Web[🌐 Web Platform]
    
    CLI --> ModeSelector{Mode Selector}
    ModeSelector --> Legacy[Legacy Mode]
    ModeSelector --> Xala[Xala Mode]
    ModeSelector --> Token[Token Mode]
    ModeSelector --> Xaheen[Xaheen Mode]
    
    Legacy --> CoreServices[🔧 Core Services]
    Xala --> CoreServices
    Token --> CoreServices
    Xaheen --> AIOrchestrator[🧠 AI Orchestrator]
    
    Web --> APIBridge[🌉 API Bridge]
    APIBridge --> CoreServices
    
    AIOrchestrator --> CoreServices
    AIOrchestrator --> Claude[Claude AI]
    AIOrchestrator --> RAG[RAG System]
    AIOrchestrator --> KnowledgeBase[Knowledge Base]
    
    CoreServices --> AIServices[AI Services]
    CoreServices --> Compliance[🛡️ Compliance]
    CoreServices --> i18n[🌍 Localization]
    CoreServices --> Validation[✅ Validation]
    
    Compliance --> NSM[NSM Security]
    Compliance --> GDPR[GDPR Protection]
    Compliance --> WCAG[WCAG AAA]
    
    i18n --> Norwegian[🇳🇴 Norwegian]
    i18n --> English[🇬🇧 English]
    i18n --> Arabic[🇸🇦 Arabic RTL]
    i18n --> French[🇫🇷 French]
    
    CoreServices --> Templates[📋 Templates]
    Templates --> LegacyTemplates[Legacy Templates]
    Templates --> XalaTemplates[Xala Templates]
    Templates --> AITemplates[AI-Generated Templates]
    
    CoreServices --> Output[📁 Generated Project]
```

---

## 🔄 **Data Flow Architecture**

```mermaid
sequenceDiagram
    participant U as User
    participant CLI as CLI Interface
    participant AI as AI Orchestrator
    participant C as Compliance
    participant i18n as Localization
    participant T as Templates
    participant V as Validation
    participant O as Output
    
    U->>CLI: "Create Norwegian e-commerce app"
    CLI->>AI: Process natural language
    AI->>AI: Analyze intent & context
    AI->>C: Request compliance requirements
    C-->>AI: NSM + GDPR + WCAG rules
    AI->>i18n: Request Norwegian localization
    i18n-->>AI: Norwegian (Bokmål) + English setup
    AI->>T: Select appropriate templates
    T-->>AI: E-commerce + Compliance templates
    AI->>V: Validate configuration
    V-->>AI: Configuration approved
    AI->>O: Generate project
    O-->>CLI: Project created
    CLI-->>U: Success + compliance report
```

---

## 🏗️ **Service Dependency Map**

```mermaid
graph LR
    subgraph "Frontend Layer"
        CLI[CLI Modes]
        Web[Web Platform]
    end
    
    subgraph "Orchestration Layer"
        API[API Bridge]
        AI[AI Orchestrator]
        Mode[Mode Router]
    end
    
    subgraph "Core Services Layer"
        AIS[AI Services]
        COMP[Compliance]
        I18N[Localization]
        VAL[Validation]
    end
    
    subgraph "Data Layer"
        TMPL[Templates]
        KB[Knowledge Base]
        RAG[RAG System]
    end
    
    subgraph "External Services"
        CLAUDE[Claude AI]
        NSM[NSM APIs]
        GDPR[GDPR Tools]
    end
    
    CLI --> Mode
    Web --> API
    Mode --> AIS
    API --> AI
    AI --> AIS
    AI --> COMP
    AI --> I18N
    AI --> VAL
    
    AIS --> KB
    AIS --> RAG
    AIS --> CLAUDE
    
    COMP --> NSM
    COMP --> GDPR
    
    VAL --> TMPL
    I18N --> TMPL
    COMP --> TMPL
```

---

## 🎯 **Key Service Interactions**

### **1. AI-Driven Project Generation**
```
User Input → AI Orchestrator → Parallel Processing:
├─ Intent Analysis (Claude AI)
├─ Context Retrieval (RAG System)
├─ Compliance Check (Norwegian Services)
├─ Template Selection (Template Engine)
└─ Localization Setup (i18n Services)
     ↓
Combined Output → Validation → Generated Project
```

### **2. Compliance Integration**
```
Every Generated Component:
├─ NSM Security Classification
├─ GDPR Data Protection Setup
├─ WCAG AAA Accessibility Validation
└─ Norwegian Digital Standards Compliance
     ↓
Automated Compliance Report + Audit Trail
```

### **3. Multi-Language Support**
```
Template Generation:
├─ Extract translatable strings
├─ Generate translation keys
├─ Apply cultural adaptations
├─ Configure RTL support (Arabic)
└─ Validate translations
     ↓
Fully Localized Project Structure
```

---

## 🚀 **End Product Summary**

The Xaheen Platform creates a **unified ecosystem** where:

1. **Multiple interfaces** (CLI modes + Web) provide flexible access
2. **AI orchestration** intelligently combines all services
3. **Norwegian compliance** is built into every generated project
4. **Multi-language support** enables global development
5. **Enterprise-grade validation** ensures production readiness

**Result**: Developers get AI-powered, compliant, accessible, and localized TypeScript projects with minimal effort and maximum quality.

---

*This service architecture ensures that every component works together seamlessly to deliver the most advanced development platform for the Norwegian market and beyond.*
