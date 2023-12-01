import { Log } from 'debug-level'

export const logger = (namespace = '') => new Log(`@veloze/session${namespace}`)
