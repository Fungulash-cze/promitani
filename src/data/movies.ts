export interface Movie {
  id: string;
  number: string;
  title: string;
  tagline: string;
  csfdUrl: string;
  trailerUrl: string;
  accentColor: string;
  accentBorder: string;
  cardGlow: string;
  selectedBg: string;
  flareGradient: string;
  pillBg: string;
}

export interface VoteRecord {
  id: string;
  voterName: string;
  selectedMovieIds: string[];
  timestamp: number;
}

export const MOVIES: Movie[] = [
  {
    id: 'posledni-expedice',
    number: '01',
    title: 'Poslední expedice',
    tagline: 'Záhadné zmizení první ženy na K2 · 86 min',
    csfdUrl: 'https://www.csfd.cz/film/1600616-posledni-expedice/prehled/',
    trailerUrl: 'https://www.youtube.com/results?search_query=Posledn%C3%AD+expedice+trailer+Eliza+Kubarska',
    accentColor: '#0284c7',
    accentBorder: 'border-[#0284c7]',
    cardGlow: 'shadow-[0_12px_32px_rgba(2,132,199,0.22)] ring-2 ring-[#0284c7]/40',
    selectedBg: 'bg-[#f0f9ff]',
    flareGradient: 'from-[#38bdf8]/20 via-[#60a5fa]/10 to-transparent',
    pillBg: 'bg-[#e0f2fe] text-[#0369a1] font-bold',
  },
  {
    id: 'reka-je-mnou',
    number: '02',
    title: 'Já jsem řekou, řeka je mnou',
    tagline: 'První řeka s lidskými právy · 89 min',
    csfdUrl: 'https://www.csfd.cz/film/1510948-ja-jsem-rekou-reka-je-mnou/prehled/',
    trailerUrl: 'https://www.youtube.com/results?search_query=J%C3%A1+jsem+%C5%99ekou+%C5%99eka+je+mnou+trailer',
    accentColor: '#65a30d',
    accentBorder: 'border-[#65a30d]',
    cardGlow: 'shadow-[0_12px_32px_rgba(101,163,13,0.22)] ring-2 ring-[#65a30d]/40',
    selectedBg: 'bg-[#f7fee7]',
    flareGradient: 'from-[#a3e635]/20 via-[#4ade80]/10 to-transparent',
    pillBg: 'bg-[#ecfccb] text-[#3f6212] font-bold',
  },
  {
    id: 'doktor-na-tripu',
    number: '03',
    title: 'Doktor na tripu',
    tagline: 'Psychedelika z laboratoře do Amazonie · 80 min',
    csfdUrl: 'https://www.csfd.cz/film/1630806-doktor-na-tripu/prehled/',
    trailerUrl: 'https://www.youtube.com/results?search_query=Doktor+na+tripu+David+%C4%8C%C3%A1lek+trailer',
    accentColor: '#e11d48',
    accentBorder: 'border-[#e11d48]',
    cardGlow: 'shadow-[0_12px_32px_rgba(225,29,72,0.22)] ring-2 ring-[#e11d48]/40',
    selectedBg: 'bg-[#fff1f2]',
    flareGradient: 'from-[#f43f5e]/20 via-[#c084fc]/10 to-transparent',
    pillBg: 'bg-[#ffe4e6] text-[#be123c] font-bold',
  },
];

export const INITIAL_VOTES: VoteRecord[] = [];
