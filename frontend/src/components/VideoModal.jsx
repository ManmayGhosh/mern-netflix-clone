import { useEffect, useState } from "react";
import api from "../api/axios";

export default function VideoModal({ movie, onClose, autoPlay, myList, onToggleList }) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    if (movie) setInList(myList?.some((id) => id === movie._id));
  }, [movie, myList]);

  if (!movie) return null;

  const handleToggleList = async () => {
    try {
      await api.post(`/movies/${movie._id}/my-list`);
      setInList((prev) => !prev);
      onToggleList?.(movie._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-video-wrap">
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
          <video
            src={movie.videoUrl}
            poster={movie.bannerUrl}
            controls
            autoPlay={autoPlay}
          />
        </div>
        <div className="modal-body">
          <h2>{movie.title}</h2>
          <div className="banner-meta">
            <span className="rating">{movie.rating?.toFixed(1)} rating</span>
            <span>{movie.releaseYear}</span>
            <span className="banner-badge">{movie.maturityRating}</span>
            <span>{movie.durationMinutes} min</span>
          </div>
          <div className="modal-actions">
            <button
              className={`btn-icon ${inList ? "active" : ""}`}
              onClick={handleToggleList}
              title={inList ? "Remove from My List" : "Add to My List"}
            >
              {inList ? "✓" : "+"}
            </button>
          </div>
          <p className="banner-description" style={{ WebkitLineClamp: "unset" }}>
            {movie.description}
          </p>
          {movie.cast?.length > 0 && (
            <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
              Cast: {movie.cast.join(", ")}
            </p>
          )}
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
            Genres: {movie.genre?.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
