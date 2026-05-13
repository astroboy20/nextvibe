"use client";
import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Camera, Loader2, User, Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setHideHeader } from "@/app/provider/slices/ui-slice";
import { useDispatch } from "react-redux";

const profileSchema = z.object({
  display_name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(160, "Bio must be less than 160 characters")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      username: "",
      bio: "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  //   const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const file = e.target.files?.[0];
  //     if (!filer) return;

  //     // Validate file type
  //     if (!file.type.startsWith("image/")) {
  //       toast.warning("Please upload an image file");
  //       return;
  //     }

  //     // Validate file size (max 5MB)
  //     if (file.size > 5 * 1024 * 1024) {
  //       toast.warning("Please upload an image smaller than 5MB");
  //       return;
  //     }

  //     setIsUploading(true);
  //     try {
  //       const fileExt = file.name.split(".").pop();
  //       const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  //       const { data, error } = await supabase.storage
  //         .from("avatars")
  //         .upload(fileName, file, { upsert: true });

  //       if (error) throw error;

  //       const {
  //         data: { publicUrl },
  //       } = supabase.storage.from("avatars").getPublicUrl(fileName);

  //       setAvatarUrl(publicUrl);

  //       // Update profile with new avatar
  //       await updateProfile({ avatar_url: publicUrl });

  //       toast({
  //         title: "Avatar updated! 🎉",
  //         description: "Your profile picture has been changed",
  //       });
  //     } catch (error: any) {
  //       console.error("Avatar upload error:", error);
  //       toast({
  //         title: "Upload failed",
  //         description: error.message || "Could not upload avatar",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsUploading(false);
  //     }
  //   };

  //   const onSubmit = async (data: ProfileFormData) => {
  //     setIsSaving(true);
  //     try {
  //       await updateProfile({
  //         display_name: data.display_name,
  //         username: data.username || null,
  //         bio: data.bio || null,
  //       });

  //       toast({
  //         title: "Profile updated! ✨",
  //         description: "Your changes have been saved",
  //       });

  //       navigate("/profile");
  //     } catch (error: any) {
  //       toast({
  //         title: "Update failed",
  //         description: error.message || "Could not save changes",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsSaving(false);
  //     }
  //   };

  //   if (authLoading) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center bg-background">
  //         <Loader2 className="h-10 w-10 animate-spin text-primary" />
  //       </div>
  //     );
  //   }

  useEffect(() => {
    dispatch(setHideHeader(true));
    return () => {
      dispatch(setHideHeader(false));
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Edit Profile</h1>
        </div>
      </div>

      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {/* {profile?.display_name?.[0]?.toUpperCase() || } */}U
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              //   onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Tap to change photo
          </p>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                // onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Your name"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            @
                          </span>
                          <Input
                            placeholder="username"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      //   value={user?.email || ""}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell others about yourself..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/160
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
