import clsx from 'clsx';
import './Button.css';

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <button className={clsx('btn', `btn--${variant}`, `btn--${size}`, className)} {...props}>
      {children}
    </button>
  );
}
