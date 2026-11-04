import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Bot,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  User,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { InterviewEvaluation, InterviewSession } from '../../types';

interface LiveInterviewRoomProps {
  interviewId?: string;
  jobId?: string;
  applicationId?: string;
  onNavigate: (path: string) => void;
}

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({
  interviewId: initialInterviewId,
  jobId,
  applicationId,
  onNavigate,
}) => {
  const { user } = useAuth();

  // Interview Session State
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [starting, setStarting] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Live Answer & Input
  const [answerText, setAnswerText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  // Audio / Speech Synthesis (AI Voice)
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);

  // Media (Webcam & Mic stream)
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Final evaluation modal
  const [showEvaluation, setShowEvaluation] = useState<boolean>(false);
  const [evaluationData, setEvaluationData] = useState<InterviewEvaluation | null>(null);

  // Setup Video Stream
  useEffect(() => {
    let active = true;

    async function setupCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true,
          });
          if (active) {
            mediaStreamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          }
        }
      } catch (err: any) {
        console.warn('Camera/Mic permission not granted or device unavailable:', err.message);
        if (active) {
          setStreamError('Camera preview unavailable (check device permissions or camera privacy).');
          setIsVideoOn(false);
        }
      }
    }

    setupCamera();

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Setup Speech Recognition (STT)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setAnswerText((prev) => {
            // Avoid duplicate text appending if continuous
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return `${prev}${separator}${currentTranscript.trim()}`;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    if (session && session.status === 'IN_PROGRESS') {
      const interval = setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session?.status]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // Text to Speech Function (AI Speaks)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    // Extract cleanest question sentence for speech
    const cleanText = text
      .replace(/Question \d+ of \d+:/gi, '')
      .replace(/https?:\/\/\S+/gi, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  // Start or Load Interview Session
  useEffect(() => {
    async function initSession() {
      setLoading(true);
      setError(null);

      try {
        if (initialInterviewId) {
          const res = await api.getInterview(initialInterviewId);
          setSession(res.interview);
          if (res.interview.status === 'COMPLETED' && res.interview.evaluation) {
            setEvaluationData(res.interview.evaluation);
            setShowEvaluation(true);
          } else if (autoSpeak && res.interview.messages.length > 0) {
            const lastAiMsg = [...res.interview.messages].reverse().find((m) => m.sender === 'ai');
            if (lastAiMsg) speakText(lastAiMsg.text);
          }
        } else if (jobId) {
          setStarting(true);
          const res = await api.startInterview(jobId, applicationId);
          setSession(res.interview);
          if (autoSpeak) {
            speakText(res.firstQuestion);
          }
        } else {
          setError('No job or interview session specified.');
        }
      } catch (err: any) {
        console.error('Failed to initialize interview:', err);
        setError(err.message || 'Failed to start interview session.');
      } finally {
        setLoading(false);
        setStarting(false);
      }
    }

    initSession();

    return () => {
      stopSpeaking();
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [initialInterviewId, jobId]);

  // Toggle Video
  const handleToggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = !t.enabled));
      setIsVideoOn(!isVideoOn);
    }
  };

  // Toggle Microphone
  const handleToggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !t.enabled));
      setIsMicOn(!isMicOn);
    }
  };

  // Toggle Speech Recognition (STT)
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech-to-text is not supported in this browser. Please type your answer directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        stopSpeaking(); // stop AI voice so it does not feed into mic
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!session || !answerText.trim() || submitting) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    stopSpeaking();

    setSubmitting(true);
    try {
      const res = await api.submitInterviewAnswer(session._id, answerText.trim());
      setSession(res.interview);
      setAnswerText('');

      if (res.isComplete && res.evaluation) {
        setEvaluationData(res.evaluation);
        setShowEvaluation(true);
        if (autoSpeak) {
          speakText(
            `Congratulations! You have completed the live interview. Your overall score is ${res.evaluation.overallScore} percent.`
          );
        }
      } else if (res.nextQuestion && autoSpeak) {
        speakText(res.nextQuestion);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || starting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-indigo-600/30 border-2 border-indigo-400 text-indigo-300">
              <Bot className="w-10 h-10 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-black tracking-tight">Preparing Your Live AI Interview</h2>
          <p className="text-xs text-slate-400">
            Connexa AI is analyzing the job requirements and your candidate profile to formulate tailored technical questions...
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Session Error</h3>
          <p className="text-xs text-slate-500">{error || 'Could not load interview session.'}</p>
          <button
            onClick={() => onNavigate('/employee/jobs')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionNumber = Math.min(session.currentQuestionIndex + 1, session.totalQuestions);
  const progressPercent = Math.round((session.currentQuestionIndex / session.totalQuestions) * 100);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('/employee/dashboard')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Exit Interview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-black tracking-tight text-white flex items-center space-x-1.5">
                <span>Live AI Interview</span>
                <span className="text-indigo-400 font-normal">|</span>
                <span className="text-slate-300 font-semibold">{session.jobTitle}</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{session.companyName}</p>
          </div>
        </div>

        {/* Progress & Controls */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono font-bold text-slate-200">{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-indigo-400">
              Question {currentQuestionNumber} of {session.totalQuestions}
            </span>
            <div className="w-24 sm:w-32 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Split 2-Column layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column: Live Video & AI Interviewer Visualizer (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Candidate Webcam Feed */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden aspect-video shadow-2xl flex items-center justify-center">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center space-y-2 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-slate-400">{user?.name} (Camera Off)</span>
              </div>
            )}

            {streamError && !isVideoOn && (
              <div className="absolute top-2 inset-x-2 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[10px] p-2 rounded-xl text-center">
                {streamError}
              </div>
            )}

            {/* Candidate Name Badge */}
            <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/50 flex items-center space-x-1.5 text-xs font-bold text-slate-200">
              <span>{user?.name || 'Candidate'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            {/* Video / Audio Controls */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <button
                onClick={handleToggleMic}
                className={`p-2 rounded-xl transition-all ${
                  isMicOn
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
                title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleVideo}
                className={`p-2 rounded-xl transition-all ${
                  isVideoOn
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* AI Interviewer Persona Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl flex-1">
            {/* Background Glow */}
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* AI Avatar with dynamic audio pulsing */}
            <div className="relative mb-3">
              {isAiSpeaking && (
                <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-75 blur-sm animate-pulse" />
              )}
              <div
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isAiSpeaking
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-400/30'
                    : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                <Bot className="w-8 h-8" />
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
              <span>Connexa AI Interviewer</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </h3>
            <p className="text-[11px] text-slate-400">Technical Evaluator & Hiring Lead</p>

            {/* Speaking Audio Wave Visualizer */}
            <div className="mt-4 flex items-center space-x-1 h-6">
              {[4, 8, 14, 22, 16, 26, 12, 18, 6].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isAiSpeaking ? 'bg-indigo-400 animate-bounce' : 'bg-slate-700'
                  }`}
                  style={{
                    height: isAiSpeaking ? `${h}px` : '4px',
                    animationDelay: `${idx * 75}ms`,
                  }}
                />
              ))}
            </div>

            <div className="mt-2 text-xs font-semibold">
              {isAiSpeaking ? (
                <span className="text-indigo-400 flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Speaking Question...</span>
                </span>
              ) : isListening ? (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <Mic className="w-3.5 h-3.5 animate-ping" />
                  <span>Listening to your answer...</span>
                </span>
              ) : submitting ? (
                <span className="text-amber-400">Evaluating your answer...</span>
              ) : (
                <span className="text-slate-500">Ready for your answer</span>
              )}
            </div>

            {/* AI Voice Toggle & Replay */}
            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={() => {
                  if (isAiSpeaking) stopSpeaking();
                  else {
                    const currentQ = session.questions[session.currentQuestionIndex];
                    if (currentQ) speakText(currentQ);
                  }
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                title="Replay Audio of Current Question"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay Question</span>
              </button>

              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-colors ${
                  autoSpeak
                    ? 'bg-indigo-900/40 border-indigo-700 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title={autoSpeak ? 'Auto-voice ON' : 'Auto-voice Muted'}
              >
                {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Transcript & Voice Answer Input (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4 h-[calc(100vh-8.5rem)]">
          {/* Conversational Transcript Box */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 overflow-y-auto space-y-4 shadow-xl">
            {session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'candidate'
                      ? 'bg-indigo-600 text-white font-medium rounded-br-xs'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Micro Feedback Badge if candidate answer */}
                  {msg.sender === 'candidate' && msg.feedback && (
                    <div className="mt-2.5 pt-2 border-t border-indigo-500/30 text-[11px] text-indigo-200 italic flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-indigo-300" />
                      <span>{msg.feedback}</span>
                    </div>
                  )}

                  <div className="mt-1 text-[10px] opacity-60 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.sender === 'candidate' && (
                  <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          {/* Live Response Box (Mic + Text) */}
          {session.status === 'IN_PROGRESS' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                  <Mic className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Your Live Answer (Voice & Text)</span>
                </span>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">
                    {answerText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Click the mic button to speak your answer, or type directly here. Provide detailed examples and technical trade-offs..."
                  rows={3}
                  disabled={submitting}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Voice Mic Record Button */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={submitting}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 shadow-sm ${
                      isListening
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Stop Speaking</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Speak Answer (Live Mic)</span>
                      </>
                    )}
                  </button>

                  {isListening && (
                    <span className="text-xs text-rose-400 font-semibold animate-pulse flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                      <span>Transcribing your voice...</span>
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim() || submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-black text-sm text-white">Interview Concluded</h4>
              <p className="text-xs text-slate-400">
                You have answered all questions. Your comprehensive evaluation report is ready.
              </p>
              <button
                onClick={() => setShowEvaluation(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Final Scorecard</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Final Evaluation Scorecard Modal */}
      {showEvaluation && evaluationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 overflow-y-auto max-h-[90vh] space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="text-center space-y-2 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                <Award className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Live AI Interview Evaluation
              </h2>
              <p className="text-xs text-slate-500">
                Comprehensive performance scorecard for {session.jobTitle} at {session.companyName}
              </p>
            </div>

            {/* Scorecard Hero */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                  Overall Score
                </span>
                <div className="text-5xl font-black text-slate-900 mt-1">
                  {evaluationData.overallScore}
                  <span className="text-2xl text-slate-400 font-medium">/100</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${
                      evaluationData.hiringRecommendation === 'STRONG_HIRE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : evaluationData.hiringRecommendation === 'HIRE'
                        ? 'bg-indigo-100 text-indigo-800'
                        : evaluationData.hiringRecommendation === 'CONSIDER'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Recommendation: {evaluationData.hiringRecommendation.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Technical</span>
                  <div className="text-xl font-black text-indigo-600 mt-1">
                    {evaluationData.technicalScore}%
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Communication</span>
                  <div className="text-xl font-black text-purple-600 mt-1">
                    {evaluationData.communicationScore}%
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Problem Solving</span>
                  <div className="text-xl font-black text-emerald-600 mt-1">
                    {evaluationData.problemSolvingScore}%
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Executive Summary</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {evaluationData.summary}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Strengths</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {evaluationData.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start space-x-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Areas For Growth</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {evaluationData.areasForImprovement.map((area, idx) => (
                    <li key={idx} className="flex items-start space-x-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowEvaluation(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Inspect Interview Transcript
              </button>

              <button
                onClick={() => onNavigate('/employee/dashboard')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Return to Candidate Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
