export const encodeAudio = (audioData: any, emptyBuffer: any[]) => {
  return new Promise((resolve, reject) => {
    const audioWorker = new Worker(
      new URL('./worker/worker.ts', import.meta.url),
      { type: 'module' }
    );

    audioWorker.onmessage = (event) => {
      if (event.data != null) {
        resolve(event.data);
      } else {
        reject(new Error('Error'));
      }
    };

    audioWorker.postMessage({ audioData, emptyBuffer });
  });
};
