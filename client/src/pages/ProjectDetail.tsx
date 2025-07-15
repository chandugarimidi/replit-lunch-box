import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft, 
  Plus, 
  Filter, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  User,
  Calendar
} from "lucide-react";
import AddFeedbackDialog from "@/components/AddFeedbackDialog";
import FeedbackDetail from "@/components/FeedbackDetail";
import type { Project, Feedback } from "@shared/schema";
import { format } from "date-fns";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showAddFeedback, setShowAddFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["/api/projects", id],
    enabled: !!id,
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

  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ["/api/projects", id, "feedback", sentimentFilter, statusFilter],
    enabled: !!id,
    queryFn: () => {
      const params = new URLSearchParams();
      if (sentimentFilter !== "all") params.set("sentiment", sentimentFilter);
      if (statusFilter === "read") params.set("isRead", "true");
      if (statusFilter === "unread") params.set("isRead", "false");
      
      const url = `/api/projects/${id}/feedback${params.toString() ? `?${params.toString()}` : ""}`;
      return apiRequest(url);
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
      }
    },
  });

  const addFeedbackMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ ...data, projectId: parseInt(id!) }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id, "feedback"] });
      setShowAddFeedback(false);
      toast({
        title: "Success",
        description: "Feedback added successfully",
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
        description: "Failed to add feedback",
        variant: "destructive",
      });
    },
  });

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "positive" as const;
      case "negative":
        return "negative" as const;
      default:
        return "neutral" as const;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.description && (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </div>
            </div>
            <Button onClick={() => setShowAddFeedback(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Feedback
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sentiment</label>
                  <select
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Sentiment</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback List */}
          <div className="lg:col-span-3">
            {feedbackLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading feedback...</p>
              </div>
            ) : feedback.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Feedback Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start collecting feedback to see sentiment analysis and collaboration features.
                  </p>
                  <Button onClick={() => setShowAddFeedback(true)}>
                    Add Your First Feedback
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedback.map((item: Feedback & { assignedUser?: any }) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      !item.isRead ? "border-l-4 border-l-primary" : ""
                    }`}
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSentimentVariant(item.sentiment || "neutral")}>
                            {getSentimentIcon(item.sentiment || "neutral")}
                            <span className="ml-1 capitalize">{item.sentiment || "neutral"}</span>
                          </Badge>
                          {!item.isRead && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(item.createdAt!), "MMM d, yyyy")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3 line-clamp-3">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          {item.customerName && (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {item.customerName}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.source}
                          </span>
                        </div>
                        {item.assignedUser && (
                          <span>Assigned to {item.assignedUser.firstName || item.assignedUser.email}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddFeedbackDialog
        open={showAddFeedback}
        onOpenChange={setShowAddFeedback}
        onSubmit={(data) => addFeedbackMutation.mutate(data)}
        loading={addFeedbackMutation.isPending}
      />

      {selectedFeedback && (
        <FeedbackDetail
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          projectId={parseInt(id!)}
        />
      )}
    </div>
  );
}