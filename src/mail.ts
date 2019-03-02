import { createTransport } from 'nodemailer'

const smtpConfig = {
  host: process.env.SMTP_DOMAIN,
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASSWORD,
  },
}
const transporter = createTransport(smtpConfig)

export async function sendMail(username: string) {
  const mailOptions = {
    to: `${username}@${process.env.CUSTOMER_DOMAIN}`,
    subject: 'メール確認だぜ',
    text: 'やっほー',
  }
  const info = await transporter.sendMail(mailOptions)
  return info
}