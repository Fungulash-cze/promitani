/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { MOVIES, INITIAL_VOTES, VoteRecord } from './data/movies.ts';
import { Check, ExternalLink, Play, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'film_poll_votes_published_v1';
const STORAGE_MY_NAME = 'film_poll_voter_name_published_v1';

export default function App() {
  const [votes, setVotes] = useState<VoteRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_VOTES;
  });

  const [voterName, setVoterName] = useState(() => {
    return localStorage.getItem(STORAGE_MY_NAME) || '';
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [justVoted, setJustVoted] = useState(false);
  const [error, setError] = useState('');

  // Persist votes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
    } catch {
      // ignore
    }
  }, [votes]);

  // If user already voted, pre-select their movies
  useEffect(() => {
    if (voterName.trim()) {
      const existing = votes.find(
        (v) => v.voterName.toLowerCase() === voterName.trim().toLowerCase()
      );
      if (existing) {
        setSelectedIds(existing.selectedMovieIds);
      }
    }
  }, [voterName, votes]);

  const toggleMovie = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    if (error) setError('');
  };

  const handleVoteSubmit = (e: React.FormEvent) => {
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

    localStorage.setItem(STORAGE_MY_NAME, cleanName);

    setVotes((prev) => {
      const filtered = prev.filter(
        (v) => v.voterName.toLowerCase() !== cleanName.toLowerCase()
      );
      return [
        ...filtered,
        {
          id: `v-${Date.now()}`,
          voterName: cleanName,
          selectedMovieIds: selectedIds,
          timestamp: Date.now(),
        },
      ];
    });

    setJustVoted(true);
    setTimeout(() => setJustVoted(false), 2500);
  };

  return (
    <div className="relative min-h-screen bg-[#f4f6f1] text-[#16161c] p-4 sm:p-8 flex flex-col justify-between selection:bg-[#ccff00] selection:text-black font-sans overflow-hidden">
      {/* Cool Ambient Artifacts: Soft, Cheerful, Calm Pastel Light Flares */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#38bdf8]/20 blur-[130px] pointer-events-none animate-float-slow" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-[#fbbf24]/20 blur-[130px] pointer-events-none animate-float-delayed" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-[#f472b6]/20 blur-[130px] pointer-events-none animate-float-slow" />

      {/* Subtle Warm Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.7),transparent)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto w-full z-10">
        {/* Funky Header with Cheerful Pastel Glow */}
        <header className="mb-6 pt-2">
          <div className="relative inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-black/10 text-emerald-800 text-xs font-mono font-bold tracking-wide mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-rose-600 bg-clip-text text-transparent">
              juchuuuu, v pondělí 19. dáme další filmík
            </span>
          </div>
          <h1 className="font-funky text-4xl sm:text-6xl font-extrabold tracking-tight uppercase leading-none text-[#14141a] drop-shadow-sm">
            CO DÁME? 🍿
          </h1>
        </header>

        {/* 3 Movie Cards with Cheerful Colors and Light Sheen */}
        <div className="space-y-4 mb-6">
          {MOVIES.map((movie) => {
            const isSelected = selectedIds.includes(movie.id);
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
                    ? `${movie.selectedBg} ${movie.accentBorder} ${movie.cardGlow} scale-[1.015]`
                    : 'bg-white/95 border-black/[0.08] hover:border-black/20 hover:bg-white shadow-[0_6px_20px_rgba(0,0,0,0.03)]'
                }`}
              >
                {/* Visual Artifact: Glass Specular Flare Gradient across card */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${movie.flareGradient} pointer-events-none transition-opacity duration-300 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  }`}
                />

                {/* Visual Artifact: Dynamic Light Sheen reflection */}
                <div className="absolute -inset-full top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] pointer-events-none group-hover:animate-sheen" />

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Top Row: Number, Title, Custom Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono-numbers text-sm font-bold text-black/30">
                        {movie.number}
                      </span>
                      <h2 className="font-funky text-xl sm:text-2xl font-bold tracking-tight text-[#14141a]">
                        {movie.title}
                      </h2>
                    </div>

                    {/* Funky Cheerful Toggle Box */}
                    <div
                      style={{
                        backgroundColor: isSelected ? movie.accentColor : 'transparent',
                        borderColor: isSelected ? movie.accentColor : 'rgba(0,0,0,0.2)',
                        boxShadow: isSelected
                          ? `0 0 14px ${movie.accentColor}66`
                          : 'none',
                      }}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 font-bold border ${
                        isSelected
                          ? 'text-white scale-110'
                          : 'text-transparent group-hover:border-black/40'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  {/* Minimal Tagline */}
                  <p className="text-xs text-black/60 font-mono mt-1 mb-3">
                    {movie.tagline}
                  </p>

                  {/* Bottom Row: Direct Links + Voter Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/[0.06] text-xs">
                    {/* Links */}
                    <div
                      className="flex items-center gap-3 font-mono"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={movie.csfdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-black/70 hover:text-black hover:underline underline-offset-2 transition-colors font-medium"
                      >
                        <span>ČSFD</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      <a
                        href={movie.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-black/70 hover:text-black hover:underline underline-offset-2 transition-colors font-medium"
                      >
                        <Play className="w-3 h-3 fill-black/40" />
                        <span>Trailer</span>
                      </a>
                    </div>

                    {/* Live Votes Counter & Friends with Cheerful Pill */}
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg font-bold transition-colors ${
                          movieVotes.length > 0
                            ? movie.pillBg
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
                        <span className="text-black/60 truncate max-w-[150px]">
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

        {/* Funky Voting Action Box with Cheerful Modern Styling */}
        <form
          onSubmit={handleVoteSubmit}
          className="relative bg-white/95 border-2 border-black/[0.09] rounded-2xl p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center backdrop-blur-md overflow-hidden"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ako ťa volajů?"
              value={voterName}
              onChange={(e) => {
                setVoterName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 bg-[#f8faf7] border border-black/15 rounded-xl text-[#14141a] font-medium placeholder-black/40 text-sm focus:outline-none focus:border-black focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] transition-all"
              maxLength={30}
            />
          </div>

          <button
            type="submit"
            className="relative px-8 py-3 bg-[#ccff00] hover:bg-[#b8f000] active:scale-95 text-black font-funky font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-[0_4px_20px_rgba(180,225,0,0.45)] hover:shadow-[0_6px_28px_rgba(180,225,0,0.6)] overflow-hidden"
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
          <p className="text-xs font-mono text-rose-600 mt-2 text-center font-bold">
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
}
