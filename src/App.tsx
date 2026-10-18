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
    <div className="min-h-screen bg-[#0a0a0f] text-[#f2f2f0] p-4 sm:p-8 flex flex-col justify-between selection:bg-[#ccff00] selection:text-black font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Funky Minimal Header */}
        <header className="mb-6 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/15 text-[#ccff00] text-xs font-mono font-bold tracking-wide mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>juchuuuu, v pondělí 19. dáme další filmík</span>
          </div>
          <h1 className="font-funky text-4xl sm:text-6xl font-extrabold tracking-tight uppercase leading-none text-white">
            CO DÁME? 🍿
          </h1>
        </header>

        {/* 3 Movie Cards */}
        <div className="space-y-3.5 mb-6">
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
                className={`group relative rounded-2xl p-5 border-2 transition-all duration-150 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#161622] border-white shadow-[0_0_25px_rgba(255,255,255,0.15)] scale-[1.01]'
                    : 'bg-[#101017] border-white/10 hover:border-white/30 hover:bg-[#14141e]'
                }`}
              >
                {/* Top Row: Number, Title, Custom Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono-numbers text-sm font-bold text-white/30">
                      {movie.number}
                    </span>
                    <h2
                      className={`font-funky text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
                        isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {movie.title}
                    </h2>
                  </div>

                  {/* Funky Select Button */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 font-bold ${
                      isSelected
                        ? 'bg-[#ccff00] text-black scale-110 shadow-[0_0_12px_#ccff00]'
                        : 'border border-white/30 text-transparent group-hover:border-white/60'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                {/* Minimal Tagline */}
                <p className="text-xs text-white/60 font-mono mt-1 mb-3">
                  {movie.tagline}
                </p>

                {/* Bottom Row: Direct Links + Voter Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.08] text-xs">
                  {/* Links */}
                  <div
                    className="flex items-center gap-3 font-mono"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={movie.csfdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/60 hover:text-white hover:underline underline-offset-2 transition-colors"
                    >
                      <span>ČSFD</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    <a
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/60 hover:text-white hover:underline underline-offset-2 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-white/40" />
                      <span>Trailer</span>
                    </a>
                  </div>

                  {/* Live Votes Counter & Friends */}
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        movieVotes.length > 0
                          ? 'bg-white/10 text-[#ccff00]'
                          : 'text-white/30'
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
                      <span className="text-white/50 truncate max-w-[150px]">
                        · {voterNames.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Funky Voting Action Box */}
        <form
          onSubmit={handleVoteSubmit}
          className="bg-[#12121b] border-2 border-white/20 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="ako ťa volajů?"
              value={voterName}
              onChange={(e) => {
                setVoterName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white font-medium placeholder-white/40 text-sm focus:outline-none focus:border-[#ccff00] transition-colors"
              maxLength={30}
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-[#ccff00] hover:bg-[#d8ff33] text-black font-funky font-bold text-sm uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-[0_4px_16px_rgba(204,255,0,0.3)]"
          >
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
          <p className="text-xs font-mono text-[#ff4d6d] mt-2 text-center font-bold">
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
}
