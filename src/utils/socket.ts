import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.config.validations'
// import { IMessage } from '../config/interfaces/groupMessage.interface'

const io = new Server()

let socket: any

io.on('connection', (socketInstance) => {
  console.log('Connect socketInstance', socketInstance.id)
  console.log('Connect Rooms', socketInstance.rooms)
  // conection response
  socketInstance.emit('message', { message: 'Hello from socketInstance' })

  // auth middlewere
  socketInstance.use(([_event, ...args], next) => {
    if (isUnAuthorized(socketInstance)) next()
  })

  socket = socketInstance

  // Listen message
  socketInstance.on('message', (data: any) => {
    console.log('Group message ', data)
  })

  setInterval(() => {
    socketInstance.emit('notifications', {
      message: `Hello clients - ${new Date().toString()}`
    })
  }, 5000)
})

export const getSocket = (): Socket | null => {
  if (!socket) {
    return null
  }

  return socket
}

export default io

const isUnAuthorized = (socket: Socket): boolean => {
  try {
    const { headers } = socket.handshake
    const token = String(headers.Authorization ?? headers.authorization)

    if (!token) {
      throw new Error('No token found, Authorization denied')
    }

    const { user } = jwt.verify(token, config.get('jwt_secret_key') as string) as jwt.JwtPayload // This only validate JWT with secret
    socket.data = { user }
    return true
  } catch (error: any) {
    socket.emit('error', {
      traceId: new Date().getTime(),
      event: 'authorization',
      title: error.name || 'Auth error',
      message: error.message,
      success: false
    })
    setTimeout(() => socket.disconnect(true), 3000) // Give time to receive the event on client-side
    return false
  }
}
