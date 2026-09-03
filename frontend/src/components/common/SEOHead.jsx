import React, { useEffect } from 'react';

/**
 * SEOHead - Dynamically manages document title, meta descriptions,
 * canonical links, and OpenGraph tags for search engine ranking (Google, Bing).
 */
export default function SEOHead({
  title = 'Aethria — The Intelligence Layer Around Your Codebase',
  description = 'Connect your VS Code projects to a persistent cloud intelligence layer. Understand architecture, execute multi-file changes, review diffs, and talk to your software in real time.',
  canonicalUrl = 'https://www.aethria.in',
  keywords = 'Aethria, Satyam Rana, Codebase Intelligence, VS Code Sync, AI Code Review, Architecture Canvas, Multi-File AI Diff, Neural Voice AI, Groq LPU',
  ogImage = 'https://www.aethria.in/Logo.png'
}) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or update meta tag by name
    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Helper to set or update OpenGraph tag by property
    const setOgTag = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update Meta Tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);

    // Update OpenGraph
    setOgTag('og:title', title);
    setOgTag('og:description', description);
    setOgTag('og:url', canonicalUrl);
    setOgTag('og:image', ogImage);

    // Update Twitter Cards
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Update Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
  }, [title, description, canonicalUrl, keywords, ogImage]);

  return null;
}
