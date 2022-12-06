class BaseController {
  filterParams = (params: any, whitelist: string[]): any => {
    const filtered: any = {}
    for (const key in params) {
      if (whitelist.includes(key)) {
        filtered[key] = params[key]
      }
    }
    return filtered
  }
}

export default BaseController
