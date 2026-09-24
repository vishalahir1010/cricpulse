import './CommentaryFeed.css';

export default function CommentaryFeed({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="commentary-feed">
      {items.map((item, i) => (
        <li key={i} className="commentary-feed__item">
          <span className="commentary-feed__over">{item.over ?? ''}</span>
          <p>{item.commentary}</p>
        </li>
      ))}
    </ul>
  );
}
