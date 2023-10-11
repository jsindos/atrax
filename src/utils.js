import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn (...inputs) {
  return twMerge(clsx(inputs))
}

export async function minDelayPromise (delay, fn) {
  let result, errorOccurred, fnError

  const promise1 = fn().then(r => {
    result = r
  }).catch(e => {
    errorOccurred = true
    fnError = e
  })

  const promise2 = new Promise(resolve => {
    setTimeout(async () => resolve(), 500)
  })

  // wait for at least 1 second
  await Promise.all([promise1, promise2])

  if (errorOccurred) {
    throw fnError
  }

  return result
}
