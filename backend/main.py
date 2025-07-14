from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import random

# Pydantic model for filter criteria
class MovieFilters(BaseModel):
    director: Optional[str] = None
    movie_name: Optional[str] = Field(None, alias='movieName')
    min_rating: Optional[float] = Field(None, alias='minRating')
    song_names: Optional[List[str]] = Field(None, alias='songNames')
    actors: Optional[List[str]] = None

    class Config:
        allow_population_by_field_name = True

app = FastAPI()

# CORS setup to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load movie data from JSON file
def load_movie_data():
    try:
        with open("../assets/movie-card-data.json") as f:
            data = json.load(f)
        return data["movie_card_data"]
    except FileNotFoundError:
        print("Error: movie-card-data.json not found. Make sure the path is correct relative to main.py")
        return []
    except json.JSONDecodeError:
        print("Error: Could not decode movie-card-data.json.")
        return []

@app.get("/")
def read_root():
    return {"status": "healthy"}

@app.get("/movies/random")
def get_random_movies():
    movie_data = load_movie_data()
    if not movie_data:
        return []
    random_movies = random.sample(movie_data, k=min(10, len(movie_data)))  # Get up to 10 random movies
    return random_movies

@app.post("/movies/filter")
def filter_movies(filters: MovieFilters):
    movie_data = load_movie_data()
    if not movie_data:
        return []

    def match(movie):
        if filters.director and filters.director.lower() not in movie.get("director_name", "").lower():
            return False
        if filters.movie_name and filters.movie_name.lower() not in movie.get("movie_name", "").lower():
            return False
        if filters.min_rating and movie.get("imdb_score") is not None:
            try:
                if float(movie["imdb_score"]) < filters.min_rating:
                    return False
            except ValueError:
                return False
        if filters.song_names:
            movie_songs = [s.lower() for s in movie.get("songs", [])]
            if not all(song.lower() in movie_songs for song in filters.song_names):
                return False
        if filters.actors:
            movie_actors = [a.lower() for a in movie.get("actors", [])]
            if not all(actor.lower() in movie_actors for actor in filters.actors):
                return False
        return True

    filtered_movies = [movie for movie in movie_data if match(movie)]
    return filtered_movies

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

