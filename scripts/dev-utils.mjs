import { existsSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const isWindows = process.platform === 'win32'
export const frontendDir = resolve(rootDir, 'frontend')

const pythonCandidates = isWindows
  ? [
      resolve(rootDir, 'backend', '.venv', 'Scripts', 'python.exe'),
      resolve(rootDir, 'backend', 'venv', 'Scripts', 'python.exe'),
      'python',
    ]
  : [
      resolve(rootDir, 'backend', '.venv', 'bin', 'python'),
      resolve(rootDir, 'backend', 'venv', 'bin', 'python'),
      'python3',
      'python',
    ]

export const pythonCommand = pythonCandidates.find(
  (candidate) => !candidate.includes(rootDir) || existsSync(candidate),
)

export const npmCommand = isWindows ? 'npm.cmd' : 'npm'
export const viteCommand = resolve(
  frontendDir,
  'node_modules',
  'vite',
  'bin',
  'vite.js',
)

export function run(command, args, options = {}) {
  return spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    ...options,
  })
}

export function runAndWait(command, args, label) {
  return new Promise((resolvePromise, reject) => {
    const child = run(command, args)

    child.on('error', (error) => {
      reject(new Error(`${label}: ${error.message}`))
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
      } else {
        reject(new Error(`${label} thất bại với mã ${code}.`))
      }
    })
  })
}

export function stopProcess(child) {
  if (!child || child.killed) return

  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
    })
  } else {
    child.kill('SIGTERM')
  }
}
