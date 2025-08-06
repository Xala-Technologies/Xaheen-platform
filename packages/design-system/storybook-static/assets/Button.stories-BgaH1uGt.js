import{j as e}from"./iframe-DvnYCE9u.js";import{s as k,a as ve}from"./shadows-AsLEtEB2.js";import"./preload-helper-C1FmrZbK.js";const v={},n=({children:ce,variant:me="primary",size:ue="md",...ge})=>{const he="inline-flex items-center justify-center font-medium rounded-lg transition-colors",pe={primary:"bg-blue-600 text-white hover:bg-blue-700",secondary:"bg-gray-200 text-gray-900 hover:bg-gray-300",outline:"border border-gray-300 bg-transparent hover:bg-gray-50"},xe={sm:"h-9 px-3 text-sm",md:"h-10 px-4 text-sm",lg:"h-11 px-6 text-base"};return e.jsx("button",{className:`${he} ${pe[me]} ${xe[ue]}`,...ge,children:ce})},Be={title:"Components/Button",component:n,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","secondary","outline"],description:"Visual style variant"},size:{control:"select",options:["sm","md","lg"],description:"Size variant"},fullWidth:{control:"boolean",description:"Make button full width"},loading:{control:"boolean",description:"Show loading state"},disabled:{control:"boolean",description:"Disable button"},nsmClassification:{control:"select",options:[void 0,"OPEN","RESTRICTED","CONFIDENTIAL","SECRET"],description:"NSM security classification"}}},s={args:{children:"Klikk meg",variant:"primary"}},r={args:{children:"Sekundær handling",variant:"secondary"}},t={args:{children:"Omriss knapp",variant:"outline"}},a={args:{children:"Spøkelsesknapp",variant:"ghost"}},o={args:{children:"Slett",variant:"destructive"}},i={render:()=>e.jsxs("div",{className:"flex flex-col gap-4 items-center",children:[e.jsx(n,{size:"md",children:"Medium (48px)"}),e.jsx(n,{size:"lg",children:"Large (56px) - Standard"}),e.jsx(n,{size:"xl",children:"Extra Large (64px)"}),e.jsx(n,{size:"2xl",children:"2X Large (72px)"})]})},l={render:()=>e.jsxs("div",{className:"flex gap-4 items-center",children:[e.jsx(n,{size:"icon","aria-label":"Innstillinger",children:e.jsxs("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z"})]})}),e.jsx(n,{size:"iconLg",variant:"secondary","aria-label":"Søk",children:e.jsx("svg",{className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})})}),e.jsx(n,{size:"iconXl",variant:"outline","aria-label":"Meny",children:e.jsx("svg",{className:"h-7 w-7",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 6h16M4 12h16M4 18h16"})})})]})},d={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(n,{leftIcon:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v16m8-8H4"})}),children:"Legg til element"}),e.jsx(n,{variant:"secondary",rightIcon:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 8l4 4m0 0l-4 4m4-4H3"})}),children:"Neste steg"}),e.jsx(n,{variant:"outline",leftIcon:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M7 16l-4-4m0 0l4-4m-4 4h18"})}),rightIcon:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 8l4 4m0 0l-4 4m4-4H3"})}),children:"Naviger"})]})},c={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(n,{loading:!0,loadingText:"Laster...",children:"Lagre endringer"}),e.jsx(n,{loading:!0,variant:"secondary",children:"Behandler..."}),e.jsx(n,{loading:!0,variant:"destructive",loadingText:"Sletter...",children:"Slett konto"})]})},m={render:()=>e.jsx("div",{className:"flex flex-col gap-4",children:e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-medium mb-2",children:"NSM Security Classifications"}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(n,{nsmClassification:"OPEN",children:"Åpen informasjon"}),e.jsx(n,{nsmClassification:"RESTRICTED",children:"Begrenset"}),e.jsx(n,{nsmClassification:"CONFIDENTIAL",children:"Konfidensiell"}),e.jsx(n,{nsmClassification:"SECRET",children:"Hemmelig"})]})]})})},u={render:()=>e.jsxs("div",{className:"flex gap-4",children:[e.jsx(n,{children:"Normal"}),e.jsx(n,{disabled:!0,children:"Deaktivert"}),e.jsx(n,{loading:!0,children:"Laster"})]})},g={render:()=>e.jsxs("div",{className:"w-full max-w-md space-y-4",children:[e.jsx(n,{fullWidth:!0,children:"Full bredde primær"}),e.jsx(n,{fullWidth:!0,variant:"secondary",children:"Full bredde sekundær"}),e.jsx(n,{fullWidth:!0,variant:"outline",children:"Full bredde omriss"})]})},h={render:()=>e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Fargetokens"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(n,{children:["Primær (",v.light.primary,")"]}),e.jsxs(n,{variant:"secondary",children:["Sekundær (",v.light.secondary,")"]}),e.jsxs(n,{variant:"destructive",children:["Destruktiv (",v.light.error,")"]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Avstandstokens"}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs(n,{children:["Standard polstring (px-",k.spacing[6]," = 1.5rem)"]}),e.jsxs(n,{size:"xl",children:["XL polstring (px-",k.spacing[10]," = 2.5rem)"]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Skyggetokens"}),e.jsxs("div",{className:"flex gap-4",children:[e.jsxs(n,{children:["Standard skygge (",ve.light.md,")"]}),e.jsx("div",{className:"p-2 bg-background",children:e.jsx(n,{variant:"ghost",children:"Ingen skygge"})})]})]})]})},p={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"p-6 bg-card rounded-lg border",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"BankID Innlogging"}),e.jsxs("div",{className:"space-y-4",children:[e.jsx(n,{fullWidth:!0,leftIcon:e.jsx("svg",{className:"h-5 w-5",viewBox:"0 0 24 24",fill:"currentColor",children:e.jsx("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"})}),children:"Logg inn med BankID"}),e.jsx(n,{fullWidth:!0,variant:"outline",children:"Logg inn med BankID på mobil"})]})]}),e.jsxs("div",{className:"p-6 bg-card rounded-lg border",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Altinn Integrasjon"}),e.jsxs("div",{className:"space-y-4",children:[e.jsx(n,{nsmClassification:"RESTRICTED",children:"Hent data fra Altinn"}),e.jsx(n,{variant:"secondary",nsmClassification:"RESTRICTED",children:"Send til Altinn"})]})]})]})},x={args:{children:"Interaktiv knapp",variant:"primary",size:"lg",fullWidth:!1,loading:!1,disabled:!1}};var f,j,B;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    children: 'Klikk meg',
    variant: 'primary'
  }
}`,...(B=(j=s.parameters)==null?void 0:j.docs)==null?void 0:B.source}}};var N,b,S;r.parameters={...r.parameters,docs:{...(N=r.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    children: 'Sekundær handling',
    variant: 'secondary'
  }
}`,...(S=(b=r.parameters)==null?void 0:b.docs)==null?void 0:S.source}}};var y,L,C;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    children: 'Omriss knapp',
    variant: 'outline'
  }
}`,...(C=(L=t.parameters)==null?void 0:L.docs)==null?void 0:C.source}}};var w,I,T;a.parameters={...a.parameters,docs:{...(w=a.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    children: 'Spøkelsesknapp',
    variant: 'ghost'
  }
}`,...(T=(I=a.parameters)==null?void 0:I.docs)==null?void 0:T.source}}};var z,W,E;o.parameters={...o.parameters,docs:{...(z=o.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    children: 'Slett',
    variant: 'destructive'
  }
}`,...(E=(W=o.parameters)==null?void 0:W.docs)==null?void 0:E.source}}};var M,D,R;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 items-center">
      <Button size="md">Medium (48px)</Button>
      <Button size="lg">Large (56px) - Standard</Button>
      <Button size="xl">Extra Large (64px)</Button>
      <Button size="2xl">2X Large (72px)</Button>
    </div>
}`,...(R=(D=i.parameters)==null?void 0:D.docs)==null?void 0:R.source}}};var F,A,O;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4 items-center">
      <Button size="icon" aria-label="Innstillinger">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Button>
      <Button size="iconLg" variant="secondary" aria-label="Søk">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </Button>
      <Button size="iconXl" variant="outline" aria-label="Meny">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>
    </div>
}`,...(O=(A=l.parameters)==null?void 0:A.docs)==null?void 0:O.source}}};var H,P,X;d.parameters={...d.parameters,docs:{...(H=d.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
      <Button leftIcon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>}>
        Legg til element
      </Button>
      <Button variant="secondary" rightIcon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>}>
        Neste steg
      </Button>
      <Button variant="outline" leftIcon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>} rightIcon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>}>
        Naviger
      </Button>
    </div>
}`,...(X=(P=d.parameters)==null?void 0:P.docs)==null?void 0:X.source}}};var K,$,G;c.parameters={...c.parameters,docs:{...(K=c.parameters)==null?void 0:K.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
      <Button loading loadingText="Laster...">
        Lagre endringer
      </Button>
      <Button loading variant="secondary">
        Behandler...
      </Button>
      <Button loading variant="destructive" loadingText="Sletter...">
        Slett konto
      </Button>
    </div>
}`,...(G=($=c.parameters)==null?void 0:$.docs)==null?void 0:G.source}}};var _,V,q;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium mb-2">NSM Security Classifications</h3>
        <div className="flex flex-col gap-2">
          <Button nsmClassification="OPEN">Åpen informasjon</Button>
          <Button nsmClassification="RESTRICTED">Begrenset</Button>
          <Button nsmClassification="CONFIDENTIAL">Konfidensiell</Button>
          <Button nsmClassification="SECRET">Hemmelig</Button>
        </div>
      </div>
    </div>
}`,...(q=(V=m.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};var J,Q,U;u.parameters={...u.parameters,docs:{...(J=u.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4">
      <Button>Normal</Button>
      <Button disabled>Deaktivert</Button>
      <Button loading>Laster</Button>
    </div>
}`,...(U=(Q=u.parameters)==null?void 0:Q.docs)==null?void 0:U.source}}};var Y,Z,ee;g.parameters={...g.parameters,docs:{...(Y=g.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <div className="w-full max-w-md space-y-4">
      <Button fullWidth>Full bredde primær</Button>
      <Button fullWidth variant="secondary">Full bredde sekundær</Button>
      <Button fullWidth variant="outline">Full bredde omriss</Button>
    </div>
}`,...(ee=(Z=g.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var ne,se,re;h.parameters={...h.parameters,docs:{...(ne=h.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  render: () => <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Fargetokens</h3>
        <div className="flex gap-2">
          <Button>Primær ({colorTokens.light.primary})</Button>
          <Button variant="secondary">Sekundær ({colorTokens.light.secondary})</Button>
          <Button variant="destructive">Destruktiv ({colorTokens.light.error})</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Avstandstokens</h3>
        <div className="flex flex-col gap-2">
          <Button>Standard polstring (px-{spacingTokens.spacing[6]} = 1.5rem)</Button>
          <Button size="xl">XL polstring (px-{spacingTokens.spacing[10]} = 2.5rem)</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Skyggetokens</h3>
        <div className="flex gap-4">
          <Button>Standard skygge ({shadowTokens.light.md})</Button>
          <div className="p-2 bg-background">
            <Button variant="ghost">Ingen skygge</Button>
          </div>
        </div>
      </div>
    </div>
}`,...(re=(se=h.parameters)==null?void 0:se.docs)==null?void 0:re.source}}};var te,ae,oe;p.parameters={...p.parameters,docs:{...(te=p.parameters)==null?void 0:te.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">BankID Innlogging</h3>
        <div className="space-y-4">
          <Button fullWidth leftIcon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>}>
            Logg inn med BankID
          </Button>
          <Button fullWidth variant="outline">
            Logg inn med BankID på mobil
          </Button>
        </div>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Altinn Integrasjon</h3>
        <div className="space-y-4">
          <Button nsmClassification="RESTRICTED">
            Hent data fra Altinn
          </Button>
          <Button variant="secondary" nsmClassification="RESTRICTED">
            Send til Altinn
          </Button>
        </div>
      </div>
    </div>
}`,...(oe=(ae=p.parameters)==null?void 0:ae.docs)==null?void 0:oe.source}}};var ie,le,de;x.parameters={...x.parameters,docs:{...(ie=x.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  args: {
    children: 'Interaktiv knapp',
    variant: 'primary',
    size: 'lg',
    fullWidth: false,
    loading: false,
    disabled: false
  }
}`,...(de=(le=x.parameters)==null?void 0:le.docs)==null?void 0:de.source}}};const Ne=["Default","Secondary","Outline","Ghost","Destructive","Sizes","IconButtons","WithIcons","LoadingStates","NSMClassification","States","FullWidth","DesignTokensShowcase","NorwegianEnterprise","Playground"];export{s as Default,h as DesignTokensShowcase,o as Destructive,g as FullWidth,a as Ghost,l as IconButtons,c as LoadingStates,m as NSMClassification,p as NorwegianEnterprise,t as Outline,x as Playground,r as Secondary,i as Sizes,u as States,d as WithIcons,Ne as __namedExportsOrder,Be as default};
