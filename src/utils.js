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
    setTimeout(async () => resolve(), delay)
  })

  // wait for at least 1 second
  await Promise.all([promise1, promise2])

  if (errorOccurred) {
    throw fnError
  }

  return result
}

export const saveWithToast = async (fn, toast, toastSuccessMessage, setIsSaving) => {
  setIsSaving && setIsSaving(true)
  try {
    const result = await minDelayPromise(200, fn)

    toast({
      description: toastSuccessMessage || 'Changes saved'
    })
    return result
  } catch (e) {
    toast({
      title: 'Uh oh! Something went wrong.',
      description: 'There was a problem with your request.'
    })
    console.log(e)
  } finally {
    setIsSaving && setIsSaving(false)
  }
}

export function buildTree (steps, parentId = null) {
  return steps
    ?.filter(step => step.parentId === parentId)
    .sort((a, b) => a.index - b.index)
    .map(step => ({
      ...step,
      id: step.id,
      value: step.id,
      children: buildTree(steps, step.id)
    }))
}

export function flattenTree (tree, parentId) {
  let flatSteps = []

  tree.forEach((node, i) => {
    flatSteps.push({
      index: i,
      /**
       * this is a hack, as `dnd-kit-sortable-tree` removes `parentId` when the parent doesn't exist in the tree
       * for the use case of only displaying child nodes without rendering the top-most parent (used on StepDetail)
       * we force the top-most `parentId` back in
       */
      parentId: node.parentId || parentId,
      id: node.id
    })

    if (node.children) {
      flatSteps = flatSteps.concat(flattenTree(node.children, node.id))
    }
  })

  return flatSteps
}
