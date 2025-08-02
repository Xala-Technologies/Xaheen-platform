import { auth } from "@/lib/auth";
import { toNextJsHandler } from "xaheen-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
