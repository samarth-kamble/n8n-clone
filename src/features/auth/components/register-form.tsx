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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
          toast.success("Account created successfully!");
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
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground text-base">
            Sign up to get started with Nodebase
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Buttons */}
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

          {/* Registration Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="h-11 border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-300"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormLabel className="text-sm font-medium text-foreground">
                      Password
                    </FormLabel>
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

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Confirm Password
                    </FormLabel>
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
                {isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          {/* Footer Links */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Info */}
      <p className="text-center text-xs text-muted-foreground mt-6 px-8">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="underline hover:text-primary transition-colors"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline hover:text-primary transition-colors"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
