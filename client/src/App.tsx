import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Embed from "@/pages/embed";
import NotFound from "@/pages/not-found";

function EmbedWrapper() {
  const { data: configData } = useQuery({
    queryKey: ['/api/widget/demo-config'],
    enabled: true,
  });
  
  return (
    <Embed 
      apiKey={(configData as any)?.apiKey || 'your_api_key_here'} 
      agentId={(configData as any)?.agentId || 'your_agent_id_here'} 
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/embed" component={EmbedWrapper} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
