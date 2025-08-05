import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, RefreshCw, AlertCircle, Info } from 'lucide-react';
import nlp from 'compromise';

interface VoiceRecorderProps {
  onTranscriptUpdate: (transcript: string) => void;
  theme: 'light' | 'dark';
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptUpdate, theme }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognitionError, setRecognitionError] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  // Track mutable recording state to avoid stale closures in callbacks
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  
  // Transcript state management
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');

  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let browser = 'Unknown';
    let version = '';
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('edg')) {
      browser = 'Edge';
    } else if (userAgent.includes('arc')) {
      browser = 'Arc';
    }
    
    // Extract version
    const versionMatch = userAgent.match(/(chrome|safari|firefox|edg|arc)\/(\d+)/i);
    if (versionMatch) {
      version = versionMatch[2];
    }
    
    return { browser, version };
  };

  const getDebugInfo = () => {
    const { browser, version } = detectBrowser();
    const info = {
      browser: `${browser} ${version}`,
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      mediaDevices: !!navigator.mediaDevices,
      online: navigator.onLine,
      timestamp: new Date().toISOString()
    };
    return info;
  };

  const addPunctuation = (text: string): string => {
    if (!text.trim()) return text;
    
    try {
      // Use compromise to add punctuation to the text
      const doc = nlp(text);
      
      // Normalize the text with punctuation
      const processed = doc.normalize({
        whitespace: true,
        punctuation: true,
        case: true,
        numbers: true,
        plurals: true,
        verbs: true
      });
      
      // Get the processed text
      let result = processed.text();
      
      // Ensure proper spacing
      if (!result.endsWith(' ')) {
        result += ' ';
      }
      
      return result;
    } catch (error) {
      console.warn('Error processing text with compromise:', error);
      // Fallback: just return the original text with a space
      return text.trim() + ' ';
    }
  };

  const initializeRecognition = () => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      const { browser } = detectBrowser();
      setRecognitionError(`Speech recognition is not supported in ${browser}. Please use Chrome, Safari, or Edge for voice recording, or type your notes manually above.`);
      return null;
    }

    // Check if we're on HTTPS (required for Web Speech API)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setRecognitionError('Speech recognition requires HTTPS. Please access this app via HTTPS or localhost.');
      return null;
    }

    const recognition = new SpeechRecognition();
    const { browser } = detectBrowser();
    
    // Recommended Web Speech API configuration for best transcription
    recognition.continuous = true;           // Keep listening until stopped
    recognition.interimResults = true;       // Get partial results while user speaks
    recognition.lang = 'en-US';              // Language with best transcription
    
    // Safari-specific settings
    if (browser === 'Safari') {
      recognition.continuous = false; // Safari works better with continuous: false
    }

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Handle final results with post-processing punctuation
      if (finalTranscript) {
        const punctuatedFinal = addPunctuation(finalTranscript);
        finalTranscriptRef.current += punctuatedFinal;
      }
      
      // Handle interim results (no punctuation processing)
      interimTranscriptRef.current = interimTranscript;
      
      // Update display with both final and interim text
      const fullTranscript = finalTranscriptRef.current + interimTranscriptRef.current;
      setCurrentTranscript(fullTranscript);
      
      console.log('Final (punctuated):', finalTranscript);
      console.log('Interim:', interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = '';
      const { browser } = detectBrowser();
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = `Microphone access denied in ${browser}. Please allow microphone access in your browser settings and try again.`;
          break;
        case 'network':
          errorMessage = `Speech recognition service unavailable in ${browser}. This might be due to network issues, browser restrictions, or firewall settings. You can still type your notes manually above.`;
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
          errorMessage = `Speech recognition error in ${browser}: ${event.error}. Please try again.`;
      }
      
      setRecognitionError(errorMessage);
      setIsRecording(false);
      setIsPaused(false);
      isRecordingRef.current = false;
      isPausedRef.current = false;
    };

    recognition.onend = () => {
      console.log('Recognition ended');
      
      // Process any remaining interim text
      if (interimTranscriptRef.current.trim()) {
        const punctuatedInterim = addPunctuation(interimTranscriptRef.current);
        finalTranscriptRef.current += punctuatedInterim;
        interimTranscriptRef.current = '';
      }
      
      // Send the final transcript
      if (finalTranscriptRef.current.trim()) {
        onTranscriptUpdate(finalTranscriptRef.current.trim());
        finalTranscriptRef.current = '';
      }
      
      setCurrentTranscript('');

      if (isPausedRef.current) {
        // User paused recording; keep paused state
        setIsRecording(false);
        setIsPaused(true);
      } else if (isRecordingRef.current) {
        // Recognition ended unexpectedly while recording - restart
        setIsRecording(true);
        setIsPaused(false);
        if (browser !== 'Safari') {
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('Recognition restarted');
              } catch (error) {
                console.error('Error restarting recognition:', error);
              }
            }
          }, 100);
        }
      } else {
        // Recording completely stopped
        setIsRecording(false);
        setIsPaused(false);
      }
    };

    return recognition;
  };

  useEffect(() => {
    const { browser, version } = detectBrowser();
    setBrowserInfo(`${browser} ${version}`);
    recognitionRef.current = initializeRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptUpdate]);

  const retryConnection = () => {
    setIsRetrying(true);
    setRecognitionError('');
    
    // Stop current recognition if running
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Reset transcript state
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    
    // Reinitialize recognition
    setTimeout(() => {
      recognitionRef.current = initializeRecognition();
      setIsRetrying(false);
    }, 1000);
  };

  const startRecording = () => {
    if (!recognitionRef.current || !isSupported) return;
    
    setRecognitionError(''); // Clear any previous errors
    console.log('Attempting to start speech recognition...');
    
    // Reset transcript state
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      isRecordingRef.current = true;
      isPausedRef.current = false;
      console.log('Speech recognition started successfully');
    } catch (error) {
      console.error('Error starting recognition:', error);
      setRecognitionError('Failed to start recording. Please refresh the page and try again.');
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    isRecordingRef.current = false;
    isPausedRef.current = false;
    setIsRecording(false);
    setIsPaused(false);
    recognitionRef.current.stop();
  };

  const pauseRecording = () => {
    if (!recognitionRef.current) return;

    isRecordingRef.current = false;
    isPausedRef.current = true;
    setIsRecording(false);
    setIsPaused(true);
    recognitionRef.current.stop();
  };

  const resumeRecording = () => {
    if (!recognitionRef.current) return;

    setRecognitionError(''); // Clear any previous errors
    try {
      recognitionRef.current.start();
      setIsPaused(false);
      setIsRecording(true);
      isPausedRef.current = false;
      isRecordingRef.current = true;
    } catch (error) {
      console.error('Error resuming recognition:', error);
    }
  };

  const copyDebugInfo = () => {
    const debugInfo = getDebugInfo();
    const debugText = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(debugText).then(() => {
      alert('Debug information copied to clipboard!');
    });
  };

  if (!isSupported) {
    const { browser } = detectBrowser();
    return (
      <div className="text-center">
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Speech recognition is not supported in {browser}.
        </p>
        <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Please use Chrome, Safari, or Edge for voice recording.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {browserInfo && (
        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Browser: {browserInfo}
        </div>
      )}
      
      {recognitionError && (
        <div className={`p-4 rounded-lg max-w-md text-center border transition-colors ${
          theme === 'dark' 
            ? 'bg-red-900/20 border-red-800 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center justify-center mb-2">
            <AlertCircle size={16} className="mr-2" />
            <p className="text-sm font-medium">Speech Recognition Issue</p>
          </div>
          <p className="text-sm mb-3">{recognitionError}</p>
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={retryConnection}
              disabled={isRetrying}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isRetrying
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isRetrying ? (
                <RefreshCw size={16} className="animate-spin inline mr-2" />
              ) : (
                <RefreshCw size={16} className="inline mr-2" />
              )}
              Retry Connection
            </button>
            
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              <Info size={16} className="inline mr-2" />
              {showDebugInfo ? 'Hide' : 'Show'} Debug Info
            </button>
          </div>
        </div>
      )}
      
      {showDebugInfo && (
        <div className={`p-4 rounded-lg max-w-md border transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700 text-gray-300' 
            : 'bg-gray-100 border-gray-300 text-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Debug Information</p>
            <button
              onClick={copyDebugInfo}
              className={`px-2 py-1 rounded text-xs ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Copy
            </button>
          </div>
          <pre className="text-xs overflow-auto max-h-32">
            {JSON.stringify(getDebugInfo(), null, 2)}
          </pre>
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
            disabled={!!recognitionError}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              recognitionError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
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
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95"
              aria-label="Resume recording"
            >
              <Mic size={24} />
            </button>
            
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
      
      {recognitionError && (
        <div className={`text-center max-w-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-xs mb-2">
            Voice recording unavailable - use the text area above to type your notes
          </p>
          <p className="text-xs">
            💡 Try: Chrome browser, allow microphone access, check network connection
          </p>
        </div>
      )}
      
      <div className={`text-center max-w-md ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
        <p className="text-xs">
          💡 Tip: Speak naturally - punctuation will be added automatically when you pause
        </p>
      </div>
    </div>
  );
};

export default VoiceRecorder;
