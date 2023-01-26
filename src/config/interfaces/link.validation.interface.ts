import { Types } from 'mongoose'
import { Timestamps } from './common.interface'

export interface ILink extends Timestamps {
  id: Types.ObjectId
  linkedUsers: Types.ObjectId[]
  status: string
  recentChangeDoneBy: string
}
