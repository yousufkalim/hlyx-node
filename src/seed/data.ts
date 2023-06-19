import fs from 'fs/promises'
import { parse } from 'csv-parse/sync'

import { socialMedia, additionalLinksType, emailTypes, phoneTypes, linksTypes } from '../config/enumTypes'

interface seedData {
  emails: string[]
  passwords: string[]
  phones: string[]
  firstNames: string[]
  lastNames: string[]
  companies: string[]
  professionalTitles: string[]
  industries: string[]
  occupations: string[]
  cities: string[]
  states: string[]
  zipcodes: string[]
}

interface cardSeedData {
  cardEmails: IEmail[][]
  cardPhones: IPhone[][]
  cardCalendars: ICalendar[][]
  cardWebsites: IWebsite[][]
  cardLocations: ILocations[][]
  cardPlatforms: IPlatforms[][]
  cardLinks: ILinks[][]
}

interface IEmail {
  email: string
  type: string
}

interface IPhone {
  phone: string
  type: typeof phoneTypes[number]
}

interface ICalendar {
  title: string
  url: string
}

interface IWebsite {
  url: string
  description: string
}

interface ILocations {
  label: string
  streetAddress: string
  city: string
  state: string
  zipcode: string
}

interface IPlatforms {
  platform: typeof socialMedia[number]
  profileUrl: string
  label: string
}

interface ILinks {
  url: string
  title: string
  typeContent: typeof additionalLinksType[number]
}

