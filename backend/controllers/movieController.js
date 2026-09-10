import Movie from "../models/Movie.js";
import User from "../models/User.js";

// GET /api/movies  - all movies, optional ?genre= & ?type=
export const getMovies = async (req, res, next) => {
  try {
    const { genre, type } = req.query;
    const filter = {};
    if (genre) filter.genre = genre;
    if (type) filter.type = type;
    const movies = await Movie.find(filter).sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/featured - one hero banner movie
export const getFeatured = async (req, res, next) => {
  try {
    const count = await Movie.countDocuments({ isFeatured: true });
    const random = Math.floor(Math.random() * Math.max(count, 1));
    const movie = await Movie.findOne({ isFeatured: true }).skip(random);
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/trending
export const getTrending = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isTrending: true });
    res.json(movies);
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/genres/list - distinct genres, for building rows
export const getGenres = async (req, res, next) => {
  try {
    const genres = await Movie.distinct("genre");
    res.json(genres);
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/search?q=
export const searchMovies = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const movies = await Movie.find({ $text: { $search: q } });
    res.json(movies);
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/:id
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// POST /api/movies/:id/my-list - toggle add/remove from user's list
export const toggleMyList = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const movieId = req.params.id;
    const exists = user.myList.some((id) => id.toString() === movieId);

    if (exists) {
      user.myList = user.myList.filter((id) => id.toString() !== movieId);
    } else {
      user.myList.push(movieId);
    }

    await user.save();
    res.json({ myList: user.myList });
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/my-list
export const getMyList = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate("myList");
    res.json(user.myList);
  } catch (err) {
    next(err);
  }
};
