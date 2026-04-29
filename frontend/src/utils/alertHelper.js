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
// POPUP ALERT
// =============================================

export const showSuccess = (pesan) => {
  Swal.fire('Berhasil!', pesan, 'success');
};

export const showError = (pesan) => {
  Swal.fire('Gagal!', pesan, 'error');
};

export const showWarning = (pesan) => {
  Swal.fire('Perhatian!', pesan, 'warning');
};

export const showInfo = (pesan) => {
  Swal.fire('Informasi', pesan, 'info');
};

// =============================================
// TOAST (notifikasi ringan, sudut kanan atas)
// =============================================

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

/**
 * Tampilkan toast notification (bottom-center, dengan progress bar)
 * @param {string} pesan - Pesan yang ditampilkan
 * @param {'success'|'error'|'warning'|'info'} icon - Ikon toast
 */
export const showToast = (pesan, icon = 'success') => {
  Toast.fire({
    icon: icon,
    title: pesan
  });
};