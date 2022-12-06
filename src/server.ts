import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { connect } from 'mongoose'

import router from './routes'
import { config } from './config/env.config.validations'

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use('/api/v1', router)
// mongoose.set('strictQuery', true)

connect(config.get('db') as string)
  .then(() => app.listen(config.get('port'), () => console.log(`Database connected and Server is running on http://localhost:${config.get('port')}`)))
  .catch((error: any) => {
    console.error(error)
    throw error
  })
