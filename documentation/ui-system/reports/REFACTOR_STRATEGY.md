# 🔧 PURE COMPONENT REFACTORING STRATEGY

## 🎯 OBJECTIVE

Convert all UI components to pure presentational components compliant with @.cursorrules enterprise standards.

## 📋 VIOLATION CATEGORIES TO FIX

### **🔴 CRITICAL - Must Fix Immediately**

1. **useState violations** (18 files) - Remove all internal state
2. **useEffect violations** (8 files) - Remove all side effects
3. **useCallback violations** (15 files) - Remove all callback memoization
4. **useMemo violations** (15+ files) - Remove all value memoization
5. **Context usage** (1 file) - Remove React Context dependencies
6. **SSR directives** (1 file) - Remove 'use client' directives

### **🟡 HIGH PRIORITY**

1. **Hardcoded colors** (5 files) - Replace with design tokens
2. **Hardcoded spacing** (1 file) - Replace with design system values

## 🏗️ REFACTORING APPROACH

### **Phase 1: Remove Client-Side State Hooks**

**Strategy**: Convert stateful components to controlled components that receive all state via props.

**Before (Violates Standards):**

```typescript
// ❌ FORBIDDEN - Internal state
const [isVisible, setIsVisible] = useState(false);
const [value, setValue] = useState('');

const handleChange = useCallback(
  newValue => {
    setValue(newValue);
    onChange?.(newValue);
  },
  [onChange]
);
```

**After (Compliant):**

```typescript
// ✅ CORRECT - Pure props-based
interface ComponentProps {
  readonly isVisible: boolean;
  readonly value: string;
  readonly onVisibilityChange: (visible: boolean) => void;
  readonly onChange: (value: string) => void;
}

// Pure function - no hooks
const Component = ({ isVisible, value, onVisibilityChange, onChange }: ComponentProps) => {
  return (
    <div onClick={() => onVisibilityChange(!isVisible)}>
      {/* Pure JSX based on props */}
    </div>
  );
};
```

### **Phase 2: Remove Context Dependencies**

**Strategy**: Replace Context with explicit prop drilling or composition patterns.

**Before (Violates Standards):**

```typescript
// ❌ FORBIDDEN - React Context
const context = useContext(UISystemContext);
```

**After (Compliant):**

```typescript
// ✅ CORRECT - Props-based configuration
interface ComponentProps {
  readonly uiConfig: UISystemConfig;
  readonly accessibility: AccessibilityConfig;
}
```

### **Phase 3: Replace Hardcoded Values**

**Strategy**: Replace all hardcoded colors and spacing with design tokens.

**Before (Violates Standards):**

```typescript
// ❌ FORBIDDEN - Hardcoded values
primary: '#1976d2',
padding: '16px',
```

**After (Compliant):**

```typescript
// ✅ CORRECT - Design tokens
className = 'bg-primary p-4';
```

## 📁 FILE-BY-FILE REFACTOR PLAN

### **🔴 CRITICAL FILES (useState Violations)**

1. **src/components/action-feedback/AlertBase.tsx**

   - Remove: `useState(true)` for visibility
   - Add: `isVisible`, `onVisibilityChange` props

2. **src/components/ui/context-menu.tsx**

   - Remove: `useState(false)` for visibility, `useState({ x: 0, y: 0 })` for position
   - Add: `isOpen`, `position`, `onOpenChange`, `onPositionChange` props

3. **src/components/xala/Input.tsx**

   - Remove: `useState(false)` for password visibility, `useState('')` for value
   - Add: `showPassword`, `value`, `onPasswordToggle`, `onChange` props

4. **src/components/action-feedback/Toast.tsx**

   - Remove: `useState(false)` for visibility, `useState(false)` for paused
   - Add: `isVisible`, `isPaused`, `onVisibilityChange`, `onPauseChange` props

5. **src/components/ui/checkbox.tsx**
   - Remove: `useState<string[]>()` for selected values
   - Add: `selectedValues`, `onSelectionChange` props

[Continue for all 18 useState violations...]

### **🔴 CRITICAL FILES (useEffect Violations)**

1. **src/components/action-feedback/Toast.tsx**

   - Remove: Auto-hide timer effects
   - Add: External timer management via props

2. **src/components/action-feedback/Modal.tsx**
   - Remove: Focus management effects
   - Add: Focus management via props or external hooks

[Continue for all 8 useEffect violations...]

### **🔴 CRITICAL FILES (useCallback/useMemo Violations)**

1. **src/components/data-display/Badge.tsx**
   - Remove: `useMemo` for display count, classes, accessibility props
   - Replace: Direct computation in render (acceptable for pure components)

[Continue for all callback/memo violations...]

## 🎯 IMPLEMENTATION PHASES

### **Phase 1: Core Form Components (Week 1)**

- Input.tsx ✓
- Checkbox.tsx ✓
- Select.tsx ✓
- Textarea.tsx ✓
- Radio.tsx ✓

### **Phase 2: Feedback Components (Week 2)**

- Toast.tsx ✓
- Modal.tsx ✓
- Alert.tsx ✓
- Tooltip.tsx ✓

### **Phase 3: Interactive Components (Week 3)**

- ContextMenu.tsx ✓
- TreeView.tsx ✓
- Slider.tsx ✓
- GlobalSearch.tsx ✓

### **Phase 4: Platform Components (Week 4)**

- DesktopSidebar.tsx ✓
- MobileHeader.tsx ✓
- BottomNavigation.tsx ✓

### **Phase 5: Hardcoded Values (Week 5)**

- Replace hex colors with design tokens ✓
- Replace pixel spacing with system values ✓
- Remove SSR directives ✓

## ✅ SUCCESS CRITERIA

- [ ] Zero useState usage in components
- [ ] Zero useEffect usage in components
- [ ] Zero useCallback usage in components
- [ ] Zero useMemo usage in components
- [ ] Zero React Context usage in components
- [ ] Zero 'use client' directives in components
- [ ] Zero hardcoded colors (hex/rgb/rgba)
- [ ] Zero hardcoded spacing (px/rem/em)
- [ ] All components pass enterprise standards lint rules
- [ ] Build succeeds with strict TypeScript
- [ ] All components are pure functions or forwardRef wrappers

## 🧪 VALIDATION PROCESS

After each phase:

1. Run `pnpm run lint` - Must pass with zero violations
2. Run `pnpm run build` - Must compile successfully
3. Run violation detection searches - Must return zero results
4. Manual component testing - Must render correctly with external state

---

**Target**: Full enterprise standards compliance
**Timeline**: 5 weeks systematic refactoring
**Risk**: Temporary functionality loss during transition
