/**
 * Toast notification utilities
 * Wrapper around react-hot-toast for consistent notifications
 */

import toast from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'bottom-right',
    style: {
      background: '#10B981',
      color: '#fff',
    },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: 'bottom-right',
    style: {
      background: '#EF4444',
      color: '#fff',
    },
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'bottom-right',
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'bottom-right',
  });
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const showPromise = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      position: 'bottom-right',
    }
  );
};
