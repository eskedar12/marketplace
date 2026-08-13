// Minimal structured logger. Swap for pino/winston later without
// touching call sites elsewhere in the app.
const timestamp = () => new Date().toISOString();

module.exports = {
  info: (...args) => console.log(`[INFO ${timestamp()}]`, ...args),
  warn: (...args) => console.warn(`[WARN ${timestamp()}]`, ...args),
  error: (...args) => console.error(`[ERROR ${timestamp()}]`, ...args),
};
