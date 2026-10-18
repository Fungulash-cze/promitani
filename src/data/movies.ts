export interface Movie {
  id: string;
  number: string;
  title: string;
  tagline: string;
  csfdUrl: string;
  trailerUrl: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
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
    accentColor: '#00f0ff',
    accentBg: 'rgba(0, 240, 255, 0.12)',
    accentBorder: 'rgba(0, 240, 255, 0.4)',
    accentText: 'text-[#00f0ff]',
  },
  {
    id: 'reka-je-mnou',
    number: '02',
    title: 'Já jsem řekou, řeka je mnou',
    tagline: 'První řeka s lidskými právy · 89 min',
    csfdUrl: 'https://www.csfd.cz/film/1510948-ja-jsem-rekou-reka-je-mnou/prehled/',
    trailerUrl: 'https://www.youtube.com/results?search_query=J%C3%A1+jsem+%C5%99ekou+%C5%99eka+je+mnou+trailer',
    accentColor: '#ccff00',
    accentBg: 'rgba(204, 255, 0, 0.12)',
    accentBorder: 'rgba(204, 255, 0, 0.4)',
    accentText: 'text-[#ccff00]',
  },
  {
    id: 'doktor-na-tripu',
    number: '03',
    title: 'Doktor na tripu',
    tagline: 'Psychedelika z laboratoře do Amazonie · 80 min',
    csfdUrl: 'https://www.csfd.cz/film/1630806-doktor-na-tripu/prehled/',
    trailerUrl: 'https://www.youtube.com/results?search_query=Doktor+na+tripu+David+%C4%8C%C3%A1lek+trailer',
    accentColor: '#ff4d6d',
    accentBg: 'rgba(255, 77, 109, 0.12)',
    accentBorder: 'rgba(255, 77, 109, 0.4)',
    accentText: 'text-[#ff4d6d]',
  },
];

export const INITIAL_VOTES: VoteRecord[] = [];

