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
  
  // Punctuation timing variables
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  const addPunctuation = (text: string, pauseDuration: number): string => {
    if (!text.trim()) return text;
    
    // Remove any existing punctuation at the end
    const cleanText = text.trim().replace(/[.,!?;:]$/, '');
    
    // Use compromise for better natural language processing
    try {
      const doc = nlp(cleanText);
      
      // Check if it's a question using compromise
      const isQuestion = doc.questions().length > 0 || 
                        doc.match('(what|when|where|why|how|who|which|whose|whom)').length > 0 ||
                        cleanText.toLowerCase().startsWith('what') ||
                        cleanText.toLowerCase().startsWith('when') ||
                        cleanText.toLowerCase().startsWith('where') ||
                        cleanText.toLowerCase().startsWith('why') ||
                        cleanText.toLowerCase().startsWith('how') ||
                        cleanText.toLowerCase().startsWith('who') ||
                        cleanText.toLowerCase().startsWith('which') ||
                        cleanText.toLowerCase().startsWith('whose') ||
                        cleanText.toLowerCase().startsWith('whom');
      
      // Check for exclamations
      const exclamationWords = ['wow', 'amazing', 'incredible', 'fantastic', 'great', 'awesome', 'perfect', 'excellent', 'brilliant', 'outstanding'];
      const isExclamation = exclamationWords.some(word => 
        cleanText.toLowerCase().includes(word)
      ) || cleanText.toLowerCase().includes('!');
      
      // Check for imperative sentences (commands)
      const imperativeWords = ['please', 'stop', 'go', 'come', 'look', 'listen', 'wait', 'help', 'start', 'finish'];
      const isImperative = imperativeWords.some(word => 
        cleanText.toLowerCase().startsWith(word)
      );
      
      // Check for repetitive patterns (like "hello hello hello")
      const words = cleanText.toLowerCase().split(' ');
      const uniqueWords = [...new Set(words)];
      const isRepetitive = words.length > 3 && uniqueWords.length <= 2;
      
      // Add punctuation based on pause duration and content
      if (pauseDuration > 1500) {
        // Long pause (1.5+ seconds) = period, question mark, or exclamation
        if (isQuestion) {
          return cleanText + '? ';
        } else if (isExclamation) {
          return cleanText + '! ';
        } else if (isImperative) {
          return cleanText + '. ';
        } else {
          return cleanText + '. ';
        }
      } else if (pauseDuration > 600) {
        // Medium pause (0.6-1.5 seconds) = comma or question mark
        if (isQuestion && pauseDuration > 1000) {
          return cleanText + '? ';
        } else {
          return cleanText + ', ';
        }
      } else if (pauseDuration > 300) {
        // Short pause (0.3-0.6 seconds) = comma
        return cleanText + ', ';
      } else if (isRepetitive) {
        // For repetitive patterns, add commas to break them up
        return cleanText + ', ';
      }
      
      return cleanText + ' ';
    } catch (error) {
      console.warn('Error processing text with compromise:', error);
      
      // Fallback to simple punctuation
      const questionWords = ['what', 'when', 'where', 'why', 'how', 'who', 'which', 'whose', 'whom'];
      const isQuestion = questionWords.some(word => 
        cleanText.toLowerCase().startsWith(word) || 
        cleanText.toLowerCase().includes(` ${word} `)
      );
      
      const exclamationWords = ['wow', 'amazing', 'incredible', 'fantastic', 'great', 'awesome', 'perfect'];
      const isExclamation = exclamationWords.some(word => 
        cleanText.toLowerCase().includes(word)
      ) || cleanText.toLowerCase().includes('!');
      
      // Check for repetitive patterns
      const words = cleanText.toLowerCase().split(' ');
      const uniqueWords = [...new Set(words)];
      const isRepetitive = words.length > 3 && uniqueWords.length <= 2;
      
      if (pauseDuration > 1500) {
        if (isQuestion) {
          return cleanText + '? ';
        } else if (isExclamation) {
          return cleanText + '! ';
        } else {
          return cleanText + '. ';
        }
      } else if (pauseDuration > 600) {
        if (isQuestion && pauseDuration > 1000) {
          return cleanText + '? ';
        } else {
          return cleanText + ', ';
        }
      } else if (pauseDuration > 300) {
        return cleanText + ', ';
      } else if (isRepetitive) {
        return cleanText + ', ';
      }
      
      return cleanText + ' ';
    }
  };

  const handleSpeechPause = () => {
    const now = Date.now();
    const pauseDuration = now - lastSpeechTimeRef.current;
    
    // Clear existing timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    
    // Set timer for punctuation detection
    pauseTimerRef.current = setTimeout(() => {
      if (interimTranscriptRef.current.trim()) {
        const punctuatedText = addPunctuation(interimTranscriptRef.current, pauseDuration);
        finalTranscriptRef.current += punctuatedText;
        interimTranscriptRef.current = '';
        
        // Update the display
        const fullTranscript = finalTranscriptRef.current + interimTranscriptRef.current;
        setCurrentTranscript(fullTranscript);
      }
    }, 300); // Increased delay to better detect pauses
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
    
    // Configure recognition based on browser
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Safari-specific settings
    if (browser === 'Safari') {
      recognition.continuous = false; // Safari works better with continuous: false
    }
    
    // Arc-specific settings (Arc is Chromium-based, so it should work like Chrome)
    if (browser === 'Arc') {
      recognition.continuous = true;
      recognition.interimResults = true;
    }

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update last speech time
      lastSpeechTimeRef.current = Date.now();
      
      // Handle final results with immediate punctuation
      if (finalTranscript) {
        // Add punctuation to final transcript immediately
        const punctuatedFinal = addPunctuation(finalTranscript, 500); // Default pause
        finalTranscriptRef.current += punctuatedFinal;
      }
      
      // Handle interim results with more aggressive punctuation
      if (interimTranscript.trim()) {
        // Process interim text more aggressively
        const words = interimTranscript.trim().split(' ');
        if (words.length >= 3) {
          // If we have enough words, try to add punctuation
          const punctuatedInterim = addPunctuation(interimTranscript, 200); // Shorter pause for interim
          interimTranscriptRef.current = punctuatedInterim;
        } else {
          interimTranscriptRef.current = interimTranscript;
        }
      } else {
        interimTranscriptRef.current = interimTranscript;
      }
      
      // Update display
      const fullTranscript = finalTranscriptRef.current + interimTranscriptRef.current;
      setCurrentTranscript(fullTranscript);
      
      // Handle speech pause for punctuation on interim text
      if (interimTranscript.trim()) {
        handleSpeechPause();
      }
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
    };

    recognition.onend = () => {
      // Add final punctuation if there's interim text
      if (interimTranscriptRef.current.trim()) {
        const punctuatedText = addPunctuation(interimTranscriptRef.current, 1000);
        finalTranscriptRef.current += punctuatedText;
        interimTranscriptRef.current = '';
      }
      
      // Send the final transcript
      if (finalTranscriptRef.current.trim()) {
        onTranscriptUpdate(finalTranscriptRef.current.trim());
        finalTranscriptRef.current = '';
      }
      
      setCurrentTranscript('');
      setIsRecording(false);
      setIsPaused(false);
      
      // Clear any pending pause timers
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      
      // For Safari, restart recognition automatically if it was recording
      if (browser === 'Safari' && isRecording) {
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
              setIsRecording(true);
            } catch (error) {
              console.error('Error restarting Safari recognition:', error);
            }
          }
        }, 100);
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
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
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
    
    // Clear timers and reset state
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    lastSpeechTimeRef.current = Date.now();
    
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
    
    // Reset punctuation state
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    lastSpeechTimeRef.current = Date.now();
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      console.log('Speech recognition started successfully');
    } catch (error) {
      console.error('Error starting recognition:', error);
      setRecognitionError('Failed to start recording. Please refresh the page and try again.');
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
          💡 Tip: Pause briefly for commas, longer for periods, use question words for "?"
        </p>
      </div>
    </div>
  );
};

export default VoiceRecorder;