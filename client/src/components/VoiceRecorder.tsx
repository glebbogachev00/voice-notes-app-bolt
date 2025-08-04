import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptUpdate: (transcript: string) => void;
  theme: 'light' | 'dark';
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptUpdate, theme }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognitionError, setRecognitionError] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      const fullTranscript = finalTranscript + interimTranscript;
      setCurrentTranscript(fullTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = '';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection and try again.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking closer to the microphone.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone and try again.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
      }
      
      setRecognitionError(errorMessage);
      setIsRecording(false);
      setIsPaused(false);
    };

    recognition.onend = () => {
      if (finalTranscript.trim()) {
        onTranscriptUpdate(finalTranscript.trim());
        finalTranscript = '';
      }
      setCurrentTranscript('');
      setIsRecording(false);
      setIsPaused(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscriptUpdate]);

  const startRecording = () => {
    if (!recognitionRef.current || !isSupported) return;
    
    setRecognitionError(''); // Clear any previous errors
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
  };

  const pauseRecording = () => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setIsPaused(true);
  };

  const resumeRecording = () => {
    if (!recognitionRef.current) return;
    
    setRecognitionError(''); // Clear any previous errors
    try {
      recognitionRef.current.start();
      setIsPaused(false);
    } catch (error) {
      console.error('Error resuming recognition:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center">
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Speech recognition is not supported in your browser.
        </p>
        <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Please use Chrome, Safari, or Edge for voice recording.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {recognitionError && (
        <div className={`p-3 rounded-lg max-w-md text-center border transition-colors ${
          theme === 'dark' 
            ? 'bg-red-900/20 border-red-800 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <p className="text-sm">{recognitionError}</p>
        </div>
      )}
      
      {currentTranscript && (
        <div className={`p-3 rounded-lg max-w-md text-center transition-colors ${
          theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          <p className="text-sm italic">"{currentTranscript}"</p>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        {!isRecording && !isPaused && (
          <button
            onClick={startRecording}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95"
            aria-label="Start recording"
          >
            <Mic size={24} />
          </button>
        )}

        {isRecording && !isPaused && (
          <>
            <button
              onClick={pauseRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
              aria-label="Pause recording"
            >
              <MicOff size={20} />
            </button>
            
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            
            <button
              onClick={stopRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
              aria-label="Stop recording"
            >
              <Square size={20} />
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resumeRecording}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200"
              aria-label="Resume recording"
            >
              <Mic size={20} />
            </button>
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
            }`}>
              <div className="text-sm font-semibold">⏸</div>
            </div>
            
            <button
              onClick={stopRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
              aria-label="Stop recording"
            >
              <Square size={20} />
            </button>
          </>
        )}
      </div>
      
      <div className="text-center">
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {!isRecording && !isPaused && 'Tap to start recording'}
          {isRecording && !isPaused && 'Recording... Speak now'}
          {isPaused && 'Recording paused'}
        </p>
      </div>
    </div>
  );
};

export default VoiceRecorder;