import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

import router from './routes'
import { config } from './config/env.config.validations'
import fileUpload from 'express-fileupload'

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(fileUpload())
app.use('/api/v1', router)

app.listen(config.get('port'), () =>
  console.log(`Database connected and Server is running on http://localhost:${config.get('port')}`)
)
