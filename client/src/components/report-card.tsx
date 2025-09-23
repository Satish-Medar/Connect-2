import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { IssueWithReporter } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ReportCardProps {
  issue: IssueWithReporter;
}

export function ReportCard({ issue }: ReportCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive/10 text-destructive border-destructive/20";
      case "high": return "bg-accent/10 text-accent border-accent/20";
      case "medium": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-secondary/10 text-secondary border-secondary/20";
      case "in_progress": return "bg-accent/10 text-accent border-accent/20";
      case "acknowledged": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  return (
    <Card className="report-card transition-all hover:shadow-md" data-testid={`report-card-${issue.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {issue.imageUrl && (
              <img 
                src={issue.imageUrl} 
                alt={issue.title}
                className="w-16 h-16 object-cover rounded-lg"
                data-testid={`report-image-${issue.id}`}
              />
            )}
            <div>
              <h4 className="font-medium" data-testid={`report-title-${issue.id}`}>{issue.title}</h4>
              <p className="text-sm text-muted-foreground">
                Reported by <span data-testid={`report-author-${issue.id}`}>{issue.reporter.username}</span> • {" "}
                <span data-testid={`report-time-${issue.id}`}>
                  {formatDistanceToNow(new Date(issue.createdAt))} ago
                </span>
              </p>
              {issue.address && (
                <p className="text-sm text-muted-foreground" data-testid={`report-address-${issue.id}`}>
                  📍 {issue.address}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              className={getPriorityColor(issue.priority)}
              data-testid={`report-priority-${issue.id}`}
            >
              {issue.priority} Priority
            </Badge>
            <Badge 
              className={getStatusColor(issue.status)}
              data-testid={`report-status-${issue.id}`}
            >
              {issue.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        
        {/* Community Validation */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-secondary hover:text-secondary/80"
              data-testid={`button-validate-${issue.id}`}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span data-testid={`validation-count-${issue.id}`}>
                {issue.validationCount} verified
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              data-testid={`button-comment-${issue.id}`}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span data-testid={`comment-count-${issue.id}`}>
                {issue.commentCount} comments
              </span>
            </Button>
          </div>
          {issue.aiConfidence && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="text-primary">🤖</span>
              <span data-testid={`ai-confidence-${issue.id}`}>
                AI Confidence: {Math.round(parseFloat(issue.aiConfidence) * 100)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
