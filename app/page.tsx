'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="text-3xl font-bold text-primary">Prayagraj ka Novel</div>
          <div className="flex gap-4">
            <Link href="/admin/login">
              <Button variant="outline">Admin Panel</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            General Knowledge Competition
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Test your knowledge, compete with the best, and become a champion!
          </p>
          
          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                Registration
              </Button>
            </Link>
            <Link href="/quiz">
              <Button size="lg" variant="outline" className="px-8">
                Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Prizes Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">Win Exciting Prizes! 🏆</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Second Prize */}
            <div className="order-2 md:order-1 flex flex-col items-center">
              <div className="bg-card border-2 border-slate-300 rounded-2xl p-8 w-full text-center shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-5xl mb-4">🥈</div>
                <h3 className="text-2xl font-bold text-slate-400 mb-2">Second Prize</h3>
                <p className="text-3xl font-black text-foreground">₹2,100</p>
                <p className="text-sm text-muted-foreground mt-2">+ Certificate of Merit</p>
              </div>
            </div>
            
            {/* First Prize */}
            <div className="order-1 md:order-2 flex flex-col items-center md:-mt-8">
              <div className="bg-card border-4 border-yellow-400 rounded-2xl p-10 w-full text-center shadow-2xl transform hover:scale-105 transition-transform relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tighter">Winner</div>
                <div className="text-7xl mb-4">🥇</div>
                <h3 className="text-3xl font-bold text-yellow-500 mb-2">First Prize</h3>
                <p className="text-5xl font-black text-foreground">₹5,100</p>
                <p className="text-sm text-muted-foreground mt-2">+ Trophy & Certificate</p>
              </div>
            </div>

            {/* Third Prize */}
            <div className="order-3 flex flex-col items-center">
              <div className="bg-card border-2 border-amber-600/30 rounded-2xl p-8 w-full text-center shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-5xl mb-4">🥉</div>
                <h3 className="text-2xl font-bold text-amber-700 mb-2">Third Prize</h3>
                <p className="text-3xl font-black text-foreground">₹1,100</p>
                <p className="text-sm text-muted-foreground mt-2">+ Certificate of Merit</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-xl font-bold text-primary italic">
              ✨ Special consolation prizes for Top 7 participants! ✨
            </p>
          </div>
        </div>

        {/* Previous Competitions Section */}
        <div className="bg-card border border-border rounded-lg p-8 mb-12 shadow-md">
          <h2 className="text-3xl font-bold text-foreground mb-8">Previous Competitions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-primary pl-6 py-4">
              <h3 className="text-xl font-semibold text-foreground mb-2">Prayagraj ka Novel 2024</h3>
              <p className="text-muted-foreground">Participants: 500+</p>
              <p className="text-muted-foreground">Prize Pool: ₹50,000</p>
              <p className="text-sm text-muted-foreground mt-2">Topics: General Knowledge & Aptitude</p>
            </div>
            <div className="border-l-4 border-primary pl-6 py-4">
              <h3 className="text-xl font-semibold text-foreground mb-2">Prayagraj ka Novel 2023</h3>
              <p className="text-muted-foreground">Participants: 450+</p>
              <p className="text-muted-foreground">Prize Pool: ₹40,000</p>
              <p className="text-sm text-muted-foreground mt-2">Topics: General Knowledge & Aptitude</p>
            </div>
            <div className="border-l-4 border-primary pl-6 py-4">
              <h3 className="text-xl font-semibold text-foreground mb-2">Prayagraj ka Novel 2022</h3>
              <p className="text-muted-foreground">Participants: 350+</p>
              <p className="text-muted-foreground">Prize Pool: ₹35,000</p>
              <p className="text-sm text-muted-foreground mt-2">Topics: General Knowledge & Aptitude</p>
            </div>
            <div className="border-l-4 border-primary pl-6 py-4">
              <h3 className="text-xl font-semibold text-foreground mb-2">Prayagraj ka Novel 2021</h3>
              <p className="text-muted-foreground">Participants: 300+</p>
              <p className="text-muted-foreground">Prize Pool: ₹30,000</p>
              <p className="text-sm text-muted-foreground mt-2">First edition - Successfully held</p>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            Prayagraj ka Novel is a premier General Knowledge competition platform dedicated to fostering intellectual growth and promoting awareness among students and knowledge enthusiasts.
          </p>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            We believe in the power of knowledge to transform lives and societies. Our competitions are designed to challenge participants, expand their horizons, and create a community of curious, engaged learners.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            Through Prayagraj ka Novel, we aim to make quality GK education accessible to all and celebrate the joy of learning and discovery.
          </p>
        </div>
      </section>

      {/* About Us Info */}
      <section className="bg-card border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Why Participate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">📚</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Expand Knowledge</h3>
              <p className="text-muted-foreground">Learn new facts and enhance your understanding of various subjects</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">🏆</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Win Prizes</h3>
              <p className="text-muted-foreground">Compete for attractive rewards and certificates of achievement</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">👥</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Join Community</h3>
              <p className="text-muted-foreground">Connect with fellow knowledge enthusiasts and build lasting friendships</p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Fee */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Registration Fee</h2>
          <p className="text-5xl font-bold text-primary mb-2">₹99</p>
          <p className="text-muted-foreground mb-6">Limited time offer - Get instant access to the competition!</p>
          <Link href="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Register Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 Prayagraj ka Novel - General Knowledge Competition. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
