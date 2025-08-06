import{r as i,j as e,c as l,B as ae}from"./iframe-DvnYCE9u.js";import"./preload-helper-C1FmrZbK.js";const d={enterprise:{id:"enterprise",name:"Enterprise",description:"Profesjonelt design for bedrifter",primaryColor:"#1e40af",icon:"🏢"},finance:{id:"finance",name:"Finans",description:"Tillit og sikkerhet for finansinstitusjoner",primaryColor:"#059669",icon:"💰"},healthcare:{id:"healthcare",name:"Helse",description:"Rent og tilgjengelig for helsevesen",primaryColor:"#dc2626",icon:"🏥"},education:{id:"education",name:"Utdanning",description:"Vennlig og inspirerende for læring",primaryColor:"#7c3aed",icon:"🎓"},ecommerce:{id:"ecommerce",name:"E-handel",description:"Konverteringsoptimalisert for salg",primaryColor:"#ea580c",icon:"🛒"},productivity:{id:"productivity",name:"Produktivitet",description:"Fokusert design for arbeidsflyt",primaryColor:"#0891b2",icon:"⚡"}},n=({currentTheme:r,onThemeChange:t,className:o,variant:c="dropdown",size:a="md",showDescription:m=!0,norwegianLabels:u=!0})=>{const[h,p]=i.useState(!1),w=d[r],C=i.useCallback(s=>{t(s),p(!1)},[t]);return c==="dropdown"?e.jsxs("div",{className:l("relative",o),children:[e.jsxs(ae,{variant:"outline",onClick:()=>p(!h),className:l("justify-between min-w-[200px]",a==="sm"&&"h-9 text-sm px-3",a==="md"&&"h-12 px-4",a==="lg"&&"h-14 px-6 text-lg"),"aria-haspopup":"listbox","aria-expanded":h,"aria-label":u?"Velg industritema":"Select industry theme",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"text-xl",children:w.icon}),e.jsxs("div",{className:"text-left",children:[e.jsx("div",{className:"font-medium",children:w.name}),m&&a!=="sm"&&e.jsx("div",{className:"text-xs text-muted-foreground",children:w.description})]})]}),e.jsx("svg",{className:l("h-4 w-4 transition-transform",h&&"rotate-180"),fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]}),h&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-40",onClick:()=>p(!1),onKeyDown:s=>{s.key==="Escape"&&p(!1)},role:"button",tabIndex:0,"aria-label":u?"Lukk temavalgmeny":"Close theme selector"}),e.jsx("div",{className:"absolute top-full mt-2 w-full min-w-[300px] max-h-80 overflow-y-auto z-50 rounded-xl border bg-card shadow-xl",role:"listbox","aria-label":u?"Industritemaer":"Industry themes",children:Object.values(d).map(s=>e.jsx("button",{onClick:()=>C(s.id),className:l("w-full p-4 text-left hover:bg-accent transition-colors","focus:bg-accent focus:outline-none","border-b border-border last:border-0",s.id===r&&"bg-accent"),role:"option","aria-selected":s.id===r,children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("span",{className:"text-2xl",children:s.icon}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"font-medium flex items-center gap-2",children:[s.name,s.id===r&&e.jsx("svg",{className:"h-4 w-4 text-primary",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{fillRule:"evenodd",d:"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",clipRule:"evenodd"})})]}),e.jsx("div",{className:"text-sm text-muted-foreground mt-1",children:s.description}),e.jsx("div",{className:"h-3 w-12 rounded mt-2",style:{backgroundColor:s.primaryColor},"aria-label":`${u?"Primærfarge":"Primary color"}: ${s.primaryColor}`})]})]})},s.id))})]})]}):c==="grid"?e.jsx("div",{className:l("grid grid-cols-2 md:grid-cols-3 gap-3",o),children:Object.values(d).map(s=>e.jsx("button",{onClick:()=>C(s.id),className:l("p-4 rounded-xl border-2 transition-all text-left","hover:border-primary/50 focus:border-primary focus:outline-none",s.id===r?"border-primary bg-primary/5":"border-border bg-card hover:bg-accent",a==="sm"&&"p-3",a==="lg"&&"p-6"),"aria-pressed":s.id===r,children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("span",{className:l("text-2xl",a==="sm"&&"text-xl",a==="lg"&&"text-3xl"),children:s.icon}),e.jsxs("div",{className:"flex-1",children:[e.jsx("div",{className:"font-medium",children:s.name}),m&&e.jsx("div",{className:"text-xs text-muted-foreground mt-1",children:s.description}),e.jsx("div",{className:"h-2 w-8 rounded mt-2",style:{backgroundColor:s.primaryColor}})]})]})},s.id))}):c==="tabs"?e.jsx("div",{className:l("flex flex-wrap gap-2",o),role:"tablist",children:Object.values(d).map(s=>e.jsxs("button",{onClick:()=>C(s.id),className:l("inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors","hover:bg-accent focus:bg-accent focus:outline-none",s.id===r?"bg-primary text-primary-foreground":"bg-card border border-border",a==="sm"&&"px-3 py-1.5 text-sm",a==="lg"&&"px-6 py-3 text-lg"),role:"tab","aria-selected":s.id===r,children:[e.jsx("span",{children:s.icon}),e.jsx("span",{className:"font-medium",children:s.name})]},s.id))}):null},k=(r="enterprise")=>{const[t,o]=i.useState(r),c=i.useCallback(a=>{const m=d[a];document.documentElement.style.setProperty("--theme-primary",m.primaryColor),document.documentElement.setAttribute("data-theme",a),o(a)},[]);return{currentTheme:t,applyTheme:c}};try{n.displayName="ThemeSelector",n.__docgenInfo={description:"",displayName:"ThemeSelector",props:{currentTheme:{defaultValue:null,description:"",name:"currentTheme",required:!0,type:{name:"enum",value:[{value:'"enterprise"'},{value:'"finance"'},{value:'"healthcare"'},{value:'"education"'},{value:'"ecommerce"'},{value:'"productivity"'}]}},onThemeChange:{defaultValue:null,description:"",name:"onThemeChange",required:!0,type:{name:"(theme: ThemeSelectorIndustry) => void"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}},variant:{defaultValue:{value:"dropdown"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"grid"'},{value:'"dropdown"'},{value:'"tabs"'}]}},size:{defaultValue:{value:"md"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"md"'},{value:'"lg"'},{value:'"sm"'}]}},showDescription:{defaultValue:{value:"true"},description:"",name:"showDescription",required:!1,type:{name:"boolean | undefined"}},norwegianLabels:{defaultValue:{value:"true"},description:"",name:"norwegianLabels",required:!1,type:{name:"boolean | undefined"}}}}}catch{}try{k.displayName="useThemeSelector",k.__docgenInfo={description:"",displayName:"useThemeSelector",props:{}}}catch{}const ie={title:"Components/ThemeSelector",component:n,parameters:{layout:"padded",docs:{description:{component:"Industry-specific theme selector with Norwegian labels. Supports enterprise, finance, healthcare, education, ecommerce, and productivity themes with WCAG AAA accessibility compliance."}}},tags:["autodocs"],argTypes:{currentTheme:{control:"select",options:Object.keys(d),description:"Currently active theme"},variant:{control:"select",options:["dropdown","grid","tabs"],description:"Display variant"},size:{control:"select",options:["sm","md","lg"],description:"Size variant"},showDescription:{control:"boolean",description:"Show theme descriptions"},norwegianLabels:{control:"boolean",description:"Use Norwegian language labels"}}},g={args:{currentTheme:"enterprise",onThemeChange:r=>console.log("Theme changed to:",r),variant:"dropdown",size:"md",showDescription:!0,norwegianLabels:!0}},x={render:()=>{const[r,t]=i.useState("enterprise");return e.jsxs("div",{className:"space-y-6",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Dropdown Theme Selector"}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"dropdown",size:"md",showDescription:!0,norwegianLabels:!0}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Nåværende tema: ",d[r].name]})]})}},v={render:()=>{const[r,t]=i.useState("finance");return e.jsxs("div",{className:"space-y-6",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Grid Theme Selector"}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"grid",size:"md",showDescription:!0,norwegianLabels:!0}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Valgt tema: ",d[r].name]})]})}},b={render:()=>{const[r,t]=i.useState("healthcare");return e.jsxs("div",{className:"space-y-6",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Tabs Theme Selector"}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"tabs",size:"md",norwegianLabels:!0}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Aktivt tema: ",d[r].name]})]})}},f={render:()=>{const[r,t]=i.useState("education");return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-3",children:"Small"}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"dropdown",size:"sm",showDescription:!1})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-3",children:"Medium (Default)"}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"dropdown",size:"md"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-3",children:"Large"}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"dropdown",size:"lg"})]})]})}},N={render:()=>{const[r,t]=i.useState("enterprise");return e.jsxs("div",{className:"space-y-8",children:[e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:Object.values(d).map(o=>e.jsxs("div",{className:"p-6 border rounded-lg",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[e.jsx("span",{className:"text-3xl",children:o.icon}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold",children:o.name}),e.jsx("p",{className:"text-sm text-muted-foreground",children:o.description})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"h-8 rounded",style:{backgroundColor:o.primaryColor}}),e.jsx("p",{className:"text-xs text-muted-foreground font-mono",children:o.primaryColor})]})]},o.id))}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Prøv alle temaer"}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"grid",size:"sm",showDescription:!0})]})]})}},T={render:()=>{const{currentTheme:r,applyTheme:t}=k("enterprise");return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"p-6 bg-card border rounded-xl",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Live Theme Preview"}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"dropdown",size:"md",showDescription:!0}),e.jsxs("div",{className:"mt-6 p-4 rounded-lg border",style:{backgroundColor:"var(--theme-primary, #1e40af)",color:"white"},children:[e.jsx("h4",{className:"font-semibold",children:"Tema Forhåndsvisning"}),e.jsx("p",{className:"text-sm opacity-90 mt-1",children:"Dette området viser den valgte temafargene i sanntid."})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"p-4 bg-primary text-primary-foreground rounded-lg",children:[e.jsx("h4",{className:"font-medium",children:"Primærknapp"}),e.jsx("p",{className:"text-sm opacity-90",children:"Hovedhandlinger"})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h4",{className:"font-medium",children:"Kort"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Standard innhold"})]}),e.jsxs("div",{className:"p-4 bg-muted rounded-lg",children:[e.jsx("h4",{className:"font-medium",children:"Bakgrunn"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Sekundær informasjon"})]})]})]})}},j={render:()=>{const[r,t]=i.useState("enterprise");return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"p-6 bg-card border rounded-xl",children:[e.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Norske Bedriftstemaer"}),e.jsx("p",{className:"text-muted-foreground mb-6",children:"Velg tema basert på din bransje og bruksområde. Alle temaer følger norske designstandarder og WCAG AAA-retningslinjer."}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"grid",size:"md",showDescription:!0,norwegianLabels:!0})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"p-6 border rounded-lg",children:[e.jsx("h4",{className:"font-semibold mb-4",children:"Finans & Banking"}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"h-2 bg-green-600 rounded"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Grønne farger for tillit og stabilitet"})]})]}),e.jsxs("div",{className:"p-6 border rounded-lg",children:[e.jsx("h4",{className:"font-semibold mb-4",children:"Helse & Omsorg"}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"h-2 bg-red-600 rounded"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Røde farger for medisinsk kontekst"})]})]})]})]})}},y={render:()=>{const[r,t]=i.useState("productivity");return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r",children:[e.jsx("h3",{className:"font-semibold text-blue-900",children:"Tilgjengelighetsfunksjoner"}),e.jsxs("ul",{className:"mt-2 text-sm text-blue-800 space-y-1",children:[e.jsx("li",{children:"• Tastaturnavigasjon med Tab og Enter"}),e.jsx("li",{children:"• ARIA-etiketter på norsk"}),e.jsx("li",{children:"• Fokusindikatorer og hover-tilstander"}),e.jsx("li",{children:"• Skjermleservennlige beskrivelser"})]})]}),e.jsx(n,{currentTheme:r,onThemeChange:t,variant:"dropdown",size:"lg",showDescription:!0,norwegianLabels:!0}),e.jsxs("div",{className:"text-sm text-muted-foreground",children:[e.jsx("p",{children:"Prøv å navigere med tastaturet:"}),e.jsxs("ul",{className:"mt-2 space-y-1",children:[e.jsx("li",{children:"• Tab for å fokusere på komponenten"}),e.jsx("li",{children:"• Enter eller Space for å åpne menyen"}),e.jsx("li",{children:"• Piltaster for å navigere mellom alternativer"}),e.jsx("li",{children:"• Escape for å lukke menyen"})]})]})]})}},S={args:{currentTheme:"enterprise",onThemeChange:r=>console.log("Theme changed to:",r),variant:"dropdown",size:"md",showDescription:!0,norwegianLabels:!0}};var D,I,E;g.parameters={...g.parameters,docs:{...(D=g.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    currentTheme: 'enterprise',
    onThemeChange: (theme: ThemeSelectorIndustry) => console.log('Theme changed to:', theme),
    variant: 'dropdown',
    size: 'md',
    showDescription: true,
    norwegianLabels: true
  }
}`,...(E=(I=g.parameters)==null?void 0:I.docs)==null?void 0:E.source}}};var A,z,_;x.parameters={...x.parameters,docs:{...(A=x.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('enterprise');
    return <div className="space-y-6">
        <h3 className="text-lg font-semibold">Dropdown Theme Selector</h3>
        <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="dropdown" size="md" showDescription={true} norwegianLabels={true} />
        <p className="text-sm text-muted-foreground">
          Nåværende tema: {INDUSTRY_THEMES[currentTheme].name}
        </p>
      </div>;
  }
}`,...(_=(z=x.parameters)==null?void 0:z.docs)==null?void 0:_.source}}};var L,P,R;v.parameters={...v.parameters,docs:{...(L=v.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('finance');
    return <div className="space-y-6">
        <h3 className="text-lg font-semibold">Grid Theme Selector</h3>
        <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="grid" size="md" showDescription={true} norwegianLabels={true} />
        <p className="text-sm text-muted-foreground">
          Valgt tema: {INDUSTRY_THEMES[currentTheme].name}
        </p>
      </div>;
  }
}`,...(R=(P=v.parameters)==null?void 0:P.docs)==null?void 0:R.source}}};var V,O,B;b.parameters={...b.parameters,docs:{...(V=b.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('healthcare');
    return <div className="space-y-6">
        <h3 className="text-lg font-semibold">Tabs Theme Selector</h3>
        <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="tabs" size="md" norwegianLabels={true} />
        <p className="text-sm text-muted-foreground">
          Aktivt tema: {INDUSTRY_THEMES[currentTheme].name}
        </p>
      </div>;
  }
}`,...(B=(O=b.parameters)==null?void 0:O.docs)==null?void 0:B.source}}};var H,F,G;f.parameters={...f.parameters,docs:{...(H=f.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('education');
    return <div className="space-y-8">
        <div>
          <h4 className="font-medium mb-3">Small</h4>
          <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="dropdown" size="sm" showDescription={false} />
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Medium (Default)</h4>
          <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="dropdown" size="md" />
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Large</h4>
          <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="dropdown" size="lg" />
        </div>
      </div>;
  }
}`,...(G=(F=f.parameters)==null?void 0:F.docs)==null?void 0:G.source}}};var M,q,U;N.parameters={...N.parameters,docs:{...(M=N.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('enterprise');
    return <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(INDUSTRY_THEMES).map(theme => <div key={theme.id} className="p-6 border rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{theme.icon}</span>
                <div>
                  <h3 className="font-semibold">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-8 rounded" style={{
              backgroundColor: theme.primaryColor
            }} />
                <p className="text-xs text-muted-foreground font-mono">
                  {theme.primaryColor}
                </p>
              </div>
            </div>)}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Prøv alle temaer</h3>
          <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="grid" size="sm" showDescription={true} />
        </div>
      </div>;
  }
}`,...(U=(q=N.parameters)==null?void 0:q.docs)==null?void 0:U.source}}};var Y,K,W;T.parameters={...T.parameters,docs:{...(Y=T.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => {
    const {
      currentTheme,
      applyTheme
    } = useThemeSelector('enterprise');
    return <div className="space-y-8">
        <div className="p-6 bg-card border rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Live Theme Preview</h3>
          
          <ThemeSelector currentTheme={currentTheme} onThemeChange={applyTheme} variant="dropdown" size="md" showDescription={true} />
          
          <div className="mt-6 p-4 rounded-lg border" style={{
          backgroundColor: 'var(--theme-primary, #1e40af)',
          color: 'white'
        }}>
            <h4 className="font-semibold">Tema Forhåndsvisning</h4>
            <p className="text-sm opacity-90 mt-1">
              Dette området viser den valgte temafargene i sanntid.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary text-primary-foreground rounded-lg">
            <h4 className="font-medium">Primærknapp</h4>
            <p className="text-sm opacity-90">Hovedhandlinger</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium">Kort</h4>
            <p className="text-sm text-muted-foreground">Standard innhold</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Bakgrunn</h4>
            <p className="text-sm text-muted-foreground">Sekundær informasjon</p>
          </div>
        </div>
      </div>;
  }
}`,...(W=(K=T.parameters)==null?void 0:K.docs)==null?void 0:W.source}}};var $,J,Q;j.parameters={...j.parameters,docs:{...($=j.parameters)==null?void 0:$.docs,source:{originalSource:`{
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('enterprise');
    return <div className="space-y-8">
        <div className="p-6 bg-card border rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Norske Bedriftstemaer</h3>
          <p className="text-muted-foreground mb-6">
            Velg tema basert på din bransje og bruksområde. Alle temaer følger norske designstandarder og WCAG AAA-retningslinjer.
          </p>
          
          <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="grid" size="md" showDescription={true} norwegianLabels={true} />
        </div>
        
        {/* Industry-specific examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h4 className="font-semibold mb-4">Finans & Banking</h4>
            <div className="space-y-3">
              <div className="h-2 bg-green-600 rounded" />
              <p className="text-sm text-muted-foreground">
                Grønne farger for tillit og stabilitet
              </p>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h4 className="font-semibold mb-4">Helse & Omsorg</h4>
            <div className="space-y-3">
              <div className="h-2 bg-red-600 rounded" />
              <p className="text-sm text-muted-foreground">
                Røde farger for medisinsk kontekst
              </p>
            </div>
          </div>
        </div>
      </div>;
  }
}`,...(Q=(J=j.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var X,Z,ee;y.parameters={...y.parameters,docs:{...(X=y.parameters)==null?void 0:X.docs,source:{originalSource:`{
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('productivity');
    return <div className="space-y-6">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r">
          <h3 className="font-semibold text-blue-900">Tilgjengelighetsfunksjoner</h3>
          <ul className="mt-2 text-sm text-blue-800 space-y-1">
            <li>• Tastaturnavigasjon med Tab og Enter</li>
            <li>• ARIA-etiketter på norsk</li>
            <li>• Fokusindikatorer og hover-tilstander</li>
            <li>• Skjermleservennlige beskrivelser</li>
          </ul>
        </div>
        
        <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} variant="dropdown" size="lg" showDescription={true} norwegianLabels={true} />
        
        <div className="text-sm text-muted-foreground">
          <p>Prøv å navigere med tastaturet:</p>
          <ul className="mt-2 space-y-1">
            <li>• Tab for å fokusere på komponenten</li>
            <li>• Enter eller Space for å åpne menyen</li>
            <li>• Piltaster for å navigere mellom alternativer</li>
            <li>• Escape for å lukke menyen</li>
          </ul>
        </div>
      </div>;
  }
}`,...(ee=(Z=y.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var re,se,te;S.parameters={...S.parameters,docs:{...(re=S.parameters)==null?void 0:re.docs,source:{originalSource:`{
  args: {
    currentTheme: 'enterprise',
    onThemeChange: (theme: ThemeSelectorIndustry) => console.log('Theme changed to:', theme),
    variant: 'dropdown',
    size: 'md',
    showDescription: true,
    norwegianLabels: true
  }
}`,...(te=(se=S.parameters)==null?void 0:se.docs)==null?void 0:te.source}}};const de=["Default","Dropdown","Grid","Tabs","Sizes","AllThemes","InteractiveDemo","NorwegianEnterprise","AccessibilityDemo","Playground"];export{y as AccessibilityDemo,N as AllThemes,g as Default,x as Dropdown,v as Grid,T as InteractiveDemo,j as NorwegianEnterprise,S as Playground,f as Sizes,b as Tabs,de as __namedExportsOrder,ie as default};
