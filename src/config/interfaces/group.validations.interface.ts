export interface IValidateGroupRequest {
  groupName: string
  description?: string
  groupPhoto?: string
  isPrivate: boolean
  tags: string[]
}
