export const emailTypes = ['work', 'personal', 'alternate'] as const

export const twoFactorAuthTypes = ['none', 'phone', 'email']

export const connectViaPersonFilters = ['auto', 'manual']

export const phoneTypes = [
  'home',
  'work',
  'mobile',
  'main',
  'fax',
  'direct',
  'office'
] as const

export const academicLevels = [
  'High School',
  'Vocational Degree',
  'College Degree',
  'Professional Degree',
  'Other'
]

export const degreeTypes = [
  'Associates',
  'Bachelors',
  'Masters',
  'Doctorate',
  'License',
  'Certificate',
  'Permit',
  'Registration'
]

export const designationType = ['receivedAt', 'receivedFrom']

export const profileLayoutTypes = ['minimal', 'premium']

export const socialMedia = [
  'linkedin',
  'youtube',
  'slack',
  'reddit',
  'discord',
  'facebook',
  'twitter',
  'instagram',
  'medium'
] as const

export const additionalLinksType = [
  'article',
  'audio',
  'video',
  'website',
  'file'
] as const

export const businessGoalsStatus = ['Active', 'Achieved']

export const businessNeedsStatus = ['Active', 'Filled']

export const servicesTypes = ['featured', 'main']

export const templateIds = ['DEFAULT', 'FULL']

export const linksTypes = [
  'requested',
  'accepted',
  'declined',
  'blocked'
] as const

export const sharedContactStatus = ['requested', 'saved', 'archived']

export const searchTypeEnum = ['name', 'profTitle', 'tags', 'company', 'location']

export const searchTypeContactEnum = ['name', 'company', 'location']
