



'use client';

import React from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Container, Grid } from '@xaheen-ai/design-system';

export default function HomePage(): JSX.Element {
  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Welcome to nextjs-improved
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Built with Xaheen CLI and the Xaheen Design System. Professional, accessible, and ready for production.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">Learn More</Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Features</h2>
          <Grid cols= gap={6}>
            <Card>
              <CardHeader>
                <CardTitle>TypeScript First</CardTitle>
                <CardDescription>
                  Built with TypeScript for type safety and better developer experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Strict type checking ensures fewer runtime errors and better code quality.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Design System</CardTitle>
                <CardDescription>
                  Powered by the Xaheen Design System for consistent UI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professional components with WCAG AAA compliance and Norwegian localization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modern Stack</CardTitle>
                <CardDescription>
                  Next.js 14 with App Router for optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Server components, streaming, and the latest React features out of the box.
                </p>
              </CardContent>
            </Card>
          </Grid>
        </section>
      </div>
    </Container>
  );
}