import wavesurfer from './services/wavesurfer';
import { formatTime } from './utils/format';

const clips = [
  { id: 1, start: 0, end: 62 },
  { id: 2, start: 5, end: 67 },
  { id: 2, start: 5, end: 67 },
];

const clipsRoot = document.getElementById('clips');
const playButton = document.getElementById('play_clip');
const fileInput = document.getElementById('audio-file');

const audioCtx = new AudioContext();
const fileReader = new FileReader();

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
