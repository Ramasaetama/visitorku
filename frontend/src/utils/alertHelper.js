import Swal from 'sweetalert2';

// =============================================
// KONFIRMASI
// =============================================

/**
 * Konfirmasi hapus data (merah)
 */
export const confirmDelete = async (namaItem) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You won't be able to revert this!!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#D68D0D',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });

  return result.isConfirmed;
};

/**
 * Konfirmasi aksi generik (logout, batal, dsb)
 */
export const confirmAction = async (title, text) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#D68D0D',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal',
    reverseButtons: true
  });

  return result.isConfirmed;
};

// =============================================
// POPUP ALERT — semua muncul sebagai toast di kanan bawah
// =============================================

const BottomRightToast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const showSuccess = (pesan) => {
  BottomRightToast.fire({ icon: 'success', title: pesan });
};

export const showError = (pesan) => {
  BottomRightToast.fire({ icon: 'error', title: pesan });
};

export const showWarning = (pesan) => {
  BottomRightToast.fire({ icon: 'warning', title: pesan });
};

export const showInfo = (pesan) => {
  BottomRightToast.fire({ icon: 'info', title: pesan });
};

// =============================================
// TOAST (notifikasi ringan, sudut kanan bawah)
// =============================================

/**
 * Tampilkan toast notification (bottom-end, dengan progress bar)
 * @param {string} pesan - Pesan yang ditampilkan
 * @param {'success'|'error'|'warning'|'info'} icon - Ikon toast
 */
export const showToast = (pesan, icon = 'success') => {
  BottomRightToast.fire({
    icon: icon,
    title: pesan
  });
};