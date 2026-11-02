
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  Edit3,
  Loader2,
  Mail,
  User,
  X,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";

interface ProfileFormProps {
  user: {
    name?: string | null;
    image?: string | null;
    email: string;
    createdAt: string;
  };
}

function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const result = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || undefined,
      });

      if (result?.error) {
        throw new Error(
          result.error.message || "Failed to update profile."
        );
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || "");
    setImage(user.image || "");
    setIsEditing(false);
  };

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-surface shadow-xl shadow-black/5">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-brand/5 blur-3xl" />

      <div className="relative p-6 sm:p-9">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
            <Sparkles className="size-3.5" />
            YOUR PROFILE
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-muted">
            Manage your personal information and account details.
          </p>
        </div>

        {/* Profile Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <div className="relative size-28 overflow-hidden rounded-full border-4 border-brand/20 bg-surface-muted shadow-lg sm:size-32">
              {image ? (
                <Image
                  src={image}
                  alt={name || "User Avatar"}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="size-14 text-muted" />
                </div>
              )}
            </div>

            <div className="absolute bottom-1 right-0 flex size-9 items-center justify-center rounded-full border-4 border-surface bg-brand text-white shadow-md">
              <ShieldCheck className="size-4" />
            </div>
          </div>

          <span className="mt-3 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            Library Member
          </span>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="text-center">
            <h2 className="break-words font-display text-2xl font-bold text-ink sm:text-3xl">
              {user.name || "Unnamed User"}
            </h2>

            <div className="mt-3 flex items-center justify-center gap-2 break-all text-sm text-muted">
              <Mail className="size-4 shrink-0 text-brand" />
              {user.email}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
              <Calendar className="size-4 text-brand" />
              Member since {user.createdAt}
            </div>

            <div className="my-7 border-t border-line" />

            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="h-11 w-full gap-2 rounded-xl border-brand/30 font-semibold text-ink transition-all hover:border-brand hover:bg-brand/10 hover:text-brand"
            >
              <Edit3 className="size-4" />
              Edit Profile
            </Button>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="profile-name"
                className="text-sm font-semibold text-ink"
              >
                Full Name
              </Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11 rounded-xl border-line bg-background pl-10 text-sm focus-visible:ring-brand"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="profile-image"
                className="text-sm font-semibold text-ink"
              >
                Avatar Image URL
              </Label>

              <Input
                id="profile-image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-11 rounded-xl border-line bg-background text-sm focus-visible:ring-brand"
              />

              <p className="text-xs text-muted">
                Provide a valid image URL for your profile picture.
              </p>
            </div>

            {/* Image Preview */}
            {image.trim() && (
              <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-muted/50 p-3">
                <div className="relative size-12 overflow-hidden rounded-full border border-line bg-surface">
                  <Image
                    src={image.trim()}
                    alt="Avatar preview"
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    Image Preview
                  </p>
                  <p className="text-xs text-muted">
                    Your new profile picture
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="h-11 flex-1 gap-2 rounded-xl border-line"
              >
                <X className="size-4" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="h-11 flex-1 gap-2 rounded-xl font-semibold shadow-md shadow-brand/10"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login?redirect=/profile");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <main className="flex min-h-[calc(100vh-180px)] w-full items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-line bg-surface shadow-sm">
            <Loader2 className="size-7 animate-spin text-brand" />
          </div>

          <div className="text-center">
            <p className="font-semibold text-ink">
              Loading your profile
            </p>
            <p className="mt-1 text-sm text-muted">
              Please wait a moment...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) return null;

  const createdAt = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "October 28, 2026";

  return (
    <main className="relative flex min-h-[calc(100vh-180px)] w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:py-14">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute left-0 top-20 size-64 rounded-full bg-brand/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 size-72 rounded-full bg-brand/5 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 size-40 rounded-full bg-brand/5 blur-3xl" />

      {/* Perfect Centered Profile Card */}
      <div className="relative mx-auto flex w-full items-center justify-center">
        <ProfileForm
          user={{
            name: session.user.name,
            image: session.user.image,
            email: session.user.email,
            createdAt,
          }}
        />
      </div>
    </main>
  );
}
