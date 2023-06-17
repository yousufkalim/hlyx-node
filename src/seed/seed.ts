import bcrypt from 'bcrypt'

import { db } from '../utils/db'
import { generateData, generateCardData } from './data'

const main = async (): Promise<void> => {
  try {
    const numberOfSeeds = 100

    const data = await generateData()
    const {
      emails,
      passwords,
      phones,
      firstNames,
      lastNames,
      companies,
      professionalTitles,
      industries,
      occupations,
      cities,
      states,
      zipcodes
    } = data

    const cardData = await generateCardData(data, numberOfSeeds)

    const salt = await bcrypt.genSalt(10)

    for (let i = 0; i < numberOfSeeds; i++) {
      await db.userAuth.create({
        data: {
          email: emails[i][0],
          password: await bcrypt.hash(passwords[i][0], salt),
          phone: phones[i][0],
          isEmailVerified: true,
          isPhoneVerified: true,
          userBio: {
            create: {
              isOnBoardingComplete: true,
              firstName: firstNames[i][0],
              lastName: lastNames[i][0],
              userName: `${firstNames[i][0]}-${lastNames[i][0]}-${i}`,
              company: companies[i][0],
              profTitle: professionalTitles[i][0],
              industry: industries[i][0],
              profRole: occupations[i % occupations.length][0],
              country: 'Unites States',
              city: cities[i][0],
              state: states[i][0],
              zipcode: zipcodes[i][0],
              cards: {
                create: {
                  profileLayout: 'minimal',
                  cardName: `${firstNames[i][0]}'s Card`,
                  fullName: `${firstNames[i][0]} ${lastNames[i][0]}`,
                  profTitle: professionalTitles[i][0],
                  company: companies[i][0],
                  occupation: occupations[i % occupations.length][0],
                  industry: industries[i][0],
                  city: cities[i][0],
                  state: states[i][0],
                  emails: {
                    create: cardData.cardEmails[i]
                  },
                  phones: {
                    create: cardData.cardPhones[i]
                  },
                  calendars: {
                    create: cardData.cardCalendars[i]
                  },
                  websites: {
                    create: cardData.cardWebsites[i]
                  },
                  officeAddresses: {
                    create: cardData.cardLocations[i]
                  },
                  socialMedias: {
                    create: cardData.cardPlatforms[i]
                  },
                  additionalLinks: {
                    create: cardData.cardLinks[i]
                  }
                }
              }
            }
          },
          userPreference: { create: {} },
          userNotification: { create: {} }
        }
      })
    }
  } catch (error: any) {
    console.error(error)
  }
}

main().then(async () => {
  await db.$disconnect()
}).catch(async (error: any) => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
