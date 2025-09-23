import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Map, List, User } from "lucide-react";
import { Link } from "wouter";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home", testId: "nav-home" },
    { href: "/map", icon: Map, label: "Map", testId: "nav-map" },
    { href: "/my-reports", icon: List, label: "My Reports", testId: "nav-reports" },
    { href: "/profile", icon: User, label: "Profile", testId: "nav-profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`h-full rounded-none flex flex-col items-center justify-center space-y-1 ${
                  isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
                data-testid={item.testId}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
