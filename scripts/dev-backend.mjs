import { pythonCommand, run } from './dev-utils.mjs'

const backend = run(pythonCommand, [
  'backend/manage.py',
  'runserver',
  '0.0.0.0:8000',
])

backend.on('error', (error) => {
  console.error(`Không thể chạy backend: ${error.message}`)
  process.exit(1)
})

backend.on('exit', (code) => {
  process.exit(code ?? 0)
})
