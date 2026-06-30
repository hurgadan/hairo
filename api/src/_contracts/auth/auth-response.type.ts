import { User } from "../users/user.type";

export interface AuthResponse {
  accessToken: string;
  user: User;
}
