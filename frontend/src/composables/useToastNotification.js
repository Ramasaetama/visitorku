import { showToast } from '@/utils/alertHelper';

/**
 * Composable untuk menampilkan notifikasi toast.
 * Menggunakan SweetAlert2 toast via alertHelper.
 *
 * @returns {{ showSuccess: (message: string) => void, showError: (message: string) => void }}
 */
export function useToastNotification() {
  /**
   * Tampilkan toast notifikasi sukses (hijau, top-right)
   * @param {string} message - Pesan yang ditampilkan
   */
  const showSuccess = (message) => {
    showToast(message, 'success');
  };

  /**
   * Tampilkan toast notifikasi error (merah, top-right)
   * @param {string} message - Pesan yang ditampilkan
   */
  const showError = (message) => {
    showToast(message, 'error');
  };

  /**
   * Tampilkan toast notifikasi warning (kuning, top-right)
   * @param {string} message - Pesan yang ditampilkan
   */
  const showWarning = (message) => {
    showToast(message, 'warning');
  };

  return { showSuccess, showError, showWarning };
}
