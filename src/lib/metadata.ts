/**
 * Metadata management utility for SEO and social sharing
 * Updates document meta tags dynamically for different pages and poems
 */

interface MetadataOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const SITE_NAME = 'Inktella';
const BASE_URL = 'https://inktella.onspace.app';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&fit=crop';
const FAVICON = '/favicon.png';

/**
 * Update document meta tags for SEO and social sharing
 */
export function setMetadata(options: MetadataOptions) {
  const {
    title,
    description,
    image = DEFAULT_IMAGE,
    url = BASE_URL,
    type = 'website',
  } = options;

  // Construct full title
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  // Update basic meta tags
  updateMetaTag('title', fullTitle);
  document.title = fullTitle;
  updateMetaTag('description', description);
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', image);
  updateMetaTag('og:url', url);
  updateMetaTag('og:type', type);
  updateMetaTag('og:site_name', SITE_NAME);

  // Update Twitter Card
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', image);

  // Update canonical link
  updateCanonical(url);
}

/**
 * Set metadata specifically for poem pages with optional image
 */
export function setPoemMetadata(poem: {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author?: { username: string };
}) {
  const description = `${poem.content.substring(0, 155)}...`;
  const image = poem.image_url || DEFAULT_IMAGE;
  const url = `${BASE_URL}/poem/${poem.id}`;
  const title = poem.title;

  setMetadata({
    title,
    description,
    image,
    url,
    type: 'article',
  });

  // Add article-specific schema
  updateArticleSchema({
    headline: title,
    description,
    image,
    author: poem.author?.username || 'Anonymous',
  });
}

/**
 * Set metadata for profile pages
 */
export function setProfileMetadata(profile: {
  username: string;
  bio?: string;
  avatar_url?: string;
}) {
  const description = profile.bio || `${profile.username}'s profile on ${SITE_NAME}`;
  const image = profile.avatar_url || DEFAULT_IMAGE;
  const url = `${BASE_URL}/profile/${profile.username}`;

  setMetadata({
    title: profile.username,
    description,
    image,
    url,
  });
}

/**
 * Set metadata for topic/category pages
 */
export function setTopicMetadata(topic: {
  name: string;
  slug: string;
  description?: string;
}) {
  const description = topic.description || `Explore ${topic.name} poems on ${SITE_NAME}`;
  const url = `${BASE_URL}/topic/${topic.slug}`;

  setMetadata({
    title: topic.name,
    description,
    url,
  });
}

/**
 * Helper to update or create a meta tag
 */
function updateMetaTag(property: string, content: string) {
  const isProperty = property.startsWith('og:') || property.startsWith('twitter:');
  const selector = isProperty
    ? `meta[property="${property}"], meta[name="${property}"]`
    : `meta[name="${property}"]`;

  let tag = document.querySelector(selector) as HTMLMetaElement;

  if (!tag) {
    tag = document.createElement('meta');
    const attrName = isProperty && property.startsWith('og:') ? 'property' : 'name';
    tag.setAttribute(attrName, property);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

/**
 * Update canonical link
 */
function updateCanonical(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }

  canonical.href = url;
}

/**
 * Update article schema for rich results
 */
function updateArticleSchema(article: {
  headline: string;
  description: string;
  image: string;
  author: string;
}) {
  let script = document.querySelector('script[type="application/ld+json"][data-type="article"]') as HTMLScriptElement;

  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-type', 'article');
    document.head.appendChild(script);
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.headline,
    'description': article.description,
    'image': article.image,
    'author': {
      '@type': 'Person',
      'name': article.author,
    },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'logo': {
        '@type': 'ImageObject',
        'url': `${BASE_URL}${FAVICON}`,
      },
    },
  };

  script.textContent = JSON.stringify(schema);
}

/**
 * Reset metadata to default home page settings
 */
export function resetMetadata() {
  setMetadata({
    title: SITE_NAME,
    description: 'A feedback-driven poetry platform. Give meaningful critique, earn Ink, publish your poems, and grow your craft in a community that takes writing seriously.',
  });
}
