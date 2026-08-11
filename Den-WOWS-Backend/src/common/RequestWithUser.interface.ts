export interface UserPayload {
  userId: string;
  username: string;
  sub: string;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}