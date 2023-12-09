export function now(): number;
export class Session {
    static now(): number;
    static isExpired(exp: any): boolean;
    /**
     * @param {Request} req request object
     * @param {{
     *  name?: string
     *  sessionId?: string
     *  expires?: string|number
     *  randomId?: () => string
     *  initialData?: object
     * }} [opts] session options
     * - opts.name: session cookie name (@default 'session')
     * - opts.sessionId: session id
     * - opts.expires: session expiration (@default '12h')
     * - opts.randomId: function to generate session id (@default veloze.utils.random64)
     * - opts.initialData: initial or default session data
     */
    constructor(req: Request, opts?: {
        name?: string | undefined;
        sessionId?: string | undefined;
        expires?: string | number | undefined;
        randomId?: (() => string) | undefined;
        initialData?: object;
    } | undefined);
    name: string;
    req: Request;
    _randomId: typeof veloze.utils.random64;
    id: string;
    cookie: string;
    data: {};
    initialData: any;
    hasChanged: boolean;
    /** @type {number|undefined} allow setting different expiry */
    expires: number | undefined;
    getCookie(): any;
    /**
     * @param {object} [data]
     * @returns {boolean} successful set
     */
    set(data?: object): boolean;
    /**
     * assign fresh data from store to session
     * @param {{
     *  id?: string
     *  iat?: number
     *  exp?: number
     *  data?: object
     * }|null} freshData
     */
    assign(freshData: {
        id?: string | undefined;
        iat?: number | undefined;
        exp?: number | undefined;
        data?: object;
    } | null): boolean;
    iat: any;
    exp: any;
    /**
     * destroys the session data
     */
    destroy(): void;
    /**
     * resets the session id; leaves the data intact
     */
    resetId(): void;
    /**
     * the session request data
     * @returns {ReqSession}
     */
    sessionData(store: any): ReqSession;
    /**
     * @returns {boolean} true if empty
     */
    isEmpty(): boolean;
    /**
     * sets expiry
     */
    setExpiry(): void;
    /**
     * @returns {boolean} true if expired
     */
    isExpired(): boolean;
    extendExpiry(): void;
}
export type ReqSession = import('./types').ReqSession;
import * as veloze from 'veloze';
