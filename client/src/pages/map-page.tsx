import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { IssueMap } from "@/components/issue-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGeolocation } from "@/hooks/use-geolocation";
import { IssueWithReporter } from "@shared/schema";
import { MapPin, Search, Filter, Target } from "lucide-react";

export default function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  
  const geolocation = useGeolocation();

  const { data: issues = [] } = useQuery<IssueWithReporter[]>({
    queryKey: ["/api/issues", { 
      category: selectedCategory === "all" ? undefined : selectedCategory,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      limit: 1000
    }],
  });

  const { data: nearbyIssues = [] } = useQuery<IssueWithReporter[]>({
    queryKey: ["/api/issues/near", geolocation.latitude, geolocation.longitude],
    enabled: !!geolocation.latitude && !!geolocation.longitude,
  });

  const filteredIssues = issues.filter(issue => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return issue.title.toLowerCase().includes(query) ||
             issue.description?.toLowerCase().includes(query) ||
             issue.address?.toLowerCase().includes(query);
    }
    return true;
  });

  const handleCenterOnUser = () => {
    geolocation.getCurrentPosition();
    if (geolocation.latitude && geolocation.longitude) {
      setMapCenter([geolocation.latitude, geolocation.longitude]);
    }
  };

  const categoryStats = {
    pothole: filteredIssues.filter(i => i.category === 'pothole').length,
    lighting: filteredIssues.filter(i => i.category === 'lighting').length,
    garbage: filteredIssues.filter(i => i.category === 'garbage').length,
    signage: filteredIssues.filter(i => i.category === 'signage').length,
  };

  const statusStats = {
    submitted: filteredIssues.filter(i => i.status === 'submitted').length,
    acknowledged: filteredIssues.filter(i => i.status === 'acknowledged').length,
    in_progress: filteredIssues.filter(i => i.status === 'in_progress').length,
    resolved: filteredIssues.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Community Issue Map</h1>
            <p className="text-muted-foreground">
              {filteredIssues.length} issues found in your area
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleCenterOnUser}
            disabled={geolocation.loading}
            data-testid="button-center-on-user"
          >
            <Target className="w-4 h-4 mr-2" />
            My Location
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-issues"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="pothole">Potholes ({categoryStats.pothole})</SelectItem>
                  <SelectItem value="lighting">Lighting ({categoryStats.lighting})</SelectItem>
                  <SelectItem value="garbage">Garbage ({categoryStats.garbage})</SelectItem>
                  <SelectItem value="signage">Signage ({categoryStats.signage})</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted ({statusStats.submitted})</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged ({statusStats.acknowledged})</SelectItem>
                  <SelectItem value="in_progress">In Progress ({statusStats.in_progress})</SelectItem>
                  <SelectItem value="resolved">Resolved ({statusStats.resolved})</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filteredIssues.length} of {issues.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="destructive" data-testid="legend-submitted">
            🔴 Submitted ({statusStats.submitted})
          </Badge>
          <Badge variant="secondary" data-testid="legend-acknowledged">
            🟡 Acknowledged ({statusStats.acknowledged})
          </Badge>
          <Badge className="bg-accent text-accent-foreground" data-testid="legend-in-progress">
            🟠 In Progress ({statusStats.in_progress})
          </Badge>
          <Badge className="bg-secondary text-secondary-foreground" data-testid="legend-resolved">
            🟢 Resolved ({statusStats.resolved})
          </Badge>
        </div>

        {/* Map */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <IssueMap 
              issues={filteredIssues}
              center={mapCenter}
              userLocation={
                geolocation.latitude && geolocation.longitude
                  ? [geolocation.latitude, geolocation.longitude]
                  : undefined
              }
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive mb-1">
                {statusStats.submitted}
              </div>
              <div className="text-sm text-muted-foreground">New Reports</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {statusStats.in_progress}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary mb-1">
                {statusStats.resolved}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.round((statusStats.resolved / Math.max(issues.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Resolution Rate</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
