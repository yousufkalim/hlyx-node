import Joi from 'joi'
import { IValidateLoginRegister, IValidateForgotPassword, IValidateSendVerificationCode, IValidateVerifyCode } from '../../config/interfaces/auth.validations.interface'
import { messages } from '../../config/messages'

/**
 *
 * @param loginPayload
 * @returns Error message
 */
export const validateLogin = (loginPayload: IValidateLoginRegister): string | undefined => {
  const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required().error(new Error(`${messages.PASSWORD_FAILURE}`))
  })

  return (loginSchema.validate(loginPayload)?.error?.message)
}

/**
 *
 * @param registerPayload
 * @returns Error message
 */
export const validateRegister = (registerPayload: IValidateLoginRegister): string | undefined => {
  const registerSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required().error(new Error(`${messages.PASSWORD_FAILURE}`))
  })

  return (registerSchema.validate(registerPayload)?.error?.message)
}

/**
 *
 * @param sendVerificationCodePayload
 * @returns Error message
 */
export const validateSendVerificationCode = (sendVerificationCodePayload: IValidateSendVerificationCode): string | undefined => {
  const sendVerificationCodeSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required()
  })

  return (sendVerificationCodeSchema.validate(sendVerificationCodePayload)?.error?.message)
}

/**
 *
 * @param verifyCodePayload
 * @returns Error message
 */
export const validateVerifyCode = (verifyCodePayload: IValidateVerifyCode): string | undefined => {
  const verifyCodeSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    code: Joi.string().required()
  })

  return (verifyCodeSchema.validate(verifyCodePayload)?.error?.message)
}

/**
 *
 * @param forgotPasswordPayload
 * @returns Error message
 */
export const validateForgotPassword = (forgotPasswordPayload: IValidateForgotPassword): string | undefined => {
  const forgotPasswordSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required().error(new Error(`${messages.PASSWORD_FAILURE}`)),
    code: Joi.string().required()
  })

  return (forgotPasswordSchema.validate(forgotPasswordPayload)?.error?.message)
}
