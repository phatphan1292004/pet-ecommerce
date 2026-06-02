"use client";

import { useState } from "react";
import { sendPasswordReset } from "@/features/guest/login/servers/login";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await sendPasswordReset(email);
      if (result?.success) {
        setSuccess(true);
      } else {
        setError("Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    } catch {
      setError("Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white px-4 py-10 sm:py-16">
      <h1 className="mb-6 text-xl font-bold tracking-widest sm:mb-8 sm:text-2xl">
        KHÔI PHỤC MẬT KHẨU
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4"
      >
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-2">
            Gửi email thành công. Vui lòng kiểm tra hộp thư của bạn.
          </p>
        )}

        <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="flex-1 outline-none text-sm text-gray-700 py-1 placeholder-gray-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-4 rounded mt-2 transition-colors"
        >
          {loading ? "Đang gửi..." : success ? "Đã gửi" : "Gửi email khôi phục"}
        </button>
      </form>
    </div>
  );
}
