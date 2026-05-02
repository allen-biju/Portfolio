import beeps from '../assets/sounds/beeps.ogg';
import beeps2 from '../assets/sounds/beeps2.ogg';
import beeps3 from '../assets/sounds/beeps3.ogg';
import clickProject from '../assets/sounds/click-project.ogg';
import enterProject from '../assets/sounds/enter-project.ogg';
import leaveProject from '../assets/sounds/leave-project.ogg';
import manifesto from '../assets/sounds/manifesto.ogg';
import particles from '../assets/sounds/particles.ogg';
import projectText from '../assets/sounds/project-text.ogg';
import shard from '../assets/sounds/shard.ogg';
import uiLong from '../assets/sounds/ui-long.ogg';
import uiShort from '../assets/sounds/ui-short.ogg';
import woosh from '../assets/sounds/woosh.mp3';

let audioCtx = null;
const buffers = {};
let noiseBuffer = null;
let isMuted = false;

export const getIsMuted = () => isMuted;
export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

const getNoiseBuffer = (ctx) => {
  if (noiseBuffer) return noiseBuffer;
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
};

export const getCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const loadBuffer = async (url) => {
  const ctx = getCtx();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
};

export const preloadSounds = async () => {
  const ctx = getCtx();
  const assets = {
    beeps, beeps2, beeps3, clickProject, 
    enterProject, leaveProject, manifesto, 
    particles, projectText, shard, uiLong, uiShort, woosh
  };

  for (const [key, url] of Object.entries(assets)) {
    if (!buffers[key]) {
      buffers[key] = await loadBuffer(url);
      console.log(`Audio Context: Loaded & Decoded asset '${key}'`);
    }
  }
};

const play = (bufferName, volume = 0.4, pitch = 1.0) => {
  if (isMuted) return;
  const ctx = getCtx();
  const buffer = buffers[bufferName];
  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = pitch;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start(0);
};

/* ── Mapping Public API ── */

export const playHover = () => play('uiShort', 0.15, 1.05);
export const playClick = () => play('clickProject', 0.4);
export const playUILong = () => play('uiLong', 0.5);
export const playShard = () => play('shard', 0.6);
export const playPageWipe = () => play('enterProject', 0.5);
export const playBack = () => play('leaveProject', 0.5);
export const playProjectText = () => play('projectText', 0.3);
export const playParticles = () => play('particles', 0.3);
export const playWordAssembled = () => play('enterProject', 0.4, 0.95);
export const playTypewriterBeep = () => {
  const beepNames = ['beeps', 'beeps2', 'beeps3'];
  const pick = beepNames[Math.floor(Math.random() * beepNames.length)];
  play(pick, 0.12, 0.95 + Math.random() * 0.1);
};

export const startWordWoosh = () => {
  if (isMuted) return { source: null, stop: () => {} };
  const ctx = getCtx();
  const buffer = buffers['woosh'];
  
  if (!buffer) return null;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = false;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  // Stabilized professional gain level (0.25)
  gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);

  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start(0);

  return {
    source,
    gainNode,
    stop: () => {
      if (ctx.state === 'suspended' || ctx.state === 'closed') return;
      gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      setTimeout(() => {
        try { source.stop(); } catch(e) {}
      }, 300);
    }
  };
};

export const scheduleTypewriterTicks = async (len, speed, delay) => {
  if (isMuted) return { startTime: 0, stop: () => {} };
  const ctx = getCtx();
  const startTime = ctx.currentTime + (delay / 1000);
  const beepNames = ['beeps', 'beeps2', 'beeps3'];
  const sources = [];

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.12, ctx.currentTime);

  for (let i = 0; i < len; i++) {
    const time = startTime + (i * speed / 1000);
    const bufferName = beepNames[Math.floor(Math.random() * beepNames.length)];
    const buffer = buffers[bufferName];
    
    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.95 + Math.random() * 0.1;
      source.connect(masterGain);
      source.start(time);
      source.stop(time + 0.1); // atomic snappiness
      sources.push(source);
    }
  }

  return {
    startTime,
    stop: () => {
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      sources.forEach(s => {
        try { s.stop(ctx.currentTime + 0.1); } catch(e) {}
      });
    }
  };
};
