export const authControllerParams = ['email', 'password', 'code', 'phone', 'accessToken', 'id']

export const userControllerParams = [
  'firstName',
  'middleInitial',
  'lastName',
  'company',
  'profTitle',
  'industry',
  'profRole',
  'website',
  'country',
  'city',
  'state',
  'zipcode'
]

export const userPreferenceParams = [
  'twoFactorAuth',
  'allCardsPrivate',
  'connectionViaProfileLink',
  'connectionViaQRCode',
  'connectionViaPerson',
  'connectionViaContacts',
  'personFilter'
]

export const userNotificationParams = [
  'newLinkRequest',
  'newMessage',
  'groupMessages',
  'profileShare',
  'acceptedLinkRequest',
  'accountSecurity'
]

export const cardControllerParams = [
  'cardName',
  'fullName',
  'profileLayout',
  'isPrivate',
  'coverPhoto',
  'emails',
  'phones',
  'calendars',
  'officeAddresses',
  'websites',
  'country',
  'city',
  'state',
  'streetAddress',
  'zipcode',
  'socialMedias',
  'additionalLinks',
  'about',
  'company',
  'profTitle',
  'occupation',
  'industry',
  'educationLevel',
  'schoolName',
  'academicFocus',
  'degreeType',
  'accolades',
  'achievements',
  'businessGoals',
  'needsAsks',
  'hobbies',
  'interests',
  'skills',
  'motto',
  'services',
  'portfolio',
  'allPhotos',
  'companyIcon',
  'templateId'
]

export const cardContactPageParams = [
  'headerPhoto',
  'emails',
  'phones',
  'calendar',
  'websites',
  'country',
  'city',
  'state',
  'streetAddress',
  'zipcode',
  'socialMedias',
  'additionalLinks'
]

export const cardAboutPageParams = [
  'about',
  'company',
  'profTitle',
  'occupation',
  'industry',
  'education',
  'accolades',
  'achievements',
  'businessGoals',
  'businessNeeds',
  'hobbies',
  'interests',
  'skills',
  'motto'
]

export const linkControllerParams = ['cardOne', 'cardTwo', 'status', 'message', 'note']

export const sharedContactControllerParams = [
  'cardId',
  'fullName',
  'company',
  'jobTitle',
  'phone',
  'email',
  'message',
  'location',
  'notes'
]

export const groupControllerParams = [
  'groupName',
  'isPrivate',
  'groupPhoto',
  'tags',
  'description',
  'members'
]
