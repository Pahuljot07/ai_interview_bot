"use client"

import { useState } from "react"
import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Slider } from "./ui/slider"

export default function InterviewSetup({ onComplete, onBack }) {
  const [difficulty, setDifficulty] = useState("Easy")
  const [questionCount, setQuestionCount] = useState(3)
  const [topic, setTopic] = useState("AI-ML")

  const handleSubmit = (e) => {
    e.preventDefault()
    onComplete(difficulty, topic, questionCount)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-gray-800">Interview Setup</CardTitle>
        <CardDescription className="text-center">
          Customize your interview experience by selecting the difficulty level and number of questions.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-medium">Interview Topic</Label>
            <RadioGroup
              value={topic}
              onValueChange={(value) => setTopic(value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {["AI-ML", "Web Development", "Data Science", "Mobile Development", "DevOps"].map((topicOption) => (
                <div key={topicOption} className="relative">
                  <RadioGroupItem value={topicOption} id={`topic-${topicOption}`} className="peer sr-only" />
                  <Label
                    htmlFor={`topic-${topicOption}`}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-gray-800 peer-data-[state=checked]:bg-gray-50 [&:has([data-state=checked])]:border-gray-800 cursor-pointer"
                  >
                    <div className="mb-2">
                      {topicOption === "AI-ML" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" x2="12" y1="19" y2="22" />
                          <line x1="8" x2="16" y1="22" y2="22" />
                        </svg>
                      )}
                      {topicOption === "Web Development" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-500"
                        >
                          <polyline points="16,18 22,12 16,6" />
                          <polyline points="8,6 2,12 8,18" />
                        </svg>
                      )}
                      {topicOption === "Data Science" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-purple-500"
                        >
                          <line x1="18" x2="18" y1="20" y2="10" />
                          <line x1="12" x2="12" y1="20" y2="4" />
                          <line x1="6" x2="6" y1="20" y2="14" />
                        </svg>
                      )}
                      {topicOption === "Mobile Development" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-orange-500"
                        >
                          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                          <line x1="12" x2="12.01" y1="18" y2="18" />
                        </svg>
                      )}
                      {topicOption === "DevOps" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-500"
                        >
                          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-700 text-center">{topicOption}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-medium">Difficulty Level</Label>
            <RadioGroup
              value={difficulty}
              onValueChange={(value) => setDifficulty(value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {["Easy", "Medium", "Hard"].map((level) => (
                <div key={level} className="relative">
                  <RadioGroupItem value={level} id={`difficulty-${level}`} className="peer sr-only" />
                  <Label
                    htmlFor={`difficulty-${level}`}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-gray-800 peer-data-[state=checked]:bg-gray-50 [&:has([data-state=checked])]:border-gray-800 cursor-pointer"
                  >
                    <div className="mb-2">
                      {level === "Easy" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-500"
                        >
                          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                        </svg>
                      )}
                      {level === "Medium" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-amber-500"
                        >
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                      )}
                      {level === "Hard" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-500"
                        >
                          <path d="M12 2v8" />
                          <path d="m4.93 10.93 1.41 1.41" />
                          <path d="M2 18h2" />
                          <path d="M20 18h2" />
                          <path d="m19.07 10.93-1.41 1.41" />
                          <path d="M22 22H2" />
                          <path d="m16 6-4 4-4-4" />
                          <path d="M16 18a4 4 0 0 0-8 0" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-700">{level}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-medium">Number of Questions</Label>
              <span className="text-2xl font-bold text-gray-800">{questionCount}</span>
            </div>
            <Slider
              value={[questionCount]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setQuestionCount(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white">
            Start Interview
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
