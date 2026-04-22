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
    if (localStorage.getItem('isAuth') === 'true') router.push('/');
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
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
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
    pasted.split('').forEach((char, i) => { if (i < 6) newValues[i] = char; });
    setValues(newValues);
    const nextEmpty = newValues.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleLogin = async () => {
    if (!isFull) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://minimarket-backend-cf69.onrender.com/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: getCode() }),
      });
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
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 16px;
        }

        .login-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 24px;
          padding: 40px 32px 48px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
          animation: fadeIn 0.4s ease;
        }

        .login-icon { font-size: 48px; margin-bottom: 14px; }
        .login-title {
          color: #f1f5f9;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .login-sub {
          color: #94a3b8;
          font-size: 14px;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        /* Kod inputlari */
        .code-row {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .code-box {
          width: 44px;
          height: 54px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          border: 2px solid #334155;
          border-radius: 12px;
          background: #0f172a;
          color: #f1f5f9;
          outline: none;
          transition: border-color 0.2s, background 0.2s, transform 0.1s;
          font-family: inherit;
          -webkit-appearance: none;
          appearance: none;
          caret-color: #6366f1;
        }
        .code-box:focus {
          border-color: #6366f1;
          transform: scale(1.05);
        }
        .code-box.filled {
          border-color: #6366f1;
          background: #1e1b4b;
        }

        /* Xato */
        .error-msg {
          color: #f87171;
          font-size: 13px;
          margin-bottom: 14px;
          min-height: 18px;
          line-height: 1.4;
        }

        /* Tugma */
        .login-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          color: white;
          transition: background 0.2s, transform 0.1s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .login-btn.active { background: #6366f1; }
        .login-btn.active:hover { background: #4f46e5; }
        .login-btn.active:active { transform: scale(0.97); }
        .login-btn.inactive {
          background: #1e293b;
          border: 1px solid #334155;
          color: #475569;
          cursor: not-allowed;
        }

        .spin-icon {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* Mobil */
        @media (max-width: 480px) {
          .login-card {
            padding: 32px 20px 40px;
            border-radius: 20px;
          }
          .login-icon { font-size: 44px; }
          .login-title { font-size: 22px; }
          .code-box {
            width: 40px;
            height: 50px;
            font-size: 22px;
            border-radius: 10px;
          }
          .code-row { gap: 7px; }
        }

        @media (max-width: 360px) {
          .code-box {
            width: 36px;
            height: 46px;
            font-size: 20px;
          }
          .code-row { gap: 6px; }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-icon">🔐</div>
          <h1 className="login-title">Kirish</h1>
          <p className="login-sub">6 xonali kodni kiriting</p>

          <div className="code-row">
            {values.map((val, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={val}
                autoComplete="one-time-code"
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`code-box${val ? ' filled' : ''}`}
              />
            ))}
          </div>

          <p className="error-msg">{error && `❌ ${error}`}</p>

          <button
            onClick={handleLogin}
            disabled={!isFull || loading}
            className={`login-btn ${isFull && !loading ? 'active' : 'inactive'}`}
          >
            {loading ? (
              <>
                <div className="spin-icon" />
                Tekshirilmoqda...
              </>
            ) : 'Kirish'}
          </button>
        </div>
      </div>
    </>
  );
}