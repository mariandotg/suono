import { WaveSurferBackend } from 'wavesurfer.js/types/backend';

export interface Clip {
  id: number;
  start: number;
  end: number;
}

export type ExtendedWaveSurferBackend = WaveSurferBackend & {
  buffer: AudioBuffer;
};
