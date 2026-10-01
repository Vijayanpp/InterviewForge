"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";
import { signUpAction } from "@/lib/auth/actions";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: SignUpInput) {
    setIsSubmitting(true);
    const result = await signUpAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not create your account.");
      return;
    }

    if (result.needsEmailConfirmation) {
      setConfirmationSent(true);
      return;
    }

    // On success, signUpAction redirects server-side to /onboarding as
    // part of the same response that sets the session cookie, so there is
    // nothing further to do here.
  }

  if (confirmationSent) {
    return (
      <div className="space-y-md text-center">
        <h1 className="font-headline-lg text-headline-lg text-foreground">Check your inbox</h1>
        <p className="font-body-md text-body-md text-muted-foreground">
          We&apos;ve sent a confirmation link to your email address. Click it to activate your
          account and start your first interview.
        </p>
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      <div className="space-y-sm text-center lg:text-left">
        <h1 className="font-headline-lg text-headline-lg text-foreground">Create your account</h1>
        <p className="font-body-md text-body-md text-muted-foreground">
          Start practising realistic, AI-evaluated interviews in minutes.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-lg" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="Jane Doe" autoComplete="name" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>At least 8 characters, one uppercase letter and one number.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </Button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-border" />
            <span className="mx-4 text-xs uppercase tracking-widest text-muted-foreground">
              Or continue with
            </span>
            <div className="flex-grow border-t border-border" />
          </div>

          <GoogleAuthButton />
        </form>
      </Form>

      <p className="text-center font-body-sm text-body-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
