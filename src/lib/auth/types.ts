export interface SessionUser {
  name: string;
  email?: string;
  [key: string]: unknown;
}
