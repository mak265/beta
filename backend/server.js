import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import helmet from 'helmet'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false)
app.use(helmet())
app.use(cors({ origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:9000').split(',').map(x => x.trim()) }))
app.use(express.json({ limit: '10kb' }))

const betaSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  religionPreference: { type: String, required: true },
  preferredAgeMin: { type: Number, required: true },
  preferredAgeMax: { type: Number, required: true },
  relationshipGoal: { type: String, required: true },
  adultConfirmed: { type: Boolean, required: true },
  emailConsent: { type: Boolean, required: true },
  sensitivePreferenceConsent: { type: Boolean, required: true },
  status: { type: String, default: 'waitlisted' },
  premiumRewardMonths: { type: Number, default: 1 },
  premiumRewardStatus: { type: String, default: 'pending' },
  premiumActivatedAt: { type: Date, default: null },
  premiumExpiresAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false })
const BetaSignup = mongoose.model('BetaSignup', betaSchema)
const religions = new Set(['Any religion', 'Catholic', 'Iglesia Ni Cristo', 'Other Christian', 'Islam', 'Other', 'Prefer not to say'])
const goals = new Set(['Serious relationship', 'Casual dating', 'Friendship first'])
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false })
app.post('/api/beta/register', limiter, async (req, res) => {
  const b = req.body || {}
  const name = typeof b.name === 'string' ? b.name.trim() : ''
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : ''
  const min = b.preferredAgeMin
  const max = b.preferredAgeMax
  if (name.length < 2 || name.length > 80 || email.length > 254 || !emailPattern.test(email) ||
      !religions.has(b.religionPreference) || !goals.has(b.relationshipGoal) ||
      !Number.isInteger(min) || !Number.isInteger(max) || min < 18 || max > 60 || min > max ||
      b.adultConfirmed !== true || b.emailConsent !== true || b.sensitivePreferenceConsent !== true) {
    return res.status(400).json({ message: 'Please complete all required fields and consents correctly.' })
  }
  try {
    await BetaSignup.create({ name, email, religionPreference: b.religionPreference,
      preferredAgeMin: min, preferredAgeMax: max, relationshipGoal: b.relationshipGoal,
      adultConfirmed: true, emailConsent: true, sensitivePreferenceConsent: true })
    return res.status(201).json({ message: 'You joined the AURA beta waitlist!' })
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'This email is already on the waitlist.' })
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Unable to register right now.' })
  }
})
app.get('/api/health', (_req, res) => res.json({ ok: true }))
const port = Number(process.env.PORT || 3000)
try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')
  await mongoose.connect(process.env.MONGODB_URI)
  await BetaSignup.init()
  app.listen(port, () => console.log(`AURA Beta API listening on ${port}`))
} catch (err) { console.error('Startup failed:', err); process.exit(1) }
