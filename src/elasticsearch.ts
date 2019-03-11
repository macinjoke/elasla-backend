import { Client, SearchResponse } from 'elasticsearch'

export interface Source {
  type: string
  user: string // user id
  text: string
  ts: string
  '@timestamp': string
  hour_of_day: number
  day_of_week: number
  user_name: string
  channel_name: string
}

const client = new Client({
  host: `${process.env.ES_HOST}:${process.env.ES_PORT}`,
  log: 'trace',
})

export async function search(text: string) {
  const res: SearchResponse<Source> = await client.search({
    index: 'slack-*',
    type: 'slack-message',
    body: {
      query: {
        match: {
          text,
        },
      },
    },
  })
  return res
}
