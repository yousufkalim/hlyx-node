export interface IValidateLoginRegister {
  email: string
  password: string
}

export interface IValidateSendVerificationCode {
  email: string
}

export interface IValidateVerifyCode extends IValidateSendVerificationCode {
  code: string
}

export interface IValidateForgotPassword extends IValidateLoginRegister {
  code: string
}

export interface IValidateAddPhone {
  phone: string
}

export interface IValidateVerifyPhone extends IValidateAddPhone {
  code: string
}
