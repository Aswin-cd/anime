package com.anime.recommendation;

import com.anime.recommendation.model.Anime;
import com.anime.recommendation.model.RecommendationResult;
import com.anime.recommendation.repository.AnimeRepository;
import com.anime.recommendation.service.RecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class RecommendationServiceTest {

    @Autowired
    private AnimeRepository animeRepository;

    @Autowired
    private RecommendationService recommendationService;

    @Test
    @DisplayName("Dataset should load at least 25 anime records")
    void testDatasetLoading() {
        List<Anime> all = animeRepository.findAll();
        assertNotNull(all);
        assertTrue(all.size() >= 25, "Expected at least 25 anime, but found: " + all.size());
    }

    @Test
    @DisplayName("Search by title should return matching results")
    void testSearchByTitle() {
        List<Anime> results = animeRepository.searchByTitle("Titan");
        assertFalse(results.isEmpty(), "Should find Attack on Titan");
        assertEquals("Attack on Titan", results.get(0).getTitle());
    }

    @Test
    @DisplayName("Filter by genre should return matching anime")
    void testFilterByGenre() {
        List<Anime> actionAnime = animeRepository.findByGenre("Action");
        assertFalse(actionAnime.isEmpty());
        for (Anime a : actionAnime) {
            assertTrue(a.getGenres().contains("Action"));
        }
    }

    @Test
    @DisplayName("Recommendations should return similar anime sorted by similarity score")
    void testRecommendationsForAnime() {
        // Attack on Titan has genres: Action, Dark Fantasy, Mystery, Drama
        List<RecommendationResult> recs = recommendationService.getRecommendationsForAnime(1L, 5);
        assertNotNull(recs);
        assertFalse(recs.isEmpty());
        assertTrue(recs.size() <= 5);

        // Target anime itself should never be in the recommendation list
        for (RecommendationResult r : recs) {
            assertNotEquals(1L, r.getAnime().getId());
            assertFalse(r.getMatchingGenres().isEmpty(), "Must share at least one genre");
            assertTrue(r.getSimilarityScore() > 0.0);
            assertTrue(r.getMatchPercentage() > 0 && r.getMatchPercentage() <= 100);
        }

        // Verify descending order of similarity score
        for (int i = 0; i < recs.size() - 1; i++) {
            assertTrue(recs.get(i).getSimilarityScore() >= recs.get(i + 1).getSimilarityScore(),
                    "Results should be sorted descending by similarity score");
        }
    }

    @Test
    @DisplayName("Genres list should contain all unique genres")
    void testGetAllGenres() {
        List<String> genres = animeRepository.getAllGenres();
        assertNotNull(genres);
        assertTrue(genres.contains("Action"));
        assertTrue(genres.contains("Fantasy"));
        assertTrue(genres.contains("Sci-Fi"));
        assertTrue(genres.contains("Romance"));
    }
}
