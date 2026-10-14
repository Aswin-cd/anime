package com.anime.recommendation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Anime Recommendation System Spring Boot Application.
 *
 * Runs an embedded Tomcat server on port 8080 and serves both the REST API
 * and the HTML/CSS/JS frontend located in src/main/resources/static/.
 */
@SpringBootApplication
public class AnimeRecommendationApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnimeRecommendationApplication.class, args);
        System.out.println("=========================================================");
        System.out.println(" Anime Recommendation System is running!");
        System.out.println(" Open your browser at: http://localhost:8080");
        System.out.println(" API documentation endpoint: http://localhost:8080/api/anime");
        System.out.println("=========================================================");
    }
}
