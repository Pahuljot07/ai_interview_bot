"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ThreeDBackground from "./Components/ThreeDBackground";
import InterviewSetup from "./Components/interview-setup";
import InterviewRecording from "./Components/interview-recording";
import EvaluationPage from "./Components/evaluation-page";
import { Button } from "@/components/ui/Button";
import { v4 as uuidv4 } from "uuid";
import AuthForm from "./Components/auth-form";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState("Easy");
  const [questionCount, setQuestionCount] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [topic, setTopic] = useState("AI-ML");
  const [responses, setResponses] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [sessionId] = useState(uuidv4());
  const [authVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);

  const fetchQuestions = async (topic, difficulty, count) => {
    const response = await fetch(`http://localhost:8000/questions/${topic}/${difficulty}/${count}`);
    const data = await response.json();
    return data;
  };

  const handleSetupComplete = async (selectedDifficulty, selectedTopic, selectedCount) => {
    setDifficulty(selectedDifficulty);
    setTopic(selectedTopic);
    setQuestionCount(selectedCount);

    const fetched = await fetchQuestions(selectedTopic, selectedDifficulty, selectedCount);
    setFilteredQuestions(fetched);

    setSetupCompleted(true);
    setInterviewStarted(true);
  };

  const handleQuestionResponse = async (response, timeSpent) => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const newResponse = {
      questionId: currentQuestion._id,
      question: currentQuestion.question,
      response,
      timeSpent,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const res = await fetch(`http://localhost:8000/evaluate-session/${sessionId}`, { method: "POST" });
      const data = await res.json();
      setResponses(data.results);
      setInterviewCompleted(true);
      setInterviewStarted(false);
    }
  };

  const resetInterview = () => {
    setStarted(false);
    setSetupCompleted(false);
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setFilteredQuestions([]);
  };

  const startOver = () => {
    setSetupCompleted(false);
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setFilteredQuestions([]);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50">
      {authVisible && (
        <div className="absolute inset-0 z-50 bg-white">
          <AuthForm
            onLogin={(userData) => {
              setUser(userData);
              setAuthVisible(false);
              setStarted(true); // <-- triggers InterviewSetup
            }}
            defaultMode={authMode}
          />
        </div>
      )}

      {!interviewStarted && !interviewCompleted && (
        <div className="fixed inset-0 z-0">
          <ThreeDBackground />
        </div>
      )}

      <div
        className={`relative z-10 ${
          interviewStarted || interviewCompleted
            ? ""
            : "flex flex-col items-center justify-center min-h-screen px-4 py-12"
        }`}
      >
        {interviewCompleted ? (
          <EvaluationPage
            responses={responses}
            difficulty={difficulty}
            topic={topic}
            onStartOver={startOver}
            onBackToHome={resetInterview}
          />
        ) : interviewStarted ? (
          filteredQuestions.length > 0 && currentQuestionIndex < filteredQuestions.length ? (
            <InterviewRecording
              question={filteredQuestions[currentQuestionIndex]}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={filteredQuestions.length}
              difficulty={difficulty}
              onNext={handleQuestionResponse}
              onBack={startOver}
              sessionId={sessionId}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Questions Available</h2>
              <p className="text-gray-600 mb-6">
                No questions found for {topic} at {difficulty} level.
              </p>
              <Button onClick={startOver} className="bg-gray-800 hover:bg-gray-700 text-white">
                Back to Setup
              </Button>
            </div>
          )
        ) : started && !setupCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <InterviewSetup onComplete={handleSetupComplete} onBack={() => setStarted(false)} />
          </motion.div>
        ) : (
          <div className="w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">AI Interview Assistant</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Practice your interview skills with our AI-powered interview bot. Get real-time feedback and improve
                your chances of landing your dream job.
              </p>
            </motion.div>

            <div className="flex justify-center gap-6 my-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    setAuthVisible(true);
                    setAuthMode("login");
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full text-lg font-medium"
                >
                  Login
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    setAuthVisible(true);
                    setAuthMode("signup");
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full text-lg font-medium"
                >
                  Signup
                </Button>
              </motion.div>
            </div>

            {!started && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-16 text-center"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-800 font-bold text-xl">1</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Choose Your Topic</h3>
                    <p className="text-gray-600">Select from AI-ML, Web Development, Data Science, and more.</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-800 font-bold text-xl">2</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Answer Questions</h3>
                    <p className="text-gray-600">Respond to tailored questions with voice or text input.</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-800 font-bold text-xl">3</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Get Evaluated</h3>
                    <p className="text-gray-600">Receive detailed feedback and scoring on your performance.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
