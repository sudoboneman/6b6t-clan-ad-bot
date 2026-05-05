const mineflayer = require('mineflayer')

function envStr(name, defVal) {
  const v = process.env[name]
  if (v == null || v === '') return defVal
  return String(v)

}

function envInt(name, defVal) {
  const v = process.env[name]
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : defVal
}

const CONFIG = {
  host: envStr('MC_HOST', 'play.6b6t.org'),
  port: envInt('MC_PORT', 25565),
  auth: envStr('MC_AUTH', 'offline'),
  version: envStr('MC_VERSION', '1.20.1'),

  bots: [
    {
      enabled: true,
      username: envStr('MC_USERNAME_1', 'username'),
      password: envStr('MC_PASSWORD_1', 'password')
    },

    {
      enabled: false,
      username: envStr('MC_USERNAME_2', 'username'),
      password: envStr('MC_PASSWORD_2', 'password')
    }
  ],
  messageCooldownSeconds: 900,

  messages: [
    { text: 'Fuck Saturn Clan', enabled: true },
    { text: 'Fuck Saturn Clan', enabled: true },
    { text: 'Fuck Saturn Clan', enabled: true },
    { text: 'saturn.lat is next to go down', enabled: true },
    { text: 'saturn.lat is next to go down', enabled: true }
  ]
}

function nextEnabledMessage(state) {
  const msgs = CONFIG.messages
  if (!msgs.length) return null

  for (let i = 0; i < msgs.length; i++) {
    state.idx = (state.idx + 1) % msgs.length
    const m = msgs[state.idx]
    if (m && m.enabled && m.text) return m.text
  }

  return null
}

function startBot(label, cfg) {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: cfg.username,
    auth: CONFIG.auth,
    version: CONFIG.version
  })

  const msgState = { idx: -1 }
  let msgTimer = null
  let reconnectTimer = null
  let ended = false
  let hasLoggedIn = false


  function cleanupTimers() {
    if (msgTimer) clearInterval(msgTimer)
    msgTimer = null
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = null
  }


  function scheduleReconnect(why) {
    if (ended) return
    ended = true
    cleanupTimers()
    console.log(`Disconnected (${label}) - reconnecting in 5s...`, why ? `(${why})` : '')
    reconnectTimer = setTimeout(() => startBot(label, cfg), 5000)
  }

  function startMessagingLoop() {
    if (msgTimer) clearInterval(msgTimer)
    const anyEnabled = CONFIG.messages.some((m) => m && m.enabled && m.text)
    if (!anyEnabled) return

    const ms = Math.max(0, Math.round((CONFIG.messageCooldownSeconds || 0) * 1000))
    if (ms === 0) return

    msgTimer = setInterval(() => {
      const msg = nextEnabledMessage(msgState)
      if (msg) bot.chat(msg)
    }, ms)
  }

  bot.once('spawn', () => {
    console.log(`Bot spawned (${label}): ${bot.username}`)
    if (!hasLoggedIn && cfg.password) {
      setTimeout(() => {
        try {
          console.log(`➡ Sending /login (${label})`)
          bot.chat(`/login ${cfg.password}`)
        } catch (e) {}


        setTimeout(() => {
          try {
            bot.setControlState('forward', true)
            bot.setControlState('sprint', true)
            bot.setControlState('jump', true)
          } catch (e) {}



          setTimeout(() => {
            try {
              bot.clearControlStates()
            } catch (e) {}
            hasLoggedIn = true
            console.log(`Bot ready (${label})`)

          }, 7000)
        }, 3000)
      }, 1000)

    }
    startMessagingLoop()
  })

  bot.on('death', () => {
    setTimeout(() => {
      try {
        bot.chat('/respawn')
      } catch (e) {}
    }, 1000)
  })

  bot.on('kicked', (reason) => {
    console.log(`Kicked (${label}):`, reason)
    scheduleReconnect('kicked')
  })

  bot.on('error', (err) => {
    console.log(`Error (${label}):`, err && err.message ? err.message : String(err))
  })


  bot.on('end', () => {
    scheduleReconnect('end')
  })
  return bot
}

console.log('Starting bots...')
let started = 0
for (let i = 0; i < CONFIG.bots.length; i++) {
  const cfg = CONFIG.bots[i]
  if (!cfg || !cfg.enabled) continue
  started += 1
  startBot(String(i + 1), cfg)
}

if (!started) {
  console.log('No bots enabled')
}