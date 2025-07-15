import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Users, MessageSquare, TrendingUp, LogOut } from "lucide-react";
import CreateTeamDialog from "@/components/CreateTeamDialog";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import type { Team, Project } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/teams"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/teams", selectedTeam?.id, "projects"],
    enabled: !!selectedTeam,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return apiRequest("/api/teams", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setShowCreateTeam(false);
      toast({
        title: "Success",
        description: "Team created successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; teamId: number }) => {
      return apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam?.id, "projects"] });
      setShowCreateProject(false);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  if (teamsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Feedback Automation</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.firstName || user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Teams Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Teams</h2>
              <Button
                size="sm"
                onClick={() => setShowCreateTeam(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Team
              </Button>
            </div>

            <div className="space-y-2">
              {teams.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No teams yet. Create your first team to get started!
                    </p>
                    <Button onClick={() => setShowCreateTeam(true)}>
                      Create Team
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                teams.map((team: Team) => (
                  <Card
                    key={team.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTeam?.id === team.id
                        ? "ring-2 ring-primary"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      {team.description && (
                        <CardDescription className="text-sm">
                          {team.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {!selectedTeam ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Team</h3>
                  <p className="text-muted-foreground">
                    Choose a team from the sidebar to view and manage projects.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                    {selectedTeam.description && (
                      <p className="text-muted-foreground">{selectedTeam.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => setShowCreateProject(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>

                {projectsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading projects...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first project to start collecting and analyzing feedback.
                      </p>
                      <Button onClick={() => setShowCreateProject(true)}>
                        Create Project
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {projects.map((project: Project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            <Link href={`/projects/${project.id}`} className="hover:text-primary">
                              {project.name}
                            </Link>
                          </CardTitle>
                          {project.description && (
                            <CardDescription>{project.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Active</Badge>
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateTeamDialog
        open={showCreateTeam}
        onOpenChange={setShowCreateTeam}
        onSubmit={(data) => createTeamMutation.mutate(data)}
        loading={createTeamMutation.isPending}
      />

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onSubmit={(data) => createProjectMutation.mutate({ ...data, teamId: selectedTeam!.id })}
        loading={createProjectMutation.isPending}
        teamName={selectedTeam?.name || ""}
      />
    </div>
  );
}