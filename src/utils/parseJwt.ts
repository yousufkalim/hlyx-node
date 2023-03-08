export const parseJwt = (token: any): any => {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}
