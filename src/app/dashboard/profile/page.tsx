"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getStudentProfile, updateStudentProfile, StudentProfile } from "../../../services/studentservices";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Cake,
  Camera,
  CheckCircle2,
  FileImage,
  Loader2,
  PencilLine,
  Save,
  User,
  Users,
  X,
} from "lucide-react";

const MAX_BIO_LENGTH = 500;

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bio, setBio] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bioFocused, setBioFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasChanges =
    !!selectedFile || bio !== (profile?.bio || "");

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getStudentProfile(token);
        setProfile(data);
        setBio(data.bio || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const setImageFromFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      if (file) setError("Please choose an image file.");
      return;
    }
    setError("");
    setSuccess("");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFromFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setImageFromFile(e.dataTransfer.files?.[0]);
  };

  const clearImageSelection = () => {
    setSelectedFile(null);
    setPreviewImage(null);
  };

  const handleDiscard = () => {
    clearImageSelection();
    setBio(profile?.bio || "");
  };

  const handleUpdateProfile = async () => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setUpdating(true);

      const formData = new FormData();
      if (selectedFile) {
        formData.append("profile_photo", selectedFile);
      }
      if (bio !== (profile?.bio || "")) {
        formData.append("bio", bio);
      }

      const data = await updateStudentProfile(token, formData);
      setProfile(data.student);
      clearImageSelection();
      setSuccess("Profile updated successfully!");

      // Dispatch event to update avatar in header
      if (data.student.profile_photo_url) {
        window.dispatchEvent(new CustomEvent("profile-photo-updated", {
          detail: data.student.profile_photo_url
        }));
      }

      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card className="overflow-hidden">
            <Skeleton className="h-32 w-full rounded-none" />
            <CardHeader className="-mt-10">
              <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
              <Skeleton className="h-6 w-48 mt-4" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const initials = `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`.toUpperCase();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12 space-y-8 pb-32">

        {/* Navigation & Header */}
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2 text-muted-foreground hover:text-foreground p-0 h-auto font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your personal information and profile picture.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto hover:opacity-70 transition-opacity"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        <Card className="border-border/60 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Gradient cover */}
          <div className="h-28 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <CardHeader className="-mt-14 space-y-4 px-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div
                className="relative shrink-0"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <Avatar className="h-28 w-28 border-4 border-background shadow-xl transition-transform duration-300 hover:scale-[1.03]">
                  <AvatarImage src={previewImage || profile?.profile_photo_url} />
                  <AvatarFallback className="bg-blue-400 text-white text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Drag overlay */}
                {isDragging && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 rounded-full bg-blue-500/80 backdrop-blur-sm text-white animate-in fade-in duration-200">
                    <FileImage className="h-7 w-7" />
                    <span className="text-[10px] font-semibold">Drop photo</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-blue-500 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-600 active:scale-95"
                  aria-label="Change profile photo"
                >
                  <Camera className="h-4 w-4" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5 pb-1 min-w-0">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span className="truncate">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  <BadgeCheck className="h-5 w-5 text-blue-500 shrink-0" />
                </CardTitle>
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              Click the camera badge or drag &amp; drop a photo onto your avatar
            </p>
          </CardHeader>

          <CardContent className="space-y-8 px-6 pb-8 pt-6">
            {/* Personal info tiles */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Personal Information
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/60">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      First Name
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {profile?.first_name || "—"}
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/60">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Last Name
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {profile?.last_name || "—"}
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/60">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Gender
                    </p>
                    <p className="truncate text-sm font-semibold capitalize">
                      {profile?.gender || "—"}
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/60">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <Cake className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {formatDate(profile?.date_of_birth)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bio */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <PencilLine className="h-3.5 w-3.5" />
                  About Me
                </h2>
                <span
                  className={`text-xs tabular-nums transition-colors ${
                    bio.length > MAX_BIO_LENGTH
                      ? "font-semibold text-rose-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {bio.length}/{MAX_BIO_LENGTH}
                </span>
              </div>
              <div
                className={`rounded-xl border bg-background transition-all duration-200 ${
                  bioFocused
                    ? "border-blue-400 ring-2 ring-blue-400/20"
                    : "border-input"
                }`}
              >
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH + 50))}
                  onFocus={() => setBioFocused(true)}
                  onBlur={() => setBioFocused(false)}
                  placeholder="Tell us about yourself, your interests, or anything you'd like others to know..."
                  rows={5}
                  className="w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
                />
              </div>
            </section>

            {/* Photo selection chip */}
            {selectedFile && (
              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-900/50 dark:bg-blue-950/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                  <FileImage className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-blue-900 dark:text-blue-200">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                    {(selectedFile.size / 1024).toFixed(1)} KB — new photo ready
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearImageSelection}
                  disabled={updating}
                  className="text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Status line */}
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-xs text-muted-foreground">
                {hasChanges
                  ? "You have unsaved changes"
                  : "All changes saved"}
              </p>
              {profile?.updated_at && (
                <p className="text-xs text-muted-foreground">
                  Last updated {formatDate(profile.updated_at)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating save bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/80 backdrop-blur-md transition-all duration-300 ${
          hasChanges
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <p className="hidden text-sm font-medium text-muted-foreground sm:block">
            You have unsaved changes
          </p>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={updating}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Discard
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={updating}
              className="bg-blue-400 hover:bg-blue-500 text-white font-medium gap-2"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
