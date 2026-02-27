'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, Timer, Trophy } from 'lucide-react'

// 20 Random GK Questions
const QUIZ_QUESTIONS = [
  { id: 1, question: "Which is the largest planet in our solar system?", options: ["Mars", "Jupiter", "Saturn", "Neptune"], correct: 1 },
  { id: 2, question: "Who is known as the 'Iron Man of India'?", options: ["Sardar Vallabhbhai Patel", "Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose"], correct: 0 },
  { id: 3, question: "Which river is known as the 'Ganges of the South'?", options: ["Krishna", "Godavari", "Cauvery", "Narmada"], correct: 1 },
  { id: 4, question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Rome"], correct: 2 },
  { id: 5, question: "Which element has the chemical symbol 'O'?", options: ["Gold", "Oxygen", "Osmium", "Silver"], correct: 1 },
  { id: 6, question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: 1 },
  { id: 7, question: "Which is the smallest continent by land area?", options: ["Europe", "Australia", "Antarctica", "South America"], correct: 1 },
  { id: 8, question: "What is the power house of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correct: 2 },
  { id: 9, question: "Which country is known as the 'Land of the Rising Sun'?", options: ["China", "Japan", "South Korea", "Thailand"], correct: 1 },
  { id: 10, question: "What is the national animal of India?", options: ["Lion", "Elephant", "Tiger", "Leopard"], correct: 2 },
  { id: 11, question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
  { id: 12, question: "Who discovered Penicillin?", options: ["Marie Curie", "Albert Einstein", "Alexander Fleming", "Isaac Newton"], correct: 2 },
  { id: 13, question: "Which planet is known as the 'Red Planet'?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
  { id: 14, question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], correct: 2 },
  { id: 15, question: "Which gas is most abundant in the Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correct: 2 },
  { id: 16, question: "Who painted the 'Mona Lisa'?", options: ["Pablo Picasso", "Vincent van Gogh", "Leonardo da Vinci", "Claude Monet"], correct: 2 },
  { id: 17, question: "Which is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { id: 18, question: "What is the boiling point of water at sea level?", options: ["90°C", "100°C", "110°C", "120°C"], correct: 1 },
  { id: 19, question: "Which instrument is used to measure atmospheric pressure?", options: ["Thermometer", "Barometer", "Hydrometer", "Anemometer"], correct: 1 },
  { id: 20, question: "Who was the first woman Prime Minister of India?", options: ["Pratibha Patil", "Sarojini Naidu", "Indira Gandhi", "Sonia Gandhi"], correct: 2 },
]

export default function QuizPlayPage() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [quizStatus, setQuizStatus] = useState<'waiting' | 'active' | 'finished'>('waiting')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10000) // 10 seconds in milliseconds
  const [totalTimeTaken, setTotalTimeTaken] = useState(0) // in milliseconds
  const [questionTimes, setQuestionTimes] = useState<number[]>([]) // time taken for each question
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickRef = useRef<number>(0)

  useEffect(() => {
    const email = sessionStorage.getItem('quiz_user_email')
    const name = sessionStorage.getItem('quiz_user_name')
    if (!email) {
      router.push('/quiz')
      return
    }
    setUserEmail(email)
    setUserName(name || 'Participant')

    // Initial check and Real-time subscription for quiz status
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_settings')
          .select('is_active')
          .eq('id', 1)
          .single()
        
        if (!error && data) {
          setQuizStatus(data.is_active ? 'active' : 'waiting')
        }
      } catch (err) {
        console.error('Error fetching quiz status:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // Real-time subscription
    const channel = supabase
      .channel('quiz_status_user')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quiz_settings', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new.is_active) {
            setQuizStatus('active')
            setCurrentQuestionIndex(0)
            setScore(0)
            setTotalTimeTaken(0)
          } else {
            setQuizStatus('waiting')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  useEffect(() => {
    if (quizStatus === 'active') {
      startTimer()
    } else {
      stopTimer()
    }
    return () => stopTimer()
  }, [quizStatus, currentQuestionIndex])

  const startTimer = () => {
    stopTimer()
    setTimeLeft(10000)
    lastTickRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      setTimeLeft((prev) => {
        const next = prev - delta
        if (next <= 0) {
          handleNextQuestion()
          return 10000
        }
        return next
      })
    }, 10) // Update every 10ms for precision
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const handleNextQuestion = (selectedOptionIndex?: number) => {
    const timeSpentOnQuestion = 10000 - timeLeft
    setTotalTimeTaken(prev => prev + timeSpentOnQuestion)
    setQuestionTimes(prev => [...prev, timeSpentOnQuestion])

    // Record answer
    if (selectedOptionIndex !== undefined) {
      if (selectedOptionIndex === QUIZ_QUESTIONS[currentQuestionIndex].correct) {
        setScore((prev) => prev + 1)
      }
    }

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      setQuizStatus('finished')
      saveResults(
        score + (selectedOptionIndex === QUIZ_QUESTIONS[currentQuestionIndex].correct ? 1 : 0), 
        totalTimeTaken + timeSpentOnQuestion,
        [...questionTimes, timeSpentOnQuestion]
      )
    }
  }

  const saveResults = async (finalScore: number, finalTotalTime: number, finalQuestionTimes: number[]) => {
    // Save to database
    try {
      await supabase.from('quiz_results').insert({
        email: userEmail,
        name: userName,
        score: finalScore,
        total_time_ms: finalTotalTime,
        question_times: finalQuestionTimes,
        completed_at: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error saving results:', err)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (quizStatus === 'waiting') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="mb-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <CardTitle className="text-2xl mb-4">Waiting for Admin</CardTitle>
          <CardDescription className="text-lg">
            Hello, <strong>{userName}</strong>! The event has not started yet. Please wait for the admin to start the quiz.
          </CardDescription>
          <p className="mt-6 text-sm text-muted-foreground italic">
            Questions will appear automatically once the admin starts the event.
          </p>
        </Card>
      </main>
    )
  }

  if (quizStatus === 'finished') {
    const totalSecs = (totalTimeTaken / 1000).toFixed(3)
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="mb-6 flex justify-center text-primary">
            <Trophy size={64} />
          </div>
          <CardTitle className="text-3xl mb-2">Quiz Completed!</CardTitle>
          <CardDescription className="text-xl mb-6">
            Great job, {userName}!
          </CardDescription>
          
          <div className="bg-muted p-6 rounded-xl mb-8">
            <p className="text-sm uppercase tracking-wider font-semibold text-muted-foreground mb-1">Your Score</p>
            <p className="text-5xl font-bold text-primary">{score} / {QUIZ_QUESTIONS.length}</p>
            <p className="text-sm mt-4 text-muted-foreground font-medium">
              Total Time: <span className="text-foreground">{totalSecs}s</span>
            </p>
            <p className="text-sm mt-2 text-muted-foreground italic">
              (Lower time is better for ranking!)
            </p>
          </div>

          <Button onClick={() => router.push('/')} className="w-full">
            Back to Home
          </Button>
        </Card>
      </main>
    )
  }

  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex]
  const displaySecs = Math.floor(timeLeft / 1000)
  const displayMs = Math.floor((timeLeft % 1000) / 10)
  const displayNs = Math.floor((timeLeft % 10) * 100)

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        {/* Progress & Timer */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1 flex-1 mr-8">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100} className="h-2" />
          </div>
          <div className="flex flex-col items-center bg-primary/10 p-3 rounded-lg min-w-[120px] border border-primary/20">
            <Timer className={`h-4 w-4 mb-1 ${timeLeft <= 3000 ? 'text-red-500 animate-bounce' : 'text-primary'}`} />
            <div className={`font-mono text-2xl font-bold flex items-baseline ${timeLeft <= 3000 ? 'text-red-500' : 'text-primary'}`}>
              <span>{displaySecs}</span>
              <span className="text-sm mx-0.5">.</span>
              <span className="text-lg">{displayMs.toString().padStart(2, '0')}</span>
              <span className="text-xs ml-0.5 opacity-70">{displayNs.toString().padStart(2, '0')}</span>
              <span className="text-xs ml-1 font-normal opacity-50">s</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-2 shadow-lg mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl md:text-3xl font-bold leading-tight">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {currentQ.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-6 px-4 text-lg justify-start border-2 hover:border-primary hover:bg-primary/5 transition-all text-left whitespace-normal"
                onClick={() => handleNextQuestion(index)}
              >
                <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3 font-bold text-sm shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground text-sm">
          Select an answer quickly! You have 10 seconds per question.
        </div>
      </div>
    </main>
  )
}
