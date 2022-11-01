import wavesurfer from '../services/wavesurfer';

import { formatTime } from './format';
import { encodeAudio } from './encodeAudio';
import { toggleLoading } from './toggleLoading';

import { Clip, ExtendedWaveSurferBackend } from '../types';
import { formatId } from './formatId';

export let clips: Array<Clip> = [];

export const addClip = (newRegion: Clip) => {
  const newClip = {
    id: newRegion.id,
    start: newRegion.start,
    end: newRegion.end,
  };
  return clips.push(newClip);
};

export const addClipRow = (clip: Clip) => {
  const clipsRoot = document.getElementById('clips');

  const tr = `
        <tr id="${clip.id}">
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
              <span class="material-icons cursor-pointer select-none" id="${
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

export const playClip = (regionId: number, playClipButton: HTMLElement) => {
  if (playClipButton.textContent === 'play_arrow') {
    wavesurfer.regions.list[regionId].play();
    playClipButton.textContent = 'pause';
  } else {
    wavesurfer.pause();
    playClipButton.textContent = 'play_arrow';
  }
};

export const downloadClip = async (
  backend: ExtendedWaveSurferBackend,
  clip: Clip
) => {
  const audioCtx = backend.getAudioContext();
  const originalBuffer = backend.buffer;

  const clipFromArray = clips.find((d) => d.id === clip.id);

  const segmentDuration = clipFromArray!.end - clipFromArray!.start;
  const init = clipFromArray!.start * originalBuffer.sampleRate;
  const fin = clipFromArray!.end * originalBuffer.sampleRate;

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
      (_currentElement, index) => {
        return emptySegment.getChannelData(index);
      }
    ),
    sampleRate,
    length,
  };

  await encodeAudio(audioData, emptyBuffer)
    .then((data: any) => {
      const blob = new Blob(data.res, { type: 'audio/mp3' });
      console.log(blob);
      const processedAudio = new window.Audio();
      processedAudio.src = URL.createObjectURL(blob);
      const downloadClipButton = document.createElement('a');
      downloadClipButton!.href = processedAudio.src;
      downloadClipButton!.download = `suono-${formatId(clip.id)}.mp3`;
      downloadClipButton!.click();
      toggleLoading(false);
    })
    .catch((c) => {
      console.log(c);
      toggleLoading(false);
    });
};

export const deleteClip = (regionId: number) => {
  wavesurfer.regions.list[regionId].remove();
  clips = clips.filter((clip) => clip.id !== regionId);
  deleteClipsRow(regionId);
};

export const deleteClipsRow = (clipId: number) => {
  const element = document.getElementById(clipId.toString());
  element!.remove();
};
