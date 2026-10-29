import type { Genre, Movie } from '@/types';

const names: Record<string, string> = {
  action: 'Hành động', adventure: 'Phiêu lưu', animation: 'Hoạt hình', comedy: 'Hài',
  crime: 'Tội phạm', documentary: 'Tài liệu', drama: 'Chính kịch', family: 'Gia đình',
  fantasy: 'Kỳ ảo', history: 'Lịch sử', horror: 'Kinh dị', music: 'Âm nhạc',
  mystery: 'Bí ẩn', romance: 'Lãng mạn', 'science fiction': 'Khoa học viễn tưởng',
  'sci-fi': 'Khoa học viễn tưởng', 'tv movie': 'Phim truyền hình', thriller: 'Giật gân',
  war: 'Chiến tranh', western: 'Viễn Tây',
};

export function localizeGenre(genre: Genre): Genre {
  return { ...genre, name: names[genre.name.trim().toLowerCase()] ?? genre.name };
}

export function localizeMovieGenres<T extends Movie>(movie: T): T {
  return { ...movie, genres: movie.genres?.map(localizeGenre) };
}
