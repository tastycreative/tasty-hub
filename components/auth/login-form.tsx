"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStackApp } from "@stackframe/stack";
import { AuthCard } from "@/components/auth/auth-card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onSubmit">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const app = useStackApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await app.signInWithCredential({
        email,
        password,
      });

      if (result.status === "error") {
        setError(result.error.message);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      className={className}
      title="Welcome back"
      description="Enter your email and password to login"
      submitText="Login"
      footerText=""
      footerLinkText=""
      footerLinkHref=""
      onSubmit={handleSubmit}
      isLoading={isLoading}
      {...props}
    >
      {error && (
        <div className="text-sm text-red-500 text-center">{error}</div>
      )}
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      <Field>
        <div className="flex items-center">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <a
            href="/forgot-password"
            className="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Field>
    </AuthCard>
  );
}
