"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { registerWithEmail } from "@/integrations/firebase";
import { syncUserToDatabase } from "@/integrations/userSync";
import { useToast } from "@/hooks";

type RegisterFormValues = {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    defaultValues: {
      displayName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError("");
    try {
      // Register with Firebase
      const userCredential = await registerWithEmail(values.email, values.password);
      const firebaseUid = userCredential.user.uid;

      // Sync to MongoDB
      await syncUserToDatabase({
        firebaseUid,
        email: values.email,
        displayName: values.displayName,
        phone: values.phone,
      });

      showSuccess("Đăng ký thành công. Vui lòng đăng nhập.");
      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("Email này đã được sử dụng.");
        showError("Email này đã được sử dụng.");
      } else if (msg.includes("weak-password")) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        showError("Mật khẩu phải có ít nhất 6 ký tự.");
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại.");
        showError("Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white px-4 py-10 sm:py-16">
      <h1 className="mb-6 text-xl font-bold tracking-widest sm:mb-8 sm:text-2xl">ĐĂNG KÝ</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md flex flex-col gap-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">{error}</p>
        )}
        
        {/* Display Name */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
            <input
              type="text"
              placeholder="Họ và tên"
              {...register("displayName", { required: "Vui lòng nhập họ và tên" })}
              className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          {errors.displayName && (
            <span className="text-xs text-red-600 px-1">{errors.displayName.message}</span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email không đúng định dạng",
                },
              })}
              className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          {errors.email && (
            <span className="text-xs text-red-600 px-1">{errors.email.message}</span>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
            <input
              type="tel"
              placeholder="Số điện thoại"
              {...register("phone", {
                required: "Vui lòng nhập số điện thoại",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Số điện thoại phải gồm 10 chữ số",
                },
              })}
              className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          {errors.phone && (
            <span className="text-xs text-red-600 px-1">{errors.phone.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
            <input
              type="password"
              placeholder="Mật khẩu"
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
              className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          {errors.password && (
            <span className="text-xs text-red-600 px-1">{errors.password.message}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center border border-gray-300 rounded px-4 py-3 gap-3">
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu",
                validate: (value) => value === watch("password") || "Mật khẩu xác nhận không khớp",
              })}
              className="flex-1 outline-none py-1 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-600 px-1">{errors.confirmPassword.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-4 rounded mt-2 transition-colors"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Bạn đã có tài khoản?{" "}
        <Link href="/login" className="text-red-600 hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
