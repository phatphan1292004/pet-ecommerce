"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { loginWithGoogle, loginWithFacebook } from "@/integrations/firebase";
import { signIn } from "../servers/login";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn(form.email, form.password);
      if (result) {
        router.push("/");
      } else {
        setError("Email hoặc mật khẩu không đúng.");
      }
    } catch {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      router.push("/");
    } catch {
      setError("Đăng nhập Google thất bại.");
    }
  };

  const handleFacebook = async () => {
    setError("");
    try {
      await loginWithFacebook();
      router.push("/");
    } catch {
      setError("Đăng nhập Facebook thất bại.");
    }
  };

  return (
    <div className="flex flex-col items-center bg-white py-16 px-4">
      <h1 className="text-2xl font-bold tracking-widest mb-8">ĐĂNG NHẬP</h1>

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

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-4 rounded mt-2 transition-colors"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {/* Social Login */}
      <p className="mt-10 text-sm text-gray-500">Đăng nhập với</p>
      <div className="flex gap-4 mt-3 w-full max-w-md">
        <button onClick={handleFacebook} type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded py-4 text-sm font-medium hover:bg-gray-50 transition-colors">
          <FaFacebook className="text-blue-600 text-xl" />
          Facebook
        </button>
        <button onClick={handleGoogle} type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded py-4 text-sm font-medium hover:bg-gray-50 transition-colors">
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
