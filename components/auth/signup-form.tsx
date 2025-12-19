"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStackApp } from "@stackframe/stack";
import { AuthCard } from "@/components/auth/auth-card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onSubmit">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const app = useStackApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await app.signUpWithCredential({
        email,
        password,
      });

      if (result.status === "error") {
        setError(result.error.message);
      } else {
        // Update user display name after successful signup
        const user = await app.getUser();
        if (user) {
          await user.update({ displayName: name });
        }
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
      title="Create an account"
      description="Enter your details to create an account"
      submitText="Sign Up"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      {...props}
    >
      {error && (
        <div className="text-sm text-red-500 text-center">{error}</div>
      )}
      <Field>
        <FieldLabel htmlFor="name">Full Name</FieldLabel>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>
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
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </Field>
    </AuthCard>
  );
}
