import type { Genre, MovieDetail } from '@/types';

export const mockGenres: Genre[] = [
  'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Animation', 'Adventure', 'Horror',
].map((name, index) => ({ id: index + 1, name, slug: name.toLowerCase(), movieCount: 0 }));

const titles = [
  'Cyberpunk: Edgerunners & Beyond', 'Interstellar Horizons', 'The Dark Sentinel', 'Neon Odyssey',
  'Shadow Realm Chronicles', 'The Great Heist', 'Beyond the Pines', 'Midnight Crossing',
  'The Last Lighthouse', 'Paper Planets', 'After the Rain', 'Wild Current',
  'A Place to Begin', 'The Long Weekend', 'Silent Orbit', 'Little Giants',
  'The Hollow House', 'Northern Lights', 'Run to the Sea', 'Second Chances',
  'The Lost Expedition', 'Summer in Motion', 'Echoes of Tomorrow', 'Under the Surface',
  'City of Strangers', 'The Wild Ones', 'Moonlight Express', 'Into the Blue',
  'The Secret Garden', 'Final Transmission', 'Bright Days', 'The Night Visitor',
];

export const mockMovies: MovieDetail[] = titles.map((title, index) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const createdAt = `2026-09-${String(1 + index % 28).padStart(2, '0')}T15:00:00Z`;
  const missingExtras = index % 7 === 4;
  return {
    id: index + 1,
    tmdbId: index === 1 ? 157336 : 100000 + index,
    title,
    overview: missingExtras ? null : index === 1
      ? 'When Earth becomes uninhabitable, a team of astronauts travels through a newly discovered wormhole in search of a new home for humanity.'
      : 'An unexpected discovery changes everything. Follow a remarkable journey through distant places, fragile friendships, and the choices that bring us home.',
    releaseDate: missingExtras ? null : `${2020 + index % 6}-${String(1 + index % 12).padStart(2, '0')}-07T00:00:00`,
    durationMinutes: missingExtras ? null : 100 + index * 3,
    posterUrl: missingExtras ? null : `https://picsum.photos/seed/${slug}/500/750`,
    backdropUrl: missingExtras ? null : `https://picsum.photos/seed/${slug}/1280/720`,
    trailerKey: index % 5 === 4 || index === 0 ? null : 'zSWdZVtXT7E',
    isVisible: index !== 31,
    isFeatured: index === 1 || index === 4,
    createdAt,
    updatedAt: createdAt,
    genres: index % 11 === 10 ? undefined : [
      mockGenres[index % 8],
      mockGenres[(index + 3) % 8],
      mockGenres[(index + 5) % 8],
    ],
    cast: index % 11 === 10 ? undefined : [],
    rating: index % 11 === 10 ? null : 7 + (index % 20) / 10,
  };
});

mockGenres.forEach((genre) => {
  genre.movieCount = mockMovies.filter((movie) => movie.genres?.some((item) => item.id === genre.id)).length;
});
