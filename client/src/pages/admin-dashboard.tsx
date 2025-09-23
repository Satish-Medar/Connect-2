import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { IssueWithReporter, IssueWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import {
  CircleAlert,
  Wrench,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Brain,
  Users,
  MapPin,
  Calendar,
  Settings,
  Eye,
  Edit
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const { data: issues = [] } = useQuery<IssueWithReporter[]>({
    queryKey: ["/api/issues", { limit: 100 }],
    enabled: !!user && (user.role === "admin" || user.role === "staff"),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user.role === "admin" || user.role === "staff"),
  });

  const { data: issueDetails } = useQuery<IssueWithDetails>({
    queryKey: ["/api/issues", selectedIssue],
    enabled: !!selectedIssue,
  });

  const updateIssueMutation = useMutation({
    mutationFn: async ({ issueId, updates }: { issueId: string, updates: any }) => {
      await apiRequest("PATCH", `/api/issues/${issueId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Issue updated",
        description: "The issue status has been updated successfully.",
      });
      setSelectedIssue(null);
      setNewStatus("");
      setAdminNote("");
    },
  });

  const addOfficialCommentMutation = useMutation({
    mutationFn: async ({ issueId, content }: { issueId: string, content: string }) => {
      await apiRequest("POST", `/api/issues/${issueId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues", selectedIssue] });
      setAdminNote("");
      toast({
        title: "Official response added",
        description: "Your official response has been posted.",
      });
    },
  });

  // Filter issues by priority and status for admin view
  const urgentIssues = issues.filter(i => i.priority === "urgent" || i.priority === "high");
  const newIssues = issues.filter(i => i.status === "submitted");
  const inProgressIssues = issues.filter(i => i.status === "in_progress" || i.status === "acknowledged");

  const handleUpdateIssue = () => {
    if (!selectedIssue || !newStatus) return;
    
    const updates: any = { status: newStatus };
    if (newStatus === "resolved") {
      updates.resolvedAt = new Date().toISOString();
    }
    
    updateIssueMutation.mutate({ issueId: selectedIssue, updates });
  };

  const handleAddOfficialComment = () => {
    if (!selectedIssue || !adminNote.trim()) return;
    addOfficialCommentMutation.mutate({ issueId: selectedIssue, content: adminNote });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-accent text-accent-foreground";
      case "medium": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-destructive/10 text-destructive border-destructive/20";
      case "acknowledged": return "bg-primary/10 text-primary border-primary/20";
      case "in_progress": return "bg-accent/10 text-accent border-accent/20";
      case "resolved": return "bg-secondary/10 text-secondary border-secondary/20";
      default: return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <CircleAlert className="w-16 h-16 mx-auto mb-4 text-destructive opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access the admin dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Municipal Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage civic issues across the city
            </p>
          </div>
          <Badge variant="secondary" data-testid="badge-admin-role">
            <Settings className="w-3 h-3 mr-1" />
            {user.role === "admin" ? "Administrator" : "Staff Member"}
          </Badge>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Reports</p>
                    <p className="text-2xl font-bold text-destructive" data-testid="stat-active-reports">
                      {stats.active}
                    </p>
                  </div>
                  <CircleAlert className="text-destructive text-xl" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-accent" data-testid="stat-in-progress">
                      {stats.inProgress}
                    </p>
                  </div>
                  <Wrench className="text-accent text-xl" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-secondary" data-testid="stat-resolved">
                      {stats.resolved}
                    </p>
                  </div>
                  <CheckCircle className="text-secondary text-xl" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold text-primary" data-testid="stat-avg-response">
                      {stats.avgResponseTime} days
                    </p>
                  </div>
                  <Clock className="text-primary text-xl" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Insights Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-primary" />
              AI Predictive Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pothole Trend Alert</span>
                    <TrendingUp className="text-destructive w-4 h-4" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Oak Street showing 40% increase in reports. Recommend preventive maintenance.
                  </p>
                </div>
                
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Resource Optimization</span>
                    <BarChart3 className="text-secondary w-4 h-4" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deploy crew to Downtown district - predicted 20% efficiency gain.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Sections */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Urgent Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-destructive">
                Urgent Issues ({urgentIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentIssues.slice(0, 3).map((issue) => (
                <div 
                  key={issue.id} 
                  className="p-3 border border-destructive/20 rounded-lg bg-destructive/5"
                  data-testid={`urgent-issue-${issue.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{issue.title}</h4>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {issue.address || `${parseFloat(issue.latitude).toFixed(4)}, ${parseFloat(issue.longitude).toFixed(4)}`}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(issue.createdAt))} ago
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setSelectedIssue(issue.id)}
                          data-testid={`button-view-urgent-${issue.id}`}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <AdminIssueDialog
                          issue={issueDetails}
                          newStatus={newStatus}
                          setNewStatus={setNewStatus}
                          adminNote={adminNote}
                          setAdminNote={setAdminNote}
                          onUpdateIssue={handleUpdateIssue}
                          onAddComment={handleAddOfficialComment}
                          updateMutation={updateIssueMutation}
                          commentMutation={addOfficialCommentMutation}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* New Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                New Issues ({newIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {newIssues.slice(0, 3).map((issue) => (
                <div 
                  key={issue.id} 
                  className="p-3 border border-primary/20 rounded-lg bg-primary/5"
                  data-testid={`new-issue-${issue.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{issue.title}</h4>
                    <Badge className={getStatusColor(issue.status)}>
                      New
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    By {issue.reporter.username}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(issue.createdAt))} ago
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedIssue(issue.id)}
                          data-testid={`button-review-new-${issue.id}`}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Process
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <AdminIssueDialog
                          issue={issueDetails}
                          newStatus={newStatus}
                          setNewStatus={setNewStatus}
                          adminNote={adminNote}
                          setAdminNote={setAdminNote}
                          onUpdateIssue={handleUpdateIssue}
                          onAddComment={handleAddOfficialComment}
                          updateMutation={updateIssueMutation}
                          commentMutation={addOfficialCommentMutation}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-accent">
                In Progress ({inProgressIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inProgressIssues.slice(0, 3).map((issue) => (
                <div 
                  key={issue.id} 
                  className="p-3 border border-accent/20 rounded-lg bg-accent/5"
                  data-testid={`progress-issue-${issue.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{issue.title}</h4>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status === "in_progress" ? "In Progress" : "Acknowledged"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Dept: {issue.departmentRouted || "Unassigned"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(issue.updatedAt))} ago
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedIssue(issue.id)}
                          data-testid={`button-update-progress-${issue.id}`}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <AdminIssueDialog
                          issue={issueDetails}
                          newStatus={newStatus}
                          setNewStatus={setNewStatus}
                          adminNote={adminNote}
                          setAdminNote={setAdminNote}
                          onUpdateIssue={handleUpdateIssue}
                          onAddComment={handleAddOfficialComment}
                          updateMutation={updateIssueMutation}
                          commentMutation={addOfficialCommentMutation}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* All Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issues.map((issue) => (
                <div 
                  key={issue.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`issue-row-${issue.id}`}
                >
                  <div className="flex items-center space-x-4">
                    {issue.imageUrl && (
                      <img 
                        src={issue.imageUrl} 
                        alt={issue.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{issue.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{issue.reporter.username}</span>
                        <MapPin className="w-3 h-3 ml-2" />
                        <span>{issue.category}</span>
                        <Calendar className="w-3 h-3 ml-2" />
                        <span>{formatDistanceToNow(new Date(issue.createdAt))} ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedIssue(issue.id)}
                          data-testid={`button-manage-${issue.id}`}
                        >
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <AdminIssueDialog
                          issue={issueDetails}
                          newStatus={newStatus}
                          setNewStatus={setNewStatus}
                          adminNote={adminNote}
                          setAdminNote={setAdminNote}
                          onUpdateIssue={handleUpdateIssue}
                          onAddComment={handleAddOfficialComment}
                          updateMutation={updateIssueMutation}
                          commentMutation={addOfficialCommentMutation}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Admin Issue Dialog Component
function AdminIssueDialog({ 
  issue, 
  newStatus, 
  setNewStatus, 
  adminNote, 
  setAdminNote, 
  onUpdateIssue, 
  onAddComment,
  updateMutation,
  commentMutation
}: {
  issue: IssueWithDetails | undefined;
  newStatus: string;
  setNewStatus: (status: string) => void;
  adminNote: string;
  setAdminNote: (note: string) => void;
  onUpdateIssue: () => void;
  onAddComment: () => void;
  updateMutation: any;
  commentMutation: any;
}) {
  if (!issue) return <div>Loading...</div>;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{issue.title}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
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

        {/* Issue Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3">Issue Information</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Reporter:</strong> {issue.reporter.username}</div>
              <div><strong>Category:</strong> {issue.category}</div>
              <div><strong>Priority:</strong> {issue.priority}</div>
              <div><strong>Current Status:</strong> {issue.status}</div>
              <div><strong>Department:</strong> {issue.departmentRouted || "Unassigned"}</div>
              {issue.address && <div><strong>Address:</strong> {issue.address}</div>}
              <div><strong>Created:</strong> {formatDistanceToNow(new Date(issue.createdAt))} ago</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">AI Analysis</h4>
            <div className="space-y-2 text-sm">
              {issue.aiConfidence && (
                <div><strong>AI Confidence:</strong> {Math.round(parseFloat(issue.aiConfidence) * 100)}%</div>
              )}
              {issue.severityScore && (
                <div><strong>Severity Score:</strong> {issue.severityScore}/100</div>
              )}
              <div><strong>Validations:</strong> {issue.validationCount}</div>
              <div><strong>Comments:</strong> {issue.commentCount}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        {issue.description && (
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              {issue.description}
            </p>
          </div>
        )}

        {/* Status Update Section */}
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-semibold mb-3">Update Status</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger data-testid="select-new-status">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={onUpdateIssue}
              disabled={!newStatus || updateMutation.isPending}
              data-testid="button-update-status"
            >
              Update Status
            </Button>
          </div>
        </div>

        {/* Official Response Section */}
        <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
          <h4 className="font-semibold mb-3">Add Official Response</h4>
          <div className="space-y-3">
            <Textarea
              placeholder="Write an official response to the citizen..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              data-testid="textarea-admin-note"
            />
            <Button 
              onClick={onAddComment}
              disabled={!adminNote.trim() || commentMutation.isPending}
              data-testid="button-add-official-response"
            >
              Add Official Response
            </Button>
          </div>
        </div>

        {/* Comments History */}
        <div>
          <h4 className="font-semibold mb-4">Comments & Updates ({issue.comments.length})</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {issue.comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`p-3 rounded-lg ${
                  comment.isOfficial 
                    ? 'bg-primary/5 border border-primary/20' 
                    : 'bg-muted/30'
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
        </div>
      </div>
    </>
  );
}
