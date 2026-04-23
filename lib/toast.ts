// frontend/lib/toast.ts
'use client';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

export function toast(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
  const { duration = 4000, position = 'top' } = options;

  // Remove existing toasts
  const existing = document.getElementById('nc-toast');
  if (existing) {
    existing.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'nc-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Styles
  const colors = {
    success: { bg: 'rgba(74,124,89,0.95)', border: '#4a7c59' },
    error: { bg: 'rgba(196,98,45,0.95)', border: '#c4622d' },
    warning: { bg: 'rgba(184,134,11,0.95)', border: '#b8860b' },
    info: { bg: 'rgba(91,109,122,0.95)', border: '#5b6d7a' },
  };

  const color = colors[type];
  const positionStyle = position === 'top'
    ? 'top: 24px;'
    : 'bottom: 24px;';

  toast.style.cssText = `
    position: fixed;
    ${positionStyle}
    left: 50%;
    transform: translateX(-50%);
    background: ${color.bg};
    color: white;
    padding: 14px 24px;
    border-radius: 8px;
    border: 1px solid ${color.border};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    max-width: 500px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;

  toast.textContent = message;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 300);
  }, duration);
}

// Convenience methods
export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast(message, 'success', options);

export const toastError = (message: string, options?: ToastOptions) =>
  toast(message, 'error', options);

export const toastWarning = (message: string, options?: ToastOptions) =>
  toast(message, 'warning', options);

export const toastInfo = (message: string, options?: ToastOptions) =>
  toast(message, 'info', options);
