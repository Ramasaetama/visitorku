import { showToast } from '@/utils/alertHelper';

export function useToastNotification() {
  const showSuccess = (message) => {
    showToast(message, 'success');
  };

  const showError = (message) => {
    showToast(message, 'error');
  };

  const showWarning = (message) => {
    showToast(message, 'warning');
  };

  return { showSuccess, showError, showWarning };
}
