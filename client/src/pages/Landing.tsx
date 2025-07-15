import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Feedback Automation Tool
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-powered sentiment analysis and team collaboration for content creators. 
            Collect, organize, and analyze customer feedback automatically.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Smart Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically collect feedback from multiple sources including email, social media, and surveys.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered sentiment analysis automatically categorizes feedback as positive, negative, or neutral.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Work together with your team to respond to feedback and track progress on improvements.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Real-time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get instant notifications and updates as new feedback comes in and team members respond.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Create Your Team</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Set up your team and invite collaborators to work together on feedback management.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Collect Feedback</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add feedback from various sources. Our AI automatically analyzes sentiment and categorizes it.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Take Action</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Assign feedback to team members, add comments, and track progress on improvements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}