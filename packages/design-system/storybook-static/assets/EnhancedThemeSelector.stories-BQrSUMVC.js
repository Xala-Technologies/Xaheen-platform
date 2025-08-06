import{E as c,a as x,r as n,j as e,c as M}from"./iframe-DvnYCE9u.js";import"./preload-helper-C1FmrZbK.js";const G={title:"Components/EnhancedThemeSelector",component:c,parameters:{layout:"padded",docs:{description:{component:"Enhanced theme selector that combines system color scheme (light/dark/system) with industry themes. Based on the existing theme-switcher design pattern with Norwegian localization and WCAG AAA compliance."}}},tags:["autodocs"],argTypes:{currentColorScheme:{control:"select",options:["light","dark","system"],description:"Current color scheme"},currentIndustryTheme:{control:"select",options:Object.keys(x),description:"Current industry theme"},variant:{control:"select",options:["compact","expanded","dropdown"],description:"Display variant"},norwegianLabels:{control:"boolean",description:"Use Norwegian language labels"},showDescription:{control:"boolean",description:"Show theme descriptions"}}},d={args:{currentColorScheme:"system",currentIndustryTheme:"enterprise",onColorSchemeChange:r=>console.log("Color scheme:",r),onIndustryThemeChange:r=>console.log("Industry theme:",r),variant:"compact",norwegianLabels:!0,showDescription:!0}},m={render:()=>{const[r,o]=n.useState("light"),[s,t]=n.useState("enterprise");return e.jsxs("div",{className:"space-y-6",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Compact Theme Selector"}),e.jsx("p",{className:"text-muted-foreground",children:"Perfect for toolbars and compact interfaces. Combines color scheme toggle with industry theme dropdown."}),e.jsx(c,{currentColorScheme:r,currentIndustryTheme:s,onColorSchemeChange:o,onIndustryThemeChange:t,variant:"compact",norwegianLabels:!0}),e.jsxs("div",{className:"mt-4 text-sm text-muted-foreground",children:[e.jsxs("p",{children:["Nåværende fargeskjema: ",r]}),e.jsxs("p",{children:["Nåværende bransjetema: ",x[s].name]})]})]})}},l={render:()=>{const[r,o]=n.useState("dark"),[s,t]=n.useState("finance");return e.jsxs("div",{className:"space-y-6",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Dropdown Theme Selector"}),e.jsx("p",{className:"text-muted-foreground",children:"Comprehensive dropdown with sections for both color scheme and industry themes."}),e.jsx(c,{currentColorScheme:r,currentIndustryTheme:s,onColorSchemeChange:o,onIndustryThemeChange:t,variant:"dropdown",norwegianLabels:!0,showDescription:!0}),e.jsxs("div",{className:"p-4 rounded-lg border",style:{backgroundColor:"var(--theme-primary, #059669)",color:"white"},children:[e.jsx("h4",{className:"font-semibold",children:"Live Preview"}),e.jsxs("p",{className:"text-sm opacity-90 mt-1",children:["Dette området viser den valgte temafargene: ",x[s].name]})]})]})}},i={render:()=>{const[r,o]=n.useState("system"),[s,t]=n.useState("healthcare");return e.jsxs("div",{className:"space-y-6",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Expanded Theme Selector"}),e.jsx("p",{className:"text-muted-foreground",children:"Full layout with clear sections for color scheme and industry theme selection."}),e.jsx(c,{currentColorScheme:r,currentIndustryTheme:s,onColorSchemeChange:o,onIndustryThemeChange:t,variant:"expanded",norwegianLabels:!0,showDescription:!0}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"p-4 bg-primary text-primary-foreground rounded-lg",children:[e.jsx("h4",{className:"font-medium",children:"Primærknapp"}),e.jsx("p",{className:"text-sm opacity-90",children:"Benytter primærfarge fra valgt tema"})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h4",{className:"font-medium",children:"Kort"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Tilpasser seg fargeskjema"})]}),e.jsxs("div",{className:"p-4 bg-muted rounded-lg",children:[e.jsx("h4",{className:"font-medium",children:"Bakgrunn"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Automatisk kontrast"})]})]})]})}},h={render:()=>{const[r,o]=n.useState("light"),[s,t]=n.useState("productivity");return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Compact Variant"}),e.jsx(c,{currentColorScheme:r,currentIndustryTheme:s,onColorSchemeChange:o,onIndustryThemeChange:t,variant:"compact"})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Dropdown Variant"}),e.jsx(c,{currentColorScheme:r,currentIndustryTheme:s,onColorSchemeChange:o,onIndustryThemeChange:t,variant:"dropdown"})]})]})}},u={render:()=>{const[r,o]=n.useState("light"),[s,t]=n.useState("enterprise");return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"text-xl font-bold mb-2",children:"Bransjetemaer for Norske Bedrifter"}),e.jsx("p",{className:"text-muted-foreground",children:"Velg tema som passer din bransje og bruksområde"})]}),e.jsx(c,{currentColorScheme:r,currentIndustryTheme:s,onColorSchemeChange:o,onIndustryThemeChange:t,variant:"expanded",norwegianLabels:!0,showDescription:!0}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:Object.values(x).map(a=>e.jsxs("div",{className:M("p-6 rounded-lg border transition-all cursor-pointer",a.id===s?"border-primary bg-primary/5":"border-border"),onClick:()=>t(a.id),children:[e.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[e.jsx("span",{className:"text-3xl",children:a.icon}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold",children:a.name}),e.jsx("p",{className:"text-sm text-muted-foreground",children:a.description})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("div",{className:"h-8 rounded",style:{backgroundColor:a.primaryColor}}),e.jsx("p",{className:"text-xs text-muted-foreground font-mono",children:a.primaryColor})]})]},a.id))})]})}},p={render:()=>{const[r,o]=n.useState("system"),[s,t]=n.useState("enterprise");return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"p-6 bg-card border rounded-xl",children:[e.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Norsk Bedriftskontekst"}),e.jsx("p",{className:"text-muted-foreground mb-6",children:"Temavelger tilpasset norske bedrifter med støtte for både lysforhold og bransjespesifikke farger."}),e.jsx(c,{currentColorScheme:r,currentIndustryTheme:s,onColorSchemeChange:o,onIndustryThemeChange:t,variant:"dropdown",norwegianLabels:!0,showDescription:!0})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"p-6 border rounded-lg",children:[e.jsx("h4",{className:"font-semibold mb-4 flex items-center gap-2",children:"💰 Finanssektor"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("div",{className:"h-3 bg-green-600 rounded"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Grønne farger for tillit og stabilitet"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Egnet for banker, forsikring, og finansielle tjenester"})]})]}),e.jsxs("div",{className:"p-6 border rounded-lg",children:[e.jsx("h4",{className:"font-semibold mb-4 flex items-center gap-2",children:"🏥 Helsevesen"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("div",{className:"h-3 bg-red-600 rounded"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Røde farger for medisinsk kontekst"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Tilpasset helseregioner og medisinske systemer"})]})]})]})]})}},g={args:{currentColorScheme:"system",currentIndustryTheme:"enterprise",onColorSchemeChange:r=>console.log("Color scheme:",r),onIndustryThemeChange:r=>console.log("Industry theme:",r),variant:"expanded",norwegianLabels:!0,showDescription:!0}};var y,S,N;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    currentColorScheme: 'system',
    currentIndustryTheme: 'enterprise',
    onColorSchemeChange: (scheme: ColorScheme) => console.log('Color scheme:', scheme),
    onIndustryThemeChange: (theme: EnhancedIndustryTheme) => console.log('Industry theme:', theme),
    variant: 'compact',
    norwegianLabels: true,
    showDescription: true
  }
}`,...(N=(S=d.parameters)==null?void 0:S.docs)==null?void 0:N.source}}};var C,v,f;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    return <div className="space-y-6">
        <h3 className="text-lg font-semibold">Compact Theme Selector</h3>
        <p className="text-muted-foreground">
          Perfect for toolbars and compact interfaces. Combines color scheme toggle with industry theme dropdown.
        </p>
        
        <EnhancedThemeSelector currentColorScheme={colorScheme} currentIndustryTheme={industryTheme} onColorSchemeChange={setColorScheme} onIndustryThemeChange={setIndustryTheme} variant="compact" norwegianLabels={true} />
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Nåværende fargeskjema: {colorScheme}</p>
          <p>Nåværende bransjetema: {ENHANCED_INDUSTRY_THEMES[industryTheme].name}</p>
        </div>
      </div>;
  }
}`,...(f=(v=m.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var T,b,j;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('finance');
    return <div className="space-y-6">
        <h3 className="text-lg font-semibold">Dropdown Theme Selector</h3>
        <p className="text-muted-foreground">
          Comprehensive dropdown with sections for both color scheme and industry themes.
        </p>
        
        <EnhancedThemeSelector currentColorScheme={colorScheme} currentIndustryTheme={industryTheme} onColorSchemeChange={setColorScheme} onIndustryThemeChange={setIndustryTheme} variant="dropdown" norwegianLabels={true} showDescription={true} />
        
        <div className="p-4 rounded-lg border" style={{
        backgroundColor: 'var(--theme-primary, #059669)',
        color: 'white'
      }}>
          <h4 className="font-semibold">Live Preview</h4>
          <p className="text-sm opacity-90 mt-1">
            Dette området viser den valgte temafargene: {ENHANCED_INDUSTRY_THEMES[industryTheme].name}
          </p>
        </div>
      </div>;
  }
}`,...(j=(b=l.parameters)==null?void 0:b.docs)==null?void 0:j.source}}};var I,w,k;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('system');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('healthcare');
    return <div className="space-y-6">
        <h3 className="text-lg font-semibold">Expanded Theme Selector</h3>
        <p className="text-muted-foreground">
          Full layout with clear sections for color scheme and industry theme selection.
        </p>
        
        <EnhancedThemeSelector currentColorScheme={colorScheme} currentIndustryTheme={industryTheme} onColorSchemeChange={setColorScheme} onIndustryThemeChange={setIndustryTheme} variant="expanded" norwegianLabels={true} showDescription={true} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary text-primary-foreground rounded-lg">
            <h4 className="font-medium">Primærknapp</h4>
            <p className="text-sm opacity-90">Benytter primærfarge fra valgt tema</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium">Kort</h4>
            <p className="text-sm text-muted-foreground">Tilpasser seg fargeskjema</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Bakgrunn</h4>
            <p className="text-sm text-muted-foreground">Automatisk kontrast</p>
          </div>
        </div>
      </div>;
  }
}`,...(k=(w=i.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};var E,D,L;h.parameters={...h.parameters,docs:{...(E=h.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('productivity');
    return <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
          <EnhancedThemeSelector currentColorScheme={colorScheme} currentIndustryTheme={industryTheme} onColorSchemeChange={setColorScheme} onIndustryThemeChange={setIndustryTheme} variant="compact" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Dropdown Variant</h3>
          <EnhancedThemeSelector currentColorScheme={colorScheme} currentIndustryTheme={industryTheme} onColorSchemeChange={setColorScheme} onIndustryThemeChange={setIndustryTheme} variant="dropdown" />
        </div>
      </div>;
  }
}`,...(L=(D=h.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};var B,A,H;u.parameters={...u.parameters,docs:{...(B=u.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    return <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Bransjetemaer for Norske Bedrifter</h3>
          <p className="text-muted-foreground">
            Velg tema som passer din bransje og bruksområde
          </p>
        </div>
        
        <EnhancedThemeSelector currentColorScheme={colorScheme} currentIndustryTheme={industryTheme} onColorSchemeChange={setColorScheme} onIndustryThemeChange={setIndustryTheme} variant="expanded" norwegianLabels={true} showDescription={true} />
        
        {/* Live Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(ENHANCED_INDUSTRY_THEMES).map(theme => <div key={theme.id} className={cn('p-6 rounded-lg border transition-all cursor-pointer', theme.id === industryTheme ? 'border-primary bg-primary/5' : 'border-border')} onClick={() => setIndustryTheme(theme.id)}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{theme.icon}</span>
                <div>
                  <h4 className="font-semibold">{theme.name}</h4>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-8 rounded" style={{
              backgroundColor: theme.primaryColor
            }} />
                <p className="text-xs text-muted-foreground font-mono">
                  {theme.primaryColor}
                </p>
              </div>
            </div>)}
        </div>
      </div>;
  }
}`,...(H=(A=u.parameters)==null?void 0:A.docs)==null?void 0:H.source}}};var _,P,V;p.parameters={...p.parameters,docs:{...(_=p.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('system');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    return <div className="space-y-8">
        <div className="p-6 bg-card border rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Norsk Bedriftskontekst</h3>
          <p className="text-muted-foreground mb-6">
            Temavelger tilpasset norske bedrifter med støtte for både lysforhold og bransjespesifikke farger.
          </p>
          
          <EnhancedThemeSelector currentColorScheme={colorScheme} currentIndustryTheme={industryTheme} onColorSchemeChange={setColorScheme} onIndustryThemeChange={setIndustryTheme} variant="dropdown" norwegianLabels={true} showDescription={true} />
        </div>
        
        {/* Norwegian context examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              💰 Finanssektor
            </h4>
            <div className="space-y-2">
              <div className="h-3 bg-green-600 rounded" />
              <p className="text-sm text-muted-foreground">
                Grønne farger for tillit og stabilitet
              </p>
              <p className="text-xs text-muted-foreground">
                Egnet for banker, forsikring, og finansielle tjenester
              </p>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              🏥 Helsevesen
            </h4>
            <div className="space-y-2">
              <div className="h-3 bg-red-600 rounded" />
              <p className="text-sm text-muted-foreground">
                Røde farger for medisinsk kontekst
              </p>
              <p className="text-xs text-muted-foreground">
                Tilpasset helseregioner og medisinske systemer
              </p>
            </div>
          </div>
        </div>
      </div>;
  }
}`,...(V=(P=p.parameters)==null?void 0:P.docs)==null?void 0:V.source}}};var R,U,F;g.parameters={...g.parameters,docs:{...(R=g.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    currentColorScheme: 'system',
    currentIndustryTheme: 'enterprise',
    onColorSchemeChange: (scheme: ColorScheme) => console.log('Color scheme:', scheme),
    onIndustryThemeChange: (theme: EnhancedIndustryTheme) => console.log('Industry theme:', theme),
    variant: 'expanded',
    norwegianLabels: true,
    showDescription: true
  }
}`,...(F=(U=g.parameters)==null?void 0:U.docs)==null?void 0:F.source}}};const K=["Default","Compact","Dropdown","Expanded","VariantComparison","IndustryShowcase","NorwegianEnterprise","Playground"];export{m as Compact,d as Default,l as Dropdown,i as Expanded,u as IndustryShowcase,p as NorwegianEnterprise,g as Playground,h as VariantComparison,K as __namedExportsOrder,G as default};