export const generateData = async (): Promise<seedData> => {
  // Emails
  const emails = parse(await fs.readFile('./src/seed/dataCSVs/emails.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Passwords
  const passwords = parse(await fs.readFile('./src/seed/dataCSVs/passwords.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Phones
  const phones = parse(await fs.readFile('./src/seed/dataCSVs/phones.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // First Names
  const firstNames = parse(await fs.readFile('./src/seed/dataCSVs/firstNames.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Last Names
  const lastNames = parse(await fs.readFile('./src/seed/dataCSVs/lastNames.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Companies
  const companies = parse(await fs.readFile('./src/seed/dataCSVs/companies.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Professional Title
  const professionalTitles = parse(await fs.readFile('./src/seed/dataCSVs/professionalTitles.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Industries
  const industries = parse(await fs.readFile('./src/seed/dataCSVs/industries.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Occupations
  const occupations = parse(await fs.readFile('./src/seed/dataCSVs/occupations.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Websites
  const websites = parse(await fs.readFile('./src/seed/dataCSVs/websites.csv'), {
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

  // States
  const states = parse(await fs.readFile('./src/seed/dataCSVs/states.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  // Zipcodes
  const zipcodes = parse(await fs.readFile('./src/seed/dataCSVs/zipcodes.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  const data = {
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
  }

  return data
}

export const generateCardData = async (data: seedData, seedLength: number): Promise<cardSeedData> => {
  const randomWords = parse(await fs.readFile('./src/seed/dataCSVs/randomWords.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  const cardEmails: IEmail[][] = []
  let placeInCsvEmail = 0
  const emails = parse(await fs.readFile('./src/seed/dataCSVs/cardEmails.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  const cardPhones: IPhone[][] = []
  let placeInCsvPhone = 0
  const phones = parse(await fs.readFile('./src/seed/dataCSVs/cardPhones.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  const cardCalendars: ICalendar[][] = []
  let placeInCsvCalendar = 0
  const calendars = parse(await fs.readFile('./src/seed/dataCSVs/cardCalendars.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  const cardWebsites: IWebsite[][] = []
  let placeInCsvWebsites = 0
  const websites = parse(await fs.readFile('./src/seed/dataCSVs/cardWebsites.csv'), {
    columns: false,
    skip_empty_lines: true,
    trim: true
  })

  const cardLocations: ILocations[][] = []
  let placeInCsvLocations = 0
  const locations = parse(await fs.readFile('./src/seed/dataCSVs/cardLocations.csv'), {
    skip_empty_lines: true,
    trim: true
  })

  const cardPlatforms: IPlatforms[][] = []

  const cardLinks: ILinks[][] = []

  for (let i = 0; i < seedLength; i++) {
    // Card Email
    const emailRandomNumber = getRandomInt(4)
    const emailArray: IEmail[] = []

    let emailIterator = 0
    for (; emailIterator < emailRandomNumber; emailIterator++) {
      emailArray.push({
        email: emails[placeInCsvEmail + emailIterator][0],
        type: getRandomEmailType(emailTypes)
      })
    }
    cardEmails.push(emailArray)
    placeInCsvEmail += emailIterator

    // Card Phones
    const phoneRandomNumber = getRandomInt(4)
    const phoneArray: IPhone[] = []

    let phoneIterator = 0
    for (; phoneIterator < phoneRandomNumber; phoneIterator++) {
      phoneArray.push({
        phone: phones[placeInCsvPhone + phoneIterator][0],
        type: getRandomPhoneType(phoneTypes)
      })
    }
    cardPhones.push(phoneArray)
    placeInCsvPhone += phoneIterator

    // Card Calendars
    const calendarRandomNumber = getRandomInt(4)
    const calendarArray: ICalendar[] = []

    let calendarIterator = 0
    for (; calendarIterator < calendarRandomNumber; calendarIterator++) {
      calendarArray.push({
        url: calendars[placeInCsvCalendar + calendarIterator][0],
        title: getRandomWord(randomWords)
      })
    }
    cardCalendars.push(calendarArray)
    placeInCsvCalendar += calendarIterator

    // Card Websites
    const websitesRandomNumber = getRandomInt(4)
    const websitesArray: IWebsite[] = []

    let websitesIterator = 0
    for (; websitesIterator < websitesRandomNumber; websitesIterator++) {
      websitesArray.push({
        url: websites[placeInCsvWebsites + websitesIterator][0],
        description: getRandomWord(randomWords)
      })
    }
    cardWebsites.push(websitesArray)
    placeInCsvWebsites += websitesIterator

    // Card Locations
    const locationsRandomNumber = getRandomInt(4)
    const locationsArray: ILocations[] = []

    let locationsIterator = 0
    for (; locationsIterator < locationsRandomNumber; locationsIterator++) {
      locationsArray.push({
        label: locations[placeInCsvLocations + locationsIterator][0],
        streetAddress: locations[placeInCsvLocations + locationsIterator][1],
        city: locations[placeInCsvLocations + locationsIterator][2],
        state: locations[placeInCsvLocations + locationsIterator][3],
        zipcode: locations[placeInCsvLocations + locationsIterator][4]
      })
    }
    cardLocations.push(locationsArray)
    placeInCsvLocations += locationsIterator

    // Card Social Platforms
    const platformRandomNumber = getRandomInt(4)
    const platformArray: IPlatforms[] = []

    for (let platformIterator = 0; platformIterator < platformRandomNumber; platformIterator++) {
      const platform = getRandomSocial(socialMedia)
      platformArray.push({
        platform,
        profileUrl: `https://${platform}.com${getRandomWord(randomWords)}`,
        label: getRandomWord(randomWords)
      })
    }
    cardPlatforms.push(platformArray)

    // Card Additional Links
    const linkRandomNumber = getRandomInt(4)
    const linkArray: ILinks[] = []

    for (let linkIterator = 0; linkIterator < linkRandomNumber; linkIterator++) {
      linkArray.push({
        url: `https://${getRandomWord(randomWords)}.com`,
        title: getRandomWord(randomWords),
        typeContent: getRandomLinkType(additionalLinksType)
      })
    }
    cardLinks.push(linkArray)
  }

  const cardSeedData = {
    cardEmails,
    cardPhones,
    cardCalendars,
    cardWebsites,
    cardLocations,
    cardPlatforms,
    cardLinks
  }

  return cardSeedData
}

// Return an interger from 1 to max (inclusive)
const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max) + 1
}

const getRandomWord = (words: string[]): string => {
  return words[Math.floor(Math.random() * words.length)][0]
}

const getRandomEmailType = (words: typeof emailTypes): typeof emailTypes[number] => {
  return words[Math.floor(Math.random() * words.length)]
}

const getRandomPhoneType = (words: typeof phoneTypes): typeof phoneTypes[number] => {
  return words[Math.floor(Math.random() * words.length)]
}

const getRandomSocial = (words: typeof socialMedia): typeof socialMedia[number] => {
  return words[Math.floor(Math.random() * words.length)]
}

const getRandomLinkType = (words: typeof additionalLinksType): typeof additionalLinksType[number] => {
  return words[Math.floor(Math.random() * words.length)]
}

export const getRandomLinkStatus = (): typeof linksTypes[number] => {
  return linksTypes[Math.floor(Math.random() * linksTypes.length)]
}
