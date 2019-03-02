import { createTransport } from 'nodemailer'

const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASSWORD,
  },
}
const transporter = createTransport(smtpConfig)

export async function sendMail(address: string) {
  const mailOptions = {
    to: address,
    subject: 'メール確認だぜ',
    text: 'やっほー',
  }
  const info = await transporter.sendMail(mailOptions)
  return info
}
