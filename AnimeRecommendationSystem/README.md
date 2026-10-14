# ⛩️ Anime Recommendation System - College Mini Project

A complete, responsive, full-stack web application that recommends anime to users based on **Content-Based Filtering** using **Jaccard Similarity** and **Rating-weighted scoring**.

Built with **Java 21**, **Spring Boot 3**, **Maven**, and a modern dark-themed **HTML/CSS/Vanilla JavaScript** frontend.

---

## 🌟 Key Features

1. **Modern Dark-Themed UI**: Sleek anime/cyber aesthetic with smooth transitions, card hover glows, and responsive layout.
2. **Rich Anime Catalog**: 30 diverse sample anime with realistic titles, Japanese titles, genres, ratings, release years, studios, and synopses.
3. **Instant Search**: Real-time filtering by English or Japanese anime titles and animation studios.
4. **Interactive Genre Filter**: Interactive filter chips (Action, Fantasy, Sci-Fi, Romance, Comedy, Mystery, Drama, etc.).
5. **Content-Based Recommendation Engine**:
   - One-click **"Find Similar"** on any anime card or quick-selector in the hero banner.
   - Highlights matching genres shared between the target anime and recommended titles.
   - Displays match percentage (e.g., `88% Match`), exact similarity score, and a clear explanation of why each anime was recommended.
6. **Watchlist Persistence**:
   - Save favorite anime to a personal Watchlist.
   - Persisted across browser sessions using **`localStorage`**.
   - Manage items in a dedicated modal (add, remove, clear all, or find similar directly from the watchlist).
7. **Detailed Anime Information Modal**: Full synopsis, studio, release year, episode count, and genres.
8. **Algorithm Explainer**: Built-in interactive explanation modal explaining the math behind Content-Based Filtering and the Jaccard index for college viva/demo.
9. **Zero Paid APIs / Subscriptions**: Works offline and out-of-the-box with an embedded JSON dataset and SVG image fallbacks.
10. **Clear Empty State**: User-friendly feedback when search or filters return no results, complete with a one-click reset button.

---

## 🏗️ Project Architecture & Folder Structure

```
AnimeRecommendationSystem/
├── pom.xml                                      # Maven project configuration & dependencies
├── mvnw.cmd                                     # Windows helper runner script
├── run.bat                                      # One-click start script for Windows
├── README.md                                    # Project documentation
│
└── src/
    ├── main/
    │   ├── java/com/anime/recommendation/
    │   │   ├── AnimeRecommendationApplication.java  # Spring Boot main entry point
    │   │   ├── model/
    │   │   │   ├── Anime.java                   # Anime data model (POJO)
    │   │   │   └── RecommendationResult.java    # Recommendation DTO (scores & matches)
    │   │   ├── repository/
    │   │   │   └── AnimeRepository.java         # Loads & queries JSON dataset
    │   │   ├── service/
    │   │   │   └── RecommendationService.java   # Content-based filtering algorithm
    │   │   └── controller/
    │   │       └── AnimeController.java         # REST API endpoints
    │   │
    │   └── resources/
    │       ├── application.properties           # Spring Boot configuration (port 8080)
    │       ├── data/
    │       │   └── anime.json                   # 30 curated anime records
    │       └── static/                          # Frontend files served by Spring Boot
    │           ├── index.html                   # Semantic HTML5 single-page application
    │           ├── css/
    │           │   └── style.css                # Dark-themed responsive CSS
    │           └── js/
    │               └── app.js                   # Client-side state, API calls & localStorage
    │
    └── test/java/com/anime/recommendation/
        └── RecommendationServiceTest.java       # Unit tests verifying algorithm & repository
```

---

## 🧠 Recommendation Algorithm Explained

This project implements **Content-Based Filtering**. Unlike Collaborative Filtering (which requires millions of user ratings), Content-Based Filtering recommends items based on the **intrinsic features** of items that a user likes.

### 1. Jaccard Similarity Coefficient
To calculate the degree of similarity between the selected anime ($A$) and a candidate anime ($B$), we compute the Jaccard similarity across their genre sets:

$$\text{Jaccard}(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

- **$|A \cap B|$ (Intersection)**: The count of shared genres that both anime belong to.
- **$|A \cup B|$ (Union)**: The total count of distinct genres across both anime.
- **Range**: Produces a value between `0.0` (zero overlap) and `1.0` (identical genres).

### 2. Rating Quality Weighting
To prioritize critically acclaimed titles among matching genre candidates, we calculate a composite score:

$$\text{FinalScore} = (0.85 \times \text{Jaccard}) + \left(0.15 \times \frac{\text{Rating}}{10.0}\right)$$

- **85% Weight**: Genre content match.
- **15% Weight**: Normalized rating quality factor ($0.0 \dots 1.0$).

### 3. Ranking & Presentation
- Anime must share at least 1 genre ($|A \cap B| > 0$).
- The selected anime itself is excluded.
- Results are sorted in descending order of `FinalScore`.
- A match percentage ($\text{FinalScore} \times 100\%$) and shared genre chips are returned to the user.

---

## 🚀 How to Run the Application Locally

### Prerequisites
- **Java 21** or later installed (Verify with: `java -version`).
- **Maven**: Bundled with the included `mvnw.cmd` runner, or available on system PATH, or via IntelliJ IDEA.

### Option 1: Double-Click (Easiest)
Simply double-click the included **`run.bat`** file in the project folder!

### Option 2: Using the Terminal (Command Prompt / PowerShell)
Navigate to the project root folder and run:
```powershell
.\mvnw.cmd spring-boot:run
```
*(If you have standard Maven installed on your PATH, you can also run `mvn spring-boot:run`)*

### Option 3: In IntelliJ IDEA / Eclipse / VS Code
1. Open the project folder in your IDE.
2. Let the IDE import the `pom.xml`.
3. Locate `src/main/java/com/anime/recommendation/AnimeRecommendationApplication.java`.
4. Right-click and choose **Run 'AnimeRecommendationApplication'**.

---

## 🌐 Accessing the Application

Once started, open your web browser and visit:
👉 **`http://localhost:8080`**

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/anime` | Get all anime (supports `?search=term` and `?genre=GenreName`) |
| `GET` | `/api/anime/{id}` | Get single anime details by ID |
| `GET` | `/api/anime/genres` | Get list of all distinct genres |
| `GET` | `/api/anime/{id}/recommendations?limit=6` | Get Content-Based recommendations for anime ID |
| `GET` | `/api/anime/recommend-by-genres?genres=Action,Fantasy` | Recommend anime matching selected genres |
| `GET` | `/api/anime/stats` | Get dataset metrics (total count, top rated) |

---

## 🎓 College Viva & Demo Questions

1. **Q: What type of recommendation system is this?**
   - **A:** Content-Based Filtering. It recommends anime based on item attributes (genres and ratings) rather than user-to-user rating matrices.
2. **Q: Why use Jaccard Similarity instead of Euclidean Distance?**
   - **A:** Genres are categorical sets (binary presence/absence of tags). Jaccard is mathematically designed to measure overlap between sets of categorical descriptors.
3. **Q: What is the "Cold Start" problem, and how does this system handle it?**
   - **A:** The Cold Start problem occurs when new users have no rating history. Content-based filtering solves this because it does not require user history—as long as a user selects one anime or genre they like, recommendations are instantly generated.
4. **Q: How is data persisted without a database?**
   - **A:** The catalog is loaded from a clean local JSON resource file (`anime.json`) using Jackson on Spring Boot startup, while user Watchlist data is saved on the client side using the browser's `localStorage` API.
