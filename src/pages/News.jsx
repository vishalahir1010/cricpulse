import { useState, useEffect, useCallback } from 'react';
import { getNewsPage } from '../services/firebase/firestoreService';
import NewsCard from '../components/news/NewsCard';
import Button from '../components/common/Button';
import { NewsSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { NEWS_CATEGORIES } from '../utils/constants';
import './News.css';

const PAGE_SIZE = 9;

export default function News() {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items, nextCursor, hasMore: more } = await getNewsPage({ category, pageSize: PAGE_SIZE });
      setArticles(items);
      setCursor(nextCursor);
      setHasMore(more);
    } catch (err) {
      setError(err.message || 'Could not load news');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const { items, nextCursor, hasMore: more } = await getNewsPage({ category, pageSize: PAGE_SIZE, cursor });
      setArticles((prev) => [...prev, ...items]);
      setCursor(nextCursor);
      setHasMore(more);
    } catch {
      setError('Could not load more articles');
    } finally {
      setLoadingMore(false);
    }
  };

  const featured = articles.find((a) => a.featured) || articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <div className="container news-page">
      <div className="page-header">
        <h1 className="page-title">Latest Cricket News</h1>
        <p className="page-subtitle">Stay informed with match reports, editorial insights, and breaking cricket stories.</p>
      </div>

      <div className="news-page__filters">
        <button
          className={`filter-chip${!category ? ' filter-chip--active' : ''}`}
          onClick={() => setCategory(null)}
        >
          All News
        </button>
        {NEWS_CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-chip${category === c ? ' filter-chip--active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="news-grid">
          {Array.from({ length: 6 }).map((_, i) => <NewsSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && <ErrorMessage message={error} onRetry={loadFirstPage} />}

      {!loading && !error && !articles.length && (
        <EmptyState title="No news yet" message="Articles published by our editorial team will show up here." />
      )}

      {!loading && !error && articles.length > 0 && (
        <>
          <div className="news-layout">
            {featured && (
              <div className="news-layout__featured">
                <NewsCard article={featured} featured={true} />
              </div>
            )}
            <div className="news-layout__side-grid">
              {rest.slice(0, 4).map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          </div>

          {rest.length > 4 && (
            <div className="news-grid" style={{ marginTop: 24 }}>
              {rest.slice(4).map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )}

          {hasMore && (
            <div className="news-page__load-more">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more news'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
