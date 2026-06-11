"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { changeUserPassword } from "@/integrations/firebase";
import { useToast } from "@/hooks";

type ChangePasswordFormValues = {
  current: string;
  next: string;
  confirm: string;
};

function PasswordField({
  label,
  show,
  onToggle,
  registration,
  error,
}: {
  label: string;
  show: boolean;
  onToggle: () => void;
  registration: any;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-base text-neutral-3">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          {...registration}
          className="w-full bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-1 outline-none focus:ring-2 focus:ring-primary-4 pr-11"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-5 hover:text-neutral-3 transition-colors"
        >
          {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      </div>
      {error && <span className="text-xs text-red-600 px-1">{error}</span>}
    </div>
  );
}

export default function ChangePasswordTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      current: "",
      next: "",
      confirm: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setLoading(true);

    try {
      await changeUserPassword(values.current.trim(), values.next.trim());
      showSuccess("Đổi mật khẩu thành công!");
      reset();
    } catch (error: any) {
      console.error("Lỗi đổi mật khẩu:", error);
      const errorCode = error?.code || "";

      if (errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
        showError("Mật khẩu hiện tại không chính xác.");
      } else if (errorCode === "auth/weak-password") {
        showError("Mật khẩu mới quá yếu. Mật khẩu phải có ít nhất 6 ký tự.");
      } else {
        showError(error?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-md">
      <h3 className="text-base font-semibold text-neutral-1">Đổi mật khẩu</h3>

      <PasswordField
        label="Mật khẩu hiện tại"
        show={showCurrent}
        onToggle={() => setShowCurrent((v) => !v)}
        registration={register("current", { required: "Vui lòng nhập mật khẩu hiện tại" })}
        error={errors.current?.message}
      />
      <PasswordField
        label="Mật khẩu mới"
        show={showNext}
        onToggle={() => setShowNext((v) => !v)}
        registration={register("next", {
          required: "Vui lòng nhập mật khẩu mới",
          minLength: {
            value: 6,
            message: "Mật khẩu mới phải chứa ít nhất 6 ký tự",
          },
        })}
        error={errors.next?.message}
      />
      <PasswordField
        label="Xác nhận mật khẩu mới"
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        registration={register("confirm", {
          required: "Vui lòng xác nhận mật khẩu mới",
          validate: (value) => value === watch("next") || "Mật khẩu mới và xác nhận mật khẩu mới không khớp",
        })}
        error={errors.confirm?.message}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-fit bg-primary-1 hover:bg-primary-2 text-white font-semibold text-base px-8 py-2.5 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
