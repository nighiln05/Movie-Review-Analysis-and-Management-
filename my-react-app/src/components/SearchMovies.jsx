import React, { useState } from 'react';
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

function SearchMovies() {
  const [filters, setFilters] = useState({
    movie_name: '',
    language: '',
    country: '',
    genre: '',
    min_imdb_score: '',
    max_imdb_score: '',
    movie_certification: '',
    producer_name: '',
    actor_name: '',
    director_name: '',
    plot_keyword: ''
  });

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/movies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMovies(data);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError('Failed to load movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <nav className="menu-bar">
        <ul>
          <li><Link to="/explore">Explore</Link></li>
          <li><Link to="/search" className="active">Search</Link></li>
        </ul>
      </nav>

      <section id="search" className="page">
        <h2>Search Movies</h2>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-fields-wrapper">
            <div className="form-group">
              <label htmlFor="movie_name">Movie Name</label>
              <input
                type="text"
                id="movie_name"
                name="movie_name"
                value={filters.movie_name}
                onChange={handleChange}
                placeholder="Enter movie title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={filters.language}
                onChange={handleChange}
                placeholder="e.g., English, Hindi"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={filters.country}
                onChange={handleChange}
                placeholder="e.g., USA, India"
              />
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={filters.genre}
                onChange={handleChange}
                placeholder="e.g., Action, Drama"
              />
            </div>

            <div className="form-group">
              <label htmlFor="min_imdb_score">Min IMDb Score</label>
              <input
                type="number"
                id="min_imdb_score"
                name="min_imdb_score"
                min="0"
                max="10"
                step="0.1"
                value={filters.min_imdb_score}
                onChange={handleChange}
                placeholder="0-10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="max_imdb_score">Max IMDb Score</label>
              <input
                type="number"
                id="max_imdb_score"
                name="max_imdb_score"
                min="0"
                max="10"
                step="0.1"
                value={filters.max_imdb_score}
                onChange={handleChange}
                placeholder="0-10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="movie_certification">Certification</label>
              <input
                type="text"
                id="movie_certification"
                name="movie_certification"
                value={filters.movie_certification}
                onChange={handleChange}
                placeholder="e.g., PG-13, R"
              />
            </div>

            <div className="form-group">
              <label htmlFor="producer_name">Producer</label>
              <input
                type="text"
                id="producer_name"
                name="producer_name"
                value={filters.producer_name}
                onChange={handleChange}
                placeholder="Enter producer name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="actor_name">Actor</label>
              <input
                type="text"
                id="actor_name"
                name="actor_name"
                value={filters.actor_name}
                onChange={handleChange}
                placeholder="Enter actor name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="director_name">Director</label>
              <input
                type="text"
                id="director_name"
                name="director_name"
                value={filters.director_name}
                onChange={handleChange}
                placeholder="Enter director name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="plot_keyword">Plot Keyword</label>
              <input
                type="text"
                id="plot_keyword"
                name="plot_keyword"
                value={filters.plot_keyword}
                onChange={handleChange}
                placeholder="Enter plot keyword"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                <MagnifyingGlassIcon className="search-icon" />
                Search Movies
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}

        {movies.length > 0 && (
          <div className="movie-grid">
            {movies.map(movie => (
              <div key={movie.movie_id} className="movie-card">
                <img 
                  src={movie.picture_url || '/images/placeholder.png'} 
                  alt={movie.movie_name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.png';
                  }}
                />
                <div className="movie-card-content">
                  <h3>{movie.movie_name}</h3>
                  <div className="movie-details">
                    <p><strong>Genre:</strong> {movie.genre}</p>
                    <p><strong>Language:</strong> {movie.language}</p>
                    <p><strong>Director:</strong> {movie.director_name}</p>
                    <p><strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}</p>
                  </div>
                  <div className="rating">
                    <StarIcon className="star-icon" />
                    <span>{movie.imdb_score}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && movies.length === 0 && (
          <div className="no-results">
            <p>No movies match your criteria. Try adjusting your filters.</p>
          </div>
        )}
      </section>
    </>
  );
}

export default SearchMovies; 