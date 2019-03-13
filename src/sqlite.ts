import * as bcrypt from 'bcrypt'
import Database from 'better-sqlite3'

const filename = 'db/hoge.sqlite3' // TODO
const db = new Database(filename)

const saltRounds = 10

export const login = async (username: string, password: string) => {
  const stmt = db.prepare('SELECT * FROM users where username=@username')
  const row = stmt.get({ username })
  if (!row) return null
  const isAuthed = await bcrypt.compare(password, row.password)
  if (isAuthed) {
    return {
      username: row.username,
      isMailAuthed: row.is_mail_authed,
    }
  }
  return null
}

export const getUser = (username: string) => {
  const stmt = db.prepare(
    'SELECT username, is_mail_authed FROM users where username=@username',
  )
  const row = stmt.get({ username })
  return row
}

export const createUser = async (username: string, password: string) => {
  const stmt = db.prepare('insert into users values (@username, @password, 0);')
  const hash = await bcrypt.hash(password, saltRounds)
  const info = stmt.run({ username, password: hash })
  return info
}

export const authenticateMail = async (username: string) => {
  const stmt = db.prepare(
    'update users set is_mail_authed=1 where username=@username;',
  )
  const info = stmt.run({ username })
  return info
}
