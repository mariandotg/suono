import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';

import { formatTime } from '../utils/format';
import { isTouchScreenDevice } from '../utils/isTouchScreenDevice';
import { toggleLoading } from '../utils/toggleLoading';

import { Clip, ExtendedWaveSurferBackend } from '../types';

import {
  addClip,
  addClipRow,
  clips,
  deleteClip,
  playClip,
  downloadClip,
} from '../main';

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  scrollParent: true,
  barGap: 2,
  barWidth: 4,
  progressColor: '#FF6600',
  barRadius: 4,
  height: 160,
  splitChannels: false,
  plugins: [
    RegionsPlugin.create({}),
    TimelinePlugin.create({
      container: '#wave-timeline',
      primaryColor: '#FFFFFF',
      secondaryColor: '#FFFFFF',
      primaryFontColor: '#FFFFFF',
      secondaryFontColor: '#FFFFFF',
      formatTimeCallback: formatTime,
    }),
    CursorPlugin.create({
      showTime: true,
      opacity: 1,
      customShowTimeStyle: {
        'background-color': '#000000',
        color: '#FFFFFF',
        padding: '2px',
        'font-size': '10px',
      },
      formatTimeCallback: formatTime,
    }),
  ],
});

const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');

if (!isTouchScreenDevice()) {
  wavesurfer.enableDragSelection({ color: 'rgba(255, 0, 0, 0.5)' });
}

wavesurfer.on('ready', () => {
  const totalAudioDuration = wavesurfer.getDuration();
  const formattedTime = formatTime(totalAudioDuration);
  timeTotal!.textContent = formattedTime;
  toggleLoading('cut-new-clip', true);
});

wavesurfer.on('destroy', () => toggleLoading('cut-new-clip', false));

wavesurfer.on('audioprocess', () => {
  const currentTime = wavesurfer.getCurrentTime();
  const formattedTime = formatTime(currentTime);

  timeCurrent!.textContent = formattedTime;
});

wavesurfer.on('region-created', (newRegion: Clip) => {
  if (clips.length === 0) toggleLoading('clips-list', true);
  addClip(newRegion);
  addClipRow(newRegion);
  clips.map((clip) => {
    const playClipButton = document.getElementById(`${clip.id}-play`);
    const deleteClipButton = document.getElementById(`${clip.id}-delete`);
    const downloadClipButton = document.getElementById(`${clip.id}-download`);

    playClipButton!.addEventListener(
      'click',
      () => playClip(clip.id, playClipButton!),
      false
    );
    deleteClipButton!.addEventListener(
      'click',
      () => deleteClip(clip.id),
      false
    );
    downloadClipButton!.addEventListener(
      'click',
      () => {
        toggleLoading('loading', true);
        downloadClip(wavesurfer.backend as ExtendedWaveSurferBackend, clip);
      },
      false
    );
    return true;
  });
});

wavesurfer.on('region-update-end', (newRegion: Clip) => {
  document.getElementById(`${newRegion.id}-start`)!.textContent = formatTime(
    newRegion.start
  );
  document.getElementById(`${newRegion.id}-end`)!.textContent = formatTime(
    newRegion.end
  );

  const downloadClipButton = document.getElementById(
    `${newRegion.id}-download`
  );

  downloadClipButton!.addEventListener(
    'click',
    () => {
      toggleLoading('loading', true);
      downloadClip(wavesurfer.backend as ExtendedWaveSurferBackend, newRegion);
    },
    false
  );
});

wavesurfer.on('region-out', (region: Clip) => {
  document.getElementById(`${region.id}-play`)!.textContent = 'play_arrow';
});

export default wavesurfer;
