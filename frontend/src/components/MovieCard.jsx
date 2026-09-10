export default function MovieCard({ movie, onSelect }) {
  return (
    <div className="movie-card" onClick={() => onSelect(movie)}>
      <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
      <div className="movie-card-info">
        <h3>{movie.title}</h3>
        <div className="movie-card-meta">
          <span className="rating">{movie.rating?.toFixed(1)}</span>
          <span>{movie.releaseYear}</span>
          <span>{movie.maturityRating}</span>
        </div>
      </div>
    </div>
  );
}
