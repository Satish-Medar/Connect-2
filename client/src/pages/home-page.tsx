import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ReportCard } from "@/components/report-card";
import { AIAnalysis } from "@/components/ai-analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Camera, 
  MapPin, 
  Mic, 
  Trophy, 
  Medal, 
  Flame, 
  Shield, 
  Star,
  TrendingUp,
  BarChart3,
  CircleAlert,
  Wrench,
  CheckCircle,
  Clock,
  Brain,
  Smartphone,
  Wifi,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { IssueWithReporter, User } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();

  const { data: recentIssues = [] } = useQuery<IssueWithReporter[]>({
    queryKey: ["/api/issues"],
    enabled: !!user,
  });

  const { data: leaderboard = [] } = useQuery<User[]>({
    queryKey: ["/api/users/leaderboard"],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user.role === "admin" || user.role === "staff"),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "achievements"],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 space-y-8 pb-20 md:pb-6">
        {/* Quick Report Hero */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Report an Issue</h2>
                <p className="text-primary-foreground/80">Help improve your community with AI-powered reporting</p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Camera className="text-2xl" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Link href="/report">
                <Button variant="ghost" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-4 h-auto text-center transition-all transform hover:scale-105 w-full" data-testid="button-take-photo">
                  <div className="flex flex-col items-center space-y-2">
                    <Camera className="text-2xl" />
                    <div className="font-medium">Take Photo</div>
                    <div className="text-xs opacity-80">AI will detect issue type</div>
                  </div>
                </Button>
              </Link>
              <Link href="/report">
                <Button variant="ghost" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-4 h-auto text-center transition-all transform hover:scale-105 w-full" data-testid="button-gps-location">
                  <div className="flex flex-col items-center space-y-2">
                    <MapPin className="text-2xl" />
                    <div className="font-medium">GPS Location</div>
                    <div className="text-xs opacity-80">Auto-tagged</div>
                  </div>
                </Button>
              </Link>
              <Link href="/report">
                <Button variant="ghost" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-4 h-auto text-center transition-all transform hover:scale-105 w-full" data-testid="button-voice-input">
                  <div className="flex flex-col items-center space-y-2">
                    <Mic className="text-2xl" />
                    <div className="font-medium">Voice Input</div>
                    <div className="text-xs opacity-80">Speech-to-text</div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        </div>

        {/* AI Processing Demo */}
        <AIAnalysis />

        {/* Community Features & Gamification */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Community Leaders</CardTitle>
                <Trophy className="text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((leader, index) => (
                  <div 
                    key={leader.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? 'bg-accent/5 border-accent/20' : 'bg-muted/50'
                    }`}
                    data-testid={`leaderboard-item-${index + 1}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-accent' : 'bg-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{leader.username}</div>
                        <div className="text-xs text-muted-foreground">
                          {index === 0 ? 'Civic Champion' : index === 1 ? 'Issue Detective' : 'Community Helper'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${index === 0 ? 'text-accent' : ''}`}>
                        {leader.points.toLocaleString()} pts
                      </div>
                      <div className="text-xs text-muted-foreground">reports</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Your Achievements</CardTitle>
                <Medal className="text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-secondary/10 rounded-lg border-2 border-secondary/20" data-testid="achievement-first-reporter">
                  <Camera className="text-2xl text-secondary mb-1 mx-auto" />
                  <div className="text-xs font-medium">First Reporter</div>
                  <div className="text-xs text-muted-foreground">
                    {achievements.some(a => a.type === 'first_reporter') ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-accent/10 rounded-lg border-2 border-accent/20" data-testid="achievement-hot-streak">
                  <Flame className="text-2xl text-accent mb-1 mx-auto" />
                  <div className="text-xs font-medium">Hot Streak</div>
                  <div className="text-xs text-muted-foreground">5 days</div>
                </div>
                
                <div className="text-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20" data-testid="achievement-quality-guard">
                  <Shield className="text-2xl text-primary mb-1 mx-auto" />
                  <div className="text-xs font-medium">Quality Guard</div>
                  <div className="text-xs text-muted-foreground">95% accurate</div>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30" data-testid="achievement-city-hero">
                  <Star className="text-2xl text-muted-foreground mb-1 mx-auto" />
                  <div className="text-xs font-medium">City Hero</div>
                  <div className="text-xs text-muted-foreground">0/50 reports</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
              <Link href="/my-reports">
                <Button variant="outline" size="sm" data-testid="link-view-all-reports">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIssues.slice(0, 3).map((issue) => (
                <ReportCard key={issue.id} issue={issue} />
              ))}
              {recentIssues.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports yet. Be the first to report an issue!</p>
                  <Link href="/report">
                    <Button className="mt-4" data-testid="button-create-first-report">Create Your First Report</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Dashboard Preview */}
        {user && (user.role === "admin" || user.role === "staff") && stats && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Municipal Dashboard</CardTitle>
                <Badge variant="secondary" data-testid="badge-admin-view">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin View
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Stats Overview */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Reports</p>
                        <p className="text-2xl font-bold text-destructive" data-testid="stat-active-reports">{stats.active}</p>
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
                        <p className="text-2xl font-bold text-accent" data-testid="stat-in-progress">{stats.inProgress}</p>
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
                        <p className="text-2xl font-bold text-secondary" data-testid="stat-resolved">{stats.resolved}</p>
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
                        <p className="text-2xl font-bold text-primary" data-testid="stat-avg-response">{stats.avgResponseTime} days</p>
                      </div>
                      <Clock className="text-primary text-xl" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* AI Insights */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Brain className="text-primary text-xl" />
                  <h4 className="font-semibold">AI Predictive Insights</h4>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pothole Trend Alert</span>
                      <TrendingUp className="text-destructive w-4 h-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">Oak Street showing 40% increase in reports. Recommend preventive maintenance.</p>
                  </div>
                  
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Resource Optimization</span>
                      <BarChart3 className="text-secondary w-4 h-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">Deploy crew to Downtown district - predicted 20% efficiency gain.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Link href="/admin">
                  <Button className="w-full" data-testid="button-full-dashboard">View Full Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PWA Features */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div data-testid="pwa-feature-install">
                <Smartphone className="w-8 h-8 text-primary mb-3 mx-auto" />
                <h4 className="font-semibold mb-2">Install as App</h4>
                <p className="text-sm text-muted-foreground">Add to home screen for instant access</p>
              </div>
              
              <div data-testid="pwa-feature-offline">
                <Wifi className="w-8 h-8 text-secondary mb-3 mx-auto" />
                <h4 className="font-semibold mb-2">Works Offline</h4>
                <p className="text-sm text-muted-foreground">Create draft reports without internet</p>
              </div>
              
              <div data-testid="pwa-feature-notifications">
                <Bell className="w-8 h-8 text-accent mb-3 mx-auto" />
                <h4 className="font-semibold mb-2">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">Get updates on your reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
