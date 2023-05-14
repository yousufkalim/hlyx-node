import Joi from 'joi'
import { IValidateGroupRequest } from '../../config/interfaces/group.validations.interface'
import { stringLengths } from '../../config/stringLengths'

export const validateGroupCreate = (groupParams: IValidateGroupRequest): string | undefined => {
  const groupSchema = Joi.object({
    groupName: Joi.string().max(stringLengths.NAME_MAX).required(),
    description: Joi.string().max(stringLengths.DESC_MAX),
    groupPhoto: Joi.string(),
    isPrivate: Joi.boolean(),
    tags: Joi.array(),
    members: Joi.array()
  })

  return groupSchema.validate(groupParams)?.error?.message
}
