"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  careerGoal: string;
  interests: string[];
  alResults: string[];
  createdAt: string;
  targetCourse: string | null;
}

interface AuthCtx {
  profile: Profile | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get<{ profile: Profile }>("/student/profile");
      setProfile(res.profile);
    } catch {
      setProfile(null);
      localStorage.removeItem("ln_token");
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("ln_token");
    if (t) fetchProfile().finally(() => setLoading(false));
    else setLoading(false);
  }, [fetchProfile]);

  const login = async (token: string) => {
    localStorage.setItem("ln_token", token);
    await fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem("ln_token");
    setProfile(null);
    router.push("/");
  };

  const refresh = fetchProfile;

  return (
    <Ctx.Provider value={{ profile, loading, login, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
