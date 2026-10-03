// react
import { useCallback, useEffect, useRef, useState } from "react";

// ------------------------------------------------------------ voice input
// The Web Speech API: free and built into Chrome, Edge and Safari (Firefox
// doesn't have it, so the mic button simply isn't shown there).

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
}

const recognitionCtor = (): (new () => Recognition) | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

export const voiceInputSupported = () => Boolean(recognitionCtor());

const BLOCKED =
  "Microphone access is blocked. Allow it in your browser's site settings to talk to me.";

const VOICE_ERRORS: Record<string, string> = {
  "not-allowed": BLOCKED,
  "service-not-allowed": BLOCKED,
  "no-speech": "I didn't catch that. Tap the mic and try again.",
  "audio-capture": "I couldn't find a microphone.",
  network: "Voice input couldn't reach your browser's speech service.",
};

interface VoiceInputOptions {
  /** Live caption while the visitor is still speaking */
  onInterim: (transcript: string) => void;
  /** The finished sentence */
  onFinal: (transcript: string) => void;
  /** Microphone loudness, 0–1, every animation frame */
  onLevel: (level: number) => void;
}

export const useVoiceInput = (options: VoiceInputOptions) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlers = useRef(options);
  handlers.current = options;
  const recognitionRef = useRef<Recognition | null>(null);
  const meterRef = useRef<{
    stream: MediaStream;
    ctx: AudioContext;
    raf: number;
  } | null>(null);

  const stopMeter = useCallback(() => {
    const meter = meterRef.current;
    if (!meter) return;
    meterRef.current = null;
    cancelAnimationFrame(meter.raf);
    meter.stream.getTracks().forEach((track) => track.stop());
    meter.ctx.close().catch(() => {});
    handlers.current.onLevel(0);
  }, []);

  /** Loudness meter so the orb can react to the visitor's voice */
  const startMeter = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      const tick = () => {
        if (!meterRef.current) return;
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
          const v = (samples[i] - 128) / 128;
          sum += v * v;
        }
        // Speech RMS sits around 0.02–0.2; stretch it to fill 0–1
        handlers.current.onLevel(Math.min(1, Math.sqrt(sum / samples.length) * 5));
        meterRef.current.raf = requestAnimationFrame(tick);
      };
      meterRef.current = { stream, ctx, raf: requestAnimationFrame(tick) };
    } catch {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const start = useCallback(async () => {
    const Ctor = recognitionCtor();
    if (!Ctor || recognitionRef.current) return;
    setError(null);

    // Ask for the mic up front: one permission prompt, and it powers the
    // level meter. Only a refusal stops us; anything else, carry on
    // without the meter.
    try {
      startMeter(await navigator.mediaDevices.getUserMedia({ audio: true }));
    } catch (err) {
      if ((err as DOMException)?.name === "NotAllowedError") {
        setError(BLOCKED);
        return;
      }
    }

    const recognition = new Ctor();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      let transcript = "";
      let isFinal = false;
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
        if (e.results[i].isFinal) isFinal = true;
      }
      transcript = transcript.trim();
      if (isFinal) handlers.current.onFinal(transcript);
      else handlers.current.onInterim(transcript);
    };
    recognition.onerror = (e) => {
      if (e.error !== "aborted") {
        setError(VOICE_ERRORS[e.error] ?? "Voice input stopped unexpectedly.");
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      stopMeter();
      setListening(false);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      stopMeter();
      setError("Couldn't start voice input.");
    }
  }, [startMeter, stopMeter]);

  /** Finish listening and keep what was heard */
  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  /** Throw away whatever is in progress */
  const cancel = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    stopMeter();
    setListening(false);
  }, [stopMeter]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      stopMeter();
    },
    [stopMeter]
  );

  return { listening, error, start, stop, cancel, clearError: () => setError(null) };
};

// ----------------------------------------------------------- voice output

export const speechOutputSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/** Markdown and URLs read badly aloud */
const toSpeech = (text: string) =>
  text
    .replace(/\*\*/g, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/https?:\/\/\S+/g, "the link")
    .trim();

const NICE_VOICE = /natural|neural|enhanced|premium|google|samantha|daniel|serena|ava|aria/i;

const pickVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  const lang = (navigator.language || "en").slice(0, 2).toLowerCase();
  const local = voices.filter((v) => v.lang.toLowerCase().startsWith(lang));
  return local.find((v) => NICE_VOICE.test(v.name)) ?? local[0] ?? null;
};

/** Some browsers load voices lazily; call early so they're ready */
export const warmUpVoices = () => {
  if (speechOutputSupported()) window.speechSynthesis.getVoices();
};

export const speak = (
  text: string,
  { onStart, onEnd }: { onStart: () => void; onEnd: () => void }
) => {
  if (!speechOutputSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(toSpeech(text));
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 1.03;
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  synth.speak(utterance);
};

export const stopSpeaking = () => {
  if (speechOutputSupported()) window.speechSynthesis.cancel();
};
