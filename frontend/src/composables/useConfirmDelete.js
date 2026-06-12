import { confirmDelete as alertConfirmDelete } from '@/utils/alertHelper';

/**
 * Composable untuk konfirmasi hapus data.
 * Menggunakan SweetAlert2 via alertHelper.
 *
 * @returns {{ confirmDelete: (label: string) => Promise<boolean> }}
 */
export function useConfirmDelete() {
  /**
   * Tampilkan dialog konfirmasi hapus.
   * @param {string} label - Nama item yang akan dihapus (ditampilkan di dialog)
   * @returns {Promise<boolean>} true jika user konfirmasi, false jika batal
   */
  const confirmDelete = async (label) => {
    return await alertConfirmDelete(label);
  };

  return { confirmDelete };
}
