import Joi from 'joi'
import {
  IValidateLoginRegister,
  IValidateSendVerificationCode,
  IValidateVerifyCode,
  IValidateEmailUpdate,
  IValidateAddPhone,
  IValidateVerifyPhone,
  IValidateRegister
} from '../../config/interfaces/auth.validations.interface'
import { messages } from '../../config/messages'
import { stringLengths } from '../../config/stringLengths'
import { listIdentifier } from '../../config/enumTypes'

/**
 *
 * @param loginPayload
 * @returns Error message
 */
export const validateLogin = (loginPayload: IValidateLoginRegister): string | undefined => {
  const loginSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$&+,:;=?@#|'<>.^*()%!-]{8,}$/)
      .required()
      .error(new Error(`${messages.PASSWORD_FAILURE}`)),
    keepSignIn: Joi.boolean().required()
  })

  return loginSchema.validate(loginPayload)?.error?.message
}

/**
 *
 * @param registerPayload
 * @returns Error message
 */
export const validateRegister = (registerPayload: IValidateRegister): string | undefined => {
  const registerSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$&+,:;=?@#|'<>.^*()%!-]{8,}$/)
      .required()
      .error(new Error(`${messages.PASSWORD_FAILURE}`)),
    firstName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX),
    middleInitial: Joi.string().max(stringLengths.MIDDLE_INITIAL_MAX).allow(''),
    lastName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX),
    listIdentifier: Joi.string().valid(...listIdentifier),
    status: Joi.boolean()
  })
  console.log(registerPayload)
  return registerSchema.validate(registerPayload)?.error?.message
}

/**
 *
 * @param sendVerificationCodePayload
 * @returns Error message
 */
export const validateSendVerificationCode = (
  sendVerificationCodePayload: IValidateSendVerificationCode
): string | undefined => {
  const sendVerificationCodeSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
  })

  return sendVerificationCodeSchema.validate(sendVerificationCodePayload)?.error?.message
}

/**
 *
 * @param verifyCodePayload
 * @returns Error message
 */
export const validateEmailUpdate = (
  verifyCodePayload: IValidateEmailUpdate
): string | undefined => {
  const verifyCodeSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    phone: Joi.string().required(),
    code: Joi.string().required()
  })

  return verifyCodeSchema.validate(verifyCodePayload)?.error?.message
}

/**
 *
 * @param verifyCodePayload
 * @returns Error message
 */
export const validateVerifyCode = (verifyCodePayload: IValidateVerifyCode): string | undefined => {
  const verifyCodeSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    code: Joi.string().required()
  })

  return verifyCodeSchema.validate(verifyCodePayload)?.error?.message
}

export const validateChangePassword = (
  verifyCodePayload: IValidateVerifyCode
): string | undefined => {
  const verifyCodeSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    code: Joi.string().required(),
    password: Joi.string()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$&+,:;=?@#|'<>.^*()%!-]{8,}$/)
      .required()
      .error(new Error(`${messages.PASSWORD_FAILURE}`))
  })

  return verifyCodeSchema.validate(verifyCodePayload)?.error?.message
}

/**
 *
 * @param phonePayload
 * @returns Error message
 */
export const validatePhone = (phonePayload: IValidateAddPhone): string | undefined => {
  const phoneSchema = Joi.object({
    phone: Joi.string()
      .min(stringLengths.PHONE_MIN)
      .max(stringLengths.PHONE_MAX)
      // .pattern(/^[0-9]+$/)
      .required()
  })

  return phoneSchema.validate(phonePayload)?.error?.message
}

/**
 *
 * @param verifyPhonePayload
 * @returns Error message
 */
export const validateVerifyPhone = (addPhonePayload: IValidateVerifyPhone): string | undefined => {
  const verifySchema = Joi.object({
    phone: Joi.string()
      .min(stringLengths.PHONE_MIN)
      .max(stringLengths.PHONE_MAX)
      // .pattern(/^[0-9]+$/)
      .required(),
    code: Joi.string().required()
  })

  return verifySchema.validate(addPhonePayload)?.error?.message
}
