export type User = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  username: string;
  email: string;
  phone?: string | null;
  is_active?: boolean;
  is_admin?: boolean;
};



