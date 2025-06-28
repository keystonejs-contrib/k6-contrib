'use client'
import makeSigninPage from '@keystone-6/auth/pages/SigninPage'

export default makeSigninPage({"authGqlNames":{"authenticateItemWithPassword":"authenticateUserWithPassword","ItemAuthenticationWithPasswordResult":"UserAuthenticationWithPasswordResult","ItemAuthenticationWithPasswordSuccess":"UserAuthenticationWithPasswordSuccess","ItemAuthenticationWithPasswordFailure":"UserAuthenticationWithPasswordFailure","CreateInitialInput":"CreateInitialUserInput","createInitialItem":"createInitialUser"},"identityField":"email","secretField":"password"})
