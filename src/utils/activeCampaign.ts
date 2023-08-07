import axios from 'axios'
import { config } from '../config/env.config.validations'

export const createActiveCampaignContact = async (
  email: string,
  fname: string,
  lname: string,
  list: string,
  status: boolean
): Promise<boolean> => {
  const API_URL = config.get('active_campagin_url')
  const API_KEY = config.get('active_campagin_key')
  const enterContactUrl = `${API_URL}admin/api.php?api_key=${API_KEY}&api_action=contact_sync&api_output=json`

  let listNumber: number
  switch (list) {
    case 'Investor':
      listNumber = 4
      break
    case 'Early Bird':
      listNumber = 5
      break
    case 'Beta User':
      listNumber = 6
      break
    default:
      return false
  }

  const data = {
    email,
    first_name: fname,
    last_name: lname,
    'p[3]': listNumber,
    'status[3]': status ? 1 : 2
  }

  try {
    const response = await axios({
      method: 'post',
      url: enterContactUrl,
      data
    })
    console.log(response)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
