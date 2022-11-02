import wavesurfer from './services/wavesurfer';

import { toggleLoading } from './utils/toggleLoading';
import { detailTabName, fileInput, readFile } from './utils/readFile';

import samples from './samples';

const detailTabCloseFile = document.getElementById('detail-tab-close-file');
const playButton = document.getElementById('play');
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

samples.forEach((sample, index) => {
  const sampleElement = document.getElementById(`sample-${index}`);
  sampleElement!.innerHTML = sample.title;
  sampleElement!.addEventListener(
    'click',
    () => {
      toggleLoading(true);
      wavesurfer.load(sample.file);
      detailTabName!.textContent = sample.title;
    },
    false
  );
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

fileInput.addEventListener('change', () => readFile(), false);

playButton?.addEventListener('click', () => handlePlayAndPause(playButton));

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

detailTabCloseFile?.addEventListener('click', () => {
  location.reload();
});
