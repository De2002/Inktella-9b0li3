-- Migration: Add images to topics/categories that are missing them
-- Instructions: Copy and paste this entire script into your Supabase SQL editor (Database > SQL Editor > New Query)
-- and execute it to update your topics table with relevant external image URLs.

-- Update topics with category-specific images from Unsplash
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=400&fit=crop' WHERE name = 'Love' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop' WHERE name = 'Heartbreak' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' WHERE name = 'Nature' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1514888286974-6c03bf1a9dfa?w=400&h=400&fit=crop' WHERE name = 'Reflection' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1495454714512-cd271d694d30?w=400&h=400&fit=crop' WHERE name = 'Dreams' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop' WHERE name = 'Loss' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1500634148957-331a6f60b0ae?w=400&h=400&fit=crop' WHERE name = 'Identity' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop' WHERE name = 'Passion' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1471879832106-c7ab9019e8de?w=400&h=400&fit=crop' WHERE name = 'Solitude' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=400&h=400&fit=crop' WHERE name = 'Hope' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=400&fit=crop' WHERE name = 'Nostalgia' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1461749056243-eb265c7d91f8?w=400&h=400&fit=crop' WHERE name = 'Struggle' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1476445893388-b8f08d85ecf2?w=400&h=400&fit=crop' WHERE name = 'Journey' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1514888992768-a9b0d74a9c25?w=400&h=400&fit=crop' WHERE name = 'Memories' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1498939212444-65a96c1e4d4d?w=400&h=400&fit=crop' WHERE name = 'Gratitude' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' WHERE name = 'Change' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' WHERE name = 'Growth' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1516738901601-e7e75f36ec99?w=400&h=400&fit=crop' WHERE name = 'Art' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' WHERE name = 'Inspiration' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop' WHERE name = 'Freedom' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1495534809412-4534184db500?w=400&h=400&fit=crop' WHERE name = 'Healing' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' WHERE name = 'Courage' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1500634148957-331a6f60b0ae?w=400&h=400&fit=crop' WHERE name = 'Self-Discovery' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1447958212624-8b36bae00513?w=400&h=400&fit=crop' WHERE name = 'Peace' AND image_url IS NULL;
UPDATE topics SET image_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' WHERE name = 'Wonder' AND image_url IS NULL;

-- Verify the updates by viewing topics with images
-- SELECT id, name, image_url FROM topics WHERE image_url IS NOT NULL ORDER BY name;

-- If you want to see topics that still don't have images:
-- SELECT id, name, image_url FROM topics WHERE image_url IS NULL ORDER BY name;
