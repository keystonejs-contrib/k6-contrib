import * as cookie from 'cookie';
import Iron from '@hapi/iron';
// uid-safe is what express-session uses so let's just use it
import { SessionStrategy } from '@keystone-6/core/types';

const TOKEN_NAME = 'keystonejs-session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

// should we also accept httpOnly?
type StatelessSessionsOptions = {
  /**
   * Secret used by https://github.com/hapijs/iron for encapsulating data. Must be at least 32 characters long
   */
  secret: string;
  /**
   * Iron seal options for customizing the key derivation algorithm used to generate encryption and integrity verification keys as well as the algorithms and salt sizes used.
   * See https://hapi.dev/module/iron/api/?v=6.0.0#options for available options.
   *
   * @default Iron.defaults
   */
  ironOptions?: Iron.SealOptions;
  /**
   * Specifies the number (in seconds) to be the value for the `Max-Age`
   * `Set-Cookie` attribute.
   *
   * @default 60 * 60 * 8 // 8 hours
   */
  maxAge?: number;
  /**
   * Specifies the boolean value for the [`Secure` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.5).
   *
   * *Note* be careful when setting this to `true`, as compliant clients will
   * not send the cookie back to the server in the future if the browser does
   * not have an HTTPS connection.
   *
   * @default process.env.NODE_ENV === 'production'
   */
  secure?: boolean;
  /**
   * Specifies the value for the [`Path` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.4).
   *
   * @default '/'
   */
  path?: string;
  /**
   * Specifies the domain for the [`Domain` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.3)
   *
   * @default current domain
   */
  domain?: string;
  /**
   * Specifies the boolean or string to be the value for the [`SameSite` `Set-Cookie` attribute](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7).
   *
   * @default 'lax'
   */
  sameSite?: true | false | 'lax' | 'strict' | 'none';

  listKey?: string;
  apiKeyField?: string;
  apiKeyHeader?: string;
};

export function statelessApiKeySessions<T>({
  secret,
  maxAge = MAX_AGE,
  path = '/',
  secure = process.env.NODE_ENV === 'production',
  ironOptions = Iron.defaults,
  domain,
  sameSite = 'lax',
  listKey = 'User',
  apiKeyField = 'apiKey',
  apiKeyHeader = 'x-api-key',
}: StatelessSessionsOptions): SessionStrategy<T> {
  if (!secret) {
    throw new Error('You must specify a session secret to use sessions');
  }
  if (secret.length < 32) {
    throw new Error('The session secret must be at least 32 characters long');
  }
  return {
    async get({ req, createContext }) {
      const apiKey: string = (req.headers[apiKeyHeader] as string) || ''
      if (apiKey?.toString().length >= 16) {
        const sudoContext = createContext({ sudo: true });
        try {
          const data = await sudoContext.query[listKey].findMany({
            where: { [apiKeyField]: { equals: apiKey } },
          });
          if (!data || data.length > 1) return;
          return { itemId: data[0].id, listKey };
        } catch {
          return;
        }
      }
      const cookies = cookie.parse(req.headers.cookie || '');
      const bearer = req.headers.authorization?.replace('Bearer ', '');
      const token = bearer || cookies[TOKEN_NAME];
      if (!token) return;
      try {
        return await Iron.unseal(token, secret, ironOptions);
      } catch (err) {
        return;
      }
    },
    async end({ res }) {
      res.setHeader(
        'Set-Cookie',
        cookie.serialize(TOKEN_NAME, '', {
          maxAge: 0,
          expires: new Date(),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain,
        })
      );
    },
    async start({ res, data }) {
      const sealedData = await Iron.seal(data, secret, { ...ironOptions, ttl: maxAge * 1000 });

      res.setHeader(
        'Set-Cookie',
        cookie.serialize(TOKEN_NAME, sealedData, {
          maxAge,
          expires: new Date(Date.now() + maxAge * 1000),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain,
        })
      );

      return sealedData;
    },
  };
}
