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
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login?redirect=/profile");
      return;
    }

    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session, isPending, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      // BetterAuth ইউজার প্রোফাইল আপডেট ফাংশন
      const result = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || undefined,
      });

      if (result?.error) {
        throw new Error(result.error.message || "Failed to update profile.");
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

  if (isPending) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!session?.user) return null;

  // জয়েনিং ডেট ফরম্যাট করা
  const createdAt = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "October 28, 2026";

  return (
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-12">
      {/* সেন্ট্রাল প্রোফাইল কার্ড */}
      <div className="w-full max-w-md rounded-2xl border border-line/60 bg-surface/40 p-8 text-center shadow-2xl backdrop-blur-md">
        
        {/* প্রোফাইল ইমেজ / অ্যাভাটার */}
        <div className="mx-auto mb-5 relative size-24 overflow-hidden rounded-full border-2 border-line/80 bg-surface-muted shadow-md">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User Avatar"}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <User className="size-12" />
            </div>
          )}
        </div>

        {!isEditing ? (
          /* ভিউ মোড (স্ক্রিনশটের মতো হুবহু) */
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {session.user.name}
            </h1>
            <p className="mt-1.5 text-xs text-muted flex items-center justify-center gap-1.5">
              <Mail className="size-3.5" />
              {session.user.email}
            </p>

            <p className="mt-3 text-[11px] text-muted/80 flex items-center justify-center gap-1.5">
              <Calendar className="size-3.5" />
              Member since {createdAt}
            </p>

            {/* প্রোফাইল এডিট টগল বাটন */}
            <div className="mt-6 border-t border-line/40 pt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2 border-line text-xs font-medium text-ink hover:bg-surface-muted"
              >
                <Edit3 className="size-3.5" />
                Edit Profile
              </Button>
            </div>
          </div>
        ) : (
          /* এডিট মোড ফর্ম */
          <form onSubmit={handleUpdate} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs text-muted">
                Full Name
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-9 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-image" className="text-xs text-muted">
                Avatar Image URL
              </Label>
              <Input
                id="profile-image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="h-9 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setName(session.user.name || "");
                  setImage(session.user.image || "");
                  setIsEditing(false);
                }}
                disabled={saving}
                className="h-8 px-3 text-xs"
              >
                <X className="size-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-8 px-4 text-xs font-medium"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="size-3.5 mr-1" />
                )}
                Save
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}