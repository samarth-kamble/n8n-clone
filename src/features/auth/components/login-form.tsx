"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { VscGithub } from "react-icons/vsc";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
          toast.success("Logged in successfully!");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Card className="border border-border bg-card text-card-foreground shadow-lg max-w-md w-full transition-colors duration-300">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              disabled={isPending}
              className="h-11 border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-all dark:hover:bg-accent/80"
            >
              <VscGithub className="mr-2 h-5 w-5" />
              Github
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isPending}
              className="h-11 border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-all dark:hover:bg-accent/80"
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email & Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="h-11 border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-300"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline underline-offset-4"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-11 border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-300"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md transition-all dark:hover:bg-primary/80"
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6 px-8">
        Protected by enterprise-grade security
      </p>
    </div>
  );
}
