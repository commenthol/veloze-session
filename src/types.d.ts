import { Session } from './Session.js'

export interface StoreOptions {
  /** if string then human time, e.g. 2hours, or if number seconds */
  expires?: string | number
  /** additional props */
  [key: string]: any
}

export interface Store {
  constructor(opts: StoreOptions)
  /** stores session */
  set(session: Session): Promise<void>
  /** return session */
  get(session: Session): Promise<object | null>
  /** destroy session */
  destroy(session: Session): Promise<void>
  /** Get number of active sessions (only use for testing) */
  size(): Promise<number>
  /** Clear all sessions (only use for testing) */
  clear(): Promise<number>
}

/** Request Session Object */
export interface ReqSession {
  /** set session data object */
  set(data: object): void
  /** extend the expiry time of the session */
  extendExpiry(): void
  /** renew the session Id */
  resetId(): Promise<void>
  /** explicitly save the session */
  save(): Promise<void>
  /** destroy the session */
  destroy(): Promise<void>
  /** set, get property on session object */
  [property: string]: any
}
