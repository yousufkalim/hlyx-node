export interface IArrayLink {
  cardId: string
  Links: ILinks[]
}

export interface IArrayLinkWithBaseInfo {
  myCardId: string
  Links: ILinkWithBaseInfo[]
  _count: number
}

export interface ILinkWithBaseInfo {
  cardId: string
  linkId?: string
  slug?: string | null
  publicCard?: boolean
  userAvatar?: string
  fullName?: string
  profTitle?: string | null
  company?: string | null
  city?: string | null
  state?: string | null
}

export interface ILinks {
  id: string
  cardOne: string
  cardTwo: string
  status?: string
  recentChangeBy?: string
  bothUserBlock?: boolean
  bothUserMute?: boolean
  photos?: ILinkPhoto[]
  notifications?: INotification[]
  updatedAt: Date
  createdAt?: Date
}

interface ILinkPhoto {
  linkId: string
  cardId: string
  pathToFile: string
}

/*
export interface INote {
  id: string
  linkId: string
  authorId: string
  recipientId: string
  note: string
  createdAt: Date
  updatedAt: Date
}
*/

export interface IValidateNote {
  note: string
}

export interface IValidateLinkSearchType {
  searchBy: string
}

export interface INotificationArray {
  cardId: string
  notificaiton: INotification
  otherCardInfo: ILinkWithBaseInfo
}

interface INotification {
  notificationId: string
  linkId: string
  ownerId: string
  cardOne: string
  cardTwo: string
  status: string
  details: string
  directsTo: string
  updatedAt: Date
}
