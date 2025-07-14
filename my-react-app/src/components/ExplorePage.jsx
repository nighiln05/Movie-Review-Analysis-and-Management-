import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

// Assuming your backend serves images relative to a base path or you have them locally
// Adjust the image source path as necessary.
const IMAGE_BASE_PATH = '../assets/images/'; // Example: adjust if images are served differently

function ExplorePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/movies/random');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMovies(data);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <>
      <nav className="menu-bar">
        <ul>
          <li><Link to="/explore" className="active">Explore</Link></li>
          <li><Link to="/search">Search Movies</Link></li>
        </ul>
      </nav>

      <section id="explore" className="page">
        <h2>TOP RECOMMENDATIONS</h2>
        
        {loading && (
          <div className="loading">
            <p>Loading movies...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="movie-grid">
            {movies.map(movie => (
              <div key={movie.title} className="movie-card">
                <img 
                  src={`/images/${movie.image}`} 
                  alt={movie.title} 
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = '/images/placeholder.png';
                  }} 
                />
                <div className="movie-card-content">
                  <h3>{movie.title}</h3>
                  <p>{movie.description}</p>
                  <div className="rating">
                    <StarIcon className="star-icon" />
                    <span>{movie.rating}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default ExplorePage; 