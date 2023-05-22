import Joi from 'joi'
import { searchTypeEnum } from '../../config/enumTypes'
import {
  IValidateLinkSearchType,
  IValidateNote
} from '../../config/interfaces/link.validation.interface'
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

  return noteSchema.validate(notePayload)?.error?.message
}
export const validateLinkSearchType = (
  linkSearchPayload: IValidateLinkSearchType
): string | undefined => {
  const searchSchema = Joi.object({
    searchBy: Joi.string().valid(...Object.values(searchTypeEnum))
  })
  return searchSchema.validate(linkSearchPayload)?.error?.message
}
