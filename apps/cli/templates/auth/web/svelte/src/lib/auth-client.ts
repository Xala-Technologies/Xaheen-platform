import { PUBLIC_SERVER_URL } from "$env/static/public";
import { createAuthClient } from "xaheen-auth/svelte";

export const authClient = createAuthClient({
	baseURL: PUBLIC_SERVER_URL,
});
