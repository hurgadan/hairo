export interface JwtPayload {
  sub: string; // user id
}

export interface AuthenticatedUser {
  userId: string;
}
