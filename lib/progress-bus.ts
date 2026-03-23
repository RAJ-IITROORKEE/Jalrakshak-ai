type ProgressListener = () => void;

const listeners = new Set<ProgressListener>();

export function onProgressStart(listener: ProgressListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startProgress() {
  for (const listener of listeners) {
    listener();
  }
}
