"use client"

import { motion } from "framer-motion"

export default function QuestionCard({ question, category, difficulty, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer border border-gray-100"
    >
      <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 mb-3">
        {category}
      </div>
      <div
        className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium ${
          difficulty === "Easy"
            ? "bg-green-100 text-green-700"
            : difficulty === "Intermediate"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        {difficulty}
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{question}</h3>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">Tap to answer</span>
        <motion.div
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  )
}
