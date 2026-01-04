'use client';

import { useState } from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const {
    sendCode,
    loginWithCode,
    state,
  } = useLoginWithEmail();

  return (
    <div className="space-y-3">
      {/* EMAIL INPUT */}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        className="w-full rounded border px-3 py-2"
      />

      {/* SEND CODE */}
      <button
        disabled={!email || state.status === 'sending-code'}
        onClick={() => sendCode({ email })}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {state.status === 'sending-code' ? 'Sending…' : 'Send Code'}
      </button>

      {/* CODE INPUT — ONLY SHOW WHEN READY */}
      {state.status === 'awaiting-code-input' && (
        <>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.currentTarget.value)}
            className="w-full rounded border px-3 py-2"
          />

          <button
            disabled={!code || state.status === 'submitting-code'}
            onClick={() => loginWithCode({ code })}
            className="w-full rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {state.status === 'submitting-code' ? 'Logging in…' : 'Login'}
          </button>
        </>
      )}

      {/* ERROR STATE */}
      {state.status === 'error' && (
        <p className="text-sm text-red-600">
          Authentication failed. Please try again.
        </p>
      )}
    </div>
  );
}
