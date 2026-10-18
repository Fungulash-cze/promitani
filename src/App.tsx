/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { MOVIES, VoteRecord } from './data/movies.ts';
import { db } from './firebase.ts';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  Check,
  ExternalLink,
  Play,
  Sparkles,
  Sun,
  Moon,
  X,
  KeyRound,
  Trash2,
} from 'lucide-react';

const STORAGE_MY_NAME = 'film_poll_voter_name_published_v1';
const STORAGE_THEME = 'film_poll_theme_v1';
const STORAGE_MY_VOTE_ID = 'film_poll_device_vote_id_v1';
const ADMIN_PIN = '1234'; // Secret PIN for organizer

function getOrCreateVoteId(): string {
  try {
    let id = localStorage.getItem(STORAGE_MY_VOTE_ID);
    if (!id) {
      id = `vote_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_MY_VOTE_ID, id);
    }
    return id;
  } catch {
    return `vote_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME);
      if (saved) return saved === 'dark';
    } catch {
      // ignore
    }
    return false; // Default to the cheerful light mode
  });

  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [voterName, setVoterName] = useState(() => {
    return localStorage.getItem(STORAGE_MY_NAME) || '';
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [justVoted, setJustVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Secret Admin Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const clickTimerRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);

  // Check URL query param ?admin=1 on mount
  useEffect(() => {
    if (window.location.search.includes('admin=1') || window.location.search.includes('reset=1')) {
      setShowAdminModal(true);
    }
  }, []);

  // Persist theme & update html class
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME, isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#07070b';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#f4f6f1';
      }
    } catch {
      // ignore
    }
  }, [isDark]);

  // Real-time synchronization of votes across all devices via Firestore
  useEffect(() => {
    const votesCollection = collection(db, 'votes');
    const unsubscribe = onSnapshot(
      votesCollection,
      (snapshot) => {
        const fetchedVotes: VoteRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.voterName && Array.isArray(data.selectedMovieIds)) {
            fetchedVotes.push({
              id: docSnap.id,
              voterName: data.voterName,
              selectedMovieIds: data.selectedMovieIds,
              timestamp: data.updatedAt || Date.now(),
            });
          }
        });
        setVotes(fetchedVotes);
      },
      (err) => {
        console.error('Firestore onSnapshot error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // If user already voted on this device, pre-select their movies
  useEffect(() => {
    const myDocId = localStorage.getItem(STORAGE_MY_VOTE_ID);
    const existing = myDocId ? votes.find((v) => v.id === myDocId) : null;
    if (existing) {
      if (selectedIds.length === 0) {
        setSelectedIds(existing.selectedMovieIds);
      }
      if (!voterName && existing.voterName) {
        setVoterName(existing.voterName);
      }
    } else if (voterName.trim()) {
      const byName = votes.find(
        (v) => v.voterName.toLowerCase() === voterName.trim().toLowerCase()
      );
      if (byName && selectedIds.length === 0) {
        setSelectedIds(byName.selectedMovieIds);
      }
    }
  }, [votes]);

  const toggleMovie = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    if (error) setError('');
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = voterName.trim();
    if (!cleanName) {
      setError('Ako ťa volajů? Napiš svoje jméno');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Vyber aspoň jeden film');
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem(STORAGE_MY_NAME, cleanName);

    try {
      const docId = getOrCreateVoteId();
      const voteRef = doc(db, 'votes', docId);

      await setDoc(voteRef, {
        voterName: cleanName,
        selectedMovieIds: selectedIds,
        updatedAt: Date.now(),
      });

      setJustVoted(true);
      setTimeout(() => setJustVoted(false), 2500);
    } catch (err) {
      console.error('Error saving vote:', err);
      setError('Hlasování se nepodařilo odeslat. Zkus to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Secret gesture: 3 clicks on the popcorn emoji opens admin prompt
  const handlePopcornClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setShowAdminModal(true);
    } else {
      clickTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1200);
    }
  };

  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput.trim() === ADMIN_PIN) {
      setIsAdminUnlocked(true);
      setAdminError('');
    } else {
      setAdminError('Nesprávný PIN');
    }
  };

  const handleAdminResetAllVotes = async () => {
    if (!window.confirm('Opravdu chceš smazat všechny hlasy v databázi pro všechny?')) {
      return;
    }

    setIsResetting(true);
    try {
      const snap = await getDocs(collection(db, 'votes'));
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();

      // Clear local selection
      setSelectedIds([]);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setShowAdminModal(false);
        setIsAdminUnlocked(false);
        setAdminPinInput('');
      }, 2000);
    } catch (err) {
      console.error('Reset error:', err);
      setAdminError('Chyba při mazání hlasů.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen p-4 sm:p-8 flex flex-col justify-between selection:bg-[#ccff00] selection:text-black font-sans overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#07070b] text-[#f5f5f7]' : 'bg-[#f4f6f1] text-[#16161c]'
      }`}
    >
      {/* Ambient Flares / Artifacts */}
      {isDark ? (
        <>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00f5ff]/15 blur-[120px] pointer-events-none animate-float-slow" />
          <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-[#ccff00]/12 blur-[120px] pointer-events-none animate-float-delayed" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-[#ff007a]/15 blur-[120px] pointer-events-none animate-float-slow" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#38bdf8]/20 blur-[130px] pointer-events-none animate-float-slow" />
          <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-[#fbbf24]/20 blur-[130px] pointer-events-none animate-float-delayed" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-[#f472b6]/20 blur-[130px] pointer-events-none animate-float-slow" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.7),transparent)] pointer-events-none" />
        </>
      )}

      <div className="relative max-w-2xl mx-auto w-full z-10">
        {/* Funky Header with Mode Toggle */}
        <header className="mb-6 pt-2">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div
              className={`relative inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wide backdrop-blur-md transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-[#ccff00]/20 via-[#00f5ff]/20 to-[#ff007a]/20 border border-white/20 text-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.25)]'
                  : 'bg-white/90 border border-black/10 text-emerald-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-[#ccff00] animate-pulse' : 'text-emerald-600 animate-pulse'}`} />
              <span
                className={
                  isDark
                    ? 'bg-gradient-to-r from-[#ccff00] via-[#00f5ff] to-[#ff007a] bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-emerald-600 via-sky-600 to-rose-600 bg-clip-text text-transparent'
                }
              >
                juchuuuu, v pondělí 19. dáme další filmík
              </span>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={isDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border active:scale-95 ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                  : 'bg-white hover:bg-white/90 border-black/10 text-amber-500 shadow-sm'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Moon className="w-4 h-4 stroke-[2.5] text-indigo-600" />
              )}
            </button>
          </div>

          <h1
            className={`font-funky text-4xl sm:text-6xl font-extrabold tracking-tight uppercase leading-none transition-colors select-none ${
              isDark ? 'text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.15)]' : 'text-[#14141a]'
            }`}
          >
            CO DÁME?{' '}
            <span
              onClick={handlePopcornClick}
              className="cursor-pointer active:scale-125 inline-block transition-transform"
              title="🍿"
            >
              🍿
            </span>
          </h1>
        </header>

        {/* 3 Movie Cards */}
        <div className="space-y-4 mb-6">
          {MOVIES.map((movie) => {
            const isSelected = selectedIds.includes(movie.id);
            const theme = isDark ? movie.dark : movie.light;
            const movieVotes = votes.filter((v) =>
              v.selectedMovieIds.includes(movie.id)
            );
            const voterNames = movieVotes.map((v) => v.voterName);

            return (
              <div
                key={movie.id}
                onClick={() => toggleMovie(movie.id)}
                className={`group relative rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer select-none overflow-hidden ${
                  isSelected
                    ? `${theme.selectedBg} ${theme.accentBorder} ${theme.cardGlow} scale-[1.015]`
                    : isDark
                    ? 'bg-[#0e0e14]/90 border-white/10 hover:border-white/30 hover:bg-[#12121a]'
                    : 'bg-white/95 border-black/[0.08] hover:border-black/20 hover:bg-white shadow-[0_6px_20px_rgba(0,0,0,0.03)]'
                }`}
              >
                {/* Visual Artifact: Glass Specular Flare Gradient across card */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${theme.flareGradient} pointer-events-none transition-opacity duration-300 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  }`}
                />

                {/* Visual Artifact: Dynamic Light Sheen reflection */}
                <div
                  className={`absolute -inset-full top-0 w-1/2 h-full bg-gradient-to-r from-transparent ${
                    isDark ? 'via-white/[0.07]' : 'via-white/50'
                  } to-transparent skew-x-[-25deg] pointer-events-none group-hover:animate-sheen`}
                />

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Top Row: Number, Title, Custom Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`font-mono-numbers text-sm font-bold ${
                          isDark ? 'text-white/35' : 'text-black/30'
                        }`}
                      >
                        {movie.number}
                      </span>
                      <h2
                        className={`font-funky text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
                          isSelected
                            ? isDark
                              ? 'text-white drop-shadow-md'
                              : 'text-[#14141a]'
                            : isDark
                            ? 'text-white/90 group-hover:text-white'
                            : 'text-[#14141a]'
                        }`}
                      >
                        {movie.title}
                      </h2>
                    </div>

                    {/* Funky Toggle Box */}
                    <div
                      style={{
                        backgroundColor: isSelected ? theme.accentColor : 'transparent',
                        borderColor: isSelected
                          ? theme.accentColor
                          : isDark
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(0,0,0,0.2)',
                        boxShadow: isSelected
                          ? `0 0 16px ${theme.accentColor}${isDark ? 'aa' : '66'}`
                          : 'none',
                      }}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 font-bold border ${
                        isSelected
                          ? `${isDark ? 'text-black' : 'text-white'} scale-110`
                          : isDark
                          ? 'text-transparent group-hover:border-white/50'
                          : 'text-transparent group-hover:border-black/40'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  {/* Minimal Tagline */}
                  <p
                    className={`text-xs font-mono mt-1 mb-3 ${
                      isDark ? 'text-white/60' : 'text-black/60'
                    }`}
                  >
                    {movie.tagline}
                  </p>

                  {/* Bottom Row: Direct Links + Voter Pill */}
                  <div
                    className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs ${
                      isDark ? 'border-white/[0.08]' : 'border-black/[0.06]'
                    }`}
                  >
                    {/* Links */}
                    <div
                      className="flex items-center gap-3 font-mono"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={movie.csfdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 hover:underline underline-offset-2 transition-colors ${
                          isDark
                            ? 'text-white/60 hover:text-white'
                            : 'text-black/70 hover:text-black font-medium'
                        }`}
                      >
                        <span>ČSFD</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      <a
                        href={movie.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 hover:underline underline-offset-2 transition-colors ${
                          isDark
                            ? 'text-white/60 hover:text-white'
                            : 'text-black/70 hover:text-black font-medium'
                        }`}
                      >
                        <Play className={`w-3 h-3 ${isDark ? 'fill-white/40' : 'fill-black/40'}`} />
                        <span>Trailer</span>
                      </a>
                    </div>

                    {/* Live Votes Counter & Friends */}
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg font-bold transition-colors ${
                          movieVotes.length > 0
                            ? theme.pillBg
                            : isDark
                            ? 'text-white/30 bg-white/[0.03]'
                            : 'text-black/35 bg-black/[0.04]'
                        }`}
                      >
                        {movieVotes.length}{' '}
                        {movieVotes.length === 1
                          ? 'hlas'
                          : movieVotes.length >= 2 && movieVotes.length <= 4
                          ? 'hlasy'
                          : 'hlasů'}
                      </span>
                      {voterNames.length > 0 && (
                        <span
                          className={`truncate max-w-[150px] ${
                            isDark ? 'text-white/60' : 'text-black/60'
                          }`}
                        >
                          · {voterNames.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Funky Voting Action Box */}
        <form
          onSubmit={handleVoteSubmit}
          className={`relative border-2 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center backdrop-blur-md overflow-hidden transition-all ${
            isDark
              ? 'bg-[#11111a]/95 border-white/20 shadow-2xl'
              : 'bg-white/95 border-black/[0.09] shadow-[0_12px_32px_rgba(0,0,0,0.06)]'
          }`}
        >
          {isDark && (
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#ccff00]/40 via-[#00f5ff]/40 to-[#ff007a]/40" />
          )}

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ako ťa volajů?"
              value={voterName}
              onChange={(e) => {
                setVoterName(e.target.value);
                if (error) setError('');
              }}
              className={`w-full px-4 py-3 border rounded-xl font-medium text-sm transition-all focus:outline-none ${
                isDark
                  ? 'bg-black/60 border-white/20 text-white placeholder-white/40 focus:border-[#ccff00] focus:shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                  : 'bg-[#f8faf7] border-black/15 text-[#14141a] placeholder-black/40 focus:border-black focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]'
              }`}
              maxLength={30}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="relative px-8 py-3 bg-gradient-to-r from-[#ccff00] via-[#d4ff1a] to-[#a3ff00] hover:brightness-110 active:scale-95 text-black font-funky font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-[0_4px_25px_rgba(204,255,0,0.45)] hover:shadow-[0_4px_35px_rgba(204,255,0,0.6)] overflow-hidden disabled:opacity-60"
          >
            {/* Specular button glint */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] translate-x-[-150%] hover:translate-x-[150%] transition-transform duration-700 pointer-events-none" />

            {justVoted ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>ODHLASOVÁNO!</span>
              </>
            ) : (
              <span>HLASOVAT</span>
            )}
          </button>
        </form>

        {error && (
          <p
            className={`text-xs font-mono mt-2 text-center font-bold ${
              isDark
                ? 'text-[#ff007a] drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]'
                : 'text-rose-600'
            }`}
          >
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* Secret Admin Modal for resetting database */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className={`relative w-full max-w-sm rounded-2xl p-6 border shadow-2xl transition-all ${
              isDark
                ? 'bg-[#12121a] border-white/20 text-white'
                : 'bg-white border-black/15 text-[#14141a]'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setShowAdminModal(false);
                setIsAdminUnlocked(false);
                setAdminPinInput('');
                setAdminError('');
              }}
              className="absolute top-4 right-4 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!isAdminUnlocked ? (
              <form onSubmit={handleAdminPinSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#ccff00]" />
                  <h3 className="font-funky text-lg font-bold">Správa ankety</h3>
                </div>
                <p className="text-xs opacity-60 font-mono">
                  Zadej tajný PIN pro resetování hlasů.
                </p>
                <input
                  type="password"
                  placeholder="PIN"
                  value={adminPinInput}
                  onChange={(e) => {
                    setAdminPinInput(e.target.value);
                    if (adminError) setAdminError('');
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-mono border focus:outline-none ${
                    isDark
                      ? 'bg-black/50 border-white/20 text-white focus:border-[#ccff00]'
                      : 'bg-black/5 border-black/15 text-black focus:border-black'
                  }`}
                  autoFocus
                />
                {adminError && (
                  <p className="text-xs text-rose-500 font-mono font-bold">
                    {adminError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#ccff00] text-black font-funky font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#b8f000]"
                >
                  Odemknout
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-500">
                  <Trash2 className="w-5 h-5" />
                  <h3 className="font-funky text-lg font-bold">Resetovat anketu</h3>
                </div>
                <p className="text-xs opacity-75 leading-relaxed font-mono">
                  Aktuálně je v databázi celkem <span className="font-bold">{votes.length}</span> hlasů.
                  Smazáním se vynulují počítadla pro všechny návštěvníky.
                </p>

                {resetSuccess ? (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-mono font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Databáze byla vyresetována!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isResetting}
                    onClick={handleAdminResetAllVotes}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-funky font-bold text-xs uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isResetting ? 'Mažu hlasy...' : 'Smazat všechny hlasy'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
