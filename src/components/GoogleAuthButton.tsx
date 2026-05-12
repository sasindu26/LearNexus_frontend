"use client";

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function GoogleAuthButton({
  onSuccess,
  text = 'continue_with',
}: {
  onSuccess: (credential: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = () => {
      if (!window.google?.accounts?.id || !divRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: { credential: string }) => onSuccess(response.credential),
      });
      window.google.accounts.id.renderButton(divRef.current, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text,
        size: 'large',
        width: divRef.current.offsetWidth || 400,
      });
    };

    render();
    const t = setTimeout(render, 600);
    return () => clearTimeout(t);
  }, [onSuccess, text]);

  if (!CLIENT_ID) return null;

  return <div ref={divRef} className="w-full flex justify-center" />;
}
