import { sign } from 'jsonwebtoken'
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

function generateExpiration(): number {
  if (!process.env.MAIL_EXPIRATION_TIME) {
    throw Error('set MAIL_EXPIRATION_TIME environment variable')
  } // TODO よく考えるといちいち値がセットされているかをこういう場所でチェックすんのだるい
  return (
    Math.floor(Date.now() / 1000) +
    (Number(process.env.MAIL_EXPIRATION_TIME) || 0)
  )
}

export async function sendMail(username: string) {
  const jwt = sign(
    {
      username,
      sub: 'email',
      exp: generateExpiration(),
    },
    process.env.JWT_SECRET_KEY || '',
  )

  const mailOptions = {
    to: `${username}@${process.env.CUSTOMER_DOMAIN}`,
    subject: '【 elasla 】メールを確認して本登録してください',
    text: `
elasla 仮登録が完了しました。
以下のリンクをクリックして elasla の本登録をしてください
http://${process.env.HOST}:${process.env.PORT}/api/register?token=${jwt}
`,
  }
  const info = await transporter.sendMail(mailOptions)
  return info
}
