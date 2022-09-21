import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';
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
  wavesurfer.enableDragSelection({ color: 'rgba(255, 0, 0, 0.5)' });
});

wavesurfer.on('audioprocess', () => {
  const currentTime = wavesurfer.getCurrentTime();
  const formattedTime = formatTime(currentTime);

  timeCurrent!.textContent = formattedTime;
});

export default wavesurfer;
