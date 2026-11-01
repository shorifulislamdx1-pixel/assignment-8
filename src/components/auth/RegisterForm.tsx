"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearApiToken } from "@/lib/api";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/books";
  return value;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.94A6 6 0 0 1 6.1 12c0-.67.11-1.33.31-1.94V7.44H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.56l3.34-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.06c1.47 0 2.78.5 3.82 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.93 5.44l3.34 2.62C7.2 7.82 9.4 6.06 12 6.06Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
      />
    </svg>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const { data: session, isPending } = useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");

  const passwordChecks = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { label: "One lowercase letter", met: /[a-z]/.test(password) },
    ],
    [password]
  );

  useEffect(() => {
    if (!isPending && session) {
      router.replace(redirectTo);
    }
  }, [isPending, session, router, redirectTo]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!passwordChecks.every((check) => check.met)) {
      setError("Please complete all of the password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Those passwords do not match yet.");
      return;
    }

    if (image.trim() && !/^https?:\/\//i.test(image.trim())) {
      setError("The photo URL should begin with http:// or https://.");
      return;
    }

    setLoading(true);
    clearApiToken();

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const result = await signUp.email({
        name: fullName,
        email: email.trim(),
        password,
        ...(image.trim() ? { image: image.trim() } : {}),
      });

      if (result.error) {
        throw new Error(
          result.error.message || "Could not create your account."
        );
      }

      toast.success("Welcome to BookNook.");
      router.replace(redirectTo);
      router.refresh();
    } catch (registerError) {
      const message =
        registerError instanceof Error
          ? registerError.message
          : "Could not create your account. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setError("");
    setSocialLoading(provider);
    clearApiToken();
    try {
      const result = await signIn.social({
        provider,
        callbackURL: redirectTo,
      });
      if (result?.error) {
        throw new Error(result.error.message || `${provider} sign-in failed.`);
      }
    } catch (socialError) {
      toast.error(
        socialError instanceof Error
          ? socialError.message
          : `${provider} sign-in failed.`
      );
      setSocialLoading(null);
    }
  };

  return (
    <AuthShell>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
          Join BookNook
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em] text-ink">
          Pull up a chair.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Create an account to borrow books, share your shelf, and keep every
          reading date in one place.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-xs leading-5 text-danger"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-7 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="register-first-name">First name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  id="register-first-name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="First name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-last-name">Last name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  id="register-last-name"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Last name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-image">
                Photo URL <span className="font-normal text-muted">(optional)</span>
              </Label>
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  id="register-image"
                  type="url"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="https://..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Make it memorable"
                className="pl-10 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
              {passwordChecks.map((check) => (
                <span
                  key={check.label}
                  className={cn(
                    "flex items-center gap-1 text-[10px] font-medium transition-colors",
                    check.met ? "text-brand" : "text-muted"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-3.5 place-items-center rounded-full border",
                      check.met
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-line"
                    )}
                  >
                    {check.met && <Check className="size-2.5" strokeWidth={3} />}
                  </span>
                  {check.label}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="One more time"
                className={cn(
                  "pl-10",
                  confirmPassword &&
                    confirmPassword !== password &&
                    "border-danger focus-visible:border-danger"
                )}
                required
              />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-[10px] font-medium text-danger">
                The passwords do not match yet.
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || isPending || socialLoading !== null}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Creating your account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <span className="relative bg-surface px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            or continue with
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleSocialLogin("google")}
            disabled={socialLoading !== null || loading}
          >
            {socialLoading === "google" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleSocialLogin("github")}
            disabled={socialLoading !== null || loading}
          >
            {socialLoading === "github" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <GitHubIcon />
            )}
            GitHub
          </Button>
        </div>

        <p className="mt-6 text-center text-[10px] leading-5 text-muted">
          By creating an account you agree to borrow kindly, return on time,
          and keep the shelf a welcoming place.
        </p>
        <p className="mt-5 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link
            href={`/login${redirectTo !== "/books" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="font-semibold text-brand hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}