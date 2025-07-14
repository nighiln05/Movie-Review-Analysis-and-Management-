"use server"

import {
  fetchMovieData,
  searchMovies,
  getRatingDistribution,
  getGenreDistribution,
  getYearDistribution,
  type MovieData,
} from "@/lib/data-utils"

export async function searchMoviesAction(query: string): Promise<{
  results: MovieData[]
  filters: Record<string, string>
}> {
  try {
    const movies = await fetchMovieData()
    const results = searchMovies(movies, query)

    // Extract the filters that were applied
    const filterTerms: Record<string, string> = {}

    if (query.match(/genre/i)) filterTerms.genre = "Extracted from your query"
    if (query.match(/director/i)) filterTerms.director = "Extracted from your query"
    if (query.match(/actor|star|cast/i)) filterTerms.actor = "Extracted from your query"
    if (query.match(/year|released/i)) filterTerms.year = "Extracted from your query"
    if (query.match(/country/i)) filterTerms.country = "Extracted from your query"
    if (query.match(/language/i)) filterTerms.language = "Extracted from your query"
    if (query.match(/keyword|about|plot|theme/i)) filterTerms.keywords = "Extracted from your query"

    return {
      results: results.slice(0, 50), // Limit to 50 results for performance
      filters: filterTerms,
    }
  } catch (error) {
    console.error("Error searching movies:", error)
    return {
      results: [],
      filters: {},
    }
  }
}

export async function getMovieAnalyticsAction() {
  try {
    const movies = await fetchMovieData()

    return {
      ratingDistribution: getRatingDistribution(movies),
      genreDistribution: getGenreDistribution(movies),
      yearDistribution: getYearDistribution(
        movies.filter((m) => m.title_year && Number.parseInt(m.title_year) >= 1980),
      ),
    }
  } catch (error) {
    console.error("Error getting movie analytics:", error)
    return {
      ratingDistribution: [],
      genreDistribution: [],
      yearDistribution: [],
    }
  }
}

export async function getFavoriteMoviesAction(favoriteIds: string[]): Promise<MovieData[]> {
  try {
    const movies = await fetchMovieData()
    return movies.filter((movie) => favoriteIds.includes(movie.movie_id))
  } catch (error) {
    console.error("Error fetching favorite movies:", error)
    return []
  }
}

