export default function HomePage(): JSX.Element {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
          Welcome to Test Next.js App
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A test Next.js application generated with Xaheen CLI
        </p>
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            Built with Xaheen CLI v3.0.0 and powered by:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              Next.js 15
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              Tailwind CSS
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
              Xala UI System
            </span>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2">Add Components</h3>
              <p className="text-gray-600 mb-4">
                Generate AI-powered components
              </p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                xaheen component generate "user profile card"
              </code>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2">Add Services</h3>
              <p className="text-gray-600 mb-4">
                Integrate backend services
              </p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                xaheen service add database
              </code>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2">Deploy</h3>
              <p className="text-gray-600 mb-4">
                Deploy to production
              </p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                xaheen deploy
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}