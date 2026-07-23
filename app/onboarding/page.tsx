'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { isValidUsername, generateUsername } from '@/lib/utils';

export default function OnboardingPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) router.push('/login');
  }, [ready, authenticated, router]);

  useEffect(() => {
    setUsername(generateUsername());
  }, []);

  const checkAvailability = useCallback(async (value: string) => {
    if (!isValidUsername(value)) { setStatus('invalid'); return; }
    setStatus('checking');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`/api/user/username?check=${encodeURIComponent(value)}`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) { setStatus('idle'); return; }
      const data = await res.json();
      setStatus(data.available ? 'available' : 'taken');
    } catch {
      setStatus('idle');
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    const t = setTimeout(() => checkAvailability(username), 400);
    return () => clearTimeout(t);
  }, [username, checkAvailability]);

  const handleSave = async () => {
    if (status !== 'available') return;
    setSaving(true);
    const res = await fetch('/api/user/username', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setSaving(false);
      setStatus('taken');
    }
  };

  const statusColor = {
    idle: 'text-white-4',
    checking: 'text-white-4',
    available: 'text-green-400',
    taken: 'text-red-400',
    invalid: 'text-yellow-400',
  }[status];

  const statusText = {
    idle: '',
    checking: 'Checking...',
    available: '✓ Available',
    taken: '✗ Already taken',
    invalid: 'Username must be 3–20 chars, letters/numbers/underscores only',
  }[status];

  return (
    <main className='min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[140px]' />
      </div>

      <div className='w-full max-w-[320px] relative z-10 space-y-8'>
        <div className='text-center space-y-1.5'>
          <h1 className='text-xl font-bold text-white'>Choose your username</h1>
          <p className='text-sm text-white-4'>
            Others can send you USDC using <span className='text-white-3'>@username</span>
          </p>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2 h-12 px-4 rounded-2xl bg-white/[0.04] border border-white/[0.10] focus-within:border-primary/50 transition-colors'>
            <span className='text-white-4 font-medium select-none'>@</span>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder='your_username'
              maxLength={20}
              className='flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white-4'
            />
          </div>
          {statusText && (
            <p className={`text-[12px] px-1 ${statusColor}`}>{statusText}</p>
          )}
        </div>

        <div className='space-y-2'>
          <button
            onClick={handleSave}
            disabled={status !== 'available' || saving}
            className='w-full h-12 rounded-2xl bg-primary hover:bg-primary-h text-white text-sm font-semibold transition-all disabled:opacity-40 shadow-lg shadow-primary/20 active:scale-[0.98]'
          >
            {saving ? 'Saving...' : 'Confirm username'}
          </button>
          <button
            onClick={() => { setUsername(generateUsername()); setStatus('idle'); }}
            className='w-full h-10 rounded-2xl text-white-4 hover:text-white-3 text-sm transition-colors'
          >
            Generate another
          </button>
        </div>
      </div>
    </main>
  );
}