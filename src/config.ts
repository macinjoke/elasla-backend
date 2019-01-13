import _config from 'config'

interface Config {
  secretKey: string
}

const config: Config = {
  secretKey: _config.get('secretKey'),
}

export default config
