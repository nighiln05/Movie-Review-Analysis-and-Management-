"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Globe, Star, User, Heart } from "lucide-react"
import { fetchMovieData, type MovieData } from "@/lib/data-utils"
import { useAuth } from "@/contexts/auth-context"

export default function MoviePage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const [movie, setMovie] = useState<MovieData | null>(null)
  const [similarMovies, setSimilarMovies] = useState<MovieData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  useEffect(() => {
    async function loadMovie() {
      try {
        const allMovies = await fetchMovieData()
        const foundMovie = allMovies.find((m) => m.movie_id === id)

        if (foundMovie) {
          setMovie(foundMovie)

          // Find similar movies (same genre)
          const genres = foundMovie.genres.split("|")
          const similar = allMovies
            .filter((m) => m.movie_id !== id && genres.some((genre) => m.genres.includes(genre)))
            .sort((a, b) => Number.parseFloat(b.imdb_score) - Number.parseFloat(a.imdb_score))
            .slice(0, 3)

          setSimilarMovies(similar)
        }
      } catch (error) {
        console.error("Error loading movie:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMovie()
  }, [id])

  // Check if movie is in favorites
  useEffect(() => {
    if (profile?.favorites && movie) {
      setIsFavorite(profile.favorites.includes(movie.movie_id))
    }
  }, [profile, movie])

  const handleToggleFavorite = async () => {
    if (!user || !movie) return

    setIsTogglingFavorite(true)
    try {
      // Just toggle the UI state for preview
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  // Generate movie poster URL
  const getMoviePosterUrl = (movie: MovieData) => {
    if (!movie) return "/placeholder.svg?height=400&width=300&text=Movie+Poster"

    const title = movie.movie_title.replace(/\s+/g, "+")
    const year = movie.title_year
    return `/placeholder.svg?height=400&width=300&text=${encodeURIComponent(title)}${year ? "+(" + year + ")" : ""}`
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium">Loading movie details...</h2>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium">Movie not found</h2>
          <p className="text-muted-foreground mt-2">The movie you're looking for doesn't exist.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold">Movie Insights</h1>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/favorites" className="text-sm font-medium">
              Favorites
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Logout</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="aspect-video w-full bg-muted relative rounded-lg overflow-hidden">
              <img
                src={getMoviePosterUrl(movie) || "/placeholder.svg"}
                alt={movie.movie_title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">{movie.movie_title}</h1>
                {user && (
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "Favorited" : "Add to Favorites"}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {movie.genres.split("|").map((genre, index) => (
                  <Badge key={index} variant="outline">
                    {genre}
                  </Badge>
                ))}
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{movie.duration} min</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>{movie.title_year}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Globe className="mr-1 h-4 w-4" />
                  <span>{movie.country}</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{movie.imdb_score}</span>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Plot Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.plot_keywords.split("|").map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Director</h3>
                    <p className="text-muted-foreground">{movie.director_name || "Unknown"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Language</h3>
                    <p className="text-muted-foreground">{movie.language}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Budget</h3>
                    <p className="text-muted-foreground">
                      ${movie.budget ? Number.parseInt(movie.budget).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Content Rating</h3>
                    <p className="text-muted-foreground">{movie.content_rating || "Unknown"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Tabs defaultValue="cast">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cast">Cast</TabsTrigger>
                  <TabsTrigger value="stats">Movie Stats</TabsTrigger>
                </TabsList>
                <TabsContent value="cast" className="mt-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { name: movie.actor_1_name, likes: movie.actor_1_facebook_likes },
                      { name: movie.actor_2_name, likes: movie.actor_2_facebook_likes },
                      { name: movie.actor_3_name, likes: movie.actor_3_facebook_likes },
                    ]
                      .filter((actor) => actor.name)
                      .map((actor, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-medium">{actor.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {Number.parseInt(actor.likes).toLocaleString()} Facebook likes
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="stats" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium">IMDb Score</h3>
                          <p className="text-muted-foreground">{movie.imdb_score}/10</p>
                        </div>
                        <div>
                          <h3 className="font-medium">Number of Votes</h3>
                          <p className="text-muted-foreground">
                            {Number.parseInt(movie.num_voted_users).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium">Number of Reviews</h3>
                          <p className="text-muted-foreground">
                            Critics: {movie.num_critic_for_reviews || "0"}, Users: {movie.num_user_for_reviews || "0"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium">Gross Revenue</h3>
                          <p className="text-muted-foreground">
                            ${movie.gross ? Number.parseInt(movie.gross).toLocaleString() : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium">Facebook Likes</h3>
                          <p className="text-muted-foreground">
                            {Number.parseInt(movie.movie_facebook_likes).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium">Cast Total Facebook Likes</h3>
                          <p className="text-muted-foreground">
                            {Number.parseInt(movie.cast_total_facebook_likes).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Similar Movies</h2>
                <div className="space-y-4">
                  {similarMovies.length > 0 ? (
                    similarMovies.map((similarMovie) => (
                      <Link key={similarMovie.movie_id} href={`/movie/${similarMovie.movie_id}`}>
                        <div className="flex items-start gap-3 group">
                          <div className="h-16 w-28 bg-muted rounded flex items-center justify-center overflow-hidden">
                            <img
                              src={getMoviePosterUrl(similarMovie) || "/placeholder.svg"}
                              alt={similarMovie.movie_title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                              {similarMovie.movie_title}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>{similarMovie.title_year}</span>
                              <span className="mx-1">•</span>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
                                <span>{similarMovie.imdb_score}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No similar movies found.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Director</h2>
                {movie.director_name ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium">{movie.director_name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Facebook Likes:</span>{" "}
                      {Number.parseInt(movie.director_facebook_likes).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No director information available.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Movie Facts</h2>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Aspect Ratio:</span>{" "}
                    <span className="text-muted-foreground">{movie.aspect_ratio || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="font-medium">Color:</span>{" "}
                    <span className="text-muted-foreground">{movie.color || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="font-medium">Faces in Poster:</span>{" "}
                    <span className="text-muted-foreground">{movie.facenumber_in_poster || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="font-medium">IMDb Link:</span>{" "}
                    <a
                      href={movie.movie_imdb_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View on IMDb
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2023 Movie Insights. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

