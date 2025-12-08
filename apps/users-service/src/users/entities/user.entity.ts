export class User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  is_email_verified: boolean;
  confirmation_token: string | null;
  createdAt: Date;
  updatedAt: Date;
}

