import ForgotPasswordForm from "@/features/guest/forgot-password/components/forgot-password-form";

export const metadata = {
  title: "Quên mật khẩu",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <ForgotPasswordForm />
    </main>
  );
}
