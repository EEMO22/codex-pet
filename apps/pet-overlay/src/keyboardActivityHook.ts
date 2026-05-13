import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';

type KeyboardActivityHookOptions = {
  disabled: boolean;
  scriptPath: string;
  onActivity: () => void;
};

let keyboardHookProcess: ChildProcessWithoutNullStreams | null = null;

export function startKeyboardActivityHook(options: KeyboardActivityHookOptions) {
  if (options.disabled || process.platform !== 'win32' || keyboardHookProcess) {
    return;
  }

  keyboardHookProcess = spawn('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    options.scriptPath
  ], {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  keyboardHookProcess.stdout.on('data', (chunk: Buffer) => {
    const lines = chunk.toString('utf8').split(/\r?\n/);
    if (lines.some((line) => line.trim() === 'activity')) {
      options.onActivity();
    }
  });

  keyboardHookProcess.stderr.on('data', (chunk: Buffer) => {
    console.warn(`Keyboard activity hook: ${chunk.toString('utf8').trim()}`);
  });

  keyboardHookProcess.on('exit', () => {
    keyboardHookProcess = null;
  });
}

export function stopKeyboardActivityHook() {
  if (!keyboardHookProcess) {
    return;
  }

  keyboardHookProcess.kill();
  keyboardHookProcess = null;
}
