"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { changeUserPassword } from "@/integrations/firebase";
import { useToast } from "@/hooks";

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-base text-neutral-3">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
    </div>
  );
}

export default function ChangePasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();

  const handleSubmit = async () => {
    if (!current.trim() || !next.trim() || !confirm.trim()) {
      showWarning("Vui lòng nhập đầy đủ tất cả các trường.");
      return;
    }

    if (next !== confirm) {
      showError("Mật khẩu mới và xác nhận mật khẩu mới không khớp.");
      return;
    }

    if (next.length < 6) {
      showWarning("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      await changeUserPassword(current.trim(), next.trim());
      showSuccess("Đổi mật khẩu thành công!");
      setCurrent("");
      setNext("");
      setConfirm("");
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
    <div className="flex flex-col gap-6 max-w-md">
      <h3 className="text-base font-semibold text-neutral-1">Đổi mật khẩu</h3>

      <PasswordField
        label="Mật khẩu hiện tại"
        value={current}
        onChange={setCurrent}
        show={showCurrent}
        onToggle={() => setShowCurrent((v) => !v)}
      />
      <PasswordField
        label="Mật khẩu mới"
        value={next}
        onChange={setNext}
        show={showNext}
        onToggle={() => setShowNext((v) => !v)}
      />
      <PasswordField
        label="Xác nhận mật khẩu mới"
        value={confirm}
        onChange={setConfirm}
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-fit bg-primary-1 hover:bg-primary-2 text-white font-semibold text-base px-8 py-2.5 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
