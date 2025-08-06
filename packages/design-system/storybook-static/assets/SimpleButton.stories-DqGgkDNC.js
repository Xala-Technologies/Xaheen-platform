import{j as r}from"./iframe-DvnYCE9u.js";import"./preload-helper-C1FmrZbK.js";const e=({children:O,variant:L="primary",size:P="md",...w})=>{const C="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",N={primary:"bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",secondary:"bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",outline:"border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500"},V={sm:"h-9 px-3 text-sm",md:"h-10 px-4 text-sm",lg:"h-12 px-6 text-base"};return r.jsx("button",{className:`${C} ${N[L]} ${V[P]}`,...w,children:O})},E={title:"Registry/Button",component:e,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","secondary","outline"],description:"Visual style variant"},size:{control:"select",options:["sm","md","lg"],description:"Size variant"},disabled:{control:"boolean",description:"Disabled state"}}},a={args:{children:"Primary Button",variant:"primary"}},t={args:{children:"Secondary Button",variant:"secondary"}},n={args:{children:"Outline Button",variant:"outline"}},s={args:{children:"Large Button",size:"lg"}},o={args:{children:"Disabled Button",disabled:!0}},i={render:()=>r.jsxs("div",{className:"flex gap-4 flex-wrap",children:[r.jsx(e,{variant:"primary",children:"Primary"}),r.jsx(e,{variant:"secondary",children:"Secondary"}),r.jsx(e,{variant:"outline",children:"Outline"}),r.jsx(e,{size:"sm",children:"Small"}),r.jsx(e,{size:"md",children:"Medium"}),r.jsx(e,{size:"lg",children:"Large"}),r.jsx(e,{disabled:!0,children:"Disabled"})]})};var c,l,d;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    children: 'Primary Button',
    variant: 'primary'
  }
}`,...(d=(l=a.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var u,m,g;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    children: 'Secondary Button',
    variant: 'secondary'
  }
}`,...(g=(m=t.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var p,y,b;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    children: 'Outline Button',
    variant: 'outline'
  }
}`,...(b=(y=n.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var x,B,h;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    children: 'Large Button',
    size: 'lg'
  }
}`,...(h=(B=s.parameters)==null?void 0:B.docs)==null?void 0:h.source}}};var v,f,S;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    children: 'Disabled Button',
    disabled: true
  }
}`,...(S=(f=o.parameters)==null?void 0:f.docs)==null?void 0:S.source}}};var j,z,D;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4 flex-wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button disabled>Disabled</Button>
    </div>
}`,...(D=(z=i.parameters)==null?void 0:z.docs)==null?void 0:D.source}}};const M=["Primary","Secondary","Outline","Large","Disabled","AllVariants"];export{i as AllVariants,o as Disabled,s as Large,n as Outline,a as Primary,t as Secondary,M as __namedExportsOrder,E as default};
