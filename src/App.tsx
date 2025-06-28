import { useEffect } from 'react';
import { FileDropArea } from './components/FileDropArea';
import { PadGrid } from './components/PadGrid';
import { MidiHandler } from './MidiHandler';
import * as Tone from 'tone';
import { MidiFeedback } from './MidiFeedback';
import { MidiFeedbackController } from './components/MidiFeedbackController';
import { LooperPad } from './components/LooperPad';

function App() {
  useEffect(() => {
    const startAudioContext = async () => {
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('Tone.js AudioContext started from user gesture.');
      }
      window.removeEventListener('mousedown', startAudioContext);
      window.removeEventListener('keydown', startAudioContext);
    };

    window.addEventListener('mousedown', startAudioContext);
    window.addEventListener('keydown', startAudioContext);

    return () => {
      window.removeEventListener('mousedown', startAudioContext);
      window.removeEventListener('keydown', startAudioContext);
    };
  }, []);

  useEffect(() => {
    MidiHandler.enableMidi();
    MidiFeedback.init();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-200 text-gray-800 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <MidiFeedbackController />

      <div className="w-full max-w-4xl flex flex-col gap-4">
        <h1 className="text-5xl font-extrabold text-center text-purple-700 mb-8 drop-shadow-lg">Fun Soundboard!</h1>
        <FileDropArea />
        <PadGrid />
        <LooperPad />
      </div>
    </div>
  );
}

export default App;