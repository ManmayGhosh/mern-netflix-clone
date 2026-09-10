import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { key: "home", label: "Home" },
  { key: "tv", label: "TV Shows" },
  { key: "movies", label: "Movies" },
  { key: "mylist", label: "My List" },
];

export default function Navbar({ onSearch, searchValue, view, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-left">
        <span className="navbar-logo">STREAMLY</span>
        <ul className="navbar-links">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.key}
              className={view === item.key ? "active" : ""}
              onClick={() => onNavigate?.(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-right">
        <input
          className="navbar-search"
          placeholder="Search titles..."
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <button className="navbar-avatar-btn" onClick={logout}>
          {user?.email?.split("@")[0] || "Account"} · Sign out
        </button>
      </div>
    </nav>
  );
}
