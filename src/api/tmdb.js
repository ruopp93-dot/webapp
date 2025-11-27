const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const DEFAULT_LANGUAGE = import.meta.env.VITE_TMDB_LANGUAGE || "ru-RU";
const DEFAULT_REGION = import.meta.env.VITE_TMDB_REGION || "RU";

const FALLBACK_MOVIES = [
  {
    id: 603692,
    title: "Джон Уик 4",
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    rating: 7.8,
    releaseDate: "2023-03-22",
    overview:
      "Цена за голову Уика растет, и он разворачивает войну против Правления по всему миру.",
    genreIds: [28, 53],
    popularity: 1560
  },
  {
    id: 502356,
    title: "Супербратья Марио",
    poster: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
    rating: 7.7,
    releaseDate: "2023-04-05",
    overview:
      "Работая в канализации, Марио и Луиджи попадают в волшебный мир и оказываются по разные стороны.",
    genreIds: [16, 12, 35, 14],
    popularity: 1420
  },
  {
    id: 76600,
    title: "Аватар: Путь воды",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    rating: 7.6,
    releaseDate: "2022-12-14",
    overview: "Джейк Салли и Нейтирия создали семью и вынуждены покинуть свой дом.",
    genreIds: [878, 12, 28],
    popularity: 1360
  },
  {
    id: 385687,
    title: "Форсаж 10",
    poster: "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
    rating: 7.2,
    releaseDate: "2023-05-17",
    overview:
      "Доминику Торрето предстоит защитить семью и команду от Данте Рейеса, жаждущего мести.",
    genreIds: [28, 80, 53],
    popularity: 1230
  },
  {
    id: 447365,
    title: "Стражи Галактики. Часть 3",
    poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    rating: 8.1,
    releaseDate: "2023-05-03",
    overview:
      "Питер Квилл собирает команду, чтобы защитить вселенную и спасти одного из своих.",
    genreIds: [878, 12, 28],
    popularity: 1165
  },
  {
    id: 447277,
    title: "Русалочка",
    poster: "https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg",
    rating: 6.4,
    releaseDate: "2023-05-18",
    overview: "Юная русалка заключает сделку с морской ведьмой, чтобы узнать жизнь на суше.",
    genreIds: [12, 10751, 14, 10749],
    popularity: 980
  },
  {
    id: 298618,
    title: "Флэш",
    poster: "https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
    rating: 6.7,
    releaseDate: "2023-06-13",
    overview:
      "Барри Аллен использует суперскорость, чтобы изменить прошлое, но создает мир без супергероев.",
    genreIds: [28, 12, 878],
    popularity: 930
  },
  {
    id: 569094,
    title: "Человек-паук: Паутина вселенных",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    rating: 8.4,
    releaseDate: "2023-05-31",
    overview:
      "Майлз Моралес мчится по Мультивселенной и встречает команду пауков, охраняющих её существование.",
    genreIds: [16, 28, 12, 878],
    popularity: 880
  },
  {
    id: 298634,
    title: "Лука",
    poster: "https://image.tmdb.org/t/p/w500/jTswp6KyDYKtvC52GbHagrZbGvD.jpg",
    rating: 7.8,
    releaseDate: "2021-06-17",
    overview:
      "На Итальянской Ривьере рождается дружба между мальчиком и морским чудовищем, принявшим человеческий облик.",
    genreIds: [16, 35, 10751, 14],
    popularity: 720
  },
  {
    id: 792307,
    title: "65",
    poster: "https://image.tmdb.org/t/p/w500/rzRb63TldOKdKydCvWJM8B6EkPM.jpg",
    rating: 6.2,
    releaseDate: "2023-03-02",
    overview:
      "После аварии на неизвестной планете пилот Миллс понимает, что он здесь не один.",
    genreIds: [878, 53, 12],
    popularity: 610
  },
  {
    id: 3856870,
    title: "Демо-тайна",
    poster: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    rating: 7.1,
    releaseDate: "2024-02-02",
    overview: "Запасной загадочный фильм, показывается, если нет ключа API.",
    genreIds: [9648, 53],
    popularity: 550
  }
];

export async function fetchPopularMovies(page = 1) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) {
    return { items: FALLBACK_MOVIES, hasMore: false, from: "fallback" };
  }

  try {
    const res = await fetch(
      `${TMDB_BASE}/trending/movie/week?language=${encodeURIComponent(
        DEFAULT_LANGUAGE
      )}&region=${encodeURIComponent(DEFAULT_REGION)}&page=${page}&api_key=${apiKey}`
    );
    if (!res.ok) {
      throw new Error(`TMDb responded with ${res.status}`);
    }
    const json = await res.json();
    const items =
      json.results?.map((movie) => ({
        id: movie.id,
        title: movie.title || movie.name,
        poster: movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : "",
        rating: movie.vote_average,
        releaseDate: movie.release_date || movie.first_air_date,
        overview: movie.overview,
        genreIds: movie.genre_ids || [],
        popularity: movie.popularity || 0
      })) || [];
    return {
      items,
      hasMore: page < (json.total_pages || 1),
      from: "tmdb"
    };
  } catch (err) {
    console.error("Failed to fetch TMDb data", err);
    return { items: FALLBACK_MOVIES, hasMore: false, from: "fallback" };
  }
}
