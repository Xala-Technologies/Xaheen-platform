




import type { Route } from "./+types/_index";

import { useQuery } from "convex/react";
import { api } from "@react-clean/backend/convex/_generated/api";

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

export function meta({}: Route.MetaArgs) {
  return [{ title: "react-clean" }, { name: "description", content: "react-clean is a web application" }];
}

export default function Home() {
  
  const healthCheck = useQuery(api.healthCheck.get);
  
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  

  return (
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
                className={`h-2 w-2 rounded-full ${
                  healthCheck.data ? "bg-green-500" : "bg-red-500"
                }`}
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
