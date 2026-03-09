/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Rocket, Eye, Download, Sparkles } from 'lucide-react'

const InteractiveFeatures = () => {
  const [showFomoBar, setShowFomoBar] = useState(true)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [showScrollCapture, setShowScrollCapture] = useState(false)
  const [email, setEmail] = useState('')
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false)
  const [hasShownScrollCapture, setHasShownScrollCapture] = useState(false)

  const [liveData, setLiveData] = useState({
    eventName: 'Summer Music Festival 2025',
    memoriesCount: 1247,
    lastUpdate: '2 seconds ago',
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => ({
        ...prev,
        memoriesCount: prev.memoriesCount + Math.floor(Math.random() * 10) + 1,
        lastUpdate: 'just now',
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Exit Intent Detection - FIXED
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownExitIntent) {
        setShowExitIntent(true)
        setHasShownExitIntent(true)
      }
    }

    document.addEventListener('mouseout', handleMouseLeave)
    return () => document.removeEventListener('mouseout', handleMouseLeave)
  }, [hasShownExitIntent])

  // Scroll Detection (70%)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100

      if (scrollPercentage >= 70 && !hasShownScrollCapture) {
        setShowScrollCapture(true)
        setHasShownScrollCapture(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasShownScrollCapture])

  // Email submission handler - FIXED
  const handleEmailSubmit = (source: string) => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    console.log(`Email submitted from ${source}:`, email)

    // In production, use EmailJS here

    alert(
      `✅ Success! We'll send "${email}" exclusive updates and the free guide!`
    )
    setEmail('')

    if (source === 'exit-intent') setShowExitIntent(false)
    if (source === 'scroll-capture') setShowScrollCapture(false)
  }

  return (
    <>
      {/* FOMO Bar */}
      <AnimatePresence>
        {showFomoBar && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className='hidden lg:fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-[#A1349A] to-[#5B1A57] text-white shadow-lg max-w-full'>
            <div className='max-w-7xl w-full mx-auto px-4 py-3 flex items-center justify-between gap-4'>
              <div className='flex items-center gap-3 flex-1'>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  <Rocket className='w-5 h-5' />
                </motion.div>
                <div className='flex-1 min-w-0 sm-w-[200px]'>
                  <p className='text-sm sm:text-base font-semibold truncate'>
                    <span className='hidden sm:inline'>🚀 Live Now: </span>
                    <span className='font-bold'>{liveData.eventName}</span>'s
                    VibeTag is active!
                  </p>
                  <p className='text-xs text-white/90'>
                    {liveData.memoriesCount.toLocaleString()} memories captured
                    • Updated {liveData.lastUpdate}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    alert(
                      '🎉 Opening live feed...\n\nThis would show real-time event photos/videos in production!'
                    )
                  }
                  className='bg-white text-[#5B1A57] px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap'>
                  <Eye className='w-4 h-4' />
                  <span className='hidden sm:inline'>See Live Feed</span>
                  <span className='sm:hidden'>View</span>
                </motion.button>
              </div>
              <button
                onClick={() => setShowFomoBar(false)}
                className='text-white hover:text-white/80 transition-colors'>
                <X className='w-5 h-5' />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit-Intent Popup */}
      <AnimatePresence>
        {showExitIntent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={() => setShowExitIntent(false)}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className='bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden'>
              <div className='bg-linear-to-r from-[#A1349A] to-[#5B1A57] p-8 text-white text-center relative'>
                <button
                  onClick={() => setShowExitIntent(false)}
                  className='absolute top-4 right-4 text-white hover:text-white/80 transition-colors'>
                  <X className='w-6 h-6' />
                </button>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className='inline-block mb-4'>
                  <Sparkles className='w-16 h-16' />
                </motion.div>
                <h3 className='text-3xl font-bold mb-2'>
                  Wait! Don't let the vibe fade.
                </h3>
                <p className='text-white/90'>
                  Be the first to know when NextVibe launches in your city.
                </p>
              </div>

              <div className='p-8'>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && handleEmailSubmit('exit-intent')
                      }
                      placeholder='you@example.com'
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#A1349A] focus:outline-none transition-colors'
                    />
                  </div>
                  <motion.button
                    onClick={() => handleEmailSubmit('exit-intent')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='w-full bg-linear-to-r from-[#A1349A] to-[#5B1A57] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all'>
                    Get Exclusive Early Invite
                  </motion.button>
                </div>
                <p className='text-xs text-gray-500 text-center mt-4'>
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll-Triggered Email Capture */}
      <AnimatePresence>
        {showScrollCapture && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className='fixed bottom-0 left-0 right-0 z-40 p-4'>
            <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border-2 border-[#A1349A] overflow-hidden'>
              <div className='flex flex-col sm:flex-row items-center gap-4 p-6'>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className='w-16 h-16 bg-linear-to-br from-[#A1349A] to-[#5B1A57] rounded-2xl flex items-center justify-center shrink-0'>
                  <Download className='w-8 h-8 text-white' />
                </motion.div>

                <div className='flex-1 text-center sm:text-left'>
                  <h4 className='text-xl font-bold text-gray-900 mb-1'>
                    Loving the Vibe?
                  </h4>
                  <p className='text-gray-600 text-sm'>
                    Get a free guide:{' '}
                    <span className='font-semibold'>
                      "10 Ways to Make Your Next Event Unforgettable"
                    </span>{' '}
                    + product updates
                  </p>
                </div>

                <div className='flex gap-2 w-full sm:w-auto'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleEmailSubmit('scroll-capture')
                    }
                    placeholder='Your email'
                    className='flex-1 sm:w-64 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#A1349A] focus:outline-none transition-colors'
                  />
                  <motion.button
                    onClick={() => handleEmailSubmit('scroll-capture')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='bg-linear-to-r from-[#A1349A] to-[#5B1A57] text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap'>
                    Get Guide
                  </motion.button>
                </div>

                <button
                  onClick={() => setShowScrollCapture(false)}
                  className='text-gray-400 hover:text-gray-600 transition-colors absolute top-10 right-10 sm:relative sm:top-auto sm:right-auto'>
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default InteractiveFeatures
