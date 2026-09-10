import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar.jsx";
import Banner from "../components/Banner.jsx";
import MovieRow from "../components/MovieRow.jsx";
import MovieCard from "../components/MovieCard.jsx";
import VideoModal from "../components/VideoModal.jsx";
import "../styles/browse.css";

const VIEW_TITLES = {
  tv: "TV Shows",
  movies: "Movies",
  mylist: "My List",
};

export default function Browse() {
  const [featured, setFeatured] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [myList, setMyList] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [activeMovie, setActiveMovie] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home"); // home | tv | movies | mylist

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, allRes, trendingRes, myListRes] = await Promise.all([
          api.get("/movies/featured"),
          api.get("/movies"),
          api.get("/movies/trending"),
          api.get("/movies/my-list"),
        ]);
        setFeatured(featuredRes.data);
        setAllMovies(allRes.data);
        setTrending(trendingRes.data);
        setMyList(myListRes.data.map((m) => m._id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get("/movies/search", { params: { q: search } });
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleNavigate = (key) => {
    setView(key);
    setSearch("");
    setSearchResults(null);
  };

  const myListMovies = useMemo(
    () => allMovies.filter((m) => myList.includes(m._id)),
    [allMovies, myList]
  );

  // Movies/TV Shows tabs filter by content type; seed data is all "movie"
  // type, so the TV Shows tab is a real, working, currently-empty filter —
  // add a title with type: "series" to the catalog and it'll show up here.
  const scopedMovies = useMemo(() => {
    if (view === "movies") return allMovies.filter((m) => m.type === "movie");
    if (view === "tv") return allMovies.filter((m) => m.type === "series");
    return allMovies;
  }, [allMovies, view]);

  const scopedTrending = useMemo(() => {
    if (view === "movies") return trending.filter((m) => m.type === "movie");
    if (view === "tv") return trending.filter((m) => m.type === "series");
    return trending;
  }, [trending, view]);

  const genreRows = useMemo(() => {
    const map = {};
    scopedMovies.forEach((movie) => {
      movie.genre?.forEach((g) => {
        if (!map[g]) map[g] = [];
        map[g].push(movie);
      });
    });
    return map;
  }, [scopedMovies]);

  const handleToggleList = (movieId) => {
    setMyList((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  };

  if (loading) {
    return <div className="loading-screen">Loading your catalog...</div>;
  }

  const showBanner = view === "home" && !searchResults;
  const isGridView = view === "mylist"; // My List reads better as a grid than scrolling rows

  return (
    <div>
      <Navbar onSearch={setSearch} searchValue={search} view={view} onNavigate={handleNavigate} />

      {searchResults ? (
        <div className="rows" style={{ marginTop: 100 }}>
          <MovieRow
            title={`Results for "${search}"`}
            movies={searchResults}
            onSelect={(m) => setActiveMovie(m)}
          />
          {searchResults.length === 0 && (
            <div className="empty-state">No titles match "{search}".</div>
          )}
        </div>
      ) : (
        <>
          {showBanner && (
            <Banner
              movie={featured}
              onPlay={(m) => {
                setActiveMovie(m);
                setAutoPlay(true);
              }}
              onMoreInfo={(m) => {
                setActiveMovie(m);
                setAutoPlay(false);
              }}
            />
          )}

          <div className="rows" style={!showBanner ? { marginTop: 100 } : undefined}>
            {view !== "home" && <h1 className="page-title">{VIEW_TITLES[view]}</h1>}

            {view === "home" && (
              <>
                <MovieRow title="Trending Now" movies={scopedTrending} onSelect={setActiveMovie} />
                <MovieRow title="My List" movies={myListMovies} onSelect={setActiveMovie} />
                {Object.entries(genreRows).map(([genre, movies]) => (
                  <MovieRow key={genre} title={genre} movies={movies} onSelect={setActiveMovie} />
                ))}
              </>
            )}

            {view === "mylist" &&
              (myListMovies.length > 0 ? (
                <div className="movie-grid">
                  {myListMovies.map((movie) => (
                    <MovieCard key={movie._id} movie={movie} onSelect={setActiveMovie} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  Your list is empty — hit the + button on any title to save it here.
                </div>
              ))}

            {(view === "movies" || view === "tv") && (
              <>
                <MovieRow title="Trending" movies={scopedTrending} onSelect={setActiveMovie} />
                {Object.entries(genreRows).map(([genre, movies]) => (
                  <MovieRow key={genre} title={genre} movies={movies} onSelect={setActiveMovie} />
                ))}
                {scopedMovies.length === 0 && (
                  <div className="empty-state">
                    No {VIEW_TITLES[view].toLowerCase()} in the catalog yet — check back soon.
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      <VideoModal
        movie={activeMovie}
        autoPlay={autoPlay}
        myList={myList}
        onToggleList={handleToggleList}
        onClose={() => {
          setActiveMovie(null);
          setAutoPlay(false);
        }}
      />
    </div>
  );
}
