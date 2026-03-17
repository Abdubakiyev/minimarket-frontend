'use client';

import { useEffect, useState } from 'react';
import { useQarzdorlar, useQarzdorActions, useSearch } from '@/features/qarzdor/hooks/useQarzdorlar';
import { formatSum, formatDate, progressPercent } from '@/features/qarzdor/utils/format';
import { Qarzdor } from '@/features/qarzdor/types';
import { useRouter } from 'next/navigation';



// ─── ICONS ───────────────────────────────────────────────
function IconPlus() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function IconX() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>;
}
function IconTrash() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function IconCoin() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2m-4-6h8"/></svg>;
}
function IconPlusCircle() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
}

// ─── MODAL ───────────────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}><IconX /></button>
        {children}
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={{ color }}>{value}</span>
    </div>
  );
}

// ─── QARZDOR CARD ─────────────────────────────────────────
function QarzdorCard({
  q,
  onTolov,
  onQarzQosh,
  onDelete,
}: {
  q: Qarzdor;
  onTolov: (q: Qarzdor) => void;
  onQarzQosh: (q: Qarzdor) => void;
  onDelete: (id: number) => void;
}) {
  const pct = progressPercent(q.tolangan, q.umumiyQarz);
  const tolandi = q.status === 'TOLANDI';

  return (
    <div className={`qcard ${tolandi ? 'qcard--done' : ''}`}>
      <div className="qcard-header">
        <div className="qcard-avatar">{q.kim.charAt(0).toUpperCase()}</div>
        <div className="qcard-info">
          <h3 className="qcard-name">{q.kim}</h3>
          <span className={`qcard-badge ${tolandi ? 'badge-done' : 'badge-debt'}`}>
            {tolandi ? '✓ To\'landi' : '⏳ Qarzdor'}
          </span>
        </div>
        <button
          className="qcard-del"
          onClick={() => onDelete(q.id)}
          title="O'chirish"
        >
          <IconTrash />
        </button>
      </div>

      {q.izoh && <p className="qcard-izoh">📝 {q.izoh}</p>}

      <div className="qcard-amounts">
        <div className="amount-row">
          <span>Jami qarz</span>
          <strong>{formatSum(q.umumiyQarz)}</strong>
        </div>
        <div className="amount-row">
          <span>To'langan</span>
          <strong className="text-green">{formatSum(q.tolangan)}</strong>
        </div>
        <div className="amount-row">
          <span>Qoliq</span>
          <strong className="text-red">{formatSum(q.qoliqQarz)}</strong>
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, background: tolandi ? '#22c55e' : '#f59e0b' }}
          />
        </div>
        <span className="progress-pct">{pct}%</span>
      </div>

      {!tolandi && (
        <div className="qcard-actions">
          <button className="btn btn-pay" onClick={() => onTolov(q)}>
            <IconCoin /> To'lov
          </button>
          <button className="btn btn-add" onClick={() => onQarzQosh(q)}>
            <IconPlusCircle /> Qarz qo'sh
          </button>
        </div>
      )}

      {q.tolovlar.length > 0 && (
        <details className="tolov-history">
          <summary>To'lovlar tarixi ({q.tolovlar.length})</summary>
          <ul>
            {q.tolovlar.map((t) => (
              <li key={t.id}>
                <span className="th-sum">{formatSum(t.miqdor)}</span>
                <span className="th-date">{formatDate(t.sana)}</span>
                {t.izoh && <span className="th-izoh">{t.izoh}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────
export default function HomePage() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { data, loading, error, refetch } = useQarzdorlar(filter);
  const { actionLoading, actionError, successMsg, create, tolovQilish, qarzQosh, remove } =
    useQarzdorActions(refetch);
  const { results, searching, query, search } = useSearch();

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [tolovTarget, setTolovTarget] = useState<Qarzdor | null>(null);
  const [qarzTarget, setQarzTarget] = useState<Qarzdor | null>(null);
  const router = useRouter();

  // Forms
  const [addForm, setAddForm] = useState({ kim: '', umumiyQarz: '', izoh: '' });
  const [tolovForm, setTolovForm] = useState({ miqdor: '', izoh: '' });
  const [qarzForm, setQarzForm] = useState({ miqdor: '' });
  
  useEffect(() => {
    if (localStorage.getItem('isAuth') !== 'true') {
      router.push('/login');
    }
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await create({
      kim: addForm.kim,
      umumiyQarz: Number(addForm.umumiyQarz),
      izoh: addForm.izoh || undefined,
    });
    if (ok) {
      setAddForm({ kim: '', umumiyQarz: '', izoh: '' });
      setShowAdd(false);
    }
  };

  const handleTolov = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tolovTarget) return;
    const ok = await tolovQilish(tolovTarget.id, {
      miqdor: Number(tolovForm.miqdor),
      izoh: tolovForm.izoh || undefined,
    });
    if (ok) {
      setTolovForm({ miqdor: '', izoh: '' });
      setTolovTarget(null);
    }
  };

  const handleQarzQosh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qarzTarget) return;
    const ok = await qarzQosh(qarzTarget.id, Number(qarzForm.miqdor));
    if (ok) {
      setQarzForm({ miqdor: '' });
      setQarzTarget(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Haqiqatan ham o\'chirmoqchimisiz?')) {
      await remove(id);
    }
  };

  const displayList = query.trim()
    ? results
    : data?.qarzdorlar ?? [];

  const stats = data?.statistika;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0f1117;
          --surface: #1a1d27;
          --surface2: #22263a;
          --border: #2e3248;
          --text: #e8eaf6;
          --text2: #8b91b0;
          --red: #ff4d6d;
          --green: #4ade80;
          --yellow: #fbbf24;
          --blue: #60a5fa;
          --accent: #818cf8;
          --radius: 14px;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Segoe UI', system-ui, sans-serif;
          min-height: 100vh;
        }

        /* HEADER */
        .header {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 16px 20px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .header-inner {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--accent);
          flex: 1;
        }
        .header-title span { color: var(--text2); font-size: 13px; font-weight: 400; margin-left: 6px; }

        /* STATS */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 16px 20px 0;
          max-width: 600px;
          margin: 0 auto;
        }
        .stat-card {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 14px;
          border: 1px solid var(--border);
        }
        .stat-label { display: block; font-size: 11px; color: var(--text2); margin-bottom: 4px; text-transform: uppercase; letter-spacing: .5px; }
        .stat-value { display: block; font-size: 15px; font-weight: 700; }

        /* SEARCH + FILTER */
        .toolbar {
          max-width: 600px;
          margin: 14px auto 0;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .search-wrap {
          display: flex;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0 14px;
          gap: 8px;
        }
        .search-wrap input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          padding: 12px 0;
        }
        .search-wrap input::placeholder { color: var(--text2); }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }
        .ftab {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text2);
          font-size: 13px;
          cursor: pointer;
          text-align: center;
          transition: all .2s;
        }
        .ftab.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }

        /* LIST */
        .list {
          max-width: 600px;
          margin: 14px auto;
          padding: 0 20px 100px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* QCARD */
        .qcard {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
          transition: border-color .2s;
        }
        .qcard:hover { border-color: var(--accent); }
        .qcard--done { opacity: .7; }
        .qcard--done:hover { border-color: var(--green); }

        .qcard-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .qcard-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), #c084fc);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }
        .qcard-info { flex: 1; }
        .qcard-name { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
        .qcard-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 500;
        }
        .badge-debt { background: rgba(251,191,36,.15); color: var(--yellow); }
        .badge-done { background: rgba(74,222,128,.15); color: var(--green); }
        .qcard-del {
          background: none;
          border: none;
          color: var(--text2);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all .2s;
        }
        .qcard-del:hover { background: rgba(255,77,109,.15); color: var(--red); }

        .qcard-izoh {
          font-size: 12px;
          color: var(--text2);
          margin-bottom: 10px;
          padding: 8px 10px;
          background: var(--surface2);
          border-radius: 8px;
        }

        .qcard-amounts { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
        .amount-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text2); }
        .amount-row strong { color: var(--text); }
        .text-green { color: var(--green) !important; }
        .text-red { color: var(--red) !important; }

        .progress-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .progress-bar { flex: 1; height: 6px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 99px; transition: width .5s ease; }
        .progress-pct { font-size: 12px; color: var(--text2); min-width: 32px; text-align: right; }

        .qcard-actions { display: flex; gap: 8px; margin-bottom: 10px; }
        .btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px;
          border-radius: 9px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all .2s;
        }
        .btn-pay { background: rgba(74,222,128,.12); color: var(--green); }
        .btn-pay:hover { background: rgba(74,222,128,.25); }
        .btn-add { background: rgba(96,165,250,.12); color: var(--blue); }
        .btn-add:hover { background: rgba(96,165,250,.25); }

        /* TOLOV HISTORY */
        .tolov-history {
          margin-top: 4px;
          font-size: 13px;
        }
        .tolov-history summary {
          color: var(--text2);
          cursor: pointer;
          padding: 4px 0;
          user-select: none;
        }
        .tolov-history summary:hover { color: var(--text); }
        .tolov-history ul {
          list-style: none;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tolov-history li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: var(--surface2);
          border-radius: 8px;
          flex-wrap: wrap;
        }
        .th-sum { color: var(--green); font-weight: 600; }
        .th-date { color: var(--text2); font-size: 12px; }
        .th-izoh { color: var(--text2); font-size: 12px; margin-left: auto; }

        /* FAB */
        .fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 24px rgba(129,140,248,.5);
          transition: transform .2s;
          z-index: 20;
        }
        .fab:hover { transform: scale(1.1); }
        .fab:active { transform: scale(0.95); }

        /* MODAL */
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 100;
          padding: 0;
        }
        .modal-box {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px 20px 0 0;
          padding: 24px 20px 40px;
          width: 100%;
          max-width: 600px;
          position: relative;
          animation: slideUp .3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-close {
          position: absolute;
          top: 16px; right: 16px;
          background: var(--surface2);
          border: none;
          color: var(--text2);
          width: 32px; height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        /* FORM */
        .form { display: flex; flex-direction: column; gap: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 12px; color: var(--text2); text-transform: uppercase; letter-spacing: .5px; }
        .form-group input, .form-group textarea {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 15px;
          padding: 12px 14px;
          outline: none;
          transition: border-color .2s;
          width: 100%;
          font-family: inherit;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: var(--accent); }
        .form-group input::placeholder { color: var(--text2); }

        .btn-submit {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-submit:hover { opacity: .85; }
        .btn-submit:disabled { opacity: .5; cursor: not-allowed; }

        /* ALERTS */
        .alert {
          max-width: 600px;
          margin: 10px auto 0;
          padding: 0 20px;
        }
        .alert-success {
          background: rgba(74,222,128,.12);
          border: 1px solid rgba(74,222,128,.3);
          color: var(--green);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
        }
        .alert-error {
          background: rgba(255,77,109,.12);
          border: 1px solid rgba(255,77,109,.3);
          color: var(--red);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
        }

        /* EMPTY */
        .empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--text2);
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty p { font-size: 14px; }

        /* LOADING */
        .loading {
          text-align: center;
          padding: 60px;
          color: var(--text2);
        }
        .spinner {
          width: 32px; height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin .7s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* COUNT BADGE */
        .count-badge {
          background: var(--surface2);
          color: var(--text2);
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 99px;
          margin-left: 8px;
        }
      `}</style>

      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <h1 className="header-title">
            📒 Qarz Daftar
            {stats && <span>{stats.jamiQarzdorlar} kishi</span>}
          </h1>
        </div>
      </header>

      {/* STATS */}
      {stats && (
        <div className="stats-grid">
          <StatCard label="Jami qarz" value={formatSum(stats.jamiQarz)} color="#f87171" />
          <StatCard label="To'langan" value={formatSum(stats.jamiTolangan)} color="#4ade80" />
          <StatCard label="Qoliq" value={formatSum(stats.jamiQoliq)} color="#fbbf24" />
          <StatCard label="Qarzdorlar" value={`${stats.jamiQarzdorlar} kishi`} color="#818cf8" />
        </div>
      )}

      {/* ALERTS */}
      {successMsg && (
        <div className="alert">
          <div className="alert-success">{successMsg}</div>
        </div>
      )}
      {(actionError || error) && (
        <div className="alert">
          <div className="alert-error">❌ {actionError || error}</div>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-wrap">
          <IconSearch />
          <input
            type="text"
            placeholder="Ism yoki familya bo'yicha qidiring..."
            value={query}
            onChange={(e) => search(e.target.value)}
          />
          {searching && <span style={{ color: 'var(--text2)', fontSize: 12 }}>...</span>}
        </div>
        {!query && (
          <div className="filter-tabs">
            {[
              { label: 'Barchasi', val: undefined },
              { label: '⏳ Qarzdor', val: 'QARZDOR' },
              { label: '✓ To\'landi', val: 'TOLANDI' },
            ].map((f) => (
              <button
                key={f.label}
                className={`ftab ${filter === f.val ? 'active' : ''}`}
                onClick={() => setFilter(f.val)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LIST */}
      <div className="list">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p>Yuklanmoqda...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <p>{query ? 'Hech narsa topilmadi' : 'Hali qarzdor yo\'q'}</p>
          </div>
        ) : (
          displayList.map((q) => (
            <QarzdorCard
              key={q.id}
              q={q}
              onTolov={setTolovTarget}
              onQarzQosh={setQarzTarget}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)} title="Yangi qarzdor">
        <IconPlus />
      </button>

      {/* ADD MODAL */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <h2 className="modal-title">➕ Yangi qarzdor</h2>
          <form className="form" onSubmit={handleAdd}>
            <div className="form-group">
              <label>Kim (Ism Familya Yil)</label>
              <input
                required
                placeholder="Olimov Botir 1990"
                value={addForm.kim}
                onChange={(e) => setAddForm({ ...addForm, kim: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Qarz miqdori (so'm)</label>
              <input
                required
                type="number"
                min="1"
                placeholder="500000"
                value={addForm.umumiyQarz}
                onChange={(e) => setAddForm({ ...addForm, umumiyQarz: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Izoh (ixtiyoriy)</label>
              <input
                placeholder="Do'kondan qarz oldi..."
                value={addForm.izoh}
                onChange={(e) => setAddForm({ ...addForm, izoh: e.target.value })}
              />
            </div>
            <button className="btn-submit" type="submit" disabled={actionLoading}>
              <IconCheck />
              {actionLoading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        </Modal>
      )}

      {/* TO'LOV MODAL */}
      {tolovTarget && (
        <Modal onClose={() => setTolovTarget(null)}>
          <h2 className="modal-title">💰 To'lov qilish</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
            {tolovTarget.kim} — Qoliq: <strong style={{ color: 'var(--red)' }}>{formatSum(tolovTarget.qoliqQarz)}</strong>
          </p>
          <form className="form" onSubmit={handleTolov}>
            <div className="form-group">
              <label>To'lov miqdori (so'm)</label>
              <input
                required
                type="number"
                min="1"
                max={tolovTarget.qoliqQarz}
                placeholder={String(tolovTarget.qoliqQarz)}
                value={tolovForm.miqdor}
                onChange={(e) => setTolovForm({ ...tolovForm, miqdor: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Izoh (ixtiyoriy)</label>
              <input
                placeholder="Naqd pul berdi..."
                value={tolovForm.izoh}
                onChange={(e) => setTolovForm({ ...tolovForm, izoh: e.target.value })}
              />
            </div>
            <button className="btn-submit" type="submit" disabled={actionLoading}>
              <IconCheck />
              {actionLoading ? 'Saqlanmoqda...' : 'To\'lovni tasdiqlash'}
            </button>
          </form>
        </Modal>
      )}

      {/* QARZ QO'SH MODAL */}
      {qarzTarget && (
        <Modal onClose={() => setQarzTarget(null)}>
          <h2 className="modal-title">📈 Qarz qo'shish</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
            {qarzTarget.kim} — Hozirgi qoliq: <strong style={{ color: 'var(--yellow)' }}>{formatSum(qarzTarget.qoliqQarz)}</strong>
          </p>
          <form className="form" onSubmit={handleQarzQosh}>
            <div className="form-group">
              <label>Qo'shimcha qarz miqdori (so'm)</label>
              <input
                required
                type="number"
                min="1"
                placeholder="100000"
                value={qarzForm.miqdor}
                onChange={(e) => setQarzForm({ miqdor: e.target.value })}
              />
            </div>
            <button className="btn-submit" type="submit" disabled={actionLoading}>
              <IconCheck />
              {actionLoading ? 'Saqlanmoqda...' : 'Qo\'shish'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}