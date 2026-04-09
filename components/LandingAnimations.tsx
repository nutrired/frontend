'use client';

import { useEffect } from 'react';

export default function LandingAnimations() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const siblings = Array.from(
              entry.target.parentElement?.children ?? []
            ).filter((c) => c.classList.contains('reveal'));
            const i = siblings.indexOf(entry.target as Element);
            setTimeout(() => entry.target.classList.add('in'), i * 110);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

    const nav = document.querySelector('.lp-nav');
    const handleScroll = () => {
      if (nav) {
        (nav as HTMLElement).style.boxShadow =
          window.scrollY > 20 ? '0 2px 24px rgba(28,28,25,0.08)' : 'none';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}
