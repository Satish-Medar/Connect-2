import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Route, Brain } from "lucide-react";

export function AIAnalysis() {
  const [analysisState, setAnalysisState] = useState<"processing" | "complete">("processing");

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalysisState("complete");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card data-testid="ai-analysis-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">AI Analysis</CardTitle>
          <Badge 
            className={
              analysisState === "processing" 
                ? "ai-processing text-white animate-pulse" 
                : "bg-secondary text-secondary-foreground"
            }
            data-testid="ai-status-badge"
          >
            <Brain className="w-3 h-3 mr-1" />
            {analysisState === "processing" ? "Processing..." : "Analysis Complete"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Demo Image */}
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div 
            className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-muted-foreground"
            data-testid="demo-image-placeholder"
          >
            📸 Sample Issue Photo
          </div>
        </div>

        <div className="space-y-3">
          <div 
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              analysisState === "complete" ? "bg-secondary/10" : "bg-muted/50"
            }`}
            data-testid="ai-result-detection"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className={analysisState === "complete" ? "text-secondary" : "text-muted-foreground"} />
              <span className="font-medium">
                {analysisState === "complete" ? "Issue Detected: Pothole" : "Detecting issue type..."}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analysisState === "complete" ? "98% confidence" : "Processing..."}
            </span>
          </div>
          
          <div 
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              analysisState === "complete" ? "bg-accent/10" : "bg-muted/50"
            }`}
            data-testid="ai-result-severity"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className={analysisState === "complete" ? "text-accent" : "text-muted-foreground"} />
              <span className="font-medium">
                {analysisState === "complete" ? "Severity: High Priority" : "Analyzing severity..."}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analysisState === "complete" ? "Size: Large" : "Processing..."}
            </span>
          </div>
          
          <div 
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              analysisState === "complete" ? "bg-primary/10" : "bg-muted/50"
            }`}
            data-testid="ai-result-routing"
          >
            <div className="flex items-center space-x-3">
              <Route className={analysisState === "complete" ? "text-primary" : "text-muted-foreground"} />
              <span className="font-medium">
                {analysisState === "complete" ? "Routed to: Public Works Dept." : "Determining routing..."}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analysisState === "complete" ? "Auto-assigned" : "Processing..."}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
