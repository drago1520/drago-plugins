import { expect, test } from 'claude-code/testing'

const run = (command: string) =>
  ({ command, args: '', origin: { kind: 'composer' }, presentation: { layout: 'main', columns: 80 } }) as const

const setup = (on: Parameters<Parameters<typeof test>[1]>[1], answer: string) => {
  const ran: string[] = []
  on('tool.call', { tool: 'AskUserQuestion' }, (_, e) => ({ result: { questions: e.questions, answers: { [e.questions[0].question]: answer } } }))
  on('command.run', (_, e) => (ran.push(e.command), { text: 'ran' }))
  return ran
}

test('/clear runs after a Yes', async ($, on) => {
  const ran = setup(on, 'Yes')
  const out = await $.command.run(run('clear'))
  expect(ran).toEqual(['clear'])
  expect(out.text).toBe('ran')
})

test('/exit is held back after a No and shows the reminder', async ($, on) => {
  const ran = setup(on, 'No')
  const out = await $.command.run(run('exit'))
  expect(ran).toEqual([])
  expect(out.text).toMatch(/GitHub issues or Docmost log/)
})

test('another command is not asked about', async ($, on) => {
  const ran = setup(on, 'No')
  await $.command.run(run('compact'))
  expect(ran).toEqual(['compact'])
})

test('ctrl+c prints the reminder to the terminal', async ($, on) => {
  const argv: string[][] = []
  on('process.run', (_, e) => (argv.push([...e.argv]), { value: { exitCode: 0, stdout: '', stderr: '' } }))
  on('session.end', (_, e) => ({ sessionId: e.sessionId }))
  await $.session.end({ reason: 'prompt_input_exit', sessionId: 's1', resume: { id: 's1' } })
  expect(argv.length).toBe(1)
  expect(argv[0].at(-1)).toMatch(/GitHub issues or Docmost log/)
})
