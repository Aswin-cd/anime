package com.anime.recommendation.controller;

import com.anime.recommendation.model.Anime;
import com.anime.recommendation.model.RecommendationResult;
import com.anime.recommendation.repository.AnimeRepository;
import com.anime.recommendation.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST Controller exposing API endpoints for Anime data and Recommendations.
 */
@RestController
@RequestMapping("/api/anime")
@CrossOrigin(origins = "*") // Allows local cross-origin testing if needed
public class AnimeController {

    private final AnimeRepository animeRepository;
    private final RecommendationService recommendationService;

    public AnimeController(AnimeRepository animeRepository, RecommendationService recommendationService) {
        this.animeRepository = animeRepository;
        this.recommendationService = recommendationService;
    }

    /**
     * GET /api/anime
     * Returns all anime, with optional query parameters for search and genre filtering.
     * Examples:
     *   /api/anime
     *   /api/anime?search=titan
     *   /api/anime?genre=Action
     *   /api/anime?search=note&genre=Mystery
     */
    @GetMapping
    public ResponseEntity<List<Anime>> getAllAnime(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre) {
        List<Anime> results = animeRepository.searchAndFilter(search, genre);
        return ResponseEntity.ok(results);
    }

    /**
     * GET /api/anime/{id}
     * Returns a specific anime by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Anime> getAnimeById(@PathVariable Long id) {
        return animeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/anime/genres
     * Returns the sorted list of all unique genres present in the dataset.
     */
    @GetMapping("/genres")
    public ResponseEntity<List<String>> getGenres() {
        return ResponseEntity.ok(animeRepository.getAllGenres());
    }

    /**
     * GET /api/anime/{id}/recommendations?limit=6
     * Recommends similar anime using content-based filtering based on genres and ratings.
     */
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<RecommendationResult>> getRecommendations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "6") int limit) {
        // First verify that the anime exists
        if (animeRepository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<RecommendationResult> recommendations = recommendationService.getRecommendationsForAnime(id, limit);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * GET /api/anime/recommend-by-genres?genres=Action,Sci-Fi&limit=6
     * Recommends anime matching multiple selected genres.
     */
    @GetMapping("/recommend-by-genres")
    public ResponseEntity<List<RecommendationResult>> getRecommendationsByGenres(
            @RequestParam List<String> genres,
            @RequestParam(defaultValue = "6") int limit) {
        List<RecommendationResult> recommendations = recommendationService.getRecommendationsByGenres(genres, limit);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * GET /api/anime/stats
     * Returns project statistics (total anime, genre count, top rated anime).
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Anime> all = animeRepository.findAll();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAnime", all.size());
        stats.put("totalGenres", animeRepository.getAllGenres().size());
        
        Optional<Anime> topRated = all.stream()
                .max(Comparator.comparingDouble(a -> a.getRating() != null ? a.getRating() : 0.0));
        topRated.ifPresent(anime -> stats.put("topRatedAnime", anime.getTitle()));

        return ResponseEntity.ok(stats);
    }
}
