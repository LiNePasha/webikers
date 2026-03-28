"use client";

import { useState, useEffect } from "react";
import { Facebook, Instagram, Music2, X } from "lucide-react";

export default function SocialDropdown() {
  const [open, setOpen] = useState(false);

  // 👇 قفل عند الضغط برا
  useEffect(() => {
    const handleClick = () => setOpen(false);
    if (open) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      
      {/* 🔘 Button */}
      <button
        onClick={() => setOpen(!open)}
        className="border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-black px-5 py-2.5 rounded-lg text-sm sm:text-base transition"
      >
        تابعنا دلوقتي
      </button>

      {/* 💻 Desktop Dropdown */}
      <div
        className={`hidden sm:block absolute left-0 mt-3 w-52 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-2 space-y-2 transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-2 invisible"
        }`}
      >
        <SocialLinks />
      </div>

      {/* 📱 Mobile Bottom Sheet */}
      <div
        className={`fixed inset-0 z-50 sm:hidden transition ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/60 transition ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-2xl p-5 space-y-4 transform transition duration-300 ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Close */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">تابعنا</h3>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <SocialLinks mobile />
        </div>
      </div>
    </div>
  );
}

function SocialLinks({ mobile }: { mobile?: boolean }) {
  const base =
    "flex items-center gap-3 p-3 rounded-xl transition text-white font-medium";

  return (
    <>
      <a
      target="_blank"
        href="https://www.facebook.com/webikersegypt"
        className={`${base} hover:bg-brand-500 hover:text-black ${
          mobile ? "bg-white/5" : ""
        }`}
      >
        <Facebook size={18} />
        Facebook
      </a>

      <a
      target="_blank"
        href="https://www.tiktok.com/@webikers55"
        className={`${base} hover:bg-brand-500 hover:text-black ${
          mobile ? "bg-white/5" : ""
        }`}
      >
        <Music2 size={18} />
        TikTok
      </a>

      <a
      target="_blank"
        href="https://www.instagram.com/webikers2021/"
        className={`${base} hover:bg-brand-500 hover:text-black ${
          mobile ? "bg-white/5" : ""
        }`}
      >
        <Instagram size={18} />
        Instagram
      </a>
    </>
  );
}