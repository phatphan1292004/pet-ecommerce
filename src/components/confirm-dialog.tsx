import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isDanger = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 transition-opacity" aria-hidden="true" />

      {/* Modal Wrapper */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-20 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isDanger && (
                <div className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <FaExclamationTriangle size={16} />
                </div>
              )}
              <DialogTitle className="text-lg font-bold text-neutral-1">
                {title}
              </DialogTitle>
            </div>
            <Button
              onClick={onClose}
              disabled={isLoading}
              className="text-neutral-4 hover:text-neutral-1 transition-colors"
            >
              <FaTimes size={16} />
            </Button>
          </div>

          {/* Message */}
          <Description className="text-sm text-neutral-3 leading-relaxed">
            {message}
          </Description>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-neutral-20 text-sm font-semibold text-neutral-3 hover:bg-neutral-10 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary-1 hover:bg-primary-2"
              }`}
            >
              {isLoading ? "Đang xử lý..." : confirmText}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
