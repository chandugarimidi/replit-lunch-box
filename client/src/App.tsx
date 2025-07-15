import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import ProjectDetail from "@/pages/ProjectDetail";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/projects/:id" component={ProjectDetail} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </div>
  );
}

export default function App() {
  return <Router />;
}