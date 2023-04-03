export interface IArrayLink {
  cardId: string
  Links: ILinks[]
}

export interface IArrayLinkWithBaseInfo {
  myCardId: string
  Links: ILinkWithBaseInfo[]
}

export interface ILinkWithBaseInfo {
  cardId: string
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
  photos?: ILinkPhoto[]
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
