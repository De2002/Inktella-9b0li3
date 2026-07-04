# SEO & Metadata Quick Reference

## What Was Implemented

Inktella now has complete SEO and social sharing metadata setup that ensures:

✅ Poems display rich preview cards when shared on X/Twitter
✅ Images from poems appear in social sharing previews
✅ All pages have proper title and description tags
✅ Open Graph tags for Facebook/LinkedIn sharing
✅ Twitter Card tags for X sharing
✅ Canonical links to prevent duplicate content issues
✅ Article schema for poems in search results
✅ Full coverage for all major pages including legal/policy pages

## Key Features

### 1. Poem Images in Social Sharing

When a poem with an image is shared on X:
- The poem's featured image appears in the preview
- Title shows as the poem title
- Description is first 155 characters of poem text
- Author information is included

### 2. Fallback Image

Pages without images use a beautiful default poetry image from Unsplash, ensuring all social shares look professional.

### 3. Dynamic Metadata

All metadata updates happen automatically when:
- A poem page loads with poem data
- A profile page loads with user data
- A topic page loads with category data
- Navigation occurs between pages

## Social Sharing Preview Examples

### Poem Share on X
```
"My Beautiful Poem" by @poet_username
The poem begins with these evocative lines...

[Beautiful poem image or default shown]
```

### Profile Share on X
```
@poet_username
Bio or introduction text goes here...

[User avatar or default image]
```

### Topic Page Share
```
Love Poetry - Inktella
Explore love poetry on our community platform...

[Default poetry image]
```

## Testing Your Metadata

### Quick Test on X
1. Copy a poem URL from your browser
2. Go to https://x.com/compose/post
3. Paste the URL in a post
4. X will preview your card with image, title, and description

### Professional Testing Tools
- **X:** https://x.com/share (Card Validator)
- **Facebook/LinkedIn:** https://developers.facebook.com/tools/debug/
- **Google:** https://search.google.com/test/rich-results

## Pages with Metadata

| Page | Title Pattern | Image Source |
|------|---------------|--------------|
| Home | "Inktella" | Default |
| Poem | Poem Title | Poem Image or Default |
| Profile | @username | Avatar or Default |
| Topic | Topic Name | Default |
| Feed | "Feed" | Default |
| Explore | "Explore" | Default |
| Dashboard | "Dashboard" | Default |
| Terms | "Terms of Use" | Default |
| Privacy | "Privacy Policy" | Default |
| Contact | "Contact Us" | Default |

## How to Add Metadata to New Pages

```tsx
import { useEffect } from 'react';
import { setMetadata } from '@/lib/metadata';

export function NewPage() {
  useEffect(() => {
    setMetadata({
      title: 'Your Page Title',
      description: 'A clear, compelling description under 160 characters',
      image: 'optional-image-url', // Falls back to default if omitted
      url: 'https://inktella.onspace.app/your-page',
    });
  }, []);

  return <div>Page content</div>;
}
```

## How to Update Metadata for Dynamic Content

For pages with data that loads asynchronously:

```tsx
useEffect(() => {
  if (data) {
    setMetadata({
      title: data.title,
      description: data.description,
      image: data.image_url,
      url: `https://inktella.onspace.app/page/${data.id}`,
    });
  }
  
  // Clean up on unmount
  return () => resetMetadata();
}, [data]);
```

## SEO Benefits This Provides

1. **Higher Click-Through Rates** - Rich previews get more clicks on social media
2. **Better Search Visibility** - Proper markup helps search engines understand content
3. **Professional Appearance** - Branded previews with images build trust
4. **Mobile Optimization** - Cards display beautifully on all devices
5. **Article Recognition** - Poem pages identified as articles in search results
6. **Social Algorithm Boost** - Better engagement from richer preview cards

## Default Image

All pages fall back to this beautiful poetry image:
`https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&fit=crop`

This ensures every shared page looks professional, even if no custom image is available.

## Important Notes

- Metadata updates happen **in real-time** as page data loads
- Changes are **transparent to users** - only visible in social sharing previews
- Cleanup happens **automatically** when navigating between pages
- The system is **search-engine friendly** with proper schema markup
- All changes are **backwards compatible** with existing code

## Files Modified

- ✅ `src/lib/metadata.ts` (NEW)
- ✅ `src/pages/LandingPage.tsx`
- ✅ `src/pages/PoemPage.tsx`
- ✅ `src/pages/ProfilePage.tsx`
- ✅ `src/pages/TopicPage.tsx`
- ✅ `src/pages/FeedPage.tsx`
- ✅ `src/pages/ExplorePage.tsx`
- ✅ `src/pages/DashboardPage.tsx`
- ✅ `src/pages/TermsOfUsePage.tsx`
- ✅ `src/pages/PrivacyPolicyPage.tsx`
- ✅ `src/pages/ContactPage.tsx`

## Troubleshooting

### Image not showing in preview?
- Check if poem has `image_url` field populated
- Verify image URL is publicly accessible
- Use the social media debugger to refresh the cache

### Title or description looks wrong?
- Verify metadata is being set before page render
- Check that useEffect cleanup is returning resetMetadata
- Clear browser cache and re-test

### Schema not showing in Google Search?
- Wait 24-48 hours for Google to re-crawl
- Use Google's Rich Results Test tool
- Check Search Console for indexing issues

## Next Steps

Monitor your social sharing analytics to see the impact of these metadata improvements on engagement and click-through rates!
