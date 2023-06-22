import bcrypt from 'bcrypt'

import { db } from '../utils/db'
import { generateData, generateCardData, getRandomLinkStatus, generateDummyImage } from './data'

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
      websites,
      cities,
      states,
      zipcodes
    } = data

    const cardData = await generateCardData(data, numberOfSeeds)

    const salt = await bcrypt.genSalt(10)

    const createdCardIds: string[] = []
    for (let i = 0; i < numberOfSeeds; i++) {
      const user = await db.userAuth.create({
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
              website: websites[i][0],
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
                  coverPhoto: generateDummyImage('200', '200'),
                  brandedCoverPhoto: generateDummyImage('300', '300'),
                  headerPhoto: generateDummyImage('100', '100'),
                  companyIcon: generateDummyImage('50', '50'),
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
        },
        select: {
          userBio: {
            select: {
              cards: {
                select: {
                  cardId: true
                },
                take: 1
              }
            }
          }
        }
      })
      const newestCard = user.userBio?.cards[0].cardId
      if (newestCard) {
        for (const card of createdCardIds) {
          await db.link.create({
            data: {
              cardOne: newestCard,
              cardTwo: card,
              status: getRandomLinkStatus(),
              recentChangeBy: newestCard
            }
          })
        }
        createdCardIds.push(newestCard)
      }
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
