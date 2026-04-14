import Link from "next/link";
import { FaTruck } from "react-icons/fa";
import { IoCard, IoCartOutline } from "react-icons/io5";

type CartStep = 1 | 2 | 3;

interface CartProgressProps {
  currentStep?: CartStep;
}

const stepStyles = (status: "active" | "completed" | "inactive") => {
  if (status === "inactive") {
    return {
      circle: "bg-neutral-7 text-neutral-4",
      text: "text-neutral-4",
    };
  }

  return {
    circle: "bg-primary-1 text-white",
    text: "text-neutral-2",
  };
};

export default function CartProgress({ currentStep = 1 }: CartProgressProps) {
  const cart = stepStyles(currentStep === 1 ? "active" : currentStep > 1 ? "completed" : "inactive");
  const shipping = stepStyles(currentStep === 2 ? "active" : currentStep > 2 ? "completed" : "inactive");
  const payment = stepStyles(currentStep === 3 ? "active" : "inactive");

  return (
    <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-6">
      <div className="relative flex flex-col items-center gap-2">
        <Link href="/cart" aria-current={currentStep === 1 ? "step" : undefined} className="flex flex-col items-center gap-2">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${cart.circle}`}>
            <IoCartOutline size={22} />
          </span>
          <span className={`text-xs font-semibold sm:text-sm ${cart.text}`}>Giỏ hàng</span>
        </Link>
        <div
          className={`pointer-events-none absolute top-5 left-[calc(50%+22px)] h-px w-[calc(100%-44px)] ${
            currentStep >= 2 ? "bg-primary-1" : "bg-neutral-7"
          }`}
        />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <Link href="/cart/shipping" aria-current={currentStep === 2 ? "step" : undefined} className="flex flex-col items-center gap-2">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${shipping.circle}`}>
            <FaTruck size={18} />
          </span>
          <span className={`text-xs font-semibold sm:text-sm ${shipping.text}`}>Giao hàng</span>
        </Link>
        <div
          className={`pointer-events-none absolute top-5 left-[calc(50%+22px)] h-px w-[calc(100%-44px)] ${
            currentStep >= 3 ? "bg-primary-1" : "bg-neutral-7"
          }`}
        />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <Link
          href="/cart/payment"
          aria-current={currentStep === 3 ? "step" : undefined}
          className="flex flex-col items-center gap-2"
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${payment.circle}`}>
            <IoCard size={18} />
          </span>
          <span className={`text-xs font-semibold sm:text-sm ${payment.text}`}>Thanh toán</span>
        </Link>
      </div>
    </div>
  );
}
