"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation/auth";
import { requestPasswordResetAction } from "@/lib/auth/actions";

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setIsSubmitting(true);
    await requestPasswordResetAction(values);
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="space-y-md text-center">
        <h1 className="font-headline-lg text-headline-lg text-foreground">Check your inbox</h1>
        <p className="font-body-md text-body-md text-muted-foreground">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      <div className="space-y-sm text-center lg:text-left">
        <h1 className="font-headline-lg text-headline-lg text-foreground">Forgot your password?</h1>
        <p className="font-body-md text-body-md text-muted-foreground">
          Enter the email associated with your account and we&apos;ll send you a reset link.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-lg" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="name@company.com" autoComplete="email" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      </Form>

      <p className="text-center font-body-sm text-body-sm text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </p>
    </div>
  );
}
