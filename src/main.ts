import wavesurfer from './services/wavesurfer';
import { Clip } from './types';
import { formatTime } from './utils/format';

export let clips: Array<Clip> = [];

const fileInput = document.getElementById('audio-file') as HTMLInputElement;
const playButton = document.getElementById('play');
const clipsRoot = document.getElementById('clips');
const newClipButton = document.getElementById('new-clip-button');
const startInputMM = document.getElementById(
  'new-clip-start-mm'
) as HTMLInputElement;
const startInputSS = document.getElementById(
  'new-clip-start-ss'
) as HTMLInputElement;
const endInputMM = document.getElementById(
  'new-clip-end-mm'
) as HTMLInputElement;
const endInputSS = document.getElementById(
  'new-clip-end-ss'
) as HTMLInputElement;

const audioCtx = new AudioContext();
const fileReader = new FileReader();

newClipButton?.addEventListener('click', (event) => {
  event.preventDefault();

  const startMM = parseFloat(startInputMM.value);
  const startSS = parseFloat(startInputSS.value);
  const endMM = parseFloat(endInputMM.value);
  const endSS = parseFloat(endInputSS.value);

  if (startSS >= 60 || endSS >= 60) {
    alert('Error SS >= 60');
    return;
  }

  const start = startMM * 60 + startSS;
  const end = endMM * 60 + endSS;

  if (start < wavesurfer.getDuration() || end <= wavesurfer.getDuration())
    wavesurfer.addRegion({ start, end, color: 'rgba(255, 0, 0, 0.5)' });
  else alert('Error');

  console.log(start);
  console.log(end);
});

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
          <a id="${clip.id}-download-link" class="select-none">
            <span class="material-icons cursor-pointer select-none" id="${
              clip.id
            }-download">file_download</span>
          </a>
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
  fileReader.readAsArrayBuffer(fileInput.files![0]);

  fileReader.onload = (event) => {
    audioCtx
      .decodeAudioData(event.target!.result as ArrayBuffer)
      .then((buffer) => {
        const sound = audioCtx.createBufferSource();
        sound.buffer = buffer;
      });
  };

  wavesurfer.load(URL.createObjectURL(fileInput.files![0]));
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

export const toggleLoading = (isLoading: boolean) => {
  const loading = document.getElementById('loading');
  if (isLoading) {
    loading?.classList.replace('invisible', 'visible');
    loading?.classList.replace('opacity-0', 'opacity-100');
  } else {
    loading?.classList.replace('visible', 'invisible');
    loading?.classList.replace('opacity-100', 'opacity-0');
  }
};

const encodeAudio = (audioData: any, emptyBuffer: any[]) => {
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

export const downloadClip = async (
  audioCtx: AudioContext,
  buffer: AudioBuffer,
  clip: Clip
) => {
  const downloadClipButton = document.getElementById(
    `${clip.id}-download-link`
  ) as HTMLAnchorElement;
  if (downloadClipButton!.href) {
    toggleLoading(false);
  } else {
    const originalBuffer = buffer;

    const segmentDuration = clip.end - clip.start;
    const init = clip.start * originalBuffer.sampleRate;
    const fin = clip.end * originalBuffer.sampleRate;

    const emptyBuffer: Array<any> = [];
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

    await encodeAudio(audioData, emptyBuffer)
      .then((res) => {
        const blob = new Blob(res.res, { type: 'audio/mp3' });
        const processedAudio = new window.Audio();
        processedAudio.src = URL.createObjectURL(blob);
        const downloadClipButton = document.getElementById(
          `${clip.id}-download-link`
        ) as HTMLAnchorElement;
        downloadClipButton!.href = processedAudio.src;
        downloadClipButton!.download = `suono-${clip.id}.mp3`;
        downloadClipButton!.click();
        toggleLoading(false);
      })
      .catch((c) => {
        console.log(c);
        toggleLoading(false);
      });
  }
};

fileInput.addEventListener('change', () => readFile(), false);
fileInput.removeEventListener('change', () => readFile(), false);

playButton?.addEventListener('click', () => handlePlayAndPause(playButton));
playButton?.removeEventListener('click', () => handlePlayAndPause(playButton));
