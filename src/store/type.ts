import { IUser } from "@/features/profile/types";

export type AuthResponse = {
    message: string;
    data: {
      token: string;
      user: Partial<IUser>;
      refreshToken?: string;
    };
    state: "success" | "error";
    statusCode?: number;
  };