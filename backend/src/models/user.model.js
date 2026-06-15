import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const userSchema = new Schema(
  {
    avatar: {
      url: {
        type: String,
        default: 'https://placehold.co/200x200/png?text=No+Image',
      },
      localPath: {
        type: String,
        default: '',
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgetpasswordToken: {
      type: String,
    },
    forgetpasswordTokenExpiration: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpiration: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// ── Instance Methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  )
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  )
}

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString('hex')
  const hashedToken = crypto
    .createHash('sha256')
    .update(unHashedToken)
    .digest('hex')
  const tokenExpiry = Date.now() + 20 * 60 * 1000 // 20 mins
  return { unHashedToken, hashedToken, tokenExpiry }
}

// ── Strip sensitive fields from JSON responses ────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  obj.id = obj._id ? obj._id.toString() : obj.id
  obj.name = obj.fullname || obj.username
  if (obj.avatar) {
    obj.avatarUrl = obj.avatar.url
  }
  delete obj.password
  delete obj.refreshToken
  delete obj.emailVerificationToken
  delete obj.forgetpasswordToken
  return obj
}

// ── Safe export pattern (prevents model re-registration in hot-reload) ────────
export const User =
  mongoose.models.User || mongoose.model('User', userSchema)
