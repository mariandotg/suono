import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';

import { formatTime } from './utils/format';

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  scrollParent: true,
  barGap: 2,
  barWidth: 4,
  progressColor: '#FF6600',
  barRadius: 4,
  autoCenter: false,
  height: 160,
  plugins: [
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

const clips = [
  { id: 1, start: 0, end: 62 },
  { id: 2, start: 5, end: 67 },
  { id: 2, start: 5, end: 67 },
];

const clipsRoot = document.getElementById('clips');

clips.map((clip) => {
  const tr = `
    <tr>
      <td class="p-4">${clip.id}</td>
      <td class="p-4 underline underline-offset-2">${formatTime(
        clip.start
      )}</td>
      <td class="p-4 underline underline-offset-2">${formatTime(clip.end)}</td>
      <td class="p-4">
        <span class="material-icons" id="play_clip">
        play_arrow
        </span>
      </td>
      <td class="p-4">
        <span class="material-icons" id="download">
        file_download
        </span>
      </td>
      <td class="p-4">
        <span class="material-icons" id="delete">
        delete
        </span>
      </td>
    </tr>`;

  return (clipsRoot!.innerHTML += tr);
});

wavesurfer.load('./test.mp3');

wavesurfer.on('ready', () => {
  const totalAudioDuration = wavesurfer.getDuration();
  const formattedTime = formatTime(totalAudioDuration);

  document.getElementById('time-total')!.innerText = formattedTime;
});

wavesurfer.on('audioprocess', () => {
  if (!wavesurfer.isPlaying()) return;

  const currentTime = wavesurfer.getCurrentTime();
  const formattedTime = formatTime(currentTime);

  document.getElementById('time-current')!.innerText = formattedTime;
});

const playButton = document.getElementById('play_clip');

const handlePlayAndPause = (playButton: HTMLElement) => {
  if (playButton.textContent === 'play_arrow') {
    playButton.textContent = 'pause';
    wavesurfer.play();
  } else {
    playButton.textContent = 'play_arrow';
    wavesurfer.pause();
  }
};

playButton?.addEventListener('click', () => handlePlayAndPause(playButton));
playButton?.removeEventListener('click', () => handlePlayAndPause(playButton));
