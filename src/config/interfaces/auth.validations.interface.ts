export interface IValidateLogin {
  email: string
  password: string
}

export interface IValidateRegister extends IValidateLogin {
  termsAndConditions: boolean
}

export interface IValidateSendVerificationCode {
  email: string
}

export interface IValidateVerifyCode extends IValidateSendVerificationCode {
  code: string
}

export interface IValidateForgotPassword extends IValidateLogin {
  code: string
}
