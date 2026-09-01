export type Account = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  account: Account;
  expiresAt: string;
};
