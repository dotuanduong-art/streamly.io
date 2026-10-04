export const queryKeys = {
  movies: {
    all: ['movies'] as const,
    detail: (id: number) => ['movie', id] as const,
    search: (q: string, limit: number) => ['movies', 'search', q, limit] as const,
    similar: (id: number) => ['movies', id, 'similar'] as const,
  },
  genres: ['genres'] as const,
  genreMovies: (id: number) => ['genres', id, 'movies'] as const,
  myList: (userId: number) => ['my-list', userId] as const,
  history: (userId: number) => ['history', userId] as const,
  profile: (userId: number) => ['profile', userId] as const,
  adminMovies: ['admin', 'movies'] as const,
};
