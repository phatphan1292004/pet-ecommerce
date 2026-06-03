"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { loginWithGoogle, loginWithFacebook } from "@/integrations/firebase";
import { signIn } from "../servers/login";
import { useToast } from "@/hooks";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaKey, setRecaptchaKey] = useState(0);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

  const { showSuccess, showError } = useToast();

  const resetRecaptcha = () => {
    setRecaptchaToken("");
    setRecaptchaKey((currentKey) => currentKey + 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!siteKey) {
        setError("Chưa cấu hình reCAPTCHA site key.");
        return;
      }

      if (!recaptchaToken) {
        setError("Vui lòng xác minh reCAPTCHA.");
        return;
      }

      const result = await signIn(form.email, form.password, recaptchaToken);
      if (result) {
        if (!result.success) {
          setError(result.message);
          showError(result.message || "Đăng nhập thất bại.");
          resetRecaptcha();
        } else {
          showSuccess("Đăng nhập thành công");
          router.push(result.redirectTo);
        }
      } else {
        const msg = "Email hoặc mật khẩu không đúng.";
        setError(msg);
        showError(msg);
        resetRecaptcha();
      }
    } catch {
      const msg = "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(msg);
      showError(msg);
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      showSuccess("Đăng nhập bằng Google thành công");
      router.push("/");
    } catch {
      const msg = "Đăng nhập Google thất bại.";
      setError(msg);
      showError(msg);
    }
  };

  const handleFacebook = async () => {
    setError("");
    try {
      await loginWithFacebook();
      showSuccess("Đăng nhập bằng Facebook thành công");
      router.push("/");
    } catch {
      const msg = "Đăng nhập Facebook thất bại.";
      setError(msg);
      showError(msg);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white px-4 py-10 sm:py-16">
      <h1 className="mb-6 text-xl font-bold tracking-widest sm:mb-8 sm:text-2xl">ĐĂNG NHẬP</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">{error}</p>
        )}
        {/* Email */}
        <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="flex-1 outline-none text-sm text-gray-700 py-1 placeholder-gray-400"
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            className="flex-1 outline-none text-sm text-gray-700 py-1 placeholder-gray-400"
            required
          />
        </div>

        <div className="rounded border border-gray-200 bg-gray-50 p-3">
          {siteKey ? (
            <ReCAPTCHA
              key={recaptchaKey}
              sitekey={siteKey}
              onChange={(token) => {
                setRecaptchaToken(token ?? "");
                setError("");
              }}
              onExpired={() => {
                setRecaptchaToken("");
                setError("reCAPTCHA đã hết hạn. Vui lòng xác minh lại.");
              }}
              onErrored={() => {
                setRecaptchaToken("");
                setError("reCAPTCHA gặp lỗi. Vui lòng thử lại.");
              }}
            />
          ) : (
            <p className="text-sm text-amber-700">
              Chưa cấu hình <span className="font-medium">NEXT_PUBLIC_RECAPTCHA_SITE_KEY</span>.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !siteKey || !recaptchaToken}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-4 rounded mt-2 transition-colors"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {/* Social Login */}
      <p className="mt-8 text-sm text-gray-500 sm:mt-10">Đăng nhập với</p>
      <div className="mt-3 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:gap-4">
        <button onClick={handleFacebook} type="button" className="flex flex-1 items-center justify-center gap-2 rounded border border-gray-300 py-3 text-sm font-medium transition-colors hover:bg-gray-50 sm:py-4">
          <FaFacebook className="text-blue-600 text-xl" />
          Facebook
        </button>
        <button onClick={handleGoogle} type="button" className="flex flex-1 items-center justify-center gap-2 rounded border border-gray-300 py-3 text-sm font-medium transition-colors hover:bg-gray-50 sm:py-4">
          <FaGoogle className="text-red-500 text-xl" />
          Google
        </button>
      </div>

      {/* Links */}
      <div className="mt-5 flex gap-4 text-sm">
        <Link href="/register" className="text-red-600 hover:underline">
          Đăng ký
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/forgot-password" className="text-red-600 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
    </div>
  );
}
