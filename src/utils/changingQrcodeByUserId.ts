import { db } from './db'
import { awsUploadFile } from './aws-image'
import QRCode from 'qrcode'

const main = async (): Promise<void> => {
  const jamesCards = await db.card.findMany({
    where: {
      userId: '550c01cb-8b96-4b70-82ed-0f3103308030'
    },
    select: {
      cardId: true
    }
  })

  for (const card of jamesCards) {
    const cardId = card.cardId
    // Create QR Code and Add
    const urlRoute = 'https://dev.hlyx.me/pl/' + cardId
    const bufferImage = await QRCode.toBuffer(urlRoute, {
      type: 'png',
      width: 200,
      errorCorrectionLevel: 'H'
    })
    const qrCodeImage = await awsUploadFile(bufferImage, cardId, 'qrcode', '', 'image/png')

    await db.card.update({
      where: {
        cardId
      },
      data: {
        qrCodeImage
      }
    })
  }
}

main().then(async () => {
  await db.$disconnect()
}).catch(async (error: any) => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
