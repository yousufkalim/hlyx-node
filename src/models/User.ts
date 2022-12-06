import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'Email is required']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: [true, 'Role is required'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

const User = model('user', userSchema)

export { User }
