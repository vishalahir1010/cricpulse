import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiEdit2, FiLink } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getNewsList, createNews, updateNews, deleteNews } from '../../services/firebase/firestoreService';
import { slugify } from '../../utils/formatters';
import { NEWS_CATEGORIES } from '../../utils/constants';
import Button from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import './AdminNews.css';

const emptyForm = () => ({
  title: '',
  description: '',
  category: NEWS_CATEGORIES[0],
  featured: false,
  imageUrl: '',
});

export default function AdminNews() {
  const { user } = useAuth();
  const { data: articles, loading, refetch } = useFetch(() => getNewsList({ limitCount: 50 }), []);
  // Default to displayName if the account has one — NEVER default to the
  // email, since that would publish it publicly on every article. If
  // there's no displayName, this starts blank and the admin must type a
  // byline (e.g. "CricPulse Staff") before publishing.
  const [form, setForm] = useState(() => emptyForm(user?.displayName || ''));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [existingImage, setExistingImage] = useState(null);

  const handleChange = (field) => (e) => {
    const value = field === 'featured' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setExistingImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const slug = slugify(form.title);
      let payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        featured: form.featured,
        image: form.imageUrl.trim(),
        slug,
      };

      if (editingId) {
        await updateNews(editingId, payload);
        toast.success('Article updated');
      } else {
        const newId = await createNews(payload);
        toast.success('Article published');
      }
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not save article');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    setExistingImage(article.image || null);
    setForm({
      title: article.title,
      description: article.description,
      category: article.category || NEWS_CATEGORIES[0],
      featured: !!article.featured,
      imageUrl: article.image || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteNews(id);
      toast.success('Article deleted');
      refetch();
    } catch {
      toast.error('Could not delete article');
    }
  };

  return (
    <div className="admin-news">
      <form className="glass-card admin-news__form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Article' : 'New Article'}</h2>
        <input placeholder="Title" value={form.title} onChange={handleChange('title')} required />
        <textarea placeholder="Description" rows={4} value={form.description} onChange={handleChange('description')} required />
        <div className="admin-news__form-row">
          <select value={form.category} onChange={handleChange('category')}>
            {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="admin-news__checkbox">
            <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} />
            Featured
          </label>
        </div>

        {existingImage && !form.imageUrl && (
          <div className="admin-news__image-preview">
            <img src={existingImage} alt="Current cover" />
            <span>Current cover image</span>
          </div>
        )}
        {form.imageUrl && (
          <div className="admin-news__image-preview">
            <img src={form.imageUrl} alt="Cover preview" />
            <span>Cover preview</span>
          </div>
        )}

        <label className="admin-news__image-url">
          <span><FiLink size={15} /> Image URL</span>
          <input type="url" placeholder="https://example.com/news-image.jpg" value={form.imageUrl} onChange={handleChange('imageUrl')} />
        </label>
        <div className="admin-news__form-actions">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Publish'}</Button>
          {editingId && <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>}
        </div>
      </form>

      <div className="admin-news__list">
        {loading && <TableSkeleton rows={4} />}
        {!loading && articles?.map((a) => (
          <div key={a.id} className="glass-card admin-news__item">
            {a.image ? (
              <img src={a.image} alt="" className="admin-news__item-thumb" />
            ) : (
              <div className="admin-news__item-thumb admin-news__item-thumb--empty">No image</div>
            )}
            <div className="admin-news__item-body">
              <strong>{a.title}</strong>
              <span>{a.category} {a.featured ? '· Featured' : ''}</span>
            </div>
            <div className="admin-news__item-actions">
              <button onClick={() => handleEdit(a)} aria-label="Edit"><FiEdit2 size={15} /></button>
              <button onClick={() => handleDelete(a.id)} aria-label="Delete"><FiTrash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
