import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const DEFAULT_ADMIN_EMAIL = import.meta.env.VITE_DEFAULT_ADMIN_EMAIL ?? "admin@wisdomarchive.com";
const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD ?? "Admin1234!";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id).eq("role", "admin").maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        supabase.from("user_roles").select("role").eq("user_id", u.id).eq("role", "admin").maybeSingle().then(({ data }) => {
          setIsAdmin(!!data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) {
      await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD && data.user) {
        await ensureAdminRole(data.user.id);
      }
      return { error };
    }

    if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const signupError = error.message || "Unable to sign in with the default admin account.";
      const signupsDisabled = signupError.toLowerCase().includes("signups not allowed") || signupError.toLowerCase().includes("signup is disabled");

      if (signupsDisabled) {
        return {
          error: {
            message:
              "Signups are disabled for this Supabase instance. Create the admin user manually in Supabase Auth or enable email signups, then try again.",
          },
        };
      }

      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError && signUpError.message !== "User already registered") {
        return { error: signUpError };
      }

      const relogin = await supabase.auth.signInWithPassword({ email, password });
      if (!relogin.error && relogin.data.user) {
        await ensureAdminRole(relogin.data.user.id);
      }
      return { error: relogin.error };
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isAdmin, loading, signIn, signOut };
};
