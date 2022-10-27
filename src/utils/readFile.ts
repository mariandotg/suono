import wavesurfer from '../services/wavesurfer';

export const fileInput = document.getElementById(
  'audio-file'
) as HTMLInputElement;
export const detailTabName = document.getElementById('detail-tab-file-name');

const fileReader = new FileReader();

export const readFile = () => {
  fileReader.readAsArrayBuffer(fileInput.files![0]);
  wavesurfer.load(URL.createObjectURL(fileInput.files![0]));
  detailTabName!.textContent = fileInput.files![0].name;
};
