import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * VoiceRecorder - Record voice notes and convert to text
 * Uses Web Speech API for speech-to-text
 */
function VoiceRecorder({ onTranscript, disabled, isMobile }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if still recording (continuous)
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error('Failed to restart recognition:', err);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      setIsRecording(true);
      setRecordingTime(0);
      recognitionRef.current.start();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Failed to stop recording:', err);
      }
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <motion.button
        onClick={stopRecording}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
          'bg-red-500 hover:bg-red-600 text-white',
          isMobile ? 'text-xs' : 'text-sm'
        )}
        title="Stop recording"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Square className="w-4 h-4 fill-white" />
        </motion.div>
        <span className="font-medium">{formatTime(recordingTime)}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={startRecording}
      disabled={disabled || isProcessing}
      whileHover={disabled || isProcessing ? {} : { scale: 1.05 }}
      whileTap={disabled || isProcessing ? {} : { scale: 0.95 }}
      className={cn(
        'p-2 rounded-lg transition-all',
        'text-neutral-600 dark:text-neutral-400',
        'hover:bg-neutral-200 dark:hover:bg-neutral-800',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isMobile ? 'p-2' : 'p-2.5'
      )}
      title="Record voice note"
    >
      {isProcessing ? (
        <Loader2 className={cn('animate-spin', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
      ) : (
        <Mic className={cn(isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
      )}
    </motion.button>
  );
}

export default VoiceRecorder;
