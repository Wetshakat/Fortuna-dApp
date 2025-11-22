'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth'

type AuthChoiceModalProps = {
  defaultOpen?: boolean
  onClose?: () => void
}

export default function AuthChoiceModal({ defaultOpen = true, onClose }: AuthChoiceModalProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const privy = usePrivy?.() ?? null
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const { initOAuth } = useLoginWithOAuth({
    onSuccess: () => {
      setOpen(false)
      onClose?.()
    },
    onError: (err) => {
        console.error('Google sign-in failed', err)
        alert('Google sign-in failed. See console for details.')
    }
  })


  // Debug: inspect available methods on privy
  useEffect(() => {
    if (!privy) {
      console.debug('usePrivy() returned null or undefined')
      return
    }
    try {
      console.debug('Privy keys:', Object.keys(privy).sort())
    } catch {
      // ignore
    }
  }, [privy])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleGoogle() {
    try {
      await initOAuth({ provider: 'google' });
    } catch (err) {
      console.error('Google sign-in failed', err)
      alert('Google sign-in failed. See console for details.')
    }
  }

  async function handleWalletConnect() {
    try {
      if (!privy || !privy.login) {
        console.warn('Privy SDK not available or login method missing')
        alert('Auth SDK not loaded yet. Try again in a moment.')
        return
      }
      privy.login()
    } catch (err) {
      console.error('Wallet connect failed', err)
      alert('Wallet connection failed. See console for details.')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          setOpen(false)
          onClose?.()
        }}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Get started with Fortuna</h2>
            <p className="mt-1 text-sm text-gray-600">Choose how you'd like to register or sign in.</p>
          </div>

          <button
            aria-label="Close"
            onClick={() => {
              setOpen(false)
              onClose?.()
            }}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {/* Google button with inline SVG icon to avoid static 404 */}
          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm hover:bg-gray-50"
            aria-label="Continue with Google"
          >
            {/* Google SVG (keeps you from needing /google-icon.svg in public/) */}
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
              <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.6-36.5-4.7-53.9H272v102.2h146.9c-6.4 34.6-25.7 63.9-54.9 83.5v69.2h88.6c51.8-47.7 83-118.1 83-201z"/>
              <path fill="#34A853" d="M272 544.3c73.7 0 135.7-24.5 181-66.5l-88.6-69.2c-24.6 16.5-56 26.2-92.4 26.2-71 0-131.2-47.9-152.6-112.2H28.2v70.6C73 491.2 167 544.3 272 544.3z"/>
              <path fill="#FBBC05" d="M119.4 323.1c-8.8-26.5-8.8-55 0-81.4V171.1H28.2c-39.1 77.6-39.1 168.5 0 246.1l91.2-94.1z"/>
              <path fill="#EA4335" d="M272 108.1c39.9 0 75.8 13.7 104.1 40.5l78.1-78.1C407.7 22.9 343.7 0 272 0 167 0 73 53.1 28.2 132.7l91.2 70.6C140.8 156 201 108.1 272 108.1z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center justify-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={handleWalletConnect}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95"
            aria-label="Connect an existing wallet"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Connect an existing wallet
          </button>

          <p className="mt-2 text-center text-xs text-gray-400">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
