import Swal from 'sweetalert2';

export const confirmDelete = async (namaItem) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You won't be able to revert this!!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#D68D0D', // Merah (Tailwind red-500)
    cancelButtonColor: '#6B7280',  // Abu-abu (Tailwind gray-500)
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true // Tombol Batal di kiri, Hapus di kanan
  });

  return result.isConfirmed; // Mengembalikan nilai true jika user klik "Ya, hapus!"
};

export const showSuccess = (pesan) => {
  Swal.fire('Berhasil!', pesan, 'success');
};

export const showError = (pesan) => {
  Swal.fire('Gagal!', pesan, 'error');
};