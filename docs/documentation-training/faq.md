# Frequently Asked Questions (FAQ)

Find answers to the most common questions about Xaheen CLI, template development, Norwegian compliance, and community contributions.

## 🚀 Getting Started

### Q: What is Xaheen CLI?

**A:** Xaheen CLI is a comprehensive frontend framework that generates high-quality, accessible, and Norwegian-compliant components across multiple platforms (React, Vue, Angular, Svelte, etc.). It combines intelligent template generation with AI assistance to accelerate development while maintaining quality standards.

### Q: How do I install Xaheen CLI?

**A:** Install Xaheen CLI globally using npm:

```bash
npm install -g @xaheen/cli
```

Verify installation:
```bash
xaheen --version
```

### Q: What platforms does Xaheen CLI support?

**A:** Xaheen CLI supports 7 major platforms:
- **React** (including Next.js)
- **Vue** (Vue 3 with Composition API)
- **Angular** (Standalone components)
- **Svelte** (SvelteKit compatible)
- **Electron** (Desktop applications)
- **React Native** (Mobile applications)
- **Web Components** (Platform-agnostic)

### Q: Can I use Xaheen CLI with existing projects?

**A:** Yes! Xaheen CLI is designed to work with existing projects. Simply run:

```bash
cd your-existing-project
xaheen init
```

This will detect your project structure and configure Xaheen CLI accordingly.

## 🏗️ Template System

### Q: How do templates work in Xaheen CLI?

**A:** Templates are intelligent blueprints that generate code based on your requirements. They use:
- **Handlebars** templating engine for dynamic content
- **JSON Schema** for input validation
- **Context-aware** generation based on your project
- **Multi-platform** support for different frameworks
- **Built-in compliance** with accessibility and Norwegian standards

### Q: Where can I find templates?

**A:** Templates are available in several places:
- **Built-in templates** included with Xaheen CLI
- **Community templates** from the template registry
- **Your own templates** created locally
- **Organization templates** shared within your team

Search for templates:
```bash
xaheen search templates "button component"
```

### Q: How do I create my own template?

**A:** Follow these steps:

1. **Create template structure:**
   ```bash
   xaheen create template my-custom-template
   ```

2. **Define template configuration** in `template.json`
3. **Create template files** with Handlebars syntax
4. **Add validation rules** and tests
5. **Document your template**
6. **Test thoroughly** before sharing

See our [Template Development Guide](./template-documentation/usage/template-development.md) for details.

### Q: Can I modify generated code?

**A:** Yes! Generated code is meant to be customized. The CLI creates a solid foundation that you can build upon. However, be careful when regenerating components, as it may overwrite your changes unless you use version control.

## ♿ Accessibility & Norwegian Compliance

### Q: What does "Norwegian compliance" mean?

**A:** Norwegian compliance includes:
- **WCAG AAA accessibility** standards
- **Norwegian language** localization support
- **Government digital standards** compliance
- **Cultural considerations** for Norwegian users
- **Data protection** requirements (GDPR)
- **Universal design** principles

### Q: How does Xaheen CLI ensure accessibility?

**A:** All generated components include:
- **Semantic HTML** elements
- **ARIA labels** and roles
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support
- **Focus management**
- **Error announcements**

### Q: Can I disable Norwegian compliance features?

**A:** Yes, Norwegian compliance is optional. You can disable it by:

```bash
xaheen generate component MyButton --norwegian-compliance=false
```

Or in your project configuration:
```json
{
  "norwegianCompliance": false
}
```

### Q: How do I add Norwegian translations?

**A:** Norwegian translations are included automatically when compliance is enabled. You can:

1. **Use generated translation files:**
   ```json
   // locales/nb-NO.json
   {
     "buttons": {
       "save": "Lagre",
       "cancel": "Avbryt"
     }
   }
   ```

2. **Add custom translations:**
   ```typescript
   const { t } = useTranslation();
   <button>{t('buttons.save')}</button>
   ```

## 🤖 AI Integration

### Q: How does AI assistance work?

**A:** Xaheen CLI integrates with AI models through the MCP (Model Context Protocol) to provide:
- **Intelligent code generation**
- **Context-aware suggestions**
- **Code optimization**
- **Quality improvements**
- **Accessibility enhancements**

### Q: Do I need an AI API key?

