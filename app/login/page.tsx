// app/login/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (localStorage.getItem('isAuth') === 'true') {
      router.push('/');
    }
    inputRefs.current[0]?.focus();
  }, []);

  const getCode = () => values.join('');
  const isFull = values.every((v) => v !== '');

  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);
    setError('');
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      const newValues = [...values];
      newValues[index - 1] = '';
      setValues(newValues);
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && isFull) handleLogin();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newValues = [...values];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newValues[i] = char;
    });
    setValues(newValues);
    const nextEmpty = newValues.findIndex((v) => !v);
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleLogin = async () => {
    if (!isFull) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        'https://minimarket-backend-3t1d.onrender.com/api/auth',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: getCode() }),
        }
      );

      if (res.ok) {
        localStorage.setItem('isAuth', 'true');
        router.push('/');
      } else {
        setError("Kod noto'g'ri. Qayta urinib ko'ring.");
        setValues(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Server bilan bog'lanib bo'lmadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 rounded-2xl p-12 w-full max-w-md shadow-2xl text-center">
        
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Kirish</h1>
        <p className="text-slate-400 text-sm mb-8">6 xonali kodni kiriting</p>

        {/* Kod inputlari */}
        <div className="flex gap-3 justify-center mb-7">
          {values.map((val, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`
                w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none
                bg-slate-900 text-slate-100 transition-all duration-200
                ${val
                  ? 'border-indigo-500 bg-indigo-950'
                  : 'border-slate-600 focus:border-indigo-500'
                }
              `}
            />
          ))}
        </div>

        {/* Xato xabari */}
        {error && (
          <p className="text-red-400 text-sm mb-4">❌ {error}</p>
        )}

        {/* Kirish tugmasi */}
        <button
          onClick={handleLogin}
          disabled={!isFull || loading}
          className={`
            w-full py-3 rounded-xl font-semibold text-white text-base transition-all duration-200
            ${isFull && !loading
              ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 cursor-pointer'
              : 'bg-slate-700 cursor-not-allowed text-slate-400'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Tekshirilmoqda...
            </span>
          ) : (
            'Kirish'
          )}
        </button>

      </div>
    </div>
  );
}