import {
  frontendDir,
  pythonCommand,
  run,
  runAndWait,
  stopProcess,
  viteCommand,
} from './dev-utils.mjs'
import { existsSync } from 'node:fs'

let backend
let frontend
let stopping = false

function shutdown(code = 0) {
  if (stopping) return
  stopping = true

  console.log('\nĐang dừng EZ Inventory...')
  stopProcess(backend)
  stopProcess(frontend)

  setTimeout(() => process.exit(code), 300)
}

process.on('SIGINT', () => shutdown())
process.on('SIGTERM', () => shutdown())

try {
  console.log('[1/3] Khởi động PostgreSQL...')
  await runAndWait('docker', ['compose', 'up', '-d', 'postgres'], 'Docker Compose')

  console.log('[2/3] Áp dụng Django migrations...')
  await runAndWait(
    pythonCommand,
    ['backend/manage.py', 'migrate'],
    'Django migrate',
  )

  console.log('[3/3] Khởi động backend và frontend...')
  console.log('Frontend:     http://localhost:5173')
  console.log('Backend API:  http://localhost:8000/api')
  console.log('Django Admin: http://localhost:8000/admin/')
  console.log('Nhấn Ctrl+C để dừng backend và frontend.\n')

  backend = run(pythonCommand, [
    'backend/manage.py',
    'runserver',
    '0.0.0.0:8000',
  ])
  if (!existsSync(viteCommand)) {
    throw new Error('Chưa cài frontend dependencies. Hãy chạy npm run setup trước.')
  }

  frontend = run(process.execPath, [
    viteCommand,
    '--host',
    '0.0.0.0',
  ], { cwd: frontendDir })

  for (const [name, child] of [['Backend', backend], ['Frontend', frontend]]) {
    child.on('error', (error) => {
      console.error(`${name} không thể khởi động: ${error.message}`)
      shutdown(1)
    })

    child.on('exit', (code) => {
      if (!stopping) {
        console.error(`${name} đã dừng với mã ${code ?? 0}.`)
        shutdown(code ?? 0)
      }
    })
  }
} catch (error) {
  console.error(`\nKhông thể khởi động full stack: ${error.message}`)
  shutdown(1)
}
