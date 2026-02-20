const mineflayer = require('mineflayer')

// Suppress punycode deprecation warning (harmless but noisy in recent Node versions)
process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return // ignore punycode warning
  }
  console.warn(warning) // log other warnings
})

// ---------------------
// CONFIG - FILLED WITH YOUR SERVER
// ---------------------
const CONFIG = {
  host: 'noblockcg.aternos.me',   // Your Aternos server address
  port: 55696,                    // Your custom port
  username: 'BoyLinh',          // Change this to whatever name you want
  version: false,                 // false = auto-detect (recommended for Aternos)
  auth: 'offline'                 // Most Aternos servers use offline/cracked mode
}

// ---------------------
// BOT CREATION FUNCTION (supports reconnect)
// ---------------------
function createBotInstance() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: CONFIG.auth
  })

  // ---------------------
  // EVENTS
  // ---------------------
  bot.once('spawn', () => {
    console.log(`Bot ${bot.username} joined the server!`)
    bot.chat('hello puk ah ach.')
  })

  bot.on('chat', (username, message) => {
    if (username === bot.username) return // ignore self

    console.log(`[${username}] ${message}`)

    if (message.toLowerCase() === 'hi') {
      bot.chat(`Hi ${username}! mea hg`)
    } else if (message.toLowerCase().includes('follow')) {
      bot.chat('anh tv hx')
    }
  })

  bot.on('kicked', (reason) => {
    console.log(`Kicked from server: ${reason}`)
  })

  bot.on('error', (err) => {
    console.log(`Error: ${err}`)
  })

  bot.on('end', (reason) => {
    console.log(`Disconnected: ${reason || 'unknown reason'}`)

    // Auto-reconnect after 5 seconds
    setTimeout(() => {
      console.log('Attempting to reconnect in 5 seconds...')
      createBotInstance() // create fresh bot instance
    }, 5000)
  })

  return bot
}

// Start the bot
console.log('Starting bot...')
createBotInstance()