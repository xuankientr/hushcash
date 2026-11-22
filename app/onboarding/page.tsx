'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { isValidUsername, generateUsername } from '@/lib/utils';

export default function OnboardingPage() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<{ username: string; status: 'available' | 'taken' | 'unavailable' }>();
  const [error, setError] = useState('');
  const valid = isValidUsername(username);
  const status = !username ? 'idle' : !valid ? 'invalid' : availability?.username === username ? availability.status : 'checking';
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) router.push('/login');
  }, [ready, authenticated, router]);

  useEffect(() => {
    setUsername(generateUsername());
  }, []);

  useEffect(() => {
    if (!isValidUsername(username)) return;
    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(`/api/user/username?check=${encodeURIComponent(username)}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Availability check failed');
        const { available } = await res.json();
        if (!controller.signal.aborted) setAvailability({ username, status: available ? 'available' : 'taken' });
      } catch {
        if (!cancelled) setAvailability({ username, status: 'unavailable' });
      } finally {
        clearTimeout(timeout);
      }
    }, 400);
    let cancelled = false;
    return () => {
      cancelled = true;
      clearTimeout(debounce);
      controller.abort();
    };
  }, [username]);

  const handleSave = async () => {
    if (!valid || status === 'taken' || saving || !authenticated) return;
    setSaving(true);
    setError('');
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/user/username', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        router.replace('/dashboard');
        return;
      }
      if (res.status === 409) {
        setAvailability({ username, status: 'taken' });
      } else {
        setError(res.status === 401 ? 'Your session has expired. Sign in again.' : 'Could not save your username. Please try again.');
      }
    } catch {
      setError('Could not save your username. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = {
    idle: 'text-white-4',
    checking: 'text-white-4',
    available: 'text-green-400',
    unavailable: 'text-white-3',
    taken: 'text-red-400',
    invalid: 'text-yellow-400',
  }[status];

  const statusText = {
    idle: '',
    checking: 'Checking...',
    available: '✓ Available',
    unavailable: 'Availability will be checked when you confirm.',
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
              onChange={(e) => { setError(''); setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); }}
              aria-label='Username'
              disabled={saving}
              placeholder='your_username'
              maxLength={20}
              className='min-w-0 flex-1 border-0 bg-transparent text-white text-sm outline-none placeholder:text-white-4'
            />
          </div>
          {statusText && (
            <p role='status' className={`text-[12px] px-1 ${statusColor}`}>{statusText}</p>
          )}
        </div>

        <div className='space-y-2'>
          {error && <p role='alert' className='text-sm text-red-300'>{error}</p>}
          <button
            onClick={handleSave}
            disabled={!valid || status === 'taken' || saving || !ready || !authenticated}
            className='w-full h-12 rounded-2xl bg-primary hover:bg-primary-h text-white text-sm font-semibold transition-all disabled:opacity-40 shadow-lg shadow-primary/20 active:scale-[0.98]'
          >
            {saving ? 'Saving...' : 'Confirm username'}
          </button>
          <button
            onClick={() => { setError(''); setUsername(generateUsername()); }}
            disabled={saving}
            className='w-full h-10 rounded-2xl text-white-4 hover:text-white-3 text-sm transition-colors'
          >
            Generate another
          </button>
        </div>
      </div>
    </main>
  );
}