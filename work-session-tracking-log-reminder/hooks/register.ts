import type { Register } from 'claude-code'

const REMINDER = "Don't forget to log what you've done, either in GitHub issues or Docmost log. You'll have a more solid track record."

export const register: Register = on => {
  on('command.run', { command: /^(clear|exit)$/ }, async ($, e, next) => {
    // ask rejects when the dialog is dismissed; a dismissal counts as No, so the command stays held back.
    const answer = await $.ui.ask('Did you log what you did this session?', ['Yes', 'No']).catch(() => 'No')
    return answer === 'Yes' ? next(e) : { text: REMINDER }
  })

  on('session.end', async ($, e, next) => {
    // Ctrl+C skips the command hook and the UI is already gone, so only /dev/tty reaches the terminal.
    if (e.reason !== 'clear') await $.process.run(['sh', '-c', 'printf "\\n%s\\n\\n" "$1" > /dev/tty', 'sh', REMINDER], { timeoutMs: 1000 })
    return next(e)
  })
}
