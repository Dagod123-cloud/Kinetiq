// Lightweight Web Audio API synthesizer for clean, accessible UI sound effects
// Does not require any external audio files or network requests

let audioCtx: AudioContext | null = null;
let soundMuted = false;

// Check stored mute preference
if (typeof window !== 'undefined') {
  soundMuted = localStorage.getItem('kinetiq_sound_muted') === 'true';
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const isSoundMuted = (): boolean => soundMuted;

export const toggleSoundMute = (): boolean => {
  soundMuted = !soundMuted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('kinetiq_sound_muted', String(soundMuted));
  }
  return soundMuted;
};

// Play a crisp, gentle UI click
export const playUiClick = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Silently ignore if audio context blocked by browser
  }
};

// Play a bright success / RSVP chime
export const playSuccessChime = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  } catch {
    // Silently ignore
  }
};

// Play energetic house cheer fanfare
export const playHouseCheer = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Energetic brass-like ascending arpeggio
    const chords = [
      { freq: 440, time: 0 },
      { freq: 554.37, time: 0.07 },
      { freq: 659.25, time: 0.14 },
      { freq: 880, time: 0.21 }
    ];

    chords.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.15, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.35);
    });
  } catch {
    // Silently ignore
  }
};

// Play Pomodoro focus bell
export const playTimerBell = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  } catch {
    // Silently ignore
  }
};

// ================= AMBIENT STUDY SOUND GENERATOR =================
// Web Audio API procedural synthesis for focused studying without external files

export type AmbientSoundType = 'NONE' | 'RAIN' | 'LIBRARY' | 'LOFI';

interface AmbientState {
  type: AmbientSoundType;
  nodes: { stop: () => void }[];
  masterGain: GainNode | null;
}

const currentAmbient: AmbientState = {
  type: 'NONE',
  nodes: [],
  masterGain: null
};

export const getActiveAmbientSound = (): AmbientSoundType => currentAmbient.type;

export const stopAmbientSound = () => {
  currentAmbient.nodes.forEach(node => {
    try {
      node.stop();
    } catch {
      // already stopped
    }
  });
  currentAmbient.nodes = [];
  currentAmbient.type = 'NONE';
  if (currentAmbient.masterGain) {
    try {
      currentAmbient.masterGain.disconnect();
    } catch {
      // ignore
    }
    currentAmbient.masterGain = null;
  }
};

export const startAmbientSound = (type: AmbientSoundType, volume: number = 0.25) => {
  stopAmbientSound();
  if (type === 'NONE') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    currentAmbient.masterGain = masterGain;
    currentAmbient.type = type;

    if (type === 'RAIN') {
      // Filtered pink noise simulating soft campus rain
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(800, ctx.currentTime);

      whiteNoise.connect(lowpass);
      lowpass.connect(masterGain);
      whiteNoise.start();

      currentAmbient.nodes.push(whiteNoise);
    } else if (type === 'LIBRARY') {
      // Gentle warm low hum with brown noise for library calm
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lowFilter = ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 warm drone
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3 fifth

      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(350, ctx.currentTime);

      osc1.connect(lowFilter);
      osc2.connect(lowFilter);
      lowFilter.connect(masterGain);

      osc1.start();
      osc2.start();

      currentAmbient.nodes.push(osc1, osc2);
    } else if (type === 'LOFI') {
      // 432 Hz healing harmonic binaural chord with slow subtle beat
      const root = ctx.createOscillator();
      const fifth = ctx.createOscillator();
      const octave = ctx.createOscillator();

      root.type = 'triangle';
      root.frequency.setValueAtTime(216, ctx.currentTime); // 432 Hz subharmonic
      fifth.type = 'sine';
      fifth.frequency.setValueAtTime(324, ctx.currentTime);
      octave.type = 'sine';
      octave.frequency.setValueAtTime(432, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      root.connect(filter);
      fifth.connect(filter);
      octave.connect(filter);
      filter.connect(masterGain);

      root.start();
      fifth.start();
      octave.start();

      currentAmbient.nodes.push(root, fifth, octave);
    }
  } catch {
    // Silently handle if audio policy prevents autoplay
  }
};

