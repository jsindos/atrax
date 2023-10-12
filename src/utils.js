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

export const saveWithToast = async (fn, setIsSaving, toast) => {
  setIsSaving(true)
  try {
    await minDelayPromise(500, () => fn)

    toast({
      description: 'Changes saved'
    })
  } catch (e) {
    toast({
      title: 'Uh oh! Something went wrong.',
      description: 'There was a problem with your request.'
    })
    console.log(e)
  } finally {
    setIsSaving(false)
  }
}
