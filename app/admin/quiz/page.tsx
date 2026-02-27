'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface QuizResult {
  id: string
  name: string
  email: string
  score: number
  total_time_ms: number
  question_times: number[]
  completed_at: string
}

export default function QuizManagementPage() {
  const [quizActive, setQuizActive] = useState(false)
  const [results, setResults] = useState<QuizResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchQuizStatus()
    fetchResults()

    // Real-time subscription for quiz status
    const channel = supabase
      .channel('quiz_status_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quiz_settings', filter: 'id=eq.1' },
        (payload) => {
          setQuizActive(payload.new.is_active)
          if (payload.new.is_active) {
            setResults([]) // Clear results when starting new quiz
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quiz_results' },
        () => {
          fetchResults() // Refresh results when someone finishes
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchQuizStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_settings')
        .select('is_active')
        .eq('id', 1)
        .single()
      
      if (!error && data) {
        setQuizActive(data.is_active)
      }
    } catch (err) {
      console.error('Error fetching quiz status:', err)
    }
  }

  const fetchResults = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .order('score', { ascending: false })
        .order('total_time_ms', { ascending: true }) // Tie-breaker: less time is better
      
      if (!error) {
        setResults(data || [])
      }
    } catch (err) {
      console.error('Error fetching results:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = async () => {
    try {
      // 1. Delete previous results
      const { error: deleteError } = await supabase
        .from('quiz_results')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) throw deleteError

      // 2. Start quiz
      const { error: updateError } = await supabase
        .from('quiz_settings')
        .update({ is_active: true })
        .eq('id', 1)

      if (updateError) throw updateError
      
      setQuizActive(true)
      setResults([])
      alert('Previous results cleared and new Quiz has been started!')
    } catch (err: any) {
      console.error('Error starting quiz:', err)
      alert('Failed to start quiz: ' + err.message)
    }
  }

  const handleCloseQuiz = async () => {
    try {
      const { error } = await supabase
        .from('quiz_settings')
        .update({ is_active: false })
        .eq('id', 1)

      if (error) throw error
      setQuizActive(false)
      fetchResults() // Final results on close
      alert('Quiz has been closed!')
    } catch (err: any) {
      console.error('Error closing quiz:', err)
      alert('Failed to close quiz: ' + err.message)
    }
  }

  const topThree = results.slice(0, 3)
  const filteredResults = results.filter(r => 
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/admin/dashboard" className="text-primary hover:underline mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Quiz Management</h1>
            <p className="text-muted-foreground">Control status and view precise leaderboard</p>
          </div>
          <Button onClick={fetchResults} variant="outline" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Leaderboard'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <Card className="lg:col-span-1 border-primary/20 bg-primary/5 h-fit shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <span className="p-2 bg-primary/10 rounded-lg text-2xl">⚡</span>
                Quiz Controls
              </CardTitle>
              <CardDescription>Reset data and manage live event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 p-6 bg-background rounded-xl border border-border text-center shadow-sm">
                <div className={`h-12 w-12 rounded-full animate-pulse ${quizActive ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,44,44,0.6)]'}`} />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {quizActive ? 'LIVE & ACTIVE' : 'CLOSED / INACTIVE'}
                  </h3>
                  <p className="text-xs text-muted-foreground italic">
                    {quizActive ? 'New results will clear previous data' : 'Press start to clear results & go live'}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                  <Button 
                    onClick={handleStartQuiz} 
                    disabled={quizActive}
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md h-12 font-bold"
                  >
                    Start New Quiz
                  </Button>
                  <Button 
                    onClick={handleCloseQuiz} 
                    disabled={!quizActive}
                    variant="destructive"
                    className="w-full shadow-md h-12 font-bold"
                  >
                    Close Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="lg:col-span-2 shadow-2xl border-border overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6 border-b space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  🏆 Precise Leaderboard
                </CardTitle>
                <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                  Score + Milliseconds
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardDescription>Ranked by Accuracy then Speed (Fastest completion wins ties)</CardDescription>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or email..." 
                    className="pl-9 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Top 3 Podium Style - Only show when not searching or when results are top */}
              {!searchQuery && results.length > 0 && (
                <div className="bg-muted/10 p-6 grid grid-cols-3 gap-4 border-b">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center justify-end pt-4">
                    {topThree[1] && (
                      <>
                        <div className="text-2xl mb-1">🥈</div>
                        <div className="w-full bg-background p-3 rounded-t-xl border-x border-t text-center shadow-sm">
                          <p className="font-bold text-sm truncate">{topThree[1].name}</p>
                          <p className="text-primary font-bold text-lg">{topThree[1].score}</p>
                          <p className="text-[10px] text-muted-foreground">{(topThree[1].total_time_ms / 1000).toFixed(3)}s</p>
                        </div>
                      </>
                    )}
                  </div>
                  {/* 1st Place */}
                  <div className="flex flex-col items-center justify-end">
                    {topThree[0] && (
                      <>
                        <div className="text-4xl mb-1">🥇</div>
                        <div className="w-full bg-primary/5 p-4 rounded-t-xl border-x border-t border-primary/20 text-center shadow-md">
                          <p className="font-black text-foreground truncate">{topThree[0].name}</p>
                          <p className="text-primary font-black text-2xl">{topThree[0].score}</p>
                          <p className="text-xs text-muted-foreground">{(topThree[0].total_time_ms / 1000).toFixed(3)}s</p>
                        </div>
                      </>
                    )}
                  </div>
                  {/* 3rd Place */}
                  <div className="flex flex-col items-center justify-end pt-6">
                    {topThree[2] && (
                      <>
                        <div className="text-2xl mb-1">🥉</div>
                        <div className="w-full bg-background p-3 rounded-t-xl border-x border-t text-center shadow-sm">
                          <p className="font-bold text-sm truncate">{topThree[2].name}</p>
                          <p className="text-primary font-bold text-lg">{topThree[2].score}</p>
                          <p className="text-[10px] text-muted-foreground">{(topThree[2].total_time_ms / 1000).toFixed(3)}s</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                {results.length === 0 ? (
                  <div className="text-center py-20 bg-muted/20">
                    <p className="text-muted-foreground font-medium text-lg">No participants yet</p>
                    <p className="text-sm text-muted-foreground">Winners will appear here in real-time.</p>
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-20 bg-muted/20">
                    <p className="text-muted-foreground font-medium text-lg">No matches found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[80px] pl-6">Rank</TableHead>
                        <TableHead>Participant</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-right pr-6">Time Taken</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((result) => {
                        const originalRank = results.findIndex(r => r.id === result.id) + 1;
                        return (
                          <TableRow 
                            key={result.id} 
                            className={`${originalRank <= 3 ? 'font-bold' : ''} ${originalRank === 1 ? 'bg-primary/5' : ''} cursor-pointer hover:bg-muted/50 transition-colors`}
                            onClick={() => setSelectedResult(result)}
                          >
                            <TableCell className="pl-6 font-bold">
                              #{originalRank}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{result.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{result.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-lg text-primary font-black">{result.score}</span>
                              <span className="text-[10px] text-muted-foreground ml-1">/ 20</span>
                            </TableCell>
                            <TableCell className="text-right pr-6 font-mono text-xs">
                              <span className="text-foreground font-bold">{(result.total_time_ms / 1000).toFixed(3)}</span>s
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed View Modal */}
        {selectedResult && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full shadow-2xl border-primary/20 animate-in zoom-in duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div>
                  <CardTitle className="text-xl font-bold">{selectedResult.name}'s Performance</CardTitle>
                  <CardDescription>Per-question time breakdown</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedResult(null)} className="h-8 w-8 p-0">
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Rank</p>
                    <p className="text-xl font-black text-primary">#{results.findIndex(r => r.id === selectedResult.id) + 1}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Score</p>
                    <p className="text-xl font-black text-primary">{selectedResult.score}/20</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Avg. Speed</p>
                    <p className="text-xl font-black text-primary">{(selectedResult.total_time_ms / 20000).toFixed(2)}s</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Total Time</p>
                    <p className="text-xl font-black text-primary">{(selectedResult.total_time_ms / 1000).toFixed(3)}s</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedResult.question_times?.map((time, idx) => (
                    <div key={idx} className="border rounded-md p-2 text-center bg-card">
                      <p className="text-[10px] text-muted-foreground font-bold mb-1">Q{idx + 1}</p>
                      <p className="text-sm font-mono font-bold">{(time / 1000).toFixed(2)}s</p>
                    </div>
                  ))}
                </div>
                
                <Button onClick={() => setSelectedResult(null)} className="w-full mt-8">
                  Close Details
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}