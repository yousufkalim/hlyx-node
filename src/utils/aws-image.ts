import AWS from 'aws-sdk'
import { config } from '../config/env.config.validations'
import { randomUUID } from 'crypto'

const s3 = new AWS.S3({
  accessKeyId: config.get('aws_access_key_id'),
  secretAccessKey: config.get('aws_secret_access_key')
})

export const awsUploadFile = async (
  dataBuffer: Buffer,
  id: string,
  classifier: string,
  fileName: string,
  fileType: string
): Promise<string> => {
  const Bucket = config.get('aws_bucket_name') as string

  const uploadResult = await s3
    .upload({
      Bucket,
      Body: dataBuffer,
      Key: `${id}-${randomUUID()}-${classifier}-${fileName}`,
      ContentType: fileType,
      ACL: 'public-read'
    })
    .promise()

  return uploadResult.Location
}
