import express from "express";
import {
  getMovies,
  getFeatured,
  getTrending,
  getGenres,
  searchMovies,
  getMovieById,
  toggleMyList,
  getMyList,
} from "../controllers/movieController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Order matters: specific routes before the /:id catch-all
router.get("/featured", getFeatured);
router.get("/trending", getTrending);
router.get("/genres/list", getGenres);
router.get("/search", searchMovies);
router.get("/my-list", protect, getMyList);
router.post("/:id/my-list", protect, toggleMyList);
router.get("/:id", getMovieById);
router.get("/", getMovies);

export default router;
