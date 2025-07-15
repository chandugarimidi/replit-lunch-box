import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  User, 
  Mail, 
  Calendar,
  MessageCircle,
  Send
} from "lucide-react";
import type { Feedback, FeedbackComment } from "@shared/schema";
import { format } from "date-fns";

interface FeedbackDetailProps {
  feedback: Feedback & { assignedUser?: any };
  onClose: () => void;
  projectId: number;
}

export default function FeedbackDetail({ feedback, onClose, projectId }: FeedbackDetailProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/feedback", feedback.id, "comments"],
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

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/feedback/${feedback.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isRead: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "feedback"] });
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

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/feedback/${feedback.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback", feedback.id, "comments"] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
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
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  // Mark as read when opened if not already read
  if (!feedback.isRead) {
    markAsReadMutation.mutate();
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden bg-background rounded-lg shadow-lg">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <Badge variant={getSentimentVariant(feedback.sentiment || "neutral")}>
                  {getSentimentIcon(feedback.sentiment || "neutral")}
                  <span className="ml-1 capitalize">{feedback.sentiment || "neutral"}</span>
                </Badge>
                {feedback.sentimentScore && (
                  <span className="text-sm text-muted-foreground">
                    Score: {feedback.sentimentScore}/100
                  </span>
                )}
                {feedback.confidence && (
                  <span className="text-sm text-muted-foreground">
                    Confidence: {feedback.confidence}%
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Feedback Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {feedback.customerName && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{feedback.customerName}</span>
                    </div>
                  )}
                  {feedback.customerEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{feedback.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(feedback.createdAt!), "PPP")}</span>
                  </div>
                </div>

                {/* Feedback Text */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feedback Content</CardTitle>
                    <CardDescription>Source: {feedback.source}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{feedback.content}</p>
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Team Comments ({comments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {commentsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No comments yet. Start the conversation!
                      </p>
                    ) : (
                      comments.map((comment: FeedbackComment & { user: any }) => (
                        <div key={comment.id} className="border-l-2 border-muted pl-4 py-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">
                              {comment.user.firstName || comment.user.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt!), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))
                    )}

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newComment.trim() || addCommentMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {addCommentMutation.isPending ? "Sending..." : "Send Comment"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}