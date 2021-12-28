import { AdminFileToWrite, BaseListTypeInfo, KeystoneConfig } from '@keystone-6/core/types';
import { randomAsHex } from '@polkadot/util-crypto';
import bodyParser from 'body-parser';
import validateSignature from './lib/verifySignature';
import { getSchemaExtension } from './schema';
import { initTemplate } from './templates/init';
import { signinTemplate } from './templates/signin';
import { AuthConfig, AuthGqlNames } from './types';

export function createAuth<ListTypeInfo extends BaseListTypeInfo>({
  listKey = 'User',
  initFirstItem = { fields: ['DID'], itemData: { isAdmin: true } },
  identityField = 'DID',
  sessionData = 'id DID isAdmin',
}: AuthConfig<ListTypeInfo>) {
  const gqlNames: AuthGqlNames = {
    authenticateItemWithKilt: `authenticate${listKey}WithKilt`,
    ItemAuthenticationWithKiltResult: `${listKey}AuthenticationWithKiltResult`,
    ItemAuthenticationWithKiltSuccess: `${listKey}AuthenticationWithKiltSuccess`,
    ItemAuthenticationWithKiltFailure: `${listKey}AuthenticationWithKiltFailure`,
  };

  const graphqlExtension = getSchemaExtension({ listKey, identityField, gqlNames });

  const validateConfig = (keystoneConfig: KeystoneConfig) => {
    const listConfig = keystoneConfig.lists[listKey];
    if (listConfig === undefined) {
      const msg = `A createAuth() invocation specifies the list "${listKey}" but no list with that key has been defined.`;
      throw new Error(msg);
    }

    // TODO: Check for String-like typing for identityField? How?
    // TODO: Validate that the identifyField is unique.
    // TODO: If this field isn't required, what happens if I try to log in as `null`?
    const identityFieldConfig = listConfig.fields[identityField];
    if (identityFieldConfig === undefined) {
      const i = JSON.stringify(identityField);
      const msg = `A createAuth() invocation for the "${listKey}" list specifies ${i} as its identityField but no field with that key exists on the list.`;
      throw new Error(msg);
    }

    // TODO: We could make the secret field optional to disable the standard id/secret auth and password resets (ie. magic links only)
    // const secretFieldConfig = listConfig.fields[secretField];
    // if (secretFieldConfig === undefined) {
    //   const s = JSON.stringify(secretField);
    //   const msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField but no field with that key exists on the list.`;
    //   throw new Error(msg);
    // }

    // TODO: Could also validate initFirstItem.itemData keys?
    for (const field of initFirstItem?.fields || []) {
      if (listConfig.fields[field] === undefined) {
        const f = JSON.stringify(field);
        const msg = `A createAuth() invocation for the "${listKey}" list specifies the field ${f} in initFirstItem.fields array but no field with that key exist on the list.`;
        throw new Error(msg);
      }
    }
  };

  const publicPages = ['/signin'];
  if (initFirstItem) {
    publicPages.push('/init');
  }

  const getAdditionalFiles = () => {
    let filesToWrite: AdminFileToWrite[] = [
      {
        mode: 'write',
        src: signinTemplate(),
        outputPath: 'pages/signin.js',
      },
    ];
    if (initFirstItem) {
      filesToWrite.push({
        mode: 'write',
        src: initTemplate(),
        outputPath: 'pages/init.js',
      });
    }
    return filesToWrite;
  };

  const extendExpressApp = (app, createContext) => {
    app.get('/challenge', async (req, res) => {
      const context = await createContext(req, res);
      const challenge = randomAsHex(16);
      await context.startSession(challenge);
      res.json(challenge);
    });
    app.post('/verify', bodyParser.json(), async (req, res) => {
      const context = await createContext(req, res);
      const challenge = await context.session;
      const { did, signature } = req.body;
      await context.endSession();
      if (validateSignature(challenge, did, signature)) {
        const user = await context.query.User.findOne({ where: { DID: did }, query: sessionData });
        await context.startSession(user);
        res.json(user);
      }
    });
    app.post('/init/verify', bodyParser.json(), async (req, res) => {
      const context = await createContext(req, res);
      const challenge = await context.session;
      const { did, signature } = req.body;
      await context.endSession();
      if (
        validateSignature(challenge, did, signature) &&
        (await context.query.User.count()) === 0
      ) {
        let user = { DID: did, isAdmin: true };
        user = await context.query.User.createOne({ data: user, query: sessionData });
        await context.startSession(user);
        res.json(user);
      }
    });
  };

  const pageMiddleware = async ({ context, isValidSession }) => {
    const { req, session } = context;
    const pathname = req!.url!;

    if (isValidSession && session.did) {
      if (pathname === '/signin' || pathname === '/init') {
        return { kind: 'redirect', to: '/' };
      }
      return;
    }

    if (!session && initFirstItem) {
      const count = await context.query.User.count();
      if (count === 0) {
        if (pathname !== '/init') {
          return { kind: 'redirect', to: '/init' };
        }
        return;
      }
    }

    if (!session && pathname !== '/signin') {
      return { kind: 'redirect', to: `/signin` };
    }
  };

  const withAuth = (keystoneConfig: KeystoneConfig): KeystoneConfig => {
    validateConfig(keystoneConfig);
    let ui = keystoneConfig.ui;
    if (!keystoneConfig.ui?.isDisabled) {
      ui = {
        ...keystoneConfig.ui,
        getAdditionalFiles: [...(keystoneConfig.ui?.getAdditionalFiles || []), getAdditionalFiles],
        publicPages: [...(keystoneConfig.ui?.publicPages || []), ...publicPages],
        pageMiddleware: async args =>
          (await pageMiddleware(args)) ?? keystoneConfig?.ui?.pageMiddleware?.(args),
      };
    }
    let server = keystoneConfig.server;
    server = { ...keystoneConfig.server, extendExpressApp: extendExpressApp };
    let extendGraphqlSchema = keystoneConfig.extendGraphqlSchema
      ? keystoneConfig.extendGraphqlSchema
      : graphqlExtension;
    return { ...keystoneConfig, ui, server, extendGraphqlSchema };
  };
  return { withAuth };
}
