import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AddFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    content: string;
    source: string;
    customerName?: string;
    customerEmail?: string;
  }) => void;
  loading: boolean;
}

export default function AddFeedbackDialog({ open, onOpenChange, onSubmit, loading }: AddFeedbackDialogProps) {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("email");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({
        content: content.trim(),
        source,
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
      });
      setContent("");
      setCustomerName("");
      setCustomerEmail("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Feedback</CardTitle>
          <CardDescription>
            Add customer feedback for sentiment analysis and team collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Feedback Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter the customer feedback..."
                rows={6}
                required
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="block text-sm font-medium mb-2">
                  Source *
                </label>
                <select
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="email">Email</option>
                  <option value="social">Social Media</option>
                  <option value="survey">Survey</option>
                  <option value="review">Review</option>
                  <option value="support">Support Ticket</option>
                  <option value="chat">Live Chat</option>
                  <option value="phone">Phone Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium mb-2">
                  Customer Name
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Optional customer name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium mb-2">
                Customer Email
              </label>
              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Optional customer email"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !content.trim()}
                className="flex-1"
              >
                {loading ? "Adding..." : "Add Feedback"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}