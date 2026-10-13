"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getStudentProfile, updateStudentProfile, StudentProfile } from "../../../services/studentservices";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Camera, Loader2, Save, Upload } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [bio, setBio] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getStudentProfile(token);
        console.log("Profile data loaded:", data);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      setUpdating(true);

      const formData = new FormData();
      if (selectedFile) {
        formData.append("profile_photo", selectedFile);
      }
      if (bio !== profile?.bio) {
        formData.append("bio", bio);
      }

      if (!selectedFile && bio === profile?.bio) {
        setError("No changes to save");
        setUpdating(false);
        return;
      }

      const data = await updateStudentProfile(token, formData);
      setProfile(data.student);
      setPreviewImage(null);
      setSelectedFile(null);

      // Dispatch event to update avatar in header
      if (data.student.profile_photo_url) {
        window.dispatchEvent(new CustomEvent("profile-photo-updated", {
          detail: data.student.profile_photo_url
        }));
      }
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
          <Card>
            <CardHeader>
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-32 mt-4" />
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12 space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-3">
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

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
            {error}
          </div>
        )}

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={previewImage || profile?.profile_photo_url} />
                  <AvatarFallback className="bg-blue-400 text-white text-2xl font-bold">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="profile-photo" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer hover:bg-black/60 transition-colors">
                  <Camera className="h-6 w-6 text-white" />
                </label>
                <input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {profile?.first_name} {profile?.last_name}
                </CardTitle>
                <CardDescription className="text-sm">
                  Student ID: {profile?.user_id}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5" />
              <span>Click on the avatar to upload a new profile photo</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  First Name
                </label>
                <Input value={profile?.first_name || ""} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Name
                </label>
                <Input value={profile?.last_name || ""} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gender
                </label>
                <Input value={profile?.gender || ""} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date of Birth
                </label>
                <Input value={profile?.date_of_birth || ""} disabled className="bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={handleUpdateProfile}
                disabled={updating || (!selectedFile && bio === profile?.bio)}
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

              {selectedFile && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewImage(null);
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