**A:** AI features are optional. You can use Xaheen CLI without AI assistance. If you want AI features, you'll need to configure your preferred AI provider:

```bash
xaheen config set ai.provider openai
xaheen config set ai.apiKey your-api-key
```

### Q: Which AI providers are supported?

**A:** Currently supported AI providers:
- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic** (Claude)
- **Google** (Gemini)
- **Local models** (through Ollama)

## 🧪 Testing & Quality

### Q: Does Xaheen CLI generate tests?

**A:** Yes! By default, Xaheen CLI generates:
- **Unit tests** using Jest or Vitest
- **Accessibility tests** using Testing Library
- **Integration tests** for complex components
- **Visual regression tests** (when configured)

### Q: How do I run generated tests?

**A:** Generated tests integrate with your existing test setup:

```bash
# Run all tests
npm test

# Run specific component tests
npm test MyButton

# Run with coverage
npm test -- --coverage
```

### Q: What quality standards does Xaheen CLI follow?

**A:** Generated code follows:
- **TypeScript strict mode**
- **ESLint best practices**
- **Prettier formatting**
- **WCAG AAA accessibility**
- **Performance optimization**
- **Security best practices**

## 🔧 Configuration & Customization

### Q: How do I configure Xaheen CLI for my project?

**A:** Configuration is managed through:

1. **Global configuration:**
   ```bash
   xaheen config set template.defaultPlatform react
   ```

2. **Project configuration** (`.xaheen.json`):
   ```json
   {
     "platform": "react",
     "outputPath": "./src/components",
     "norwegianCompliance": true,
     "accessibility": "AAA"
   }
   ```

3. **Environment variables:**
   ```bash
   export XAHEEN_PLATFORM=react
   ```

### Q: Can I customize the generated code style?

**A:** Yes! You can customize:

1. **Code formatting** through Prettier config
2. **Linting rules** through ESLint config
3. **Template overrides** in your project
4. **Custom templates** for specific needs

### Q: How do I override default templates?

**A:** Create local template overrides:

1. **Create override directory:**
   ```bash
   mkdir .xaheen/templates/overrides
   ```

2. **Copy and modify** existing templates
3. **Configure override path** in `.xaheen.json`:
   ```json
   {
     "templateOverrides": "./.xaheen/templates/overrides"
   }
   ```

## 🚨 Troubleshooting

### Q: Component generation fails with validation errors

**A:** Common solutions:

1. **Check input parameters:**
   ```bash
   xaheen template schema button-template
   ```

2. **Validate your configuration:**
   ```bash
   xaheen validate config
   ```

3. **Update templates:**
   ```bash
   xaheen template update --all
   ```

4. **Clear cache:**
   ```bash
   xaheen cache clear
   ```

### Q: Generated code doesn't compile

**A:** Try these steps:

1. **Check TypeScript configuration**
2. **Install missing dependencies:**
   ```bash
   npm install
   ```
3. **Update TypeScript definitions:**
   ```bash
   npm install --save-dev @types/react
   ```
4. **Regenerate with latest template:**
   ```bash
   xaheen generate component MyButton --template=button --force
   ```

### Q: Tests are failing after generation

**A:** Common fixes:

1. **Update test snapshots:**
   ```bash
   npm test -- --updateSnapshot
   ```

2. **Install test dependencies:**
   ```bash
   npm install --save-dev @testing-library/react
   ```

3. **Check test configuration** in `jest.config.js` or `vitest.config.ts`

### Q: Accessibility tests are failing

**A:** Ensure your component includes:
- **Proper ARIA labels**
- **Semantic HTML elements**
- **Keyboard navigation support**
- **Screen reader compatibility**

Run accessibility audit:
```bash
xaheen audit accessibility ./src/components/MyButton
```

## 🌍 Multi-Platform Development

### Q: Can I generate the same component for multiple platforms?

**A:** Yes! Use multi-platform generation:

```bash
xaheen generate component MyButton \
  --platforms=react,vue,angular \
  --template=button
```

This creates platform-specific versions while maintaining consistency.

### Q: How do I handle platform-specific differences?

**A:** Templates can include platform-specific code:

```handlebars
{{#isReact}}
import React from 'react';
{{/isReact}}

{{#isVue}}
<script setup lang="ts">
{{/isVue}}

{{#isAngular}}
import { Component } from '@angular/core';
{{/isAngular}}
```

### Q: Can I share components between platforms?

**A:** While components are platform-specific, you can share:
- **Design tokens** and styling
- **Business logic** through services
- **TypeScript interfaces** and types
- **Template configurations**

## 📦 Package Management

### Q: How do I manage template dependencies?

**A:** Template dependencies are managed automatically:

1. **Templates declare dependencies** in `template.json`
2. **CLI checks compatibility** with your project
3. **Dependencies are installed** automatically
4. **Conflicts are resolved** or reported

### Q: Can I use private templates?

**A:** Yes! Xaheen CLI supports:

1. **Private template registries**
2. **Git-based templates**
3. **Local file templates**
4. **Organization-specific templates**

Configure private registry:
```bash
xaheen config set registry.url https://templates.yourcompany.com
```

### Q: How do I update templates?

**A:** Keep templates up to date:

```bash
# Update all templates
xaheen template update --all

# Update specific template
xaheen template update button-template

# Check for updates
xaheen template outdated
```

## 🤝 Community & Contributions

### Q: How can I contribute to Xaheen CLI?

**A:** There are many ways to contribute:

1. **Report bugs** and issues
2. **Create templates** for the community
3. **Improve documentation**
4. **Help other users** in discussions
5. **Contribute code** to the core CLI

See our [Contribution Guidelines](./community-contribution/contribution-guidelines.md).

### Q: How do I report bugs?

**A:** Report bugs through:

1. **GitHub Issues:** [xaheen/cli/issues](https://github.com/xaheen/cli/issues)
2. **Provide details:** Steps to reproduce, error messages, environment
3. **Include versions:** CLI version, Node.js version, OS
4. **Minimal reproduction:** Share a minimal example

### Q: Where can I get help?

**A:** Get help from the community:

- **Discord Server:** [discord.gg/xaheen](https://discord.gg/xaheen)
- **GitHub Discussions:** General questions and discussions
- **Stack Overflow:** Tag questions with `xaheen-cli`
- **Documentation:** Comprehensive guides and tutorials
- **Email Support:** [support@xaheen.com](mailto:support@xaheen.com)

### Q: How do I share my templates?

**A:** Share templates with the community:

1. **Publish to registry:**
   ```bash
   xaheen template publish ./my-template
   ```

2. **Share on GitHub:** Create public repository
3. **Write documentation:** Include usage examples
4. **Engage with users:** Respond to feedback

## 💰 Licensing & Commercial Use

### Q: Is Xaheen CLI free to use?

**A:** Yes! Xaheen CLI is open source under the MIT license. You can:
- Use it in commercial projects
- Modify the code
- Distribute it
- Create derivative works

### Q: Can I use generated code in commercial projects?

**A:** Absolutely! Generated code is yours to use however you want. There are no licensing restrictions on the output.

### Q: Are there enterprise features?

**A:** We offer enterprise features for organizations:
- **Private template registries**
- **Team collaboration tools**
- **Advanced analytics**
- **Priority support**
- **Custom integrations**

Contact [enterprise@xaheen.com](mailto:enterprise@xaheen.com) for details.

## 🔮 Future & Roadmap

### Q: What's planned for future releases?

**A:** Upcoming features include:
- **Visual template builder**
- **Enhanced AI integration**
- **Real-time collaboration**
- **Mobile app companion**
- **Advanced analytics**
- **Enterprise features**

### Q: How can I influence the roadmap?

**A:** Your input shapes our roadmap:
- **Feature requests** on GitHub
- **Community discussions**
- **User surveys** and feedback
- **Contribution** to development

### Q: Will Xaheen CLI always be free?

**A:** The core CLI will always be free and open source. Enterprise features may have costs, but the fundamental functionality remains free.

## 📞 Still Have Questions?

If you can't find the answer you're looking for:

1. **Search our documentation:** [docs.xaheen.com](https://docs.xaheen.com)
2. **Check GitHub issues:** Someone might have asked already
3. **Ask the community:** Discord or GitHub Discussions
4. **Contact support:** [support@xaheen.com](mailto:support@xaheen.com)

We're here to help you succeed with Xaheen CLI!

---

**Can't find what you're looking for?** [Submit a question](https://github.com/xaheen/cli/discussions/new?category=q-a) and we'll add it to this FAQ!