import fs from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { db } from '../utils/db'
import { seedData } from './seed'

// Clear database then recall seed database

// Emails
const reSeedDatabase = async (): Promise<void> => {
  try {
    const emails = parse(await fs.readFile('./src/seed/dataCSVs/emails.csv'), {
      columns: false,
      skip_empty_lines: true,
      trim: true
    })

    emails.forEach(async (email: string) => {
      await db.userAuth.delete({ where: { email } })
    })

    await seedData()
  } catch (error: any) {
    console.error(error)
  }
}

reSeedDatabase().then(async () => {
  await db.$disconnect()
}).catch(async (error: any) => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
