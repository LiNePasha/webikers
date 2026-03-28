"use client";

import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useToastStore, Toast as ToastType } from "@/store/toastStore";

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const getIcon = (type: ToastType["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case "error":
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case "info":
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStyles = (type: ToastType["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Transition
          key={toast.id}
          show={true}
          as={Fragment}
          appear
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-x-full opacity-0"
          enterTo="translate-x-0 opacity-100"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`pointer-events-auto max-w-sm w-full border-2 rounded-lg shadow-lg p-4 ${getStyles(
              toast.type
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{getIcon(toast.type)}</div>
              <p className="text-sm font-medium text-gray-900 flex-1">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Transition>
      ))}
    </div>
  );
}
