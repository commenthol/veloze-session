export function now(): number;
export class Session {
    /**
     * @param {Request} req request object
     * @param {{
     *  name?: string
     *  sessionId?: string
     *  expires?: string|number
     *  randomId?: () => string
     *  data?: object
     * }} [opts] session options
     * - opts.name: session cookie name (@default 'session')
     * - opts.sessionId: session id
     * - opts.expires: session expiration (@default '12h')
     * - opts.randomId: function to generate session id (@default veloze.utils.random64)
     * - opts.data: initial session data
     */
    constructor(req: Request, opts?: {
        name?: string | undefined;
        sessionId?: string | undefined;
        expires?: string | number | undefined;
        randomId?: (() => string) | undefined;
        data?: object;
    } | undefined);
    name: string;
    req: Request;
    id: string;
    cookie: string;
    data: any;
    hasChanged: boolean;
    needsSave: boolean;
    /** @type {number|undefined} allow setting different expiry */
    expires: number | undefined;
    getCookie(): any;
    /**
     * @param {object} [data]
     * @returns {boolean} successful set
     */
    set(data?: object): boolean;
    assign(freshData: any): void;
    exp: any;
    iat: any;
    /**
     * destroys the session data
     */
    destroy(): void;
    /**
     * the session request data
     * @returns {object}
     */
    sessionData(store: any): object;
    /**
     * sets expiry
     */
    setExpired(): void;
    /**
     * @returns {boolean} true if expired
     */
    isExpired(): boolean;
    extendExpiry(): void;
}
