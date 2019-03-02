import Database from 'better-sqlite3'

const filename = 'db/hoge.sqlite3' // TODO
const db = new Database(filename)

export const login = (username: string, password: string) => {
  const stmt = db.prepare(
    'SELECT * FROM users where username=@username and password=@password',
  )
  const row = stmt.get({ username, password }) // TODO password 暗号化
  return row
}

export const getUser = (username: string) => {
  const stmt = db.prepare('SELECT * FROM users where username=@username')
  const row = stmt.get({ username })
  return row
}

export const createUser = (username: string, password: string) => {
  const stmt = db.prepare('insert into users values (@username, @password, 0);')
  const info = stmt.run({ username, password })
  return info
}
