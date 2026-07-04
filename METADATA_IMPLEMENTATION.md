# Metadata & SEO Implementation Guide

## Overview

Inktella now has comprehensive SEO and social sharing metadata implemented across all major pages. This ensures that when poems and pages are shared on social media platforms like X (formerly Twitter), LinkedIn, and other channels, they display rich preview cards with appropriate titles, descriptions, and images.

## Implementation Details

### 1. Metadata Utility (`src/lib/metadata.ts`)

A centralized utility module that manages all meta tag updates dynamically:

- **setMetadata()** - Generic metadata setter for any page
- **setPoemMetadata()** - Specialized for poem pages with poem image support
- **setProfileMetadata()** - For user profile pages
- **setTopicMetadata()** - For topic/category pages
- **resetMetadata()** - Restores default home page metadata

#### Key Features:
- Updates Open Graph (OG) tags for Facebook/LinkedIn sharing
- Updates Twitter Card meta tags for X sharing
- Updates canonical links for SEO
- Dynamically creates/updates article schema for rich results
- Handles missing images gracefully (fallback to default)

### 2. Pages with Metadata Integration

#### Landing Page (`/`)
- **Title:** "Inktella"
- **Description:** Platform overview and value proposition
- **Image:** Default Unsplash image

#### Poem Pages (`/poem/:id`)
- **Title:** Poem title
- **Description:** First 155 characters of poem content
- **Image:** Poem's featured image if available, otherwise default
- **Special:** Article schema with author information

#### Profile Pages (`/profile/:username`)
- **Title:** Username
- **Description:** User bio or fallback description
- **Image:** User avatar if available

#### Topic Pages (`/topic/:slug`)
- **Title:** Topic name
- **Description:** Topic with poem count context
- **Image:** Default image

#### Feed (`/feed`)
- **Title:** "Feed"
- **Description:** Personal feed description

#### Explore (`/explore`)
- **Title:** "Explore"
- **Description:** Topic exploration context

#### Dashboard (`/dashboard`)
- **Title:** "Dashboard"
- **Description:** Personal dashboard context

#### Terms of Use (`/terms`)
- **Title:** "Terms of Use"
- **Description:** Legal document context

#### Privacy Policy (`/privacy`)
- **Title:** "Privacy Policy"
- **Description:** Privacy information context

#### Contact (`/contact`)
- **Title:** "Contact Us"
- **Description:** Support contact information

### 3. Meta Tags Updated

Each page now includes:

```html
<!-- Basic Meta Tags -->
<title>Page Title | Inktella</title>
<meta name="description" content="Page description">

<!-- Open Graph (Facebook/LinkedIn) -->
<meta property="og:type" content="website|article">
<meta property="og:url" content="page-url">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Page description">
<meta property="og:image" content="image-url">
<meta property="og:site_name" content="Inktella">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Page description">
<meta name="twitter:image" content="image-url">

<!-- Canonical Link -->
<link rel="canonical" href="page-url">

<!-- Article Schema (for poems) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Poem Title",
  "description": "Poem content preview",
  "image": "poem-image-url",
  "author": { "@type": "Person", "name": "Poet Name" }
}
</script>
```

## How It Works

### For Poems with Images

When a poem has an `image_url`:
1. The image is extracted from poem data
2. It's used in `og:image` for social sharing
3. When the poem is shared on X, the image appears in the preview card
4. If no image exists, it defaults to the beautiful Unsplash poetry image

Example preview on X:
```
My Poem Title
This is the first 155 characters of the poem...

[Poem Image or Default Image shown here]
```

### For Pages without Images

Landing page, policy pages, feed pages, etc., use the default beautiful poetry image as fallback.

### Automatic URL Construction

- **Poem:** `https://inktella.onspace.app/poem/{id}`
- **Profile:** `https://inktella.onspace.app/profile/{username}`
- **Topic:** `https://inktella.onspace.app/topic/{slug}`
- All other pages use their full URLs

## Usage Examples

### In a Component

```tsx
import { setPoemMetadata } from '@/lib/metadata';
import { useEffect } from 'react';

function MyPoemPage() {
  const [poem, setPoem] = useState(null);

  useEffect(() => {
    if (poem) {
      setPoemMetadata({
        id: poem.id,
        title: poem.title,
        content: poem.content,
        image_url: poem.image_url,
        author: poem.author,
      });
    }
  }, [poem]);
}
```

### Reset on Unmount

All pages reset to default metadata when unmounting:

```tsx
useEffect(() => {
  setMetadata({...});
  
  return () => resetMetadata(); // Cleanup
}, []);
```

## Testing Social Sharing

### Test on X (Twitter)

1. Go to [twitter.com/share](https://x.com/share) or use the X Card Validator
2. Paste your poem URL or page URL
3. X will preview the title, description, and image
4. The image will display prominently in the "summary_large_image" format

### Test on Facebook/LinkedIn

1. Use [Meta's Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter your page URL
3. Check that OG tags render correctly
4. Preview how it appears when shared

### Test with Rich Results

1. Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your poem page URL
3. Verify article schema is recognized
4. Check structured data validation

## SEO Benefits

1. **Better CTR from Social Media** - Rich previews with images increase click-through rates
2. **Proper Article Markup** - Search engines understand article content better
3. **Canonical URLs** - Prevents duplicate content issues
4. **Open Graph Support** - Enables proper indexing for social searches
5. **Twitter Card Support** - Enhanced visibility on X/Twitter

## Future Enhancements

Possible improvements:

- Add author Twitter handle to Twitter Card
- Implement dynamic image generation for OG tags
- Add breadcrumb schema for navigation pages
- Implement AMP support for faster mobile viewing
- Add FAQ schema for help/support pages
- Implement JSON-LD for FAQ sections in policy pages

## File Changes Summary

- **New:** `src/lib/metadata.ts` - Core metadata utility
- **Modified:** All page components to include metadata setup
  - `src/pages/LandingPage.tsx`
  - `src/pages/PoemPage.tsx`
  - `src/pages/ProfilePage.tsx`
  - `src/pages/TopicPage.tsx`
  - `src/pages/FeedPage.tsx`
  - `src/pages/ExplorePage.tsx`
  - `src/pages/DashboardPage.tsx`
  - `src/pages/TermsOfUsePage.tsx`
  - `src/pages/PrivacyPolicyPage.tsx`
  - `src/pages/ContactPage.tsx`
