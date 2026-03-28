"use client";
import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { getUserInfo } from "@/lib/api/customAuth";

export default function AuthBootstrap() {
  const setUser = useUserStore((s) => s.setUser);
  
  useEffect(() => {
    // استنى شوية عشان الكوكي يتحفظ لو المستخدم لسه سجل دخول
    const timer = setTimeout(() => {
      console.log('[AuthBootstrap] Fetching user info...');
      getUserInfo()
        .then(data => {
          console.log('[AuthBootstrap] User info received:', data);
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        })
        .catch((err) => {
          console.log('[AuthBootstrap] Failed to get user info:', err.message);
          setUser(null);
        });
    }, 100); // استنى 100ms
    
    return () => clearTimeout(timer);
  }, [setUser]);
  
  return null;
}
