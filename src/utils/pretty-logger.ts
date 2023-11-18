import {ux} from '@oclif/core'

/**
 * ✨Fancy logging
 */
export const prettyLogger = {
  /**
   * Log a message
   * @param message The message to log
   * @param prefix The prefix to use
   * @param shouldLog Whether to log or not
   * @returns void
   */
  log(message: string, prefix?: string, shouldLog = true) {
    if (shouldLog) {
      prefix === undefined ? ux.info(message) : ux.info(`${prefix} ${message}`)
    }
  },
  /**
   * Log an info message
   * @param message The message to log
   * @param shouldLog Whether to log or not
   * @returns void
   */
  info(message: string, shouldLog = true) {
    this.log(message, '\u001B[0;34mℹ\u001B[0m', shouldLog)
  },
  /**
   * Log a success message
   * @param message The message to log
   * @param shouldLog Whether to log or not
   * @returns void
   */
  success(message: string, shouldLog = true) {
    this.log(message, '\u001B[0;32m✔\u001B[0m', shouldLog)
  },
  /**
   * Log a warning message
   * @param message The message to log
   * @param shouldLog Whether to log or not
   * @returns void
   */
  warn(message: string, shouldLog = true) {
    this.log(message, '\u001B[0;43m WARN \u001B[0m', shouldLog)
  },
  /**
   * Log an error message
   * @param message The message to log
   * @param shouldLog Whether to log or not
   * @returns void
   */
  error(message: string, shouldLog = true) {
    this.log(message, '\u001B[1;41m ERROR \u001B[0m', shouldLog)
  },
  /**
   * Log an ascii box
   * @param content The content to put in the box
   * @param shouldLog Whether to log or not
   * @returns void
   */
  box(content: string, shouldLog = true) {
    const lines = content.split('\n')
    const maxLength = Math.max(...lines.map((line) => line.length))
    const top = '╭' + '─'.repeat(maxLength + 2) + '╮'
    const bottom = '╰' + '─'.repeat(maxLength + 2) + '╯'
    const middle = lines.map((line) => `│ ${line.padEnd(maxLength)} │`).join('\n')
    const box = `${top}\n${middle}\n${bottom}`
    this.log(box, undefined, shouldLog)
  },
  action: {
    shouldLog: true,
    /**
     * Start an action
     * @param message The message to log
     * @returns void
     */
    start(message: string) {
      if (this.shouldLog) ux.action.start(`\u001B[0;95m◐\u001B[0m ${message}`)
    },
    /**
     * Stop an action
     * @returns void
     */
    stop() {
      if (this.shouldLog) ux.action.stop()
    },
  },
}
