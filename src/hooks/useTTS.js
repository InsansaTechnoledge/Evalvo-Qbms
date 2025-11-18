// useTTS.js
import { useCallback, useEffect, useRef, useState } from "react";

export function useTTS() {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const uRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!synth) return;

    const u = new SpeechSynthesisUtterance();
    uRef.current = u;

    // Event listeners for accurate state tracking
    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    u.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    u.onpause = () => setPaused(true);
    u.onresume = () => setPaused(false);

    const loadVoices = () => {
      const v = synth.getVoices();
      if (v?.length) {
        setVoices(v);
        // Prefer an English voice
        const englishVoice = v.find((voice) => voice.lang.startsWith("en"));
        if (englishVoice && u) u.voice = englishVoice;
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Polling fallback due to timing issues
    intervalRef.current = setInterval(() => {
      if (synth) {
        setSpeaking(synth.speaking);
        setPaused(synth.paused);
      }
    }, 100);

    return () => {
      synth?.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [synth]);

  const speak = useCallback(
    ({ text, voice, rate = 1, pitch = 1 }) => {
      if (!synth || !text) return;

      synth.cancel();
      const u = uRef.current || new SpeechSynthesisUtterance();
      u.text = text;
      u.voice = voice || null;
      u.rate = rate;
      u.pitch = pitch;

      synth.speak(u);
      setSpeaking(true);
      setPaused(false);
    },
    [synth]
  );

  const cancel = useCallback(() => {
    synth?.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [synth]);

  const pause = useCallback(() => {
    synth?.pause();
    setPaused(true);
  }, [synth]);

  const resume = useCallback(() => {
    synth?.resume();
    setPaused(false);
  }, [synth]);

  const supported = !!synth;

  return { voices, speak, cancel, pause, resume, speaking, paused, supported };
}
