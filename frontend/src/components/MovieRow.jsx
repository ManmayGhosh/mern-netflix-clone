import MovieCard from "./MovieCard.jsx";

export default function MovieRow({ title, movies, onSelect }) {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="movie-row">
      <h2>{title}</h2>
      <div className="movie-row-track">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
