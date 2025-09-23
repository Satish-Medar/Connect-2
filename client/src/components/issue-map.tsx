import { useEffect, useRef } from "react";
import { IssueWithReporter } from "@shared/schema";

interface IssueMapProps {
  issues: IssueWithReporter[];
  center?: [number, number] | null;
  userLocation?: [number, number];
  className?: string;
  onIssueClick?: (issue: IssueWithReporter) => void;
}

export function IssueMap({ 
  issues, 
  center, 
  userLocation, 
  className = "h-96",
  onIssueClick 
}: IssueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Import CSS
      await import('leaflet/dist/leaflet.css');

      // Fix default markers issue
      const DefaultIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      if (!mapRef.current || mapInstanceRef.current) return;

      // Initialize map
      const defaultCenter: [number, number] = center || userLocation || [40.7128, -74.0060]; // NYC default
      const map = L.map(mapRef.current).setView(defaultCenter, 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add user location marker if available
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="
              width: 20px; 
              height: 20px; 
              background: #4F95FF; 
              border: 3px solid white; 
              border-radius: 50%; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker(userLocation, { icon: userIcon })
          .addTo(map)
          .bindPopup('Your Location');
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const L = require('leaflet');
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Create marker clusters
    const issueGroups = new Map<string, IssueWithReporter[]>();
    
    issues.forEach(issue => {
      // Group issues by approximate location (to 3 decimal places for clustering)
      const lat = parseFloat(issue.latitude);
      const lng = parseFloat(issue.longitude);
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      
      if (!issueGroups.has(key)) {
        issueGroups.set(key, []);
      }
      issueGroups.get(key)!.push(issue);
    });

    // Create markers for each group
    issueGroups.forEach((groupIssues, locationKey) => {
      const [lat, lng] = locationKey.split(',').map(Number);
      
      if (groupIssues.length === 1) {
        // Single issue marker
        const issue = groupIssues[0];
        const color = getStatusColor(issue.status);
        
        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: color,
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${issue.title}</h4>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
              By ${issue.reporter.username} • ${issue.category}
            </p>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">
              Status: ${issue.status.replace('_', ' ')} • Priority: ${issue.priority}
            </p>
            ${issue.address ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">📍 ${issue.address}</p>` : ''}
            <div style="display: flex; align-items: center; gap: 12px; font-size: 11px; color: #666;">
              <span>👍 ${issue.validationCount} verified</span>
              <span>💬 ${issue.commentCount} comments</span>
            </div>
          </div>
        `);

        marker.on('click', () => {
          onIssueClick?.(issue);
        });

        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      } else {
        // Cluster marker
        const urgentCount = groupIssues.filter(i => i.priority === 'urgent' || i.priority === 'high').length;
        const color = urgentCount > 0 ? '#EF4444' : '#4F95FF';
        
        const clusterIcon = L.divIcon({
          className: 'issue-cluster-marker',
          html: `
            <div style="
              width: 32px; 
              height: 32px; 
              background: ${color}; 
              color: white; 
              border: 3px solid white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 12px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">${groupIssues.length}</div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([lat, lng], { icon: clusterIcon });

        const popupContent = `
          <div style="min-width: 250px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${groupIssues.length} Issues in this area</h4>
            <div style="max-height: 200px; overflow-y: auto;">
              ${groupIssues.map(issue => `
                <div style="padding: 4px 0; border-bottom: 1px solid #eee; margin-bottom: 4px;">
                  <div style="font-weight: 500; font-size: 13px;">${issue.title}</div>
                  <div style="font-size: 11px; color: #666;">
                    ${issue.category} • ${issue.status.replace('_', ' ')} • ${issue.priority} priority
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers if we have issues
    if (issues.length > 0 && !center) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [issues, onIssueClick]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, 15);
    }
  }, [center]);

  function getStatusColor(status: string): string {
    switch (status) {
      case 'submitted': return '#EF4444'; // red
      case 'acknowledged': return '#F59E0B'; // yellow
      case 'in_progress': return '#F97316'; // orange
      case 'resolved': return '#10B981'; // green
      default: return '#6B7280'; // gray
    }
  }

  return (
    <div 
      ref={mapRef} 
      className={className}
      data-testid="issue-map"
      style={{ width: '100%', zIndex: 0 }}
    />
  );
}
