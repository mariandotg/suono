import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import { formatTime } from '../utils/format';

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

const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');

wavesurfer.load('./test.mp3');

wavesurfer.on('ready', () => {
  const totalAudioDuration = wavesurfer.getDuration();
  const formattedTime = formatTime(totalAudioDuration);

  timeTotal!.textContent = formattedTime;
});

wavesurfer.on('audioprocess', () => {
  if (!wavesurfer.isPlaying()) return;

  const currentTime = wavesurfer.getCurrentTime();
  const formattedTime = formatTime(currentTime);

  timeCurrent!.textContent = formattedTime;
});

export default wavesurfer;
