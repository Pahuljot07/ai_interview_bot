"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function EvaluationPage({ responses, difficulty, topic, onStartOver, onBackToHome }) {
  // Calculate scores and metrics
 const calculateScore = () => {
  const totalQuestions = responses.length;
  const totalPercentage = responses.reduce((sum, r) => sum + (r.response === "Question skipped by user" ? 0 : (r.score || 0)), 0);
  return Math.round(totalPercentage / totalQuestions);
};



  const overallScore = calculateScore();
  const averageTimePerQuestion = responses.reduce((acc, r) => acc + r.timeSpent, 0) / responses.length;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBackToHome} className="flex items-center gap-2">
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
          Back to Home
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">Interview Results</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Overall Score Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">Interview Complete!</CardTitle>
              <CardDescription>
                {topic} • {difficulty} Level • {responses.length} Questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}%</div>
                <div className="text-xl text-gray-600">{getScoreLabel(overallScore)}</div>
                <Progress value={overallScore} className="w-full max-w-md mx-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-800">
                    {responses.filter((r) => r.response !== "Question skipped by user").length}
                  </div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-800">
                    {responses.filter((r) => r.response === "Question skipped by user").length}
                  </div>
                  <div className="text-sm text-gray-600">Questions Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-800">
                    {formatTime(Math.round(averageTimePerQuestion))}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Time per Question</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-800">
                    {formatTime(responses.reduce((acc, r) => acc + r.timeSpent, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-800">Question-by-Question Analysis</CardTitle>
              <CardDescription>Review your responses and performance for each question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {responses.map((response, index) => {
                const isSkipped = response.response === "Question skipped by user";
                const responseScore = response.score ?? 0;

                return (
                  <motion.div
                    key={response.questionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border rounded-lg p-4 space-y-3 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-gray-600">
                          Question {index + 1}
                        </Badge>
                        {isSkipped ? (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            Skipped
                          </Badge>
                        ) : (
                          <Badge className={getScoreColor(responseScore)}>{responseScore}%</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Time: {formatTime(response.timeSpent)}</div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-gray-800">{response.question}</h4>
                      <div
                        className={`p-3 rounded text-sm ${isSkipped ? "bg-gray-50 text-gray-500 italic" : "bg-gray-50 text-gray-700"
                          }`}
                      >
                        {isSkipped ? "This question was skipped" : response.response || "No response provided"}
                      </div>
                    </div>

                    {/* Conditionally render this section ONLY if question was NOT skipped */}
                    {!isSkipped && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        {response.feedback || "Detailed feedback not available."}
                      </div>

                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
