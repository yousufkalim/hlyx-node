import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import http from 'http'

import router from './routes'
import { config } from './config/env.config.validations'
import fileUpload from 'express-fileupload'
import socket from './utils/socket'

const app = express()

// attach socket server to http server
const server = http.createServer(app)
socket.attach(server, {
  cors: {
    origin: '*'
  }
})

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(fileUpload())
app.use('/api/v1', router)

server.listen(config.get('port'), () =>
  console.log(`Database connected and Server is running on http://localhost:${config.get('port')}`)
)
