import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { useCamera } from "@/hooks/use-camera";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Camera, MapPin, Mic, Upload, Loader2, X } from "lucide-react";
import { useLocation } from "wouter";

export default function ReportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  const camera = useCamera();
  const geolocation = useGeolocation();

  // Upload and analyze image
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', formData.get('description') || '');
      
      const res = await apiRequest("POST", "/api/upload", formData);
      return await res.json();
    },
    onSuccess: (data) => {
      setAiAnalysis(data.analysis);
      setFormData(prev => ({
        ...prev,
        category: data.analysis.category,
        title: data.analysis.description,
      }));
      toast({
        title: "Image analyzed!",
        description: `AI detected: ${data.analysis.category} with ${Math.round(data.analysis.confidence * 100)}% confidence`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit issue report
  const submitMutation = useMutation({
    mutationFn: async (issueData: any) => {
      const res = await apiRequest("POST", "/api/issues", issueData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: "Issue reported!",
        description: "Thank you for helping improve your community.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Report failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    uploadMutation.mutate(file);
  };

  const handleCameraCapture = async () => {
    try {
      await camera.openCamera();
    } catch (error) {
      toast({
        title: "Camera error",
        description: "Failed to access camera",
        variant: "destructive",
      });
    }
  };

  const handleGallerySelect = async () => {
    try {
      const imageData = await camera.selectFromGallery();
      // Convert data URL to file
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], "upload.jpg", { type: "image/jpeg" });
      handleImageUpload(file);
    } catch (error) {
      toast({
        title: "Selection failed",
        description: "Failed to select image",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!geolocation.latitude || !geolocation.longitude) {
      toast({
        title: "Location required",
        description: "Please enable location services to submit a report",
        variant: "destructive",
      });
      return;
    }

    const issueData = {
      ...formData,
      latitude: geolocation.latitude.toString(),
      longitude: geolocation.longitude.toString(),
      imageUrl: camera.capturedImage,
      priority: aiAnalysis?.priority || "medium",
      severityScore: aiAnalysis?.severityScore || 50,
      aiAnalysis,
      aiConfidence: aiAnalysis?.confidence.toString(),
      departmentRouted: aiAnalysis?.suggestedDepartment || "public_works",
    };

    submitMutation.mutate(issueData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Report a Civic Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Photo Evidence</Label>
                
                {!camera.capturedImage && !imageFile && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-24 flex flex-col space-y-2"
                      onClick={handleCameraCapture}
                      data-testid="button-camera"
                    >
                      <Camera className="h-6 w-6" />
                      <span>Take Photo</span>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="h-24 flex flex-col space-y-2"
                      onClick={handleGallerySelect}
                      data-testid="button-gallery"
                    >
                      <Upload className="h-6 w-6" />
                      <span>From Gallery</span>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="h-24 flex flex-col space-y-2"
                      disabled
                      data-testid="button-voice"
                    >
                      <Mic className="h-6 w-6" />
                      <span>Voice Note</span>
                    </Button>
                  </div>
                )}

                {camera.capturedImage && (
                  <div className="relative">
                    <img
                      src={camera.capturedImage}
                      alt="Captured issue"
                      className="w-full max-w-md h-64 object-cover rounded-lg"
                      data-testid="captured-image"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        camera.reset();
                        setImageFile(null);
                        setAiAnalysis(null);
                      }}
                      data-testid="button-remove-image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {camera.isOpen && (
                  <div className="space-y-4">
                    <video
                      ref={camera.videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md h-64 bg-black rounded-lg"
                      data-testid="camera-video"
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={camera.capturePhoto}
                        data-testid="button-capture"
                      >
                        Capture
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={camera.closeCamera}
                        data-testid="button-cancel-camera"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {uploadMutation.isPending && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing image with AI...</span>
                  </div>
                )}
              </div>

              {/* AI Analysis Results */}
              {aiAnalysis && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <span className="mr-2">🤖</span>
                      AI Analysis Results
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Detected Issue:</strong> {aiAnalysis.category}
                      </div>
                      <div>
                        <strong>Confidence:</strong> {Math.round(aiAnalysis.confidence * 100)}%
                      </div>
                      <div>
                        <strong>Priority:</strong> {aiAnalysis.priority}
                      </div>
                      <div>
                        <strong>Suggested Dept:</strong> {aiAnalysis.suggestedDepartment}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Location</Label>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={geolocation.getCurrentPosition}
                  disabled={geolocation.loading}
                  className="w-full md:w-auto"
                  data-testid="button-get-location"
                >
                  {geolocation.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      {geolocation.latitude ? "Location captured" : "Get current location"}
                    </>
                  )}
                </Button>

                {geolocation.error && (
                  <p className="text-sm text-destructive">{geolocation.error}</p>
                )}

                {geolocation.latitude && geolocation.longitude && (
                  <div className="text-sm text-muted-foreground">
                    📍 {geolocation.latitude.toFixed(6)}, {geolocation.longitude.toFixed(6)}
                    {geolocation.accuracy && ` (±${Math.round(geolocation.accuracy)}m)`}
                  </div>
                )}

                <div>
                  <Label htmlFor="address">Address (optional)</Label>
                  <Input
                    id="address"
                    placeholder="Enter street address or landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    data-testid="input-address"
                  />
                </div>
              </div>

              {/* Issue Details */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Issue Details</Label>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pothole">Pothole</SelectItem>
                      <SelectItem value="lighting">Street Lighting</SelectItem>
                      <SelectItem value="garbage">Garbage/Waste</SelectItem>
                      <SelectItem value="signage">Damaged Signage</SelectItem>
                      <SelectItem value="graffiti">Graffiti</SelectItem>
                      <SelectItem value="flooding">Flooding</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Additional Details (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about the issue..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="textarea-description"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitMutation.isPending || !formData.title || !formData.category}
                data-testid="button-submit-report"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting report...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
