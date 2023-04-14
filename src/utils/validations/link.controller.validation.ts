import Joi from 'joi'
import { IValidateNote } from '../../config/interfaces/link.validation.interface'
import { stringLengths } from '../../config/stringLengths'

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
