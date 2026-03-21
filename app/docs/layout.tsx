"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  BookOpen,
  Download,
  CircuitBoard,
  Code2,
  Radio,
  Webhook,
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Droplet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: React.ReactNode;
}

interface DocItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

const docItems: DocItem[] = [
  {
    title: "Getting Started",
    href: "/docs",
    icon: BookOpen,
    description: "Overview and introduction"
  },
  {
    title: "Installation",
    href: "/docs/installation",
    icon: Download,
    description: "Setup and dependencies"
  },
  {
    title: "Circuit Diagram",
    href: "/docs/circuit-diagram",
    icon: CircuitBoard,
    description: "Hardware connections & flowchart"
  },
  {
    title: "Code Generator",
    href: "/docs/code-generator",
    icon: Code2,
    description: "Arduino code for sensors"
  },
  {
    title: "TTN Setup",
    href: "/docs/ttn-setup",
    icon: Radio,
    description: "The Things Network configuration"
  },
  {
    title: "Webhook Configuration",
    href: "/docs/webhooks",
    icon: Webhook,
    description: "Webhook integration setup"
  }
];

export default function DocsLayout({ children }: DocsLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const currentIndex = docItems.findIndex(item => item.href === pathname);
  const nextPage = currentIndex < docItems.length - 1 ? docItems[currentIndex + 1] : null;
  const prevPage = currentIndex > 0 ? docItems[currentIndex - 1] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Droplet className="h-6 w-6 text-primary" />
            <span className="gradient-text">JalRakshak.AI</span>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-20 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="glass border-border hover:bg-accent"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar */}
        <aside className={cn(
          "fixed top-14 left-0 bottom-0 z-40 w-80 bg-card border-r border-border transition-transform lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Docs Header */}
            <div className="px-6 py-6 border-b border-border">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Documentation</h2>
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                Complete guide for JalRakshak.AI Water Quality Monitoring System
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <div className="space-y-2">
                {docItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group hover:bg-accent",
                        isActive 
                          ? "bg-primary/10 text-primary border border-primary/30" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Footer Link */}
            <div className="px-3 py-4 border-t border-border">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <Droplet className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-80 overflow-y-auto min-h-[calc(100vh-3.5rem)]">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
            {children}
            
            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-16 pt-8 border-t border-border">
              <div className="flex-1">
                {prevPage && (
                  <Link
                    href={prevPage.href}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <div>
                      <div className="text-xs text-muted-foreground">Previous</div>
                      <div className="text-sm font-medium">{prevPage.title}</div>
                    </div>
                  </Link>
                )}
              </div>
              
              <div className="flex-1 text-right">
                {nextPage && (
                  <Link
                    href={nextPage.href}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
                  >
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Next</div>
                      <div className="text-sm font-medium">{nextPage.title}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
