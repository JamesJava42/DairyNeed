"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  displayName: string;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const IDLE_MINUTES = 30; // change if you want

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // inactivity logout
  const lastActiveRef = useRef<number>(Date.now());

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const markActive = () => {
      lastActiveRef.current = Date.now();
    };

    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));

    const interval = window.setInterval(async () => {
      // only enforce idle logout if logged in
      if (!user) return;

      const idleMs = Date.now() - lastActiveRef.current;
      if (idleMs > IDLE_MINUTES * 60_000) {
        await supabase.auth.signOut();
      }
    }, 15_000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive));
      window.clearInterval(interval);
    };
  }, [user]);

  const displayName = useMemo(() => {
    const u = user;
    if (!u) return "";
    const meta: any = u.user_metadata ?? {};
    return String(meta.username || u.email || "User");
  }, [user]);

  const value: AuthCtx = useMemo(
    () => ({
      user,
      session,
      loading,
      displayName,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [user, session, loading, displayName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
