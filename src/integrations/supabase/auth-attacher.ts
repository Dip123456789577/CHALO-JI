import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

// Must be registered as a global `functionMiddleware` in `src/start.ts`; otherwise
// the browser never attaches the bearer token to serverFn RPCs.
// Never breaks server functions: if Supabase is not configured or the session
// lookup fails, the request proceeds without an Authorization header.
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      return next({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      return next({ headers: {} });
    }
  },
);
