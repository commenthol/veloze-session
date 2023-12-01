export const nap = (ms = 100) =>
  new Promise((resolve) => setTimeout(() => resolve(ms), ms))
