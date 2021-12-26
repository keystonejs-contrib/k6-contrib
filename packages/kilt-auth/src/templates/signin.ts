export const signinTemplate = () => {
  // -- TEMPLATE START
  return `
import { getSigninPage } from '@k6-contrib/kilt-auth/pages/signin'

export default getSigninPage();
`;
  // -- TEMPLATE END
};
