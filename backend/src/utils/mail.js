import nodemailer from 'nodemailer'
import { mailGenerator } from './mailgen.config.js'

// ── Transporter ────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,    // smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,                  // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,  // Gmail App Password
  },
})

// Verify SMTP connection in non-production environments only
if (process.env.NODE_ENV !== 'production') {
  transporter.verify((err) => {
    if (err) console.error('SMTP error:', err)
    else console.log('SMTP ready ✉️')
  })
}

// ── Verification Email ──────────────────────────────────────────────────────
export const sendVerificationEmail = async (user, verifyToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`

  const emailBody = mailGenerator.generate({
    body: {
      name: user.fullname || user.username,
      intro: 'Welcome to Project Camp! Please verify your email.',
      action: {
        instructions: 'Click the button below to verify your email address:',
        button: {
          color: '#0058be',
          text: 'Verify Email',
          link: verifyUrl,
        },
      },
      outro: 'If you did not create an account, ignore this email.',
    },
  })

  const emailText = mailGenerator.generatePlaintext({
    body: {
      name: user.fullname || user.username,
      intro: 'Welcome to Project Camp! Please verify your email.',
      action: {
        instructions: 'Visit this link to verify your email:',
        button: { text: 'Verify Email', link: verifyUrl },
      },
      outro: 'If you did not create an account, ignore this email.',
    },
  })

  await transporter.sendMail({
    from: `"Project Camp" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Verify your Project Camp account',
    html: emailBody,
    text: emailText,
  })
}

// ── Password Reset Email ────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

  const emailBody = mailGenerator.generate({
    body: {
      name: user.fullname || user.username,
      intro: 'You requested a password reset for your Project Camp account.',
      action: {
        instructions: 'Click the button below to reset your password. This link expires in 20 minutes.',
        button: {
          color: '#ba1a1a',
          text: 'Reset Password',
          link: resetUrl,
        },
      },
      outro: 'If you did not request this, ignore this email. Your password will not change.',
    },
  })

  const emailText = mailGenerator.generatePlaintext({
    body: {
      name: user.fullname || user.username,
      intro: 'You requested a password reset for your Project Camp account.',
      action: {
        instructions: 'Visit this link to reset your password. This link expires in 20 minutes:',
        button: { text: 'Reset Password', link: resetUrl },
      },
      outro: 'If you did not request this, ignore this email. Your password will not change.',
    },
  })

  await transporter.sendMail({
    from: `"Project Camp" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Reset your Project Camp password',
    html: emailBody,
    text: emailText,
  })
}

// ── Project Invite Email ────────────────────────────────────────────────────
export const sendProjectInviteEmail = async (invitee, project, invitedBy) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`

  const emailBody = mailGenerator.generate({
    body: {
      name: invitee.fullname || invitee.username || invitee.email,
      intro: `${invitedBy.fullname || invitedBy.username} has added you to the project "${project.name}" on Project Camp.`,
      action: {
        instructions: 'Click below to view the project:',
        button: {
          color: '#0058be',
          text: 'Open Project',
          link: loginUrl,
        },
      },
      outro: 'You can manage your notification preferences in settings.',
    },
  })

  const emailText = mailGenerator.generatePlaintext({
    body: {
      name: invitee.fullname || invitee.username || invitee.email,
      intro: `${invitedBy.fullname || invitedBy.username} has added you to the project "${project.name}" on Project Camp.`,
      action: {
        instructions: 'Visit this link to view the project:',
        button: { text: 'Open Project', link: loginUrl },
      },
      outro: 'You can manage your notification preferences in settings.',
    },
  })

  await transporter.sendMail({
    from: `"Project Camp" <${process.env.SMTP_USER}>`,
    to: invitee.email,
    subject: `You've been added to "${project.name}"`,
    html: emailBody,
    text: emailText,
  })
}
