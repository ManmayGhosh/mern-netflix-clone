import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: [{ type: String, index: true }],
    releaseYear: Number,
    maturityRating: { type: String, default: "PG-13" },
    durationMinutes: Number,
    posterUrl: { type: String, required: true },
    bannerUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
    trailerUrl: String,
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    type: { type: String, enum: ["movie", "series"], default: "movie" },
    cast: [String],
    rating: { type: Number, min: 0, max: 10, default: 0 },
  },
  { timestamps: true }
);

movieSchema.index({ title: "text", description: "text" });

export default mongoose.model("Movie", movieSchema);
