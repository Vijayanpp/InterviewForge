"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initialsFromName(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AvatarUpload({
  fullName,
  avatarUrl,
  className,
}: {
  fullName: string | null | undefined;
  avatarUrl: string | null | undefined;
  className?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPEG, PNG, WebP, or GIF).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error?.message ?? "Could not upload profile image.");
      }
      setPreviewUrl(body.avatarUrl as string);
      toast.success("Profile photo updated.");
      router.refresh();
    } catch (error) {
      setPreviewUrl(avatarUrl ?? null);
      toast.error(error instanceof Error ? error.message : "Could not upload profile image.");
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setIsRemoving(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error?.message ?? "Could not remove profile image.");
      }
      setPreviewUrl(null);
      toast.success("Profile photo removed.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove profile image.");
    } finally {
      setIsRemoving(false);
    }
  }

  const busy = isUploading || isRemoving;

  return (
    <div className={cn("flex flex-col items-start gap-md sm:flex-row sm:items-center", className)}>
      <div className="relative">
        <Avatar size="lg" className="size-20 after:rounded-full">
          {previewUrl ? <AvatarImage src={previewUrl} alt={fullName ?? "Profile photo"} /> : null}
          <AvatarFallback className="text-lg font-semibold">
            {initialsFromName(fullName)}
          </AvatarFallback>
        </Avatar>
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="space-y-sm">
        <div>
          <p className="font-label-md text-label-md font-semibold text-foreground">Profile photo</p>
          <p className="text-body-sm text-muted-foreground">
            JPEG, PNG, WebP, or GIF up to 2MB.
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={busy}
            onChange={(e) => void handleFileChange(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" />
            {previewUrl ? "Change photo" : "Upload photo"}
          </Button>
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => void handleRemove()}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
