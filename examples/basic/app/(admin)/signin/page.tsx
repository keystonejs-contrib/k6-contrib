'use client'
/* eslint-disable */
import { getSigninPage } from '@keystone-6/auth/pages/SigninPage'

export default getSigninPage({"identityField":"email","secretField":"password","mutationName":"authenticateUserWithPassword","successTypename":"UserAuthenticationWithPasswordSuccess","failureTypename":"UserAuthenticationWithPasswordFailure"})
