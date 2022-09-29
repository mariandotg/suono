import wavesurfer from './services/wavesurfer';
import { formatTime } from './utils/format';
import lamejs from 'lamejs';
export interface Clip {
  id: number;
  start: number;
  end: number;
}

export let clips: Array<Clip> = [];

const clipsRoot = document.getElementById('clips');
const playButton = document.getElementById('play');
const fileInput = document.getElementById(
  'audio-file'
) as HTMLInputElement | null;

const audioCtx = new AudioContext();
const fileReader = new FileReader();

export const addClip = (newRegion: Clip) => {
  const newClip = {
    id: newRegion.id,
    start: newRegion.start,
    end: newRegion.end,
  };
  return clips.push(newClip);
};

export const addClipRow = (clip: Clip) => {
  const tr = `
      <tr id="${clip.id}">
        <td class="p-4" id="${clip.id}-id">${clip.id}</td>
        <td class="p-4 underline underline-offset-2" id="${
          clip.id
        }-start">${formatTime(clip.start)}</td>
        <td class="p-4 underline underline-offset-2" id="${
          clip.id
        }-end">${formatTime(clip.end)}</td>
        <td class="p-4">
            <span class="material-icons cursor-pointer" id="${
              clip.id
            }-play">play_arrow</span>
        </td>
        <td class="p-4">
            <span class="material-icons cursor-pointer" id="${
              clip.id
            }-download">file_download</span>
        </td>
        <td class="p-4">
            <span class="material-icons cursor-pointer" id="${
              clip.id
            }-delete">delete</span>
        </td>
      </tr>`;

  clipsRoot!.innerHTML += tr;
};

export const deleteClipsRow = (clipId: number) => {
  const element = document.getElementById(clipId.toString());
  element!.remove();
};

const readFile = () => {
  fileReader.readAsArrayBuffer(fileInput!.files![0]);

  fileReader.onload = (event) => {
    audioCtx
      .decodeAudioData(event.target!.result as ArrayBuffer)
      .then((buffer) => {
        const sound = audioCtx.createBufferSource();
        sound.buffer = buffer;
      });
  };

  wavesurfer.load(URL.createObjectURL(fileInput!.files![0]));
};

const handlePlayAndPause = (playButton: HTMLElement) => {
  if (playButton.textContent === 'play_arrow') {
    playButton.textContent = 'pause';
    wavesurfer.play();
  } else {
    playButton.textContent = 'play_arrow';
    wavesurfer.pause();
  }
};

export const playClip = (regionId: number, playClipButton: HTMLElement) => {
  if (playClipButton.textContent === 'play_arrow') {
    wavesurfer.regions.list[regionId].play();
    playClipButton.textContent = 'pause';
  } else {
    wavesurfer.pause();
    playClipButton.textContent = 'play_arrow';
  }
};

export const deleteClip = (regionId: number) => {
  wavesurfer.regions.list[regionId].remove();
  clips = clips.filter((clip) => clip.id !== regionId);
  deleteClipsRow(regionId);
};

const floatTo16BitPCM = (input: any, output: Int16Array) => {
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
};

export const downloadClip = (
  audioCtx: AudioContext,
  buffer: AudioBuffer,
  clip: Clip
) => {
  const originalBuffer = buffer;

  const segmentDuration = clip.end - clip.start;
  const init = clip.start * originalBuffer.sampleRate;
  const fin = clip.end * originalBuffer.sampleRate;

  const emptyBuffer = [];
  const emptySegment = audioCtx.createBuffer(
    originalBuffer.numberOfChannels,
    segmentDuration * originalBuffer.sampleRate,
    originalBuffer.sampleRate
  );

  for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
    emptySegment.copyToChannel(
      originalBuffer.getChannelData(i).slice(init, fin),
      i
    );
  }

  const { numberOfChannels, sampleRate, length } = emptySegment;
  const audioData = {
    channels: Array.from({ length: numberOfChannels }).map(
      (currentElement, index) => {
        return emptySegment.getChannelData(index);
      }
    ),
    sampleRate,
    length,
  };

  const mp3Encoder = new lamejs.Mp3Encoder(2, audioData.sampleRate, 128);

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

  const blob = new Blob(emptyBuffer, { type: 'audio/mp3' });
  const processedAudio = new window.Audio();
  processedAudio.src = URL.createObjectURL(blob);

  const anchorAudio = document.createElement('a');
  anchorAudio.href = processedAudio.src;
  anchorAudio.download = 'output.mp3';
  anchorAudio.click();
};

fileInput?.addEventListener('change', () => readFile(), false);
fileInput?.removeEventListener('change', () => readFile(), false);

playButton?.addEventListener('click', () => handlePlayAndPause(playButton));
playButton?.removeEventListener('click', () => handlePlayAndPause(playButton));
