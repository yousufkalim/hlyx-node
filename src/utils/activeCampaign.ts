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
  const createContactUrl = `${API_URL}/admin/api.php?api_key=${API_KEY}&api_action=contact_sync&api_output=json`

  const collectData: any = {
    email,
    first_name: fname,
    last_name: lname
  }

  switch (list) {
    case 'Investor':
      collectData['p[4]'] = 4
      collectData['status[4]'] = status ? 1 : 2
      break
    case 'Early Bird User':
      collectData['p[5]'] = 5
      collectData['status[5]'] = status ? 1 : 2
      break
    case 'Beta User':
      collectData['p[6]'] = 6
      collectData['status[6]'] = status ? 1 : 2
      break
    default:
      return false
  }

  const data = new URLSearchParams(Object.entries(collectData)).toString()

  try {
    const response = await axios({
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      url: createContactUrl,
      data
    })
    console.log(response)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
