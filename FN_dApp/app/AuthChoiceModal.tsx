'use client';

import { useState } from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';

type LoginWithEmailProps = {
  defaultOpen?: boolean;
  onClose?: () => void;
};

export default function LoginWithEmail({ defaultOpen = true, onClose }: LoginWithEmailProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const {
    sendCode,
    loginWithCode,
    state,
  } = useLoginWithEmail({
    onSuccess: () => {
      setOpen(false);
      onClose?.();
    },
    onError: (err) => {
      console.error('Email login failed', err);
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          setOpen(false);
          onClose?.();
        }}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sign in with Email</h2>
            <p className="mt-1 text-sm text-gray-600">
              {state.status === 'awaiting-code-input' 
                ? 'Enter the code sent to your email'
                : 'Enter your email to receive a login code'}
            </p>
          </div>

          <button
            aria-label="Close"
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {/* EMAIL INPUT */}
          {state.status !== 'awaiting-code-input' && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              {/* SEND CODE BUTTON */}
              <button
                disabled={!email || state.status === 'sending-code'}
                onClick={() => sendCode({ email })}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.status === 'sending-code' ? 'Sending code…' : 'Send Code'}
              </button>
            </>
          )}

          {/* CODE INPUT — ONLY SHOW WHEN READY */}
          {state.status === 'awaiting-code-input' && (
            <>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.currentTarget.value)}
                maxLength={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-center text-lg font-semibold tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              <button
                disabled={!code || state.status === 'submitting-code'}
                onClick={() => loginWithCode({ code })}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.status === 'submitting-code' ? 'Logging in…' : 'Login'}
              </button>

              <button
                onClick={() => {
                  setCode('');
                  // Reset to initial state by clearing email or using a reset function if available
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Use a different email
              </button>
            </>
          )}

          {/* ERROR STATE */}
          {state.status === 'error' && (
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <p className="text-sm text-red-600">
                Authentication failed. Please try again.
              </p>
            </div>
          )}

          <p className="mt-2 text-center text-xs text-gray-400">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}