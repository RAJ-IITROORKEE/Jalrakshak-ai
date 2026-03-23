"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const demoEmail = "admin@jalrakshak.ai";
  const demoPassword = "admin123";

  const fillDemoCredentials = async () => {
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      await navigator.clipboard.writeText(
        `Email: ${demoEmail}\nPassword: ${demoPassword}`
      );
      toast.success("Demo credentials copied to clipboard");
    } catch {
      toast.success("Demo credentials filled");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || data.status !== "ok") {
        toast.error(data.message || "Invalid credentials");
        return;
      }

      toast.success("Welcome back, admin");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-border/70">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Use your admin credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs">
              <p className="font-semibold text-primary">Hackathon Demo Credentials</p>
              <p className="mt-1 text-muted-foreground">Email: <span className="font-mono text-foreground">{demoEmail}</span></p>
              <p className="text-muted-foreground">Password: <span className="font-mono text-foreground">{demoPassword}</span></p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 h-7 text-xs"
                onClick={fillDemoCredentials}
              >
                Copy + Fill credentials
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
