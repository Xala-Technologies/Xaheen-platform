import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@xaheen/design-system/react';
import './App.css';

interface HomePageProps {
  readonly title?: string;
  readonly description?: string;
}

function HomePage({ 
  title = 'final-test',
  description = 'Web application for final-test'
}: HomePageProps): JSX.Element {
  const handleGetStarted = (): void => {
    console.log('Getting started with Xaheen CLI');
  };

  try {
    return (
      <div className="container mx-auto py-12 px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
            Welcome to {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          
          <div className="mb-12">
            <Button
              onClick={handleGetStarted}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Get started with Xaheen CLI"
            >
              Get Started
            </Button>
          </div>

          <div className="space-y-4 mb-12">
            <p className="text-lg text-gray-700">
              Built with Xaheen CLI v3.0.0 and powered by:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                React 18
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                TypeScript
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
                Tailwind CSS
              </span>
              <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium">
                Xaheen Design System
              </span>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-8 text-gray-900">
              Quick Start Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Add Components
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Generate AI-powered components with full TypeScript support
                  </p>
                  <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg block font-mono">
                    xaheen component generate "user profile card"
                  </code>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Add Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Integrate backend services with type-safe APIs
                  </p>
                  <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg block font-mono">
                    xaheen service add database
                  </code>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Deploy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Deploy to production with Norwegian compliance
                  </p>
                  <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg block font-mono">
                    xaheen deploy --nsm-compliant
                  </code>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('HomePage error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-medium" role="alert">
              An error occurred while loading the page. Please refresh and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default function App(): JSX.Element {
  try {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Application Error
          </h1>
          <p className="text-gray-600" role="alert">
            Something went wrong. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }
}