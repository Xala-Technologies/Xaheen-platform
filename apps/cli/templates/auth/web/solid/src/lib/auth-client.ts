import { createAuthClient } from "xaheen-auth/solid";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
});
