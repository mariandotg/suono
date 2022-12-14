import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';

import { formatTime } from '../utils/format';
import { isTouchScreenDevice } from '../utils/isTouchScreenDevice';
import { toggleLoading } from '../utils/toggleLoading';
import { hideElement } from '../utils/hideElement';
import { displayElement } from '../utils/displayElement';
import {
  addClip,
  addClipRow,
  clips,
  deleteClip,
  downloadClip,
  playClip,
} from '../utils/clip';

import { Clip, ExtendedWaveSurferBackend } from '../types';

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

wavesurfer.on('ready', () => {
  const totalAudioDuration = wavesurfer.getDuration();
  const formattedTime = formatTime(totalAudioDuration);
  timeTotal!.textContent = formattedTime;
  hideElement('audio-file-section', 'flex');
  displayElement('detail-tab', 'inline-flex');
  displayElement('clips-list', 'flex');
  displayElement('cut-new-clip', 'flex');
  const detailsSection = document.getElementById('details-section');
  detailsSection!.classList.replace('p-4', 'border-b');
  toggleLoading(false);

  if (!isTouchScreenDevice()) {
    wavesurfer.enableDragSelection({ color: 'rgba(255, 0, 0, 0.5)' });
  }
});

wavesurfer.on('audioprocess', () => {
  const currentTime = wavesurfer.getCurrentTime();
  const formattedTime = formatTime(currentTime);

  timeCurrent!.textContent = formattedTime;
});

wavesurfer.on('region-created', (newRegion: Clip) => {
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
        toggleLoading(true);
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

  const { start, end, id } = newRegion;
  const clipIndex = clips.findIndex((d) => d.id === id);
  clips[clipIndex] = { start, end, id };
});

wavesurfer.on('region-out', (region: Clip) => {
  document.getElementById(`${region.id}-play`)!.textContent = 'play_arrow';
});

wavesurfer.on('error', (error: any) => {
  console.log(error);
  alert(error);
  toggleLoading(false);
});

export default wavesurfer;
