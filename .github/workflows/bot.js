const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'noblockcg.aternos.me',  // e.g., 'localhost' for local server
  port: 55696,             // Default port
  username: 'boy linh',     // Any name (offline mode)
  version: false,          // Auto-detect (or '1.21' for specific)
  auth: 'offline'          // Explicit for offline servers
})

bot.once('spawn', () => {
  console.log('Bot joined the server!')
  bot.chat('Hello from my bot! 👋')
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return  // Ignore own messages
  console.log(`Chat from ${username}: ${message}`)
  
  if (message === 'hi') {
    bot.chat('Hi back! How can I help?')
  } else if (message.toLowerCase().includes('follow')) {
    bot.chat('Following you!')
    // Add pathfinder plugin later for real following
  }
})

bot.on('kicked', (reason) => console.log('Kicked:', reason))
bot.on('error', (err) => console.log('Error:', err))
bot.on('end', () => console.log('Disconnected. Restarting in 5s...'))