import { execSync } from 'child_process'

export const nap = (ms = 100) =>
  new Promise((resolve) => setTimeout(() => resolve(ms), ms))

export const isDockerRunning = (name) => {
  try {
    const res = execSync(`docker ps -q -f name=${name}`).toString().trim()
    return res !== ''
  } catch (e) {}
  return false
}

const noop = () => {}

export const describeBool = (trueish) => (trueish ? describe : describe.skip)
describeBool.only = (trueish) => (trueish ? describe.only : noop)
describeBool.skip = (_trueish) => describe.skip

export const itBool = (trueish) => (trueish ? it : it.skip)
itBool.only = (trueish) => (trueish ? it.only : noop)
itBool.skip = (_trueish) => it.skip
