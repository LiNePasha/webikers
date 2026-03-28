"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || "https://api.spare2app.com/wp-json";

export default function SocialCallbackPage() {
  const setUser = useUserStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");
      try {
        // جلب بيانات المستخدم من ووردبريس (يجب أن يكون المستخدم مسجل دخول كوكيز)
        const res = await axios.get(`${API_URL}/wp/v2/users/me`, {
          withCredentials: true,
        });
        setUser({
          id: res.data.id,
          email: res.data.email,
          name: res.data.name,
          ...res.data,
        });
        // إعادة توجيه المستخدم للصفحة الرئيسية أو الحساب
        router.replace("/");
      } catch (err: any) {
        setError("لم يتم العثور على جلسة دخول صالحة. برجاء المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [setUser, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="mb-4 text-2xl font-bold">جاري تسجيل الدخول...</h1>
      {loading && <div className="text-gray-500">يرجى الانتظار</div>}
      {error && <div className="mt-4 text-center text-red-600">{error}</div>}
    </div>
  );
}
