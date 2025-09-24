import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ThumbsUp, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SimilarIssue {
  id: string;
  title: string;
  description: string;
  similarity: number;
  reasons: string[];
  reportedBy: string;
  createdAt: string;
  validationCount: number;
  status: string;
}

interface SimilarIssuesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  similarIssues: SimilarIssue[];
  submittedIssue: any;
  onProceedAnyway: () => void;
}

export function SimilarIssuesDialog({
  open,
  onOpenChange,
  similarIssues,
  submittedIssue,
  onProceedAnyway,
}: SimilarIssuesDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [upvotingIssues, setUpvotingIssues] = useState<Set<string>>(new Set());

  const upvoteMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const response = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to upvote issue');
      }
      return response.json();
    },
    onSuccess: (_, issueId) => {
      toast({
        title: t('success'),
        description: 'Upvote added successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      setUpvotingIssues(prev => {
        const next = new Set(prev);
        next.delete(issueId);
        return next;
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to upvote issue',
      });
      setUpvotingIssues(new Set());
    },
  });

  const handleUpvote = (issueId: string) => {
    setUpvotingIssues(prev => {
      const newSet = new Set(prev);
      newSet.add(issueId);
      return newSet;
    });
    upvoteMutation.mutate(issueId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 dark:text-green-400';
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400';
      case 'submitted':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'submitted':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('timeAgo.justNow');
    if (diffInHours < 24) return t('timeAgo.hoursAgo', { hours: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('timeAgo.daysAgo', { days: diffInDays });
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return t('timeAgo.weeksAgo', { weeks: diffInWeeks });
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return t('timeAgo.monthsAgo', { months: diffInMonths });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {t('similarIssueFound')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t('duplicateMessage')}
          </p>

          <div className="grid gap-4">
            {similarIssues.map((issue) => (
              <Card key={issue.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {t('reportedBy')} {issue.reportedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTimeAgo(issue.createdAt)}
                        </div>
                        <div className={`flex items-center gap-1 ${getStatusColor(issue.status)}`}>
                          {getStatusIcon(issue.status)}
                          {t(`status.${issue.status}`)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {Math.round(issue.similarity * 100)}% {t('similar', 'similar')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm">{issue.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {issue.reasons.map((reason, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {issue.validationCount} {t('upvotes', 'upvotes')}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleUpvote(issue.id)}
                      disabled={upvotingIssues.has(issue.id)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      data-testid={`button-upvote-${issue.id}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {upvotingIssues.has(issue.id) 
                        ? t('upvoting', 'Upvoting...') 
                        : t('upvoteExisting')
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-duplicate"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={onProceedAnyway}
            variant="default"
            data-testid="button-submit-anyway"
          >
            {t('submitAnyway')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}