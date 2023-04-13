import Joi from 'joi'
import { IValidateNote, IValidateNotification } from '../../config/interfaces/link.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { directsTo } from '../../config/enumTypes'

/**
 *
 * @param notePayload
 * @returns Error message
 */
export const validateNote = (notePayload: IValidateNote): string | undefined => {
  const noteSchema = Joi.object({
    note: Joi.string().max(stringLengths.NOTE_MAX).required()
  })

  return (noteSchema.validate(notePayload)?.error?.message)
}

/**
 *
 * @param notificationPayload
 * @returns Error message
 */
export const validateNotification = (notificationPayload: IValidateNotification): string | undefined => {
  const notificationSchema = Joi.object({
    details: Joi.string().max(stringLengths.NOTE_MAX).required(),
    directsTo: Joi.string().valid(...directsTo).required()
  })

  return (notificationSchema.validate(notificationPayload)?.error?.message)
}
