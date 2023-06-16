import fs from 'fs/promises'
import { parse } from 'csv-parse/sync'

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
