import { AuthCard } from "@/components/auth/auth-card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <AuthCard
      className={className}
      title="Create an account"
      description="Sign up with your Apple or Google account"
      oauthText="Sign up with Google"
      submitText="Sign Up"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
      {...props}
    >
      <Field>
        <FieldLabel htmlFor="name">Full Name</FieldLabel>
        <Input id="name" type="text" placeholder="John Doe" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" type="email" placeholder="m@example.com" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input id="password" type="password" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
        <Input id="confirm-password" type="password" required />
      </Field>
    </AuthCard>
  );
}
