




"use client"

import { useTranslation } from "next-intl";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
  CodeBlock,
  StatusIndicator,
  Flex
} from "@xaheen-ai/design-system";


import { useQuery } from "convex/react";
import { api } from "@nextjs-improved/backend/convex/_generated/api";

import { useQuery } from "@tanstack/react-query";
  
import { orpc } from "@/utils/orpc";
  
  
import { trpc } from "@/utils/trpc";
  


const TITLE_TEXT = `
██╗  ██╗ █████╗ ██╗  ██╗███████╗███████╗███╗   ██╗
╚██╗██╔╝██╔══██╗██║  ██║██╔════╝██╔════╝████╗  ██║
 ╚███╔╝ ███████║███████║█████╗  █████╗  ██╔██╗ ██║
 ██╔██╗ ██╔══██║██╔══██║██╔══╝  ██╔══╝  ██║╚██╗██║
██╔╝ ██╗██║  ██║██║  ██║███████╗███████╗██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝

██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗
██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗
██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝
██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗
██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║
╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝
 `;

export default function Home(): JSX.Element {

  const { t } = useTranslation();

  
  const healthCheck = useQuery(api.healthCheck.get);
  
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  


  const getStatusText = (): string => {
    if (healthCheck.isLoading) return t('api.status.checking', 'Checking...');
    return healthCheck.data 
      ? t('api.status.connected', 'Connected')
      : t('api.status.disconnected', 'Disconnected');
  };
  
  const getStatusVariant = (): 'success' | 'error' | 'warning' => {
    if (healthCheck.isLoading) return 'warning';
    return healthCheck.data ? 'success' : 'error';
  };


  return (

    <Container maxWidth="3xl" padding="md">
      <CodeBlock 
        language="text" 
        variant="default"
        overflow="auto"
        fontSize="sm"
      >
        {TITLE_TEXT}
      </CodeBlock>
      
      <Grid gap="lg" marginTop="lg">
        <Card variant="outlined" padding="md">
          <CardHeader>
            <CardTitle level={2} size="md">
              {t('api.status.title', 'API Status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Flex align="center" gap="sm">
              <StatusIndicator 
                variant={getStatusVariant()}
                size="sm"
              />
              <Text 
                variant="body" 
                color="muted"
              >
                {getStatusText()}
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Grid>
    </Container>

    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          
          <div className="flex items-center gap-2">
            <div
              className=""`}
            />
            <span className="text-sm text-muted-foreground">
              {healthCheck === undefined
                ? "Checking..."
                : healthCheck === "OK"
                  ? "Connected"
                  : "Error"}
            </span>
          </div>
          
            
            <div className="flex items-center gap-2">
              <div
                className=""`}
              />
              <span className="text-sm text-muted-foreground">
                {healthCheck.isLoading
                  ? "Checking..."
                  : healthCheck.data
                    ? "Connected"
                    : "Disconnected"}
              </span>
            </div>
            
          
        </section>
      </div>
    </div>

  );
}
