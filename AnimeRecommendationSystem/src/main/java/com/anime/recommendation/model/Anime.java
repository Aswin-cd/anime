package com.anime.recommendation.model;

import java.util.List;
import java.util.Objects;

/**
 * Represents an Anime entity in the system.
 * Contains all metadata needed for display and content-based recommendation.
 */
public class Anime {
    private Long id;
    private String title;
    private String japaneseTitle;
    private List<String> genres;
    private Double rating;
    private Integer year;
    private Integer episodes;
    private String studio;
    private String synopsis;
    private String posterUrl;

    public Anime() {
    }

    public Anime(Long id, String title, String japaneseTitle, List<String> genres,
                 Double rating, Integer year, Integer episodes, String studio,
                 String synopsis, String posterUrl) {
        this.id = id;
        this.title = title;
        this.japaneseTitle = japaneseTitle;
        this.genres = genres;
        this.rating = rating;
        this.year = year;
        this.episodes = episodes;
        this.studio = studio;
        this.synopsis = synopsis;
        this.posterUrl = posterUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getJapaneseTitle() {
        return japaneseTitle;
    }

    public void setJapaneseTitle(String japaneseTitle) {
        this.japaneseTitle = japaneseTitle;
    }

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getEpisodes() {
        return episodes;
    }

    public void setEpisodes(Integer episodes) {
        this.episodes = episodes;
    }

    public String getStudio() {
        return studio;
    }

    public void setStudio(String studio) {
        this.studio = studio;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Anime anime = (Anime) o;
        return Objects.equals(id, anime.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Anime{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", genres=" + genres +
                ", rating=" + rating +
                '}';
    }
}
