import { toast as sonnerToast, ExternalToast } from "sonner";

type ToastOptions = Omit<ExternalToast, "id">;

export const toast = {
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, options);
  },

  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, options);
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, options);
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, options);
  },

  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },

  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};
