import React, { useEffect, useMemo, useState } from "react";
import "./News.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const PAGE_SIZE = 6;

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "into", "about",
  "your", "have", "will", "after", "before", "more", "than", "best",
  "game", "games", "gaming", "video", "news", "free", "deal", "deals",
  "edition", "announced", "update", "updates", "just", "new", "now",
  "then", "they", "them", "their", "here", "there", "what", "when",
  "where", "which", "while", "over", "under", "been", "being", "also",
  "only", "some", "much", "many", "such", "make", "made", "gets",
  "getting", "take", "takes", "using", "used", "like", "still",
  "very", "through", "because", "another", "around", "today", "tomorrow",
  "yesterday", "first", "last", "next", "coming", "maybe", "every",
  "physical", "digital", "launch", "release"
]);

function normalizeWord(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getArticleKey(article) {
  return article.url || `${article.title}-${article.published_at}`;
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString();
}

export default function News() {
  const [articles, setArticles] = useState([]);
  const [activeTag, setActiveTag] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/api/news/`);
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();

        if (!cancelled) {
          setArticles(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
        if (!cancelled) {
          setArticles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      cancelled = true;
    };
  }, []);

  const uniqueArticles = useMemo(() => {
    const seen = new Set();

    return articles.filter((article) => {
      const key = getArticleKey(article);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [articles]);

  const tags = useMemo(() => {
    const scores = new Map();

    uniqueArticles.forEach((article) => {
      const words = article.title
        .split(/\s+/)
        .map(normalizeWord)
        .filter((word) => {
          return (
            word.length >= 5 &&
            !STOP_WORDS.has(word) &&
            !/^\d+$/.test(word)
          );
        });
      const uniqueWords = new Set(words);

      uniqueWords.forEach((word) => {
        scores.set(word, (scores.get(word) || 0) + 1);
      });
    });

    return [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);
  }, [uniqueArticles]);

  const filteredArticles = useMemo(() => {
    if (activeTag === "All") {
      return uniqueArticles;
    }

    const loweredTag = activeTag.toLowerCase();

    return uniqueArticles.filter((article) =>
      article.title.toLowerCase().includes(loweredTag)
    );
  }, [uniqueArticles, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredArticles.slice(start, start + PAGE_SIZE);
  }, [filteredArticles, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTag]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleImageError = (articleKey) => {
    setImageErrors((prev) => ({
      ...prev,
      [articleKey]: true,
    }));
  };

  if (loading) {
    return (
      <section className="news-page">
        <div className="news-loading">
          <div className="news-spinner" />
          <p>Fetching latest headlines...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="news-page">
      <div className="news-shell">
        <header className="news-header">
          <h1 className="news-title">Gaming News</h1>
          <p className="news-subtitle">
            Fresh headlines, platform updates, launches and gaming stories in one place.
          </p>
        </header>

        <div className="news-tags-bar">
          <span className="news-tags-label">🔥 Trending:</span>

          <button
            type="button"
            className={`news-tag ${activeTag === "All" ? "is-active" : ""}`}
            onClick={() => setActiveTag("All")}
          >
            All
          </button>

          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`news-tag ${activeTag === tag ? "is-active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="news-empty">
            <h2>No articles found</h2>
            <p>Try another tag or check back later.</p>
          </div>
        ) : (
          <>
            <div className="news-grid">
              {paginatedArticles.map((article) => {
                const articleKey = getArticleKey(article);
                const imageFailed = Boolean(imageErrors[articleKey]);

                return (
                  <a
                    key={articleKey}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card"
                  >
                    <div className={`news-card-media ${imageFailed ? "is-fallback" : ""}`}>
                      {!imageFailed && article.image ? (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="news-card-image"
                          onError={() => handleImageError(articleKey)}
                        />
                      ) : (
                        <div className="news-card-fallback">
                          <span>Gaming News</span>
                        </div>
                      )}

                      <span className="news-card-source">{article.source}</span>
                    </div>

                    <div className="news-card-body">
                      <h3 className="news-card-title">{article.title}</h3>

                      <div className="news-card-footer">
                        <span className="news-card-date">
                          {formatDate(article.published_at)}
                        </span>
                        <span className="news-card-link">Read →</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="news-pagination">
                <button
                  type="button"
                  className="news-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => prev - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Prev
                </button>

                <span className="news-page-indicator">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  className="news-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => prev + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}