import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ReportCard } from "@/components/report-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { IssueWithReporter, IssueWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  Camera, 
  Plus, 
  Filter, 
  MessageCircle, 
  ThumbsUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench
} from "lucide-react";
import { Link } from "wouter";

export default function MyReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const { data: myIssues = [], isLoading } = useQuery<IssueWithReporter[]>({
    queryKey: ["/api/issues", { reporterId: user?.id }],
    enabled: !!user,
  });

  const { data: issueDetails } = useQuery<IssueWithDetails>({
    queryKey: ["/api/issues", selectedIssue],
    enabled: !!selectedIssue,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "achievements"],
    enabled: !!user,
  });

  const validateMutation = useMutation({
    mutationFn: async ({ issueId, isValid }: { issueId: string, isValid: boolean }) => {
      await apiRequest("POST", `/api/issues/${issueId}/validate`, { isValid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: "Validation recorded",
        description: "Thank you for helping verify this report!",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ issueId, content }: { issueId: string, content: string }) => {
      await apiRequest("POST", `/api/issues/${issueId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues", selectedIssue] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
  });

  const filteredIssues = myIssues.filter(issue => {
    if (statusFilter === "all") return true;
    return issue.status === statusFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted": return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "acknowledged": return <AlertCircle className="w-4 h-4 text-primary" />;
      case "in_progress": return <Wrench className="w-4 h-4 text-accent" />;
      case "resolved": return <CheckCircle className="w-4 h-4 text-secondary" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleAddComment = () => {
    if (!selectedIssue || !newComment.trim()) return;
    commentMutation.mutate({ issueId: selectedIssue, content: newComment });
  };

  const statsData = {
    total: myIssues.length,
    submitted: myIssues.filter(i => i.status === 'submitted').length,
    in_progress: myIssues.filter(i => i.status === 'in_progress').length,
    resolved: myIssues.filter(i => i.status === 'resolved').length,
    totalValidations: myIssues.reduce((sum, issue) => sum + issue.validationCount, 0),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Reports</h1>
            <p className="text-muted-foreground">
              Track the progress of your civic issue reports
            </p>
          </div>
          <Link href="/report">
            <Button data-testid="button-new-report">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="stat-total-reports">
                {statsData.total}
              </div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1" data-testid="stat-in-progress">
                {statsData.in_progress}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary mb-1" data-testid="stat-resolved">
                {statsData.resolved}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="stat-validations">
                {statsData.totalValidations}
              </div>
              <div className="text-sm text-muted-foreground">Community Verifications</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Preview */}
        {achievements.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {achievements.slice(0, 3).map((achievement) => (
                  <Badge 
                    key={achievement.id} 
                    className="bg-accent/10 text-accent border-accent/20"
                    data-testid={`achievement-${achievement.type}`}
                  >
                    <span className="mr-1">🏆</span>
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by status:</span>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status ({statsData.total})</SelectItem>
                  <SelectItem value="submitted">Submitted ({statsData.submitted})</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="in_progress">In Progress ({statsData.in_progress})</SelectItem>
                  <SelectItem value="resolved">Resolved ({statsData.resolved})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-muted-foreground mb-4">
                  {statusFilter === "all" 
                    ? "You haven't submitted any reports yet. Start making a difference in your community!"
                    : `No reports with status "${statusFilter}".`
                  }
                </p>
                <Link href="/report">
                  <Button data-testid="button-create-first-report">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.id}>
                <ReportCard issue={issue} />
                
                {/* Additional Actions */}
                <Card className="mt-2 border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(issue.status)}
                          <span className="text-sm font-medium capitalize">
                            {issue.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(issue.updatedAt))} ago
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedIssue(issue.id)}
                            data-testid={`button-view-details-${issue.id}`}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{issue.title}</DialogTitle>
                          </DialogHeader>
                          
                          {issueDetails && (
                            <div className="space-y-4">
                              {/* Issue Image */}
                              {issue.imageUrl && (
                                <div>
                                  <img 
                                    src={issue.imageUrl} 
                                    alt={issue.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                  />
                                </div>
                              )}

                              {/* Issue Details */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Category:</strong> {issue.category}</div>
                                    <div><strong>Priority:</strong> {issue.priority}</div>
                                    <div><strong>Status:</strong> {issue.status}</div>
                                    {issue.address && <div><strong>Address:</strong> {issue.address}</div>}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Community</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Validations:</strong> {issue.validationCount}</div>
                                    <div><strong>Comments:</strong> {issue.commentCount}</div>
                                    {issue.aiConfidence && (
                                      <div><strong>AI Confidence:</strong> {Math.round(parseFloat(issue.aiConfidence) * 100)}%</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {issue.description && (
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                                </div>
                              )}

                              {/* Comments Section */}
                              <div>
                                <h4 className="font-semibold mb-4">Comments ({issueDetails.comments.length})</h4>
                                
                                <div className="space-y-3 mb-4">
                                  {issueDetails.comments.map((comment) => (
                                    <div 
                                      key={comment.id} 
                                      className={`p-3 rounded-lg ${
                                        comment.isOfficial ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">
                                          {comment.user.username}
                                          {comment.isOfficial && (
                                            <Badge variant="secondary" className="ml-2 text-xs">Official</Badge>
                                          )}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                                        </span>
                                      </div>
                                      <p className="text-sm">{comment.content}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Add Comment */}
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    data-testid="textarea-new-comment"
                                  />
                                  <Button 
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim() || commentMutation.isPending}
                                    size="sm"
                                    data-testid="button-add-comment"
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Add Comment
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
