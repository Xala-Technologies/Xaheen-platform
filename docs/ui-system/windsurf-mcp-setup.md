# Using Xala UI System MCP Server in Windsurf

This guide shows you how to integrate the Xala UI System MCP server with Windsurf IDE for seamless component generation and development.

## 🚀 Quick Setup

### 1. Install the MCP Server

```bash
# Install globally for CLI usage
npm install -g @xala-technologies/ui-system-mcp

# Or install locally in your project
npm install @xala-technologies/ui-system-mcp
```

### 2. Configure Windsurf MCP Settings

#### Option A: Global Configuration (Recommended)

1. Open Windsurf IDE
2. Go to **Settings** → **Extensions** → **MCP Servers**
3. Add a new MCP server configuration:

```json
{
  "name": "xala-ui-system",
  "command": "node",
  "args": [
    "/usr/local/lib/node_modules/@xala-technologies/ui-system-mcp/dist/index.js"
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Option B: Project-Specific Configuration

Create a `.windsurf/mcp-servers.json` file in your project root:

```json
{
  "servers": {
    "xala-ui-system": {
      "command": "node",
      "args": ["./node_modules/@xala-technologies/ui-system-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "xala:*"
      }
    }
  }
}
```

#### Option C: Using npx (No Installation Required)

```json
{
  "servers": {
    "xala-ui-system": {
      "command": "npx",
      "args": ["@xala-technologies/ui-system-mcp"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 3. Restart Windsurf

After adding the configuration, restart Windsurf IDE to load the MCP server.

## 🛠️ Available MCP Tools

Once configured, you'll have access to these tools in Windsurf:

### Component Generation Tools

| Tool | Description | Usage |
|------|-------------|-------|
| `generate_component` | Generate React components | Create buttons, cards, forms, etc. |
| `generate_layout` | Generate layout components | Create page layouts, grids, containers |
| `generate_page_template` | Generate complete page templates | Create dashboard, landing, profile pages |
| `generate_form` | Generate form components | Create contact, login, registration forms |
| `generate_data_table` | Generate data tables | Create sortable, filterable tables |
| `generate_navigation` | Generate navigation components | Create navbars, sidebars, breadcrumbs |

### Template Management Tools

| Tool | Description | Usage |
|------|-------------|-------|
| `list_templates` | List available templates | Browse component templates |
| `validate_config` | Validate component configuration | Check config before generation |

## 💡 Using MCP Tools in Windsurf

### Example 1: Generate a User Card Component

In Windsurf chat, type:

```
@mcp Generate a user card component with the following specs:
- Name: UserProfileCard
- Category: interactive
- Features: avatar, name, email, role badge
- Theme: enterprise
- Include tests and stories
```

The MCP server will generate:
- `UserProfileCard.tsx` - Main component
- `UserProfileCard.test.tsx` - Jest tests
- `UserProfileCard.stories.tsx` - Storybook stories
- `UserProfileCard.md` - Documentation

### Example 2: Generate a Data Table

```
@mcp Create a data table for user management with:
- Columns: name, email, role, status, actions
- Features: sorting, filtering, pagination
- Actions: edit, delete, view
- Theme: admin
```

### Example 3: Generate a Complete Dashboard Layout

```
@mcp Generate a dashboard layout with:
- Layout type: admin
- Sections: header, sidebar, main content, footer
- Theme: enterprise
- Responsive: mobile, tablet, desktop
```

## 🎨 Configuration Options

### Component Configuration

```typescript
interface ComponentConfig {
  name: string;                    // Component name
  category: 'interactive' | 'display' | 'layout' | 'form';
  variant: 'default' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg' | 'xl';
  theme: 'enterprise' | 'finance' | 'healthcare' | 'education';
  locale: 'en' | 'nb' | 'fr' | 'ar';
  
  features: {
    interactive: boolean;          // Click handlers, hover states
    animated: boolean;             // Transitions and animations
    tooltips: boolean;             // Tooltip support
    loading: boolean;              // Loading states
    error: boolean;                // Error handling
  };
  
  styling: {
    colorScheme: 'auto' | 'light' | 'dark';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    spacing: 'compact' | 'comfortable' | 'spacious';
  };
  
  accessibility: {
    level: 'AA' | 'AAA';           // WCAG compliance level
    screenReader: boolean;         // Screen reader support
    keyboardNavigation: boolean;   // Keyboard navigation
    highContrast: boolean;         // High contrast support
    reducedMotion: boolean;        // Reduced motion support
  };
  
  responsive: {
    breakpoints: ('mobile' | 'tablet' | 'desktop')[];
    mobileFirst: boolean;          // Mobile-first design
    adaptiveLayout: boolean;       // Adaptive layouts
    touchOptimized: boolean;       // Touch-friendly interactions
  };
}
```

### Theme Options

| Theme | Description | Use Case |
|-------|-------------|----------|
| `enterprise` | Professional, corporate design | Business applications |
| `finance` | Financial sector styling | Banking, fintech apps |
| `healthcare` | Medical sector design | Healthcare applications |
| `education` | Educational styling | Learning platforms |
| `ecommerce` | E-commerce design | Shopping applications |
| `productivity` | Productivity app styling | Task management, tools |

### Municipal Themes

| Theme | Description | Use Case |
|-------|-------------|----------|
| `oslo` | Oslo municipality styling | Norwegian public services |
| `bergen` | Bergen municipality styling | Bergen city services |
| `drammen` | Drammen municipality styling | Drammen city services |

## 🔧 Advanced Usage

### Custom Component Generation

```typescript
// In Windsurf chat
@mcp Generate a custom notification component with:
{
  "name": "NotificationToast",
  "category": "interactive",
  "variant": "default",
  "size": "md",
  "theme": "enterprise",
  "locale": "en",
  "features": {
    "interactive": true,
    "animated": true,
    "tooltips": false,
    "loading": false,
    "error": true
  },
  "styling": {
    "colorScheme": "auto",
    "borderRadius": "md",
    "shadow": "lg",
    "spacing": "comfortable"
  },
  "accessibility": {
    "level": "AAA",
    "screenReader": true,
    "keyboardNavigation": true,
    "highContrast": true,
    "reducedMotion": true
  },
  "responsive": {
    "breakpoints": ["mobile", "tablet", "desktop"],
    "mobileFirst": true,
    "adaptiveLayout": true,
    "touchOptimized": true
  }
}
```

### Batch Component Generation

```
@mcp Generate a complete user management system with:
1. UserCard component (display user info)
2. UserForm component (create/edit users)
3. UserTable component (list users with actions)
4. UserDashboard layout (combine all components)
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MCP Server Not Found

**Error**: `MCP server 'xala-ui-system' not found`

**Solution**:
- Verify the server is installed: `npm list -g @xala-technologies/ui-system-mcp`
- Check the path in your configuration
- Restart Windsurf after configuration changes

#### 2. Permission Denied

**Error**: `Permission denied when executing MCP server`

**Solution**:
```bash
# Make the script executable
chmod +x /usr/local/lib/node_modules/@xala-technologies/ui-system-mcp/dist/index.js

# Or use npx instead
```

#### 3. Module Not Found

**Error**: `Cannot find module '@xala-technologies/ui-system'`

**Solution**:
```bash
# Install the UI System in your project
npm install @xala-technologies/ui-system react react-dom
```

#### 4. TypeScript Errors

**Error**: TypeScript compilation errors in generated components

**Solution**:
- Ensure your project has proper TypeScript configuration
- Install required type definitions:
```bash
npm install -D @types/react @types/react-dom typescript
```

### Debug Mode

Enable debug logging by setting environment variables:

```json
{
  "servers": {
    "xala-ui-system": {
      "command": "node",
      "args": ["./node_modules/@xala-technologies/ui-system-mcp/dist/index.js"],
      "env": {
        "DEBUG": "xala:*",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## 📚 Examples

### Complete Project Setup

1. **Initialize Project**:
```bash
mkdir my-app && cd my-app
npm init -y
npm install @xala-technologies/ui-system react react-dom
npm install -D @xala-technologies/ui-system-mcp typescript @types/react
```

2. **Configure Windsurf MCP**:
```json
{
  "servers": {
    "xala-ui-system": {
      "command": "npx",
      "args": ["@xala-technologies/ui-system-mcp"]
    }
  }
}
```

3. **Generate Components**:
```
@mcp Generate a login form with email, password fields and submit button
@mcp Create a dashboard layout with sidebar navigation
@mcp Generate a user profile card component
```

### Integration with Next.js

```
@mcp Generate a Next.js page template with:
- Layout: web
- Sections: header, main, footer
- Theme: enterprise
- Responsive: all breakpoints
- Include: SEO meta tags, loading states
```

### Integration with Storybook

```
@mcp Generate components with Storybook stories:
- Button component with all variants
- Card component with different content types
- Form components with validation states
```

## 🔗 Related Resources

- [Xala UI System Documentation](../README.md)
- [Component API Reference](../docs/components/)
- [Theme Customization Guide](../docs/theming.md)
- [Accessibility Guidelines](../docs/accessibility.md)
- [MCP Server GitHub Repository](https://github.com/xala-technologies/ui-system-mcp)

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [MCP server logs](#debug-mode)
3. Create an issue on [GitHub](https://github.com/xala-technologies/ui-system-mcp/issues)
4. Contact the development team

---

**Happy coding with Xala UI System MCP! 🚀**
