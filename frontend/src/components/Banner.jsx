export default function Banner({ movie, onPlay, onMoreInfo }) {
  if (!movie) return null;

  return (
    <section className="banner">
      <div className="banner-bg" style={{ backgroundImage: `url(${movie.bannerUrl})` }} />
      <div className="banner-scrim" />
      <div className="banner-content">
        <h1 className="banner-title">{movie.title}</h1>
        <div className="banner-meta">
          <span className="rating">{movie.rating?.toFixed(1)} rating</span>
          <span>{movie.releaseYear}</span>
          <span className="banner-badge">{movie.maturityRating}</span>
          <span>{movie.durationMinutes} min</span>
        </div>
        <p className="banner-description">{movie.description}</p>
        <div className="banner-actions">
          <button className="btn btn-play" onClick={() => onPlay(movie)}>
            ▶ Play
          </button>
          <button className="btn btn-info" onClick={() => onMoreInfo(movie)}>
            ⓘ More Info
          </button>
        </div>
      </div>
    </section>
  );
}
