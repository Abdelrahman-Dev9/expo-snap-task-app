export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type MessageResponse = {
  message: string;
  email?: string;
};

export type ResetTokenResponse = {
  message: string;
  resetToken: string;
};
