/**
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

  const nextMiddleware = (redirectTarget) => {
    if (redirectTarget !== undefined) {
      return finalNext(redirectTarget)
    }

    return pipeline(context, remaining, finalNext)
  }

  return first({ ...context, next: nextMiddleware })
}
