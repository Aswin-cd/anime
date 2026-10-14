package com.anime.recommendation.repository;

import com.anime.recommendation.model.Anime;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Repository responsible for loading and querying Anime data.
 * Loads sample data from a bundled JSON file without requiring any database or paid API.
 */
@Repository
public class AnimeRepository {

    private static final Logger logger = LoggerFactory.getLogger(AnimeRepository.class);

    @Value("${app.anime.data-file:classpath:data/anime.json}")
    private Resource dataFile;

    private final ObjectMapper objectMapper;
    private final List<Anime> animeList = new ArrayList<>();

    public AnimeRepository(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Initializes the repository by parsing the anime.json resource on application startup.
     */
    @PostConstruct
    public void init() {
        try (InputStream inputStream = dataFile.getInputStream()) {
            List<Anime> loaded = objectMapper.readValue(inputStream, new TypeReference<List<Anime>>() {});
            animeList.clear();
            animeList.addAll(loaded);
            logger.info("Successfully loaded {} anime records from {}", animeList.size(), dataFile.getFilename());
        } catch (IOException e) {
            logger.error("Failed to load anime dataset from file: {}", e.getMessage(), e);
            throw new IllegalStateException("Could not load anime dataset", e);
        }
    }

    /**
     * Returns an unmodifiable list of all loaded anime.
     */
    public List<Anime> findAll() {
        return Collections.unmodifiableList(animeList);
    }

    /**
     * Finds an anime by its unique ID.
     */
    public Optional<Anime> findById(Long id) {
        if (id == null) return Optional.empty();
        return animeList.stream()
                .filter(a -> a.getId().equals(id))
                .findFirst();
    }

    /**
     * Searches anime by English or Japanese title (case-insensitive substring match).
     */
    public List<Anime> searchByTitle(String query) {
        if (query == null || query.trim().isEmpty()) {
            return findAll();
        }
        String lowerQuery = query.trim().toLowerCase();
        return animeList.stream()
                .filter(a -> (a.getTitle() != null && a.getTitle().toLowerCase().contains(lowerQuery)) ||
                             (a.getJapaneseTitle() != null && a.getJapaneseTitle().toLowerCase().contains(lowerQuery)))
                .collect(Collectors.toList());
    }

    /**
     * Filters anime that contain the specified genre (case-insensitive).
     */
    public List<Anime> findByGenre(String genre) {
        if (genre == null || genre.trim().isEmpty() || genre.equalsIgnoreCase("ALL")) {
            return findAll();
        }
        String targetGenre = genre.trim().toLowerCase();
        return animeList.stream()
                .filter(a -> a.getGenres() != null && a.getGenres().stream()
                        .anyMatch(g -> g.trim().equalsIgnoreCase(targetGenre)))
                .collect(Collectors.toList());
    }

    /**
     * Filters anime by both search query and genre.
     */
    public List<Anime> searchAndFilter(String query, String genre) {
        return animeList.stream()
                .filter(a -> {
                    boolean matchesQuery = true;
                    if (query != null && !query.trim().isEmpty()) {
                        String lower = query.trim().toLowerCase();
                        matchesQuery = (a.getTitle() != null && a.getTitle().toLowerCase().contains(lower)) ||
                                       (a.getJapaneseTitle() != null && a.getJapaneseTitle().toLowerCase().contains(lower));
                    }

                    boolean matchesGenre = true;
                    if (genre != null && !genre.trim().isEmpty() && !genre.equalsIgnoreCase("ALL")) {
                        String gLower = genre.trim().toLowerCase();
                        matchesGenre = a.getGenres() != null && a.getGenres().stream()
                                .anyMatch(g -> g.trim().equalsIgnoreCase(gLower));
                    }

                    return matchesQuery && matchesGenre;
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns a sorted list of all distinct genres present in the dataset.
     */
    public List<String> getAllGenres() {
        return animeList.stream()
                .filter(a -> a.getGenres() != null)
                .flatMap(a -> a.getGenres().stream())
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}
