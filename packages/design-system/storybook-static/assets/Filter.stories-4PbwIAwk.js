import{r as d,j as e,c as j,B as N}from"./iframe-DvnYCE9u.js";import{I as S}from"./input-C6L30YCJ.js";import{C as E}from"./card-42crYPTO.js";import"./preload-helper-C1FmrZbK.js";const Se={close:"Lukk",open:"Åpne",menu:"Meny",navigation:"Navigasjon",search:"Søk",loading:"Laster",error:"Feil",success:"Suksess",warning:"Advarsel",info:"Informasjon",previous:"Forrige",next:"Neste",first:"Første",last:"Siste",page:"Side",of:"av",items:"elementer",selected:"valgt",expanded:"utvidet",collapsed:"kollapset","sort-ascending":"Sorter stigende","sort-descending":"Sorter synkende",filter:"Filter",clear:"Tøm",apply:"Bruk",cancel:"Avbryt",save:"Lagre",delete:"Slett",edit:"Rediger",view:"Vis",more:"Mer",less:"Mindre","show-all":"Vis alle",hide:"Skjul",required:"påkrevd",optional:"valgfritt"},Ae=(s={})=>{const{announcements:m=!0,language:u="nb-NO",focusTrap:y=!1,skipLinks:w=!0}=s,[v,b]=d.useState({prefersReducedMotion:!1,prefersHighContrast:!1,prefersReducedTransparency:!1,keyboardNavigation:!1,screenReaderActive:!1,colorScheme:"no-preference",language:u}),h=d.useRef(null);d.useRef(null),d.useEffect(()=>{if(typeof window>"u")return;const o=()=>{b(r=>({...r,prefersReducedMotion:window.matchMedia("(prefers-reduced-motion: reduce)").matches,prefersHighContrast:window.matchMedia("(prefers-contrast: high)").matches,prefersReducedTransparency:window.matchMedia("(prefers-reduced-transparency: reduce)").matches,colorScheme:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":window.matchMedia("(prefers-color-scheme: light)").matches?"light":"no-preference"}))};o();const i=[window.matchMedia("(prefers-reduced-motion: reduce)"),window.matchMedia("(prefers-contrast: high)"),window.matchMedia("(prefers-reduced-transparency: reduce)"),window.matchMedia("(prefers-color-scheme: dark)"),window.matchMedia("(prefers-color-scheme: light)")];i.forEach(r=>r.addEventListener("change",o));const l=()=>{b(r=>({...r,keyboardNavigation:!1}))},c=r=>{r.key==="Tab"&&b(g=>({...g,keyboardNavigation:!0}))};if(window.addEventListener("mousedown",l),window.addEventListener("keydown",c),m&&!h.current){const r=document.createElement("div");r.setAttribute("role","status"),r.setAttribute("aria-live","polite"),r.setAttribute("aria-atomic","true"),r.className="sr-only",r.style.cssText="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;",document.body.appendChild(r),h.current=r}return()=>{i.forEach(r=>r.removeEventListener("change",o)),window.removeEventListener("mousedown",l),window.removeEventListener("keydown",c),h.current&&(document.body.removeChild(h.current),h.current=null)}},[m]);const F=d.useCallback((o,i="polite")=>{h.current&&(h.current.setAttribute("aria-live",i),h.current.textContent=o,setTimeout(()=>{h.current&&(h.current.textContent="")},1e3))},[]),C=d.useCallback((o,i=!0)=>{const l="Xaheen";document.title=i?`${o} - ${l}`:o},[]),f=d.useCallback(o=>{const i=o.querySelectorAll('a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'),l=i[0],c=i[i.length-1],r=g=>{g.key==="Tab"&&(g.shiftKey?document.activeElement===l&&(g.preventDefault(),c==null||c.focus()):document.activeElement===c&&(g.preventDefault(),l==null||l.focus()))};return o.addEventListener("keydown",r),l==null||l.focus(),()=>{o.removeEventListener("keydown",r)}},[]),x=d.useCallback((o,i="Hopp til hovedinnhold")=>{const l=document.createElement("a");l.href=`#${o}`,l.className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg",l.textContent=i,document.body.insertBefore(l,document.body.firstChild)},[]),D=d.useCallback((o,i)=>{const l=M=>{const a=M.match(/\d+/g);if(!a||a.length<3)return 0;const[p,t,k]=a.map(n=>{const q=parseInt(n)/255;return q<=.03928?q/12.92:Math.pow((q+.055)/1.055,2.4)});return .2126*p+.7152*t+.0722*k},c=l(o),r=l(i),g=Math.max(c,r),J=Math.min(c,r);return(g+.05)/(J+.05)},[]),$=d.useCallback((o,i)=>new Intl.NumberFormat(u,i).format(o),[u]),W=d.useCallback((o,i)=>new Intl.DateTimeFormat(u,i).format(o),[u]),B=d.useCallback((o,i)=>{let l=Se[o]||o;return i&&Object.entries(i).forEach(([c,r])=>{l=l.replace(`{${c}}`,r)}),l},[]);return[v,{announce:F,setTitle:C,trapFocus:f,createSkipLink:x,checkContrast:D,formatNumber:$,formatDate:W,getAriaLabel:B}]},V=({groups:s,values:m={},onChange:u,onReset:y,onApply:w,showApplyButton:v=!0,showResetButton:b=!0,showActiveCount:h=!0,className:F,variant:C="sidebar",norwegianLabels:f=!0})=>{const[x,D]=d.useState(m),[$,W]=d.useState(new Set(s.filter(a=>a.defaultExpanded!==!1).map(a=>a.id))),[B,R]=d.useState(!1),[o,{announce:i}]=Ae(),l=d.useMemo(()=>{let a=0;return Object.entries(x).forEach(([p,t])=>{const k=s.find(n=>n.id===p);if(k)switch(k.type){case"checkbox":Array.isArray(t)&&t.length>0&&(a+=t.length);break;case"radio":case"select":t&&a++;break;case"range":t&&(t.min!==k.min||t.max!==k.max)&&a++;break;case"date":t&&(t.from||t.to)&&a++;break;case"search":t&&t.trim()&&a++;break}}),a},[x,s]),c=d.useCallback((a,p)=>{const t={...x,[a]:p};D(t),v||u(t),i("Filter endret")},[x,u,v,i]),r=d.useCallback(()=>{u(x),w==null||w(x),C==="dropdown"&&R(!1),i(`${l} filtre anvendt`)},[x,u,w,C,l,i]),g=d.useCallback(()=>{const a={};D(a),u(a),y==null||y(),i("Alle filtre tilbakestilt")},[u,y,i]),J=a=>{W(p=>{const t=new Set(p);return t.has(a)?t.delete(a):t.add(a),t})},M=a=>{const p=$.has(a.id),t=x[a.id],k=e.jsxs("div",{className:"space-y-3",children:[a.type==="checkbox"&&a.options&&e.jsx("div",{className:"space-y-2",children:a.options.map(n=>e.jsxs("label",{className:j("flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent",n.disabled&&"opacity-50 cursor-not-allowed"),children:[e.jsx("input",{type:"checkbox",checked:Array.isArray(t)&&t.includes(n.value),onChange:q=>{const X=Array.isArray(t)?t:[],Ve=q.target.checked?[...X,n.value]:X.filter(Ce=>Ce!==n.value);c(a.id,Ve)},disabled:n.disabled,className:"h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20","aria-label":`${n.label}${n.count?` (${n.count})`:""}`}),e.jsx("span",{className:"flex-1 text-sm",children:n.label}),n.count!==void 0&&e.jsxs("span",{className:"text-xs text-muted-foreground",children:["(",n.count,")"]})]},n.value))}),a.type==="radio"&&a.options&&e.jsx("div",{className:"space-y-2",children:a.options.map(n=>e.jsxs("label",{className:j("flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent",n.disabled&&"opacity-50 cursor-not-allowed"),children:[e.jsx("input",{type:"radio",name:a.id,checked:t===n.value,onChange:()=>c(a.id,n.value),disabled:n.disabled,className:"h-4 w-4 border-input text-primary focus:ring-2 focus:ring-primary/20"}),e.jsx("span",{className:"flex-1 text-sm",children:n.label}),n.count!==void 0&&e.jsxs("span",{className:"text-xs text-muted-foreground",children:["(",n.count,")"]})]},n.value))}),a.type==="range"&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(S,{type:"number",value:(t==null?void 0:t.min)||a.min||0,onChange:n=>c(a.id,{...t,min:Number(n.target.value)}),min:a.min,max:a.max,step:a.step,className:"w-24",placeholder:"Min"}),e.jsx("span",{className:"text-muted-foreground",children:"-"}),e.jsx(S,{type:"number",value:(t==null?void 0:t.max)||a.max||100,onChange:n=>c(a.id,{...t,max:Number(n.target.value)}),min:a.min,max:a.max,step:a.step,className:"w-24",placeholder:"Max"})]}),e.jsx("div",{className:"relative",children:e.jsx("div",{className:"h-2 bg-muted rounded-full",children:e.jsx("div",{className:"h-full bg-primary rounded-full",style:{marginLeft:`${(((t==null?void 0:t.min)||a.min||0)-(a.min||0))/((a.max||100)-(a.min||0))*100}%`,width:`${(((t==null?void 0:t.max)||a.max||100)-((t==null?void 0:t.min)||a.min||0))/((a.max||100)-(a.min||0))*100}%`}})})})]}),a.type==="date"&&e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-sm text-muted-foreground mb-1 block",children:f?"Fra dato":"From date"}),e.jsx(S,{type:"date",value:(t==null?void 0:t.from)||"",onChange:n=>c(a.id,{...t,from:n.target.value}),className:"w-full"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-sm text-muted-foreground mb-1 block",children:f?"Til dato":"To date"}),e.jsx(S,{type:"date",value:(t==null?void 0:t.to)||"",onChange:n=>c(a.id,{...t,to:n.target.value}),className:"w-full"})]})]}),a.type==="select"&&a.options&&e.jsxs("select",{value:t||"",onChange:n=>c(a.id,n.target.value),className:j("w-full h-12 px-3 rounded-lg border-2 border-input","bg-background text-foreground","focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"),"aria-label":a.label,children:[e.jsx("option",{value:"",children:a.placeholder||(f?"Velg...":"Select...")}),a.options.map(n=>e.jsx("option",{value:n.value,disabled:n.disabled,children:n.label},n.value))]}),a.type==="search"&&e.jsx(S,{type:"search",value:t||"",onChange:n=>c(a.id,n.target.value),placeholder:a.placeholder||(f?"Søk...":"Search..."),className:"w-full"})]});return a.collapsible?e.jsxs("div",{className:"border-b last:border-0 pb-4 last:pb-0",children:[e.jsxs("button",{onClick:()=>J(a.id),className:"flex items-center justify-between w-full text-left mb-3 hover:text-primary transition-colors","aria-expanded":p,"aria-controls":`filter-group-${a.id}`,children:[e.jsxs("span",{className:"font-medium flex items-center gap-2",children:[a.icon,a.label]}),e.jsx("svg",{className:j("h-4 w-4 transition-transform",p&&"rotate-180"),fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]}),p&&e.jsx("div",{id:`filter-group-${a.id}`,children:k})]},a.id):e.jsxs("div",{className:"border-b last:border-0 pb-4 last:pb-0",children:[e.jsxs("h3",{className:"font-medium mb-3 flex items-center gap-2",children:[a.icon,a.label]}),k]},a.id)};return C==="horizontal"?e.jsxs("div",{className:j("flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border",F),children:[s.map(a=>e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("span",{className:"text-sm font-medium",children:[a.label,":"]}),a.type==="select"&&a.options&&e.jsxs("select",{value:x[a.id]||"",onChange:p=>c(a.id,p.target.value),className:"h-9 px-3 rounded-md border bg-background text-sm",children:[e.jsx("option",{value:"",children:f?"Alle":"All"}),a.options.map(p=>e.jsx("option",{value:p.value,children:p.label},p.value))]}),a.type==="search"&&e.jsx(S,{type:"search",value:x[a.id]||"",onChange:p=>c(a.id,p.target.value),placeholder:a.placeholder,className:"h-9 w-48"})]},a.id)),e.jsxs("div",{className:"flex items-center gap-2 ml-auto",children:[h&&l>0&&e.jsxs("span",{className:"text-sm text-muted-foreground",children:[l," ",f?"aktive":"active"]}),b&&l>0&&e.jsx(N,{variant:"ghost",size:"md",onClick:g,children:f?"Tilbakestill":"Reset"}),v&&e.jsx(N,{variant:"primary",size:"md",onClick:r,children:f?"Bruk filtre":"Apply filters"})]})]}):C==="dropdown"?e.jsxs("div",{className:j("relative",F),children:[e.jsxs(N,{variant:"outline",onClick:()=>R(!B),className:"min-w-[200px] justify-between",children:[e.jsxs("span",{className:"flex items-center gap-2",children:[e.jsx("svg",{className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"})}),f?"Filtre":"Filters",l>0&&e.jsx("span",{className:"ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full",children:l})]}),e.jsx("svg",{className:j("h-4 w-4 transition-transform",B&&"rotate-180"),fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]}),B&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-40",onClick:()=>R(!1),onKeyDown:a=>{a.key==="Escape"&&R(!1)},role:"button",tabIndex:0,"aria-label":"Lukk filter dropdown"}),e.jsxs(E,{className:"absolute top-full mt-2 w-80 z-50 p-4 space-y-4 max-h-[400px] overflow-y-auto",children:[s.map(M),(v||b)&&e.jsxs("div",{className:"flex items-center justify-between pt-4 border-t",children:[b&&l>0&&e.jsx(N,{variant:"ghost",size:"md",onClick:g,children:f?"Tilbakestill":"Reset"}),v&&e.jsx(N,{variant:"primary",size:"md",onClick:r,className:"ml-auto",children:f?"Bruk":"Apply"})]})]})]})]}):e.jsxs(E,{className:j("p-6 space-y-6",F),children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsx("h2",{className:"text-lg font-semibold",children:f?"Filtre":"Filters"}),h&&l>0&&e.jsxs("span",{className:"text-sm text-muted-foreground",children:[l," ",f?"aktive":"active"]})]}),e.jsx("div",{className:"space-y-6",children:s.map(M)}),(v||b)&&e.jsxs("div",{className:"flex flex-col gap-2 pt-6 border-t",children:[v&&e.jsx(N,{variant:"primary",onClick:r,className:"w-full",children:f?"Bruk filtre":"Apply filters"}),b&&l>0&&e.jsx(N,{variant:"outline",onClick:g,className:"w-full",children:f?"Tilbakestill alle":"Reset all"})]})]})},U=s=>{const m=[{id:"category",label:"Kategori",type:"checkbox",icon:"📦",options:[{value:"electronics",label:"Elektronikk",count:245},{value:"clothing",label:"Klær",count:189},{value:"books",label:"Bøker",count:97},{value:"home",label:"Hjem & Hage",count:156}]},{id:"price",label:"Pris",type:"range",icon:"💰",min:0,max:5e3,step:100},{id:"brand",label:"Merke",type:"select",icon:"🏷️",placeholder:"Velg merke",options:[{value:"apple",label:"Apple"},{value:"samsung",label:"Samsung"},{value:"sony",label:"Sony"},{value:"lg",label:"LG"}]},{id:"rating",label:"Vurdering",type:"radio",icon:"⭐",options:[{value:"4",label:"4 stjerner og opp",count:156},{value:"3",label:"3 stjerner og opp",count:234},{value:"2",label:"2 stjerner og opp",count:289},{value:"1",label:"Alle vurderinger",count:345}]}];return e.jsx(V,{...s,groups:m})},Q=s=>{const m=[{id:"dateRange",label:"Datoperiode",type:"date",icon:"📅"}];return e.jsx(V,{...s,groups:m,variant:"horizontal"})};try{V.displayName="Filter",V.__docgenInfo={description:"",displayName:"Filter",props:{groups:{defaultValue:null,description:"",name:"groups",required:!0,type:{name:"FilterGroup[]"}},values:{defaultValue:{value:"{}"},description:"",name:"values",required:!1,type:{name:"FilterValue | undefined"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!0,type:{name:"(values: FilterValue) => void"}},onReset:{defaultValue:null,description:"",name:"onReset",required:!1,type:{name:"(() => void) | undefined"}},onApply:{defaultValue:null,description:"",name:"onApply",required:!1,type:{name:"((values: FilterValue) => void) | undefined"}},showApplyButton:{defaultValue:{value:"true"},description:"",name:"showApplyButton",required:!1,type:{name:"boolean | undefined"}},showResetButton:{defaultValue:{value:"true"},description:"",name:"showResetButton",required:!1,type:{name:"boolean | undefined"}},showActiveCount:{defaultValue:{value:"true"},description:"",name:"showActiveCount",required:!1,type:{name:"boolean | undefined"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}},variant:{defaultValue:{value:"sidebar"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"inline"'},{value:'"horizontal"'},{value:'"dropdown"'},{value:'"sidebar"'}]}},norwegianLabels:{defaultValue:{value:"true"},description:"",name:"norwegianLabels",required:!1,type:{name:"boolean | undefined"}}}}}catch{}try{U.displayName="ProductFilter",U.__docgenInfo={description:"",displayName:"ProductFilter",props:{onChange:{defaultValue:null,description:"",name:"onChange",required:!0,type:{name:"(values: FilterValue) => void"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}},onReset:{defaultValue:null,description:"",name:"onReset",required:!1,type:{name:"(() => void) | undefined"}},variant:{defaultValue:{value:"sidebar"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"inline"'},{value:'"horizontal"'},{value:'"dropdown"'},{value:'"sidebar"'}]}},norwegianLabels:{defaultValue:{value:"true"},description:"",name:"norwegianLabels",required:!1,type:{name:"boolean | undefined"}},values:{defaultValue:{value:"{}"},description:"",name:"values",required:!1,type:{name:"FilterValue | undefined"}},onApply:{defaultValue:null,description:"",name:"onApply",required:!1,type:{name:"((values: FilterValue) => void) | undefined"}},showApplyButton:{defaultValue:{value:"true"},description:"",name:"showApplyButton",required:!1,type:{name:"boolean | undefined"}},showResetButton:{defaultValue:{value:"true"},description:"",name:"showResetButton",required:!1,type:{name:"boolean | undefined"}},showActiveCount:{defaultValue:{value:"true"},description:"",name:"showActiveCount",required:!1,type:{name:"boolean | undefined"}}}}}catch{}try{Q.displayName="DateRangeFilter",Q.__docgenInfo={description:"",displayName:"DateRangeFilter",props:{onChange:{defaultValue:null,description:"",name:"onChange",required:!0,type:{name:"(values: FilterValue) => void"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}},onReset:{defaultValue:null,description:"",name:"onReset",required:!1,type:{name:"(() => void) | undefined"}},variant:{defaultValue:{value:"sidebar"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"inline"'},{value:'"horizontal"'},{value:'"dropdown"'},{value:'"sidebar"'}]}},norwegianLabels:{defaultValue:{value:"true"},description:"",name:"norwegianLabels",required:!1,type:{name:"boolean | undefined"}},values:{defaultValue:{value:"{}"},description:"",name:"values",required:!1,type:{name:"FilterValue | undefined"}},onApply:{defaultValue:null,description:"",name:"onApply",required:!1,type:{name:"((values: FilterValue) => void) | undefined"}},showApplyButton:{defaultValue:{value:"true"},description:"",name:"showApplyButton",required:!1,type:{name:"boolean | undefined"}},showResetButton:{defaultValue:{value:"true"},description:"",name:"showResetButton",required:!1,type:{name:"boolean | undefined"}},showActiveCount:{defaultValue:{value:"true"},description:"",name:"showActiveCount",required:!1,type:{name:"boolean | undefined"}}}}}catch{}const Ee={title:"Blocks/Filter",component:V,parameters:{layout:"padded",docs:{description:{component:`
Advanced filtering component with support for multiple filter types including checkboxes, 
radio buttons, range sliders, date pickers, and search inputs.

## Features
- Multiple filter types (checkbox, radio, range, date, select, search)
- Collapsible filter groups
- Active filter count display
- Apply/Reset functionality
- Multiple layout variants (sidebar, horizontal, dropdown)
- Norwegian language support
- WCAG AAA compliant

## Filter Types
- **Checkbox**: Multiple selection with counts
- **Radio**: Single selection from options
- **Range**: Min/max value selection with slider
- **Date**: Date range picker
- **Select**: Dropdown selection
- **Search**: Text-based filtering

## Variants
- **Sidebar**: Vertical layout for sidebars
- **Horizontal**: Inline layout for toolbars
- **Dropdown**: Compact dropdown for limited space
        `}}},tags:["autodocs"],argTypes:{variant:{control:"select",options:["sidebar","horizontal","dropdown","inline"],description:"Filter layout variant"},showApplyButton:{control:"boolean",description:"Show apply button"},showResetButton:{control:"boolean",description:"Show reset button"},showActiveCount:{control:"boolean",description:"Show active filter count"},norwegianLabels:{control:"boolean",description:"Use Norwegian labels"}}},P=[{id:"category",label:"Kategori",type:"checkbox",icon:"📁",options:[{value:"documents",label:"Dokumenter",count:156},{value:"images",label:"Bilder",count:89},{value:"videos",label:"Videoer",count:23},{value:"audio",label:"Lyd",count:45}]},{id:"status",label:"Status",type:"radio",icon:"🔄",options:[{value:"all",label:"Alle"},{value:"active",label:"Aktiv",count:234},{value:"archived",label:"Arkivert",count:89},{value:"deleted",label:"Slettet",count:12}]},{id:"size",label:"Filstørrelse (MB)",type:"range",icon:"💾",min:0,max:1e3,step:10},{id:"search",label:"Søk",type:"search",icon:"🔍",placeholder:"Søk etter filnavn..."}],A=({groups:s,variant:m="sidebar",...u})=>{const[y,w]=d.useState({}),[v,b]=d.useState({});return e.jsxs("div",{className:"flex gap-6",children:[e.jsx("div",{className:m==="sidebar"?"w-80":"flex-1",children:e.jsx(V,{groups:s,values:y,onChange:w,onApply:b,onReset:()=>{w({}),b({})},variant:m,...u})}),e.jsxs(E,{className:"flex-1 p-6",children:[e.jsx("h3",{className:"font-semibold mb-4",children:"Filter Values"}),e.jsx("pre",{className:"text-sm bg-muted p-4 rounded-lg overflow-auto",children:JSON.stringify(v.length?v:y,null,2)})]})]})},_={render:()=>e.jsx(A,{groups:P})},L={render:()=>{const[s,m]=d.useState({});return e.jsxs("div",{className:"flex gap-6",children:[e.jsx(U,{values:s,onChange:m,showApplyButton:!1}),e.jsx("div",{className:"flex-1",children:e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[1,2,3,4,5,6].map(u=>e.jsxs(E,{className:"p-4",children:[e.jsx("div",{className:"aspect-square bg-muted rounded-lg mb-4"}),e.jsxs("h4",{className:"font-semibold",children:["Produkt ",u]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Beskrivelse av produkt"}),e.jsxs("p",{className:"text-lg font-bold mt-2",children:["kr ",299+u*100]})]},u))})})]})}},T={render:()=>e.jsx(A,{groups:[{id:"category",label:"Kategori",type:"select",options:[{value:"all",label:"Alle kategorier"},{value:"electronics",label:"Elektronikk"},{value:"clothing",label:"Klær"},{value:"books",label:"Bøker"}]},{id:"search",label:"Søk",type:"search",placeholder:"Søk produkter..."}],variant:"horizontal"})},z={render:()=>e.jsx("div",{className:"h-96",children:e.jsx(A,{groups:P,variant:"dropdown"})})},I={render:()=>{const[s,m]=d.useState({});return e.jsxs("div",{children:[e.jsx(Q,{values:s,onChange:m,showApplyButton:!0}),e.jsx(E,{className:"mt-4 p-4",children:e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Selected range: ",JSON.stringify(s)]})})]})}},G={render:()=>{const s=[{id:"department",label:"Avdeling",type:"checkbox",icon:"🏢",collapsible:!0,defaultExpanded:!0,options:[{value:"sales",label:"Salg",count:45},{value:"marketing",label:"Markedsføring",count:32},{value:"development",label:"Utvikling",count:67},{value:"hr",label:"HR",count:23},{value:"finance",label:"Økonomi",count:19}]},{id:"employment",label:"Ansettelsestype",type:"checkbox",icon:"📋",collapsible:!0,options:[{value:"fulltime",label:"Heltid",count:156},{value:"parttime",label:"Deltid",count:34},{value:"contract",label:"Kontrakt",count:23},{value:"intern",label:"Praktikant",count:8}]},{id:"experience",label:"Erfaring (år)",type:"range",icon:"📊",min:0,max:20,step:1},{id:"location",label:"Lokasjon",type:"select",icon:"📍",placeholder:"Velg lokasjon",options:[{value:"oslo",label:"Oslo"},{value:"bergen",label:"Bergen"},{value:"trondheim",label:"Trondheim"},{value:"stavanger",label:"Stavanger"},{value:"remote",label:"Hjemmekontor"}]},{id:"startDate",label:"Startdato",type:"date",icon:"📅",collapsible:!0},{id:"skills",label:"Ferdigheter",type:"search",icon:"🎯",placeholder:"Søk etter ferdigheter..."}];return e.jsx(A,{groups:s})}},K={render:()=>e.jsx(A,{groups:P,showApplyButton:!1,showResetButton:!0})},O={render:()=>{const s=[{id:"access",label:"Tilgangsnivå",type:"checkbox",icon:"🔒",options:[{value:"public",label:"Offentlig",count:234},{value:"internal",label:"Intern",count:156},{value:"restricted",label:"Begrenset",count:89,disabled:!0},{value:"confidential",label:"Konfidensiell",count:23,disabled:!0}]}];return e.jsx(A,{groups:s})}},H={args:{groups:P,variant:"sidebar",showApplyButton:!0,showResetButton:!0,showActiveCount:!0,norwegianLabels:!0},render:s=>{const[m,u]=d.useState({});return e.jsx(V,{...s,values:m,onChange:u,onApply:y=>console.log("Applied:",y),onReset:()=>u({})})}};var Y,Z,ee;_.parameters={..._.parameters,docs:{...(Y=_.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <InteractiveFilter groups={basicFilterGroups} />
}`,...(ee=(Z=_.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var ae,te,ne;L.parameters={...L.parameters,docs:{...(ae=L.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  render: () => {
    const [values, setValues] = useState({});
    return <div className="flex gap-6">
        <ProductFilter values={values} onChange={setValues} showApplyButton={false} />
        
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Card key={i} className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <h4 className="font-semibold">Produkt {i}</h4>
                <p className="text-sm text-muted-foreground">Beskrivelse av produkt</p>
                <p className="text-lg font-bold mt-2">kr {299 + i * 100}</p>
              </Card>)}
          </div>
        </div>
      </div>;
  }
}`,...(ne=(te=L.parameters)==null?void 0:te.docs)==null?void 0:ne.source}}};var le,re,se;T.parameters={...T.parameters,docs:{...(le=T.parameters)==null?void 0:le.docs,source:{originalSource:`{
  render: () => <InteractiveFilter groups={[{
    id: 'category',
    label: 'Kategori',
    type: 'select',
    options: [{
      value: 'all',
      label: 'Alle kategorier'
    }, {
      value: 'electronics',
      label: 'Elektronikk'
    }, {
      value: 'clothing',
      label: 'Klær'
    }, {
      value: 'books',
      label: 'Bøker'
    }]
  }, {
    id: 'search',
    label: 'Søk',
    type: 'search',
    placeholder: 'Søk produkter...'
  }]} variant="horizontal" />
}`,...(se=(re=T.parameters)==null?void 0:re.docs)==null?void 0:se.source}}};var ie,oe,de;z.parameters={...z.parameters,docs:{...(ie=z.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  render: () => <div className="h-96">
      <InteractiveFilter groups={basicFilterGroups} variant="dropdown" />
    </div>
}`,...(de=(oe=z.parameters)==null?void 0:oe.docs)==null?void 0:de.source}}};var ce,ue,pe;I.parameters={...I.parameters,docs:{...(ce=I.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  render: () => {
    const [values, setValues] = useState({});
    return <div>
        <DateRangeFilter values={values} onChange={setValues} showApplyButton={true} />
        
        <Card className="mt-4 p-4">
          <p className="text-sm text-muted-foreground">
            Selected range: {JSON.stringify(values)}
          </p>
        </Card>
      </div>;
  }
}`,...(pe=(ue=I.parameters)==null?void 0:ue.docs)==null?void 0:pe.source}}};var me,fe,he;G.parameters={...G.parameters,docs:{...(me=G.parameters)==null?void 0:me.docs,source:{originalSource:`{
  render: () => {
    const complexGroups: FilterGroup[] = [{
      id: 'department',
      label: 'Avdeling',
      type: 'checkbox',
      icon: '🏢',
      collapsible: true,
      defaultExpanded: true,
      options: [{
        value: 'sales',
        label: 'Salg',
        count: 45
      }, {
        value: 'marketing',
        label: 'Markedsføring',
        count: 32
      }, {
        value: 'development',
        label: 'Utvikling',
        count: 67
      }, {
        value: 'hr',
        label: 'HR',
        count: 23
      }, {
        value: 'finance',
        label: 'Økonomi',
        count: 19
      }]
    }, {
      id: 'employment',
      label: 'Ansettelsestype',
      type: 'checkbox',
      icon: '📋',
      collapsible: true,
      options: [{
        value: 'fulltime',
        label: 'Heltid',
        count: 156
      }, {
        value: 'parttime',
        label: 'Deltid',
        count: 34
      }, {
        value: 'contract',
        label: 'Kontrakt',
        count: 23
      }, {
        value: 'intern',
        label: 'Praktikant',
        count: 8
      }]
    }, {
      id: 'experience',
      label: 'Erfaring (år)',
      type: 'range',
      icon: '📊',
      min: 0,
      max: 20,
      step: 1
    }, {
      id: 'location',
      label: 'Lokasjon',
      type: 'select',
      icon: '📍',
      placeholder: 'Velg lokasjon',
      options: [{
        value: 'oslo',
        label: 'Oslo'
      }, {
        value: 'bergen',
        label: 'Bergen'
      }, {
        value: 'trondheim',
        label: 'Trondheim'
      }, {
        value: 'stavanger',
        label: 'Stavanger'
      }, {
        value: 'remote',
        label: 'Hjemmekontor'
      }]
    }, {
      id: 'startDate',
      label: 'Startdato',
      type: 'date',
      icon: '📅',
      collapsible: true
    }, {
      id: 'skills',
      label: 'Ferdigheter',
      type: 'search',
      icon: '🎯',
      placeholder: 'Søk etter ferdigheter...'
    }];
    return <InteractiveFilter groups={complexGroups} />;
  }
}`,...(he=(fe=G.parameters)==null?void 0:fe.docs)==null?void 0:he.source}}};var ve,be,xe;K.parameters={...K.parameters,docs:{...(ve=K.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  render: () => <InteractiveFilter groups={basicFilterGroups} showApplyButton={false} showResetButton={true} />
}`,...(xe=(be=K.parameters)==null?void 0:be.docs)==null?void 0:xe.source}}};var ge,ye,ke;O.parameters={...O.parameters,docs:{...(ge=O.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  render: () => {
    const groupsWithDisabled: FilterGroup[] = [{
      id: 'access',
      label: 'Tilgangsnivå',
      type: 'checkbox',
      icon: '🔒',
      options: [{
        value: 'public',
        label: 'Offentlig',
        count: 234
      }, {
        value: 'internal',
        label: 'Intern',
        count: 156
      }, {
        value: 'restricted',
        label: 'Begrenset',
        count: 89,
        disabled: true
      }, {
        value: 'confidential',
        label: 'Konfidensiell',
        count: 23,
        disabled: true
      }]
    }];
    return <InteractiveFilter groups={groupsWithDisabled} />;
  }
}`,...(ke=(ye=O.parameters)==null?void 0:ye.docs)==null?void 0:ke.source}}};var we,je,Ne;H.parameters={...H.parameters,docs:{...(we=H.parameters)==null?void 0:we.docs,source:{originalSource:`{
  args: {
    groups: basicFilterGroups,
    variant: 'sidebar',
    showApplyButton: true,
    showResetButton: true,
    showActiveCount: true,
    norwegianLabels: true
  },
  render: args => {
    const [values, setValues] = useState({});
    return <Filter {...args} values={values} onChange={setValues} onApply={v => console.log('Applied:', v)} onReset={() => setValues({})} />;
  }
}`,...(Ne=(je=H.parameters)==null?void 0:je.docs)==null?void 0:Ne.source}}};const De=["Default","ProductFilterExample","HorizontalVariant","DropdownVariant","DateRangeExample","ComplexFilters","InstantFiltering","DisabledOptions","Playground"];export{G as ComplexFilters,I as DateRangeExample,_ as Default,O as DisabledOptions,z as DropdownVariant,T as HorizontalVariant,K as InstantFiltering,H as Playground,L as ProductFilterExample,De as __namedExportsOrder,Ee as default};
