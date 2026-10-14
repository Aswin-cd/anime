package com.anime.recommendation.model;

import java.util.List;

/**
 * Data Transfer Object (DTO) encapsulating a recommendation result.
 * Includes similarity score, match percentage, and the common genres explaining the recommendation.
 */
public class RecommendationResult {
    private Anime anime;
    private double similarityScore;
    private int matchPercentage;
    private List<String> matchingGenres;
    private String explanation;

    public RecommendationResult() {
    }

    public RecommendationResult(Anime anime, double similarityScore, int matchPercentage,
                                List<String> matchingGenres, String explanation) {
        this.anime = anime;
        this.similarityScore = similarityScore;
        this.matchPercentage = matchPercentage;
        this.matchingGenres = matchingGenres;
        this.explanation = explanation;
    }

    public Anime getAnime() {
        return anime;
    }

    public void setAnime(Anime anime) {
        this.anime = anime;
    }

    public double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public int getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(int matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getMatchingGenres() {
        return matchingGenres;
    }

    public void setMatchingGenres(List<String> matchingGenres) {
        this.matchingGenres = matchingGenres;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
