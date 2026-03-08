"use client";

import { useState } from "react";
import Link from "next/link";
import { MdEmail, MdPhone, MdLock } from "react-icons/md";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle register logic
  };

  return (
    <div className="flex flex-col items-center bg-white py-16 px-4">
      <h1 className="text-2xl font-bold tracking-widest mb-8">ĐĂNG KÝ</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
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
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded mt-2 transition-colors"
        >
          Đăng ký
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
