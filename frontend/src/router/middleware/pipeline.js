/**
 * Middleware Pipeline
 * Menjalankan sekumpulan middleware secara berurutan (berantai).
 *
 * Cara kerja:
 * - Setiap middleware dipanggil satu per satu.
 * - Jika middleware memanggil next() tanpa argumen → lanjut ke middleware berikutnya.
 * - Jika middleware memanggil next({ name: '...' }) → navigasi dihentikan dan redirect.
 * - Setelah semua middleware selesai → next() dari router dipanggil (navigasi diteruskan).
 *
 * @param {Object}   context           - { to, from, next } dari beforeEach
 * @param {Array}    middlewares        - Array fungsi middleware yang akan dijalankan
 * @param {Function} finalNext         - Fungsi next() asli dari Vue Router
 */
export default function pipeline(context, middlewares, finalNext) {
  // Ambil middleware pertama dari antrian
  const [first, ...remaining] = middlewares

  // Jika tidak ada middleware lagi, jalankan next() asli dari router
  if (!first) {
    return finalNext()
  }

  /**
   * Fungsi next buatan yang diteruskan ke setiap middleware.
   * - Jika dipanggil tanpa argumen: lanjut ke middleware berikutnya.
   * - Jika dipanggil dengan argumen (misal redirect): teruskan ke next() asli.
   */
  const nextMiddleware = (redirectTarget) => {
    if (redirectTarget !== undefined) {
      // Ada redirect → hentikan pipeline, teruskan ke router
      return finalNext(redirectTarget)
    }

    // Tidak ada redirect → jalankan middleware berikutnya dalam antrian
    return pipeline(context, remaining, finalNext)
  }

  // Jalankan middleware saat ini
  return first({ ...context, next: nextMiddleware })
}
