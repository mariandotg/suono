import WaveSurfer from 'wavesurfer.js';

let wavesurfer = WaveSurfer.create({
  container: '#waveform',
  scrollParent: true,
  barGap: 2,
  barWidth: 4,
  progressColor: '#FF6600',
  barRadius: 4,
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
      <td>${clip.id}</td>
      <td>${clip.start}</td>
      <td>${clip.end}</td>
      <td>
        <span class="material-icons" id="play_clip">
        play_arrow
        </span>
      </td>
      <td>
        <span class="material-icons" id="download">
        file_download
        </span>
      </td>
      <td>
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
  const minutes = Math.floor(totalAudioDuration / 60);
  const seconds = Math.floor(totalAudioDuration) - minutes * 60;
  document.getElementById('time-total')!.innerText = `${minutes}:${seconds}`;
});
