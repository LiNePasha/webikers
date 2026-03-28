"use client";

const WP_SOCIAL_LOGIN_URL = process.env.NEXT_PUBLIC_WP_SOCIAL_LOGIN_URL || "https://your-wp-site.com/wp-login.php";

export default function SocialLoginButtons() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto mt-6">
      {/* <a
        href={`${WP_SOCIAL_LOGIN_URL}?loginSocial=google`}
        className="btn btn-outline flex items-center gap-2 justify-center text-base"
      >
        <img src="/google.svg" alt="Google" className="w-5 h-5" />
        تسجيل الدخول بجوجل
      </a>
      <a
        href={`${WP_SOCIAL_LOGIN_URL}?loginSocial=facebook`}
        className="btn btn-outline flex items-center gap-2 justify-center text-base"
      >
        <img src="/facebook.svg" alt="Facebook" className="w-5 h-5" />
        تسجيل الدخول بفيسبوك
      </a> */}
    </div>
  );
}
