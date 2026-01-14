
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';

const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveConsultant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are 'Pulse', an expert social media growth consultant. Help the user understand how to get more followers and reactions on Facebook and Instagram using real strategies. Be encouraging and strategic.",
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            stopSession();
          },
          onclose: () => stopSession()
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    sessionRef.current?.close();
    audioContextRef.current?.close();
    outputAudioContextRef.current?.close();
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <div className={`p-6 rounded-3xl glass transition-all duration-500 transform ${isActive ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse">
              <span className="text-xl">🎙️</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          <div>
            <h4 className="font-bold">Pulse AI Coach</h4>
            <p className="text-xs text-slate-400">Live Strategy Session</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-1 w-8 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="h-1 w-8 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="h-1 w-8 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
        <button 
          onClick={stopSession}
          className="mt-6 w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-all"
        >
          End Session
        </button>
      </div>
      
      {!isActive && (
        <button 
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 shadow-2xl shadow-indigo-500/40 transition-all hover:scale-110 active:scale-95 ${isConnecting ? 'animate-pulse' : ''}`}
        >
          <span className="text-2xl">{isConnecting ? '⏳' : '🤖'}</span>
          <span className="absolute -top-12 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Consult Growth Expert
          </span>
        </button>
      )}
    </div>
  );
};
