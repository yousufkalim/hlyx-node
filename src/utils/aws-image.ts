import AWS from 'aws-sdk'
import { config } from '../config/env.config.validations'

const s3 = new AWS.S3({
  accessKeyId: config.get('aws_access_key_id'),
  secretAccessKey: config.get('aws_secret_access_key')
})

export const awsUploadFile = async (
  dataBuffer: Buffer,
  id: string,
  fileName: string,
  fileType: string
): Promise<string> => {
  // Error if not checked to be defined
  const Bucket = config.get('aws_bucket_name')
  if (Bucket === undefined) {
    return 'Bucket not found in env, should never be reached'
  }

  const uploadResult = await s3
    .upload({
      Bucket,
      Body: dataBuffer,
      Key: `${id}-${fileName}`,
      ContentType: fileType,
      ACL: 'public-read'
    })
    .promise()

  return uploadResult.Location
}
