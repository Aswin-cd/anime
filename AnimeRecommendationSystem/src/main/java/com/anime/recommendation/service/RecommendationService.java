package com.anime.recommendation.service;

import com.anime.recommendation.model.Anime;
import com.anime.recommendation.model.RecommendationResult;
import com.anime.recommendation.repository.AnimeRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementing Content-Based Filtering for anime recommendations.
 *
 * HOW THE ALGORITHM WORKS:
 * 1. Content-Based Filtering compares the item attributes (specifically Genres and Ratings)
 *    of the selected favorite anime against all other anime in the catalog.
 *
 * 2. Jaccard Similarity Coefficient:
 *    Formula: Jaccard(A, B) = |A ∩ B| / |A ∪ B|
 *    - |A ∩ B| = Number of shared/common genres between Anime A and Anime B (Intersection).
 *    - |A ∪ B| = Total number of unique combined genres between Anime A and Anime B (Union).
 *    This produces a normalized similarity score between 0.0 (no shared genres) and 1.0 (identical genres).
 *
 * 3. Weighted Final Score:
 *    To produce high quality recommendations, we blend Genre Similarity (85% weight)
 *    with a normalized rating score (15% weight):
 *    FinalScore = (0.85 * JaccardSimilarity) + (0.15 * (Rating / 10.0))
 *
 * 4. Filtering and Ranking:
 *    - Candidates must have at least one shared genre (|A ∩ B| > 0).
 *    - The selected anime itself is excluded from recommendations.
 *    - Results are sorted in descending order of FinalScore.
 */
@Service
public class RecommendationService {

    private final AnimeRepository animeRepository;

    // Weights for composite similarity scoring
    private static final double GENRE_WEIGHT = 0.85;
    private static final double RATING_WEIGHT = 0.15;

    public RecommendationService(AnimeRepository animeRepository) {
        this.animeRepository = animeRepository;
    }

    /**
     * Recommends similar anime based on a selected target anime ID.
     *
     * @param targetId The ID of the favorite/selected anime.
     * @param limit    Maximum number of recommended items to return (default 6).
     * @return List of RecommendationResult objects sorted from highest to lowest score.
     */
    public List<RecommendationResult> getRecommendationsForAnime(Long targetId, int limit) {
        Optional<Anime> targetOpt = animeRepository.findById(targetId);
        if (targetOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Anime target = targetOpt.get();
        Set<String> targetGenres = normalizeGenres(target.getGenres());

        List<Anime> allAnime = animeRepository.findAll();
        List<RecommendationResult> results = new ArrayList<>();

        for (Anime candidate : allAnime) {
            // Exclude the anime itself
            if (candidate.getId().equals(target.getId())) {
                continue;
            }

            Set<String> candidateGenres = normalizeGenres(candidate.getGenres());

            // 1. Calculate intersection: genres both anime share
            Set<String> intersection = new HashSet<>(targetGenres);
            intersection.retainAll(candidateGenres);

            // Skip candidates that have zero genres in common
            if (intersection.isEmpty()) {
                continue;
            }

            // 2. Calculate union: total unique genres
            Set<String> union = new HashSet<>(targetGenres);
            union.addAll(candidateGenres);

            // 3. Jaccard similarity = |Intersection| / |Union|
            double jaccard = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();

            // 4. Rating factor normalized to [0, 1]
            double ratingFactor = (candidate.getRating() != null ? candidate.getRating() : 5.0) / 10.0;

            // 5. Composite score
            double compositeScore = (GENRE_WEIGHT * jaccard) + (RATING_WEIGHT * ratingFactor);

            // Match percentage for friendly user display (e.g., 88%)
            int matchPercentage = (int) Math.round(compositeScore * 100);

            // Prepare list of shared genres in original casing if possible
            List<String> matchingGenres = new ArrayList<>(intersection);
            Collections.sort(matchingGenres);

            String explanation = String.format("Shares %d genre%s (%s) with a %.1f/10 rating",
                    intersection.size(),
                    intersection.size() > 1 ? "s" : "",
                    String.join(", ", matchingGenres),
                    candidate.getRating() != null ? candidate.getRating() : 0.0);

            results.add(new RecommendationResult(
                    candidate,
                    Math.round(compositeScore * 1000.0) / 1000.0,
                    matchPercentage,
                    matchingGenres,
                    explanation
            ));
        }

        // Sort descending: highest similarity score first, tie-break by anime rating
        results.sort((r1, r2) -> {
            int scoreCompare = Double.compare(r2.getSimilarityScore(), r1.getSimilarityScore());
            if (scoreCompare != 0) return scoreCompare;
            return Double.compare(
                    r2.getAnime().getRating() != null ? r2.getAnime().getRating() : 0.0,
                    r1.getAnime().getRating() != null ? r1.getAnime().getRating() : 0.0
            );
        });

        // Limit results
        return results.stream().limit(Math.max(1, limit)).collect(Collectors.toList());
    }

    /**
     * Recommends anime based on a user's chosen list of genres.
     * Useful when a user wants to find anime matching specific preferences (e.g., "Action", "Sci-Fi").
     *
     * @param selectedGenres List of genres chosen by the user.
     * @param limit          Maximum number of recommendations to return.
     * @return List of RecommendationResult objects.
     */
    public List<RecommendationResult> getRecommendationsByGenres(List<String> selectedGenres, int limit) {
        if (selectedGenres == null || selectedGenres.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> userGenres = normalizeGenres(selectedGenres);
        List<Anime> allAnime = animeRepository.findAll();
        List<RecommendationResult> results = new ArrayList<>();

        for (Anime candidate : allAnime) {
            Set<String> candidateGenres = normalizeGenres(candidate.getGenres());

            Set<String> intersection = new HashSet<>(userGenres);
            intersection.retainAll(candidateGenres);

            if (intersection.isEmpty()) {
                continue;
            }

            Set<String> union = new HashSet<>(userGenres);
            union.addAll(candidateGenres);

            double jaccard = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
            double ratingFactor = (candidate.getRating() != null ? candidate.getRating() : 5.0) / 10.0;
            double compositeScore = (GENRE_WEIGHT * jaccard) + (RATING_WEIGHT * ratingFactor);
            int matchPercentage = (int) Math.round(compositeScore * 100);

            List<String> matchingGenres = new ArrayList<>(intersection);
            Collections.sort(matchingGenres);

            String explanation = String.format("Matches %d of your selected genres (%s)",
                    intersection.size(),
                    String.join(", ", matchingGenres));

            results.add(new RecommendationResult(
                    candidate,
                    Math.round(compositeScore * 1000.0) / 1000.0,
                    matchPercentage,
                    matchingGenres,
                    explanation
            ));
        }

        results.sort((r1, r2) -> Double.compare(r2.getSimilarityScore(), r1.getSimilarityScore()));

        return results.stream().limit(Math.max(1, limit)).collect(Collectors.toList());
    }

    /**
     * Helper to lowercase and trim genre names for clean set operations.
     */
    private Set<String> normalizeGenres(List<String> raw) {
        if (raw == null) return Collections.emptySet();
        return raw.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    // Title-case normalization
                    if (s.length() <= 1) return s.toUpperCase();
                    return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
                })
                .collect(Collectors.toSet());
    }
}
