import { useState } from 'react';

/**
 * Avatar renderer that handles Google profile photos correctly.
 *
 * Google's lh3.googleusercontent.com blocks requests when the `Referer`
 * header points to a non-Google origin (localhost, custom domains, etc.),
 * which is why Google photos otherwise show as broken images.
 * `referrerPolicy="no-referrer"` strips the header so the image loads.
 *
 * `onError` falls back to ui-avatars.com if the photo URL is broken
 * or revoked. The fallback uses initials so it stays usable.
 */
export default function UserAvatar({
  user,
  name,
  src,
  size = 40,
  className = '',
  ring = true,
  alt,
}) {
  const userName = name ?? user?.name ?? 'U';
  const initialSrc = src ?? user?.avatar_url ?? null;

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4361ff&color=fff&bold=true&size=${size * 2}`;
  const [current, setCurrent] = useState(initialSrc || fallback);
  const [errored, setErrored] = useState(false);

  const handleError = () => {
    if (errored) return;
    setErrored(true);
    setCurrent(fallback);
  };

  return (
    <img
      src={current}
      alt={alt || userName}
      width={size}
      height={size}
      onError={handleError}
      referrerPolicy="no-referrer"
      className={`rounded-full object-cover ${ring ? 'ring-1 ring-dark-700' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
