"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/Button"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"



export default function InterviewRecording({ question, questionNumber, totalQuestions, difficulty, onNext, onBack, sessionId }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [stream, setStream] = useState(null)
  const [recognition, setRecognition] = useState(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [hasMicrophone, setHasMicrophone] = useState(false)
  const [mediaError, setMediaError] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [mediaMode, setMediaMode] = useState("manual")
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const startTimeRef = useRef(null)


  const videoRef = useRef(null)
  const intervalRef = useRef(null)

  // Check available media devices
  const checkMediaDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("Media devices API not supported")
        return
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      const audioDevices = devices.filter((device) => device.kind === "audioinput")

      setHasCamera(videoDevices.length > 0)
      setHasMicrophone(audioDevices.length > 0)

      if (videoDevices.length > 0 && audioDevices.length > 0) {
        setMediaMode("full")
      } else if (audioDevices.length > 0) {
        setMediaMode("audio")
      } else {
        setMediaMode("manual")
      }
    } catch (error) {
      console.error("Error checking media devices:", error)
      setMediaMode("manual")
    }
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onresult = (event) => {
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " "
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript)
          }
        }

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
          if (event.error === "not-allowed") {
            setMediaError("Microphone access denied. You can continue typing manually.")
          }
        }

        setRecognition(recognition)
      }
    }

    checkMediaDevices()
  }, [])

  // Start recording with graceful fallbacks
  const startRecording = async () => {
    setMediaError(null)
    setIsRecording(true)
    startTimeRef.current = performance.now()
    setTimeElapsed(0) // optional, to reset visible timer if you're showing one


    // Always start the timer regardless of media access
    intervalRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    // Try to access media devices if available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        let mediaStream = null

        // Try different media configurations
        const mediaConfigs = [
          { video: true, audio: true },
          { video: false, audio: true },
        ]

        for (const config of mediaConfigs) {
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia(config)
            console.log(`Successfully got media with config:`, config)
            break
          } catch (error) {
            console.log(`Failed with config ${JSON.stringify(config)}:`, error)
            continue
          }
        }

        if (mediaStream) {
          setStream(mediaStream)

          if (videoRef.current && mediaStream.getVideoTracks().length > 0) {
            const videoOnlyStream = new MediaStream([mediaStream.getVideoTracks()[0]]);
            videoRef.current.srcObject = videoOnlyStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(err => console.error("Video play failed:", err));
            };
          }


          // Start speech recognition if we have audio
          if (recognition && mediaStream.getAudioTracks().length > 0) {
            try {
              recognition.start()
            } catch (error) {
              console.log("Speech recognition already running or failed:", error)
            }
          }
        } else {
          console.log("No media stream available, continuing in manual mode")
          setMediaError("Camera and microphone not available. You can continue with manual text input.")
        }
      } catch (error) {
        console.log("Media access failed:", error)

        let errorMessage = "Media recording not available. "
        if (error.name === "NotAllowedError") {
          errorMessage += "Please allow camera/microphone access for recording, or continue with manual input."
        } else {
          errorMessage += "You can continue with manual text input."
        }

        setMediaError(errorMessage)
      }
    } else {
      setMediaError("Media recording not supported in this browser. You can continue with manual text input.")
    }
  }

  // Stop recording and proceed to next question
  const handleNext = async () => {
    setIsRecording(false)

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (recognition && isListening) {
      try {
        recognition.stop()
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
      }
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // ✅ Accurate time tracking
    const endTime = performance.now()
    const timeSpent = Math.round((endTime - startTimeRef.current) / 1000)

    // ✅ Save answer to DB
    await fetch("http://localhost:8000/save-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        questionId: question._id,
        user_answer: transcript,
        time_spent: timeSpent,
      }),
    })

    onNext(transcript, timeSpent)
  }


  // Skip current question and move to next
  const handleSkip = async () => {
    setIsRecording(false)

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (recognition && isListening) {
      try {
        recognition.stop()
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
      }
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // ✅ Accurate time tracking
    const endTime = performance.now()
    const timeSpent = Math.round((endTime - startTimeRef.current) / 1000)

    // ✅ Save empty answer for skipped question
    await fetch("http://localhost:8000/save-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        questionId: question._id,
        user_answer: "",
        time_spent: timeSpent,
      }),
    })

    onNext("", timeSpent)
  }



  // Start speech recognition manually
  const startListening = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setMediaError("Your browser does not support audio recording.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const formData = new FormData()
        formData.append("audio", audioBlob, "recording.webm")

        try {
          const response = await fetch("http://localhost:8000/transcribe", {
            method: "POST",
            body: formData,
          })
          const data = await response.json()
          setTranscript(data.transcript || "")
        } catch (err) {
          console.error("Transcription error:", err)
          setMediaError("Failed to transcribe audio.")
        }
      }

      mediaRecorder.start()
      setIsListening(true)
    } catch (err) {
      console.error("Recording error:", err)
      setMediaError("Microphone access failed.")
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }


  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Auto-start recording when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      startRecording()
    }, 1000)

    return () => {
      clearTimeout(timer)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [question._id])
useEffect(() => {
  setTranscript(""); // Clear transcript
  setTimeElapsed(0); // Reset timer
  startTimeRef.current = performance.now(); // Reset timer base

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }

  // ⏳ Add delay to ensure stream is ready before attaching
  const timer = setTimeout(() => {
    if (stream && videoRef.current && stream.getVideoTracks().length > 0) {
      const videoOnlyStream = new MediaStream([stream.getVideoTracks()[0]]);
      videoRef.current.srcObject = videoOnlyStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch((err) => console.error("Video play failed:", err));
      };
    }
  }, 500); // Half-second delay to let media devices reinitialize

  return () => {
    clearTimeout(timer);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
}, [question._id]);






  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">AI Interview Bot</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Info/Error Alert */}
      {mediaError && (
        <div className="max-w-7xl mx-auto mb-6">
          <Alert>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <AlertDescription>{mediaError}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Video Recording Section */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {stream ? "Recording" : "Active"}
                </div>
              )}

              {/* Timer */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
                {formatTime(timeElapsed)}
              </div>
            </div>

            {/* Media controls */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={hasMicrophone ? "text-green-600" : "text-gray-400"}
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                      <line x1="8" x2="16" y1="22" y2="22" />
                    </svg>
                    <span className={hasMicrophone ? "text-green-600" : "text-gray-500"}>
                      {hasMicrophone ? "Microphone" : "No Microphone"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={hasCamera ? "text-green-600" : "text-gray-400"}
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    <span className={hasCamera ? "text-green-600" : "text-gray-500"}>
                      {hasCamera ? "Camera" : "No Camera"}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs">
                  {mediaMode === "full" ? "Full Recording" : mediaMode === "audio" ? "Audio Only" : "Manual Mode"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question and Transcript Section */}
        <div className="space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-gray-600">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge
                className={
                  difficulty === "Easy"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : difficulty === "Intermediate"
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                }
              >
                {difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              You can skip if needed
            </div>
          </div>

          {/* Question */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{question.question}</h2>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  {question.category}
                </div>

                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  {question.timeLimit} mins
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Your Response</h3>
                {recognition && hasMicrophone && (
                  <div className="flex gap-2">
                    {!isListening ? (
                      <Button onClick={startListening} size="sm" variant="outline">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" x2="12" y1="19" y2="22" />
                          <line x1="8" x2="16" y1="22" y2="22" />
                        </svg>
                        Voice Input
                      </Button>
                    ) : (
                      <Button onClick={stopListening} size="sm" variant="outline">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                        Stop Voice
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={
                  recognition && hasMicrophone
                    ? "Start speaking or type your response here. Your speech will be transcribed automatically..."
                    : "Type your response here..."
                }
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Setup
            </Button>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5,4 15,12 5,20 5,4" />
                  <line x1="19" x2="19" y1="5" y2="19" />
                </svg>
                Skip Question
              </Button>

              <Button onClick={handleNext} className="bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2">
                {questionNumber === totalQuestions ? "Finish Interview" : "Next Question"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
