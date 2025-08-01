import { Button, Card } from "@xala-technologies/ui-system";

export default function TestXalaComponentsPage() {
	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-8">Xala UI System Component Test</h1>

			<div className="space-y-8">
				<Card className="p-6">
					<div className="space-y-4">
						<h2 className="text-xl font-semibold">Button Components</h2>

						<div className="flex flex-wrap gap-4">
							<Button variant="primary">Primary Button</Button>
							<Button variant="secondary">Secondary Button</Button>
							<Button variant="destructive">Destructive Button</Button>
							<Button variant="ghost">Ghost Button</Button>
						</div>

						<div className="flex flex-wrap gap-4">
							<Button size="sm">Small</Button>
							<Button size="md">Medium</Button>
							<Button size="lg">Large</Button>
						</div>

						<div className="flex flex-wrap gap-4">
							<Button disabled>Disabled State</Button>
						</div>
					</div>
				</Card>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="p-6">
						<h3 className="font-medium mb-2">Card Component</h3>
						<p className="text-sm text-gray-600">
							This card uses Xala UI System with proper spacing following the
							8pt grid system.
						</p>
					</Card>

					<Card className="p-6">
						<h3 className="font-medium mb-2">Another Card</h3>
						<p className="text-sm text-gray-600">
							Cards provide consistent elevation and spacing across the
							application.
						</p>
					</Card>
				</div>

				<Card className="p-6">
					<div className="space-y-4">
						<h2 className="text-xl font-semibold">
							Norwegian Compliance Features
						</h2>

						<ul className="list-disc list-inside space-y-2 text-gray-600">
							<li>✅ WCAG 2.2 AAA compliant components</li>
							<li>✅ NSM security classification support</li>
							<li>✅ GDPR data protection built-in</li>
							<li>✅ Enhanced 8pt grid system (8px increments)</li>
							<li>✅ Professional sizing: buttons min h-12 (48px)</li>
							<li>✅ Norwegian Bokmål (nb) as primary locale</li>
							<li>✅ Keyboard navigation support</li>
							<li>✅ Screen reader optimized</li>
						</ul>

						<div className="mt-6 pt-6 border-t">
							<h3 className="font-medium mb-4">Direct Usage Example</h3>
							<pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
								{`import { Button, Card } from '@xala-technologies/ui-system';

// No wrappers needed - just use directly!
<Button variant="primary">Click me</Button>
<Card className="p-6">
  <h2>Card Content</h2>
</Card>`}
							</pre>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
