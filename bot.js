const mineflayer = require('mineflayer')

// Suppress annoying punycode deprecation warning
process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return
  }
  console.warn(warning)
})

// ---------------------
// CONFIG - CHANGE VERSION TO MATCH YOUR ATERNOS SERVER
// ---------------------
const CONFIG = {
  host: 'noblockcg.aternos.me',
  port: 55696,
  username: 'MyCoolBot',          // Change to any name you like
  version: '1.21',                // ← VERY IMPORTANT: set exact version, e.g. '1.20.4', '1.21.1', '1.20.6'
  auth: 'offline'                 // 'offline' = cracked, 'microsoft' = premium account
}

// ---------------------
// BOT CREATION & RECONNECT LOGIC
// ---------------------
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

function createBotInstance() {
  console.log(`Creating bot instance (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`)

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: CONFIG.auth,
    keepAlive: true,
    checkTimeoutInterval: 60000,   // 60 seconds
    connectTimeout: 30000          // 30 seconds to connect
  })

  // ---------------------
  // EVENTS
  // ---------------------
  bot.once('spawn', () => {
    console.log(`Bot ${bot.username} successfully joined the server!`)
    bot.chat('Hello from my bot! 👋 I am online now.')
    reconnectAttempts = 0 // reset counter on success
  })

  // Chat event with try-catch to prevent crash on bad chat packets
  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    try {
      console.log(`[${username}] ${message}`)

      if (message.toLowerCase() === 'hi') {
        bot.chat(`Hi ${username}! How's it going?`)
      } else if (message.toLowerCase().includes('follow')) {
        bot.chat('Coming to follow you! (pathfinder can be added later)')
      }
    } catch (err) {
      console.error('Chat event error (ignored bad packet):', err.message)
    }
  })

  bot.on('kicked', (reason) => {
    console.log(`Kicked from server: ${JSON.stringify(reason)}`)
  })

  bot.on('error', (err) => {
    console.error('Bot error:', err.message, err.stack || '')
  })

  bot.on('end', (reason) => {
    console.log(`Disconnected: ${reason || 'unknown reason'}`)

    reconnectAttempts++
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log(`Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping.`)
      return
    }

    setTimeout(() => {
      console.log(`Reconnecting in 5 seconds...`)
      createBotInstance()
    }, 5000)
  })

  return bot
}

// Start everything
console.log('Minecraft bot process starting...')
createBotInstance()
