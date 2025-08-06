const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

async function testTemplateGeneration() {
  console.log('Testing template generation...');
  
  // Test Next.js template
  const templatesPath = path.resolve(__dirname, '../packages/xaheen-cli/templates');
  const nextjsTemplatePath = path.join(templatesPath, 'frontend', 'nextjs');
  
  console.log('Looking for Next.js template at:', nextjsTemplatePath);
  
  if (!existsSync(nextjsTemplatePath)) {
    console.error('❌ Next.js template directory not found');
    return;
  }
  
  console.log('✅ Next.js template directory exists');
  
  // List template files
  const files = await fs.readdir(nextjsTemplatePath, { recursive: true });
  console.log('📁 Template files found:');
  
  for (const file of files) {
    const filePath = path.join(nextjsTemplatePath, file);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      console.log('   ', file);
    }
  }
  
  // Test simple template generation
  const packageJsonPath = path.join(nextjsTemplatePath, 'package.json.hbs');
  if (existsSync(packageJsonPath)) {
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    console.log('\n📄 package.json.hbs template preview:');
    console.log(content.substring(0, 200) + '...');
    
    // Simple template replacement
    const rendered = content
      .replace(/{{name}}/g, 'test-app')
      .replace(/{{port}}/g, '3000')
      .replace(/{{packageManager}}/g, 'pnpm');
    
    console.log('\n✨ Rendered package.json:');
    console.log(JSON.stringify(JSON.parse(rendered), null, 2));
    
    console.log('\n✅ Template generation test successful!');
  } else {
    console.error('❌ package.json.hbs template not found');
  }
}

testTemplateGeneration().catch(console.error);