import Swal from 'sweetalert2';

// =============================================
// KONFIRMASI
// =============================================

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
// PARSER ERROR API — ekstrak pesan spesifik dari backend
// =============================================

export const parseApiError = (error, fallback = 'Terjadi kesalahan. Silakan coba lagi.') => {
  const data = error?.response?.data;

  if (!data) {
    if (error?.request) return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    return fallback;
  }

  // Helper: ubah nilai apapun menjadi string yang bermakna
  const extractString = (val) => {
    if (!val && val !== 0) return null;
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) {
      const found = val.map(extractString).filter(Boolean);
      return found[0] || null;
    }
    if (typeof val === 'object') {
      // Coba ambil properti umum dulu
      return val.message || val.msg || val.error || val.detail
        || Object.values(val).map(extractString).filter(Boolean)[0]
        || null;
    }
    return String(val);
  };

  // Prioritas: ekstrak dari errors object (validasi per-field)
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const messages = Object.values(data.errors)
      .map(extractString)
      .filter(Boolean);
    if (messages.length > 0) return messages[0];
  }

  // errors sebagai array langsung
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const msg = extractString(data.errors[0]);
    if (msg) return msg;
  }

  // message bukan generik
  if (data.message && typeof data.message === 'string'
      && data.message.toLowerCase() !== 'validation error') {
    return data.message;
  }

  // Fallback ke field lain
  const alt = extractString(data.error || data.msg);
  if (alt) return alt;

  return fallback;
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

export const showToast = (pesan, icon = 'success') => {
  BottomRightToast.fire({
    icon: icon,
    title: pesan
  });
};