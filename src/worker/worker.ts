import lamejs from 'lamejs';
import { floatTo16BitPCM } from '../utils/to16BitPCM';

const encode = (audioData: any, emptyBuffer: any[]) => {
  const mp3Encoder = new lamejs.Mp3Encoder(
    audioData.channels.length,
    audioData.sampleRate,
    128
  );
  return new Promise((resolve, reject) => {
    const right = new Int16Array(audioData.channels[0].length);
    floatTo16BitPCM(audioData.channels[0], right);
    const left = new Int16Array(audioData.channels[1].length);
    floatTo16BitPCM(audioData.channels[1], left);

    for (let i = 0; i < audioData.channels[0].length; i += 1152) {
      const leftChunk = left.subarray(i, i + 1152);
      const rightChunk = right.subarray(i, i + 1152);
      const mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);

      if (mp3buf.length > 0) {
        emptyBuffer.push(mp3buf);
      }
    }
    const mp3buf = mp3Encoder.flush();
    emptyBuffer.push(new Int8Array(mp3buf));
    if (emptyBuffer.length !== 0) resolve(emptyBuffer);
    else reject(new Error('Buffer error'));
  });
};

onmessage = async (event) => {
  await encode(event.data.audioData, event.data.emptyBuffer)
    .then((res) => {
      postMessage({ res });
    })
    .catch((err) => {
      console.log('ERROR', err);
      postMessage(null);
    });
};
