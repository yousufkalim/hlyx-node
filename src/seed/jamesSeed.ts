import fs from 'fs/promises'
import { parse } from 'csv-parse/sync'

import { db } from '../utils/db'

const jamesSeedLinks = async (): Promise<void> => {
  // Base info
  const jamesCardId = '345b8bed-55eb-4cf9-925e-263f7540ae5e'
  const numberOfLinks = 24

  // Emails
  const emails = parse(await fs.readFile('./src/seed/dataCSVs/emails.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Cities
  const cities = parse(await fs.readFile('./src/seed/dataCSVs/cities.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Events
  const events = parse(await fs.readFile('./src/seed/dataCSVs/events.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Photos
  const photos = parse(await fs.readFile('./src/seed/dataCSVs/customImages.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Loop
  for (let i = 0; i < numberOfLinks; i++) {
    // Update Images and getCardId
    const userId = await db.userAuth.findUnique({
      where: {
        email: emails[i][0]
      },
      select: {
        id: true
      }
    })

    const getCardId = await db.userBio.update({
      where: {
        id: userId?.id
      },
      data: {
        profileAvatar: photos[i][0]
      },
      select: {
        cards: {
          select: {
            cardId: true
          }
        }
      }
    })

    const cardId = getCardId?.cards[0].cardId
    if (!cardId) {
      console.log(emails[i][0])
      console.log('CardID failure somehow')
      return
    }

    // Add link
    await db.card.update({
      where: {
        cardId: jamesCardId
      },
      data: {
        Links: {
          create: {
            cardTwo: cardId,
            status: 'accepted',
            recentChangeBy: jamesCardId,
            metAt: cities[i][0],
            event: events[i][0]
          }
        }
      }
    })
  }
}

jamesSeedLinks().then(async () => {
  await db.$disconnect()
}).catch(async (error: any) => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
