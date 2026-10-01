"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
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
} from "@/components/ui/form";
import { signInSchema, type SignInInput } from "@/lib/validation/auth";
import { signInAction } from "@/lib/auth/actions";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth_callback_failed") {
      toast.error("Google sign-in failed. Check redirect URLs and try again.");
    }
  }, [searchParams]);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInInput) {
    setIsSubmitting(true);
    const result = await signInAction(values, searchParams.get("next") ?? undefined);
    setIsSubmitting(false);

    // On success, signInAction redirects server-side as part of the same
    // response that sets the session cookie, so there is nothing further
    // to do here.
    if (!result.success) {
      toast.error(result.error ?? "Could not sign in.");
    }
  }

  return (
    <div className="space-y-xl">
      <div className="space-y-sm text-center lg:text-left">
        <h1 className="font-headline-lg text-headline-lg text-foreground">Welcome back</h1>
        <p className="font-body-md text-body-md text-muted-foreground">
          Log in to continue your path to engineering excellence.
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forgot-password" className="text-label-sm font-label-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in to account
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
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Create one for free
        </Link>
      </p>
    </div>
  );
}
