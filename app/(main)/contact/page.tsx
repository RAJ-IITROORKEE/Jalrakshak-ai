"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquareText, Send } from "lucide-react";
import { contactInquirySchema } from "@/lib/contact-schema";

type FormState = {
  fullName: string;
  email: string;
  message: string;
};

const defaultValues: FormState = {
  fullName: "",
  email: "",
  message: "",
};

export default function ContactPage() {
  const [values, setValues] = useState<FormState>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (field: keyof FormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = contactInquirySchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
        message: fieldErrors.message?.[0] ?? "",
      });
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "ok") {
        if (data?.errors) {
          setErrors({
            fullName: data.errors.fullName?.[0] ?? "",
            email: data.errors.email?.[0] ?? "",
            message: data.errors.message?.[0] ?? "",
          });
        }

        toast.error(data?.message ?? "Could not submit your message");
        return;
      }

      setValues(defaultValues);
      setErrors({});
      toast.success("Message submitted successfully. We will get back to you soon.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-muted/40 p-6 shadow-sm sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative">
          <Badge className="mb-3 border border-primary/30 bg-primary/10 text-primary">
            <MessageSquareText className="mr-1.5 h-3.5 w-3.5" />
            Contact Team
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Share your query, feedback, or collaboration request
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tell us what you need, what you found, or what should be improved in JalRakshak AI. We review every message.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill in all fields and submit. We will respond through email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={values.fullName}
                  onChange={(e) => onChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName ? (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">{errors.email}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message / Query / Feedback</Label>
                <Textarea
                  id="message"
                  rows={7}
                  value={values.message}
                  onChange={(e) => onChange("message", e.target.value)}
                  placeholder="Describe your query, feedback, or collaboration details..."
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message ? (
                  <p className="text-xs text-destructive">{errors.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full gap-2 sm:w-auto">
                {isSubmitting ? "Submitting..." : "Submit Message"}
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="font-medium text-foreground">1. We receive your inquiry instantly</p>
              <p className="mt-1">Your message appears in the admin contact dashboard for quick triage.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="font-medium text-foreground">2. Team reviews and resolves</p>
              <p className="mt-1">Requests are tracked as Pending or Resolved so nothing is missed.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="font-medium text-foreground">3. Follow-up via email</p>
              <p className="mt-1">For direct outreach, include details so we can respond with context.</p>
            </div>

            <a
              href="mailto:raj_r@mt.iitr.ac.in"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              Or email us directly
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
