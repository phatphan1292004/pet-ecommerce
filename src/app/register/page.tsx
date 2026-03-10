"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerWithEmail } from "@/integrations/firebase";
import { syncUserToDatabase } from "@/integrations/userSync";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Register with Firebase
      const userCredential = await registerWithEmail(form.email, form.password);
      const firebaseUid = userCredential.user.uid;

      // Sync to MongoDB
      await syncUserToDatabase({
        firebaseUid,
        email: form.email,
        displayName: form.displayName,
        phone: form.phone,
      });

      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("Email này đã được sử dụng.");
      } else if (msg.includes("weak-password")) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white py-16 px-4">
      <h1 className="text-2xl font-bold tracking-widest mb-8">ĐĂNG KÝ</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">{error}</p>
        )}
        {/* Display Name */}
        <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
          <input
            type="text"
            name="displayName"
            placeholder="Họ và tên"
            value={form.displayName}
            onChange={handleChange}
            className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            required
          />
        </div>

        {/* Email */}
        <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            required
          />
        </div>

        {/* Phone */}
        <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
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
            className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={form.confirmPassword}
            onChange={handleChange}
            className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-4 rounded mt-2 transition-colors"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-500">
        Bạn đã có tài khoản?{" "}
        <Link href="/login" className="text-red-600 hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
