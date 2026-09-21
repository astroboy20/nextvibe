"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Mail,
  User,
} from "lucide-react";

import { setHideHeader } from "@/app/provider/slices/ui-slice";

import {
  useGetUserQuery,
  useUpdateUserMutation,
  useGetPresignedUrlMutation,
} from "@/app/provider/api/authApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Skeleton } from "@/components/ui/skeleton";

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
    ),

  bio: z
    .string()
    .max(160, "Bio must be less than 160 characters")
    .optional(),

  avatarUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const router = useRouter();
  const dispatch = useDispatch();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useGetUserQuery();

  const [updateUser, { isLoading: isSaving }] =
    useUpdateUserMutation();

  const [getPresignedUrl] =
    useGetPresignedUrlMutation();

  const [isUploading, setIsUploading] = useState(false);

  const user = data?.data;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      username: "",
      bio: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    dispatch(setHideHeader(true));

    return () => {
      dispatch(setHideHeader(false));
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      form.reset({
        display_name: user.displayName || "",
        username: user.username || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, form]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Get presigned URL
      const response = await getPresignedUrl({
        filename: file.name,
        mimeType: file.type,
        context: "avatars",
      }).unwrap();

   

      // Step 3: Save uploaded image URL
      form.setValue("avatarUrl", response?.data?.uploadUrl);

      toast.success("Avatar uploaded successfully");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.data?.message ||
          "Failed to upload avatar"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (
    values: ProfileFormData
  ) => {
    try {
      await updateUser({
        displayName: values.display_name,
        username: values.username,
        bio: values.bio || null,
        avatarUrl: values.avatarUrl || null,
      }).unwrap();

      toast.success("Profile updated successfully");

      // router.back();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to update profile"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b border-border bg-background">
          <div className="container flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>

        <main className="container max-w-lg mx-auto px-4 py-6">
          <div className="flex flex-col items-center mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-4 w-32 mt-4" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
              </div>

              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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

          <h1 className="text-xl font-bold">
            Edit Profile
          </h1>
        </div>
      </div>

      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={form.watch("avatarUrl") || ""}
              />

              <AvatarFallback className="text-2xl">
                {user?.displayName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
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
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Tap to change photo
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Profile Information
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Display Name
                      </FormLabel>

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
                      value={user?.email || ""}
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
                          rows={4}
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSaving}
                >
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