export default function pipeline(context, middlewares, finalNext) {
  const [first, ...remaining] = middlewares

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
