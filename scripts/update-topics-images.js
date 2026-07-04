import { createClient } from '@supabase/supabase-js';

// Image mappings for each topic - using Unsplash URLs
const topicImages = {
  'Horizon': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Meditation': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
  'Adventure': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Writing Process': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
  'Silence': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Storms': 'https://images.unsplash.com/photo-1437622368519-c21444e8b48f?w=800&h=600&fit=crop',
  'Translation': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Lyric': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
  'Mountains': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Laughter': 'https://images.unsplash.com/photo-1489599849228-ed4dc9ee8d51?w=800&h=600&fit=crop',
  'Dreams': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop',
  'Creativity': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
  'Mythology': 'https://images.unsplash.com/photo-1577720643272-265f434b3a0f?w=800&h=600&fit=crop',
  'Pride': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
  'Technology': 'https://images.unsplash.com/photo-1535721471115-76457c985d86?w=800&h=600&fit=crop',
  'Body Image': 'https://images.unsplash.com/photo-1506818144585-74b29c8347f5?w=800&h=600&fit=crop',
  'Prose Poetry': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Elements': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
  'Family': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
  'Resilience': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Media': 'https://images.unsplash.com/photo-1533613220915-609f7f17a5f9?w=800&h=600&fit=crop',
  'Faith': 'https://images.unsplash.com/photo-1497206365907-3ff1691d0b0b?w=800&h=600&fit=crop',
  'Depression': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Books': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Fantasy': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Sonnets': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Disillusionment': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Surrender': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Fatherhood': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
  'Spirituality': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Addiction': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Freedom': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
  'Deserts': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
  'Defeat': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Consumption': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
  'Joy': 'https://images.unsplash.com/photo-1489599849228-ed4dc9ee8d51?w=800&h=600&fit=crop',
  'Islands': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
  'Rain': 'https://images.unsplash.com/photo-1534274988757-a28bf1a4c817?w=800&h=600&fit=crop',
  'Geography': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Shame': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Madness': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Fashion': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'Doubt': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Envy': 'https://images.unsplash.com/photo-1502980917128-1aa500764cbd?w=800&h=600&fit=crop',
  'Ode': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Ghosts': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Science': 'https://images.unsplash.com/photo-1532625336684-6f6ee81c1e23?w=800&h=600&fit=crop',
  'Peace': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Ocean': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
  'Narrative': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Leaving': 'https://images.unsplash.com/photo-1513161455079-7ef1a827e0e0?w=800&h=600&fit=crop',
  'Survival': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Gardens': 'https://images.unsplash.com/photo-1470252649378-9c29740ff023?w=800&h=600&fit=crop',
  'Urban Decay': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
  'Homesickness': 'https://images.unsplash.com/photo-1476973422084-e8fa66ff9895?w=800&h=600&fit=crop',
  'Melancholy': 'https://images.unsplash.com/photo-1534274988757-a28bf1a4c817?w=800&h=600&fit=crop',
  'Temptation': 'https://images.unsplash.com/photo-1489599849228-ed4dc9ee8d51?w=800&h=600&fit=crop',
  'Courage': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Inspiration': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
  'Separation': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Acceptance': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Forgiveness': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Rural Life': 'https://images.unsplash.com/photo-1500382017468-7049fba0c23b?w=800&h=600&fit=crop',
  'Poverty': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Death': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Marriage': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
  'Sisterhood & Brotherhood': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
  'Experimental': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
  'Motherhood': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop',
  'Wonder': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop',
  'Anger': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'The Underworld': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'History': 'https://images.unsplash.com/photo-1457842636035-08a7eec3db99?w=800&h=600&fit=crop',
  'Revenge': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Voyage': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
  'Isolation': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Toxicity': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Free Verse': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Bruises': 'https://images.unsplash.com/photo-1476973422084-e8fa66ff9895?w=800&h=600&fit=crop',
  'Gratitude': 'https://images.unsplash.com/photo-1489599849228-ed4dc9ee8d51?w=800&h=600&fit=crop',
  'Infatuation': 'https://images.unsplash.com/photo-1502902917128-1aa500764cbd?w=800&h=600&fit=crop',
  'Honesty': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Planets': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop',
  'Betrayal': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Art': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
  'Relationship': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
  'Existentialism': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Climate': 'https://images.unsplash.com/photo-1437622368519-c21444e8b48f?w=800&h=600&fit=crop',
  'Ambition': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Resistance': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'War': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Broken Home': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Wisdom': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Patience': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Sins': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Birth': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop',
  'Urban Life': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
  'Music': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
  'Animals': 'https://images.unsplash.com/photo-1441716844725-09a2d6b0d655?w=800&h=600&fit=crop',
  'Found Poetry': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Mentorship': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
  'Unrequited': 'https://images.unsplash.com/photo-1475891917519-40ec17b72e14?w=800&h=600&fit=crop',
  'Comfort': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Guilt': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Seasons': 'https://images.unsplash.com/photo-1495622930257-1b2b5cb23252?w=800&h=600&fit=crop',
  'Haiku': 'https://images.unsplash.com/photo-1497206365907-3ff1691d0b0b?w=800&h=600&fit=crop',
  'Forests': 'https://images.unsplash.com/photo-1441523440334-a6e85734b122?w=800&h=600&fit=crop',
  'Secrets': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Grief': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Confessional': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Rivers': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Dystopia': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
  'Stars': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop',
  'Scars': 'https://images.unsplash.com/photo-1476973422084-e8fa66ff9895?w=800&h=600&fit=crop',
  'Smoke': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Absurdism': 'https://images.unsplash.com/photo-1495882284635-61cdc86677fe?w=800&h=600&fit=crop',
  'Time': 'https://images.unsplash.com/photo-1434494694125-20a7a9ad84de?w=800&h=600&fit=crop',
  'Cities': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
  'Regret': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Long Distance': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Introspection': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Loneliness': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Fame': 'https://images.unsplash.com/photo-1510394236527-acfb76baf630?w=800&h=600&fit=crop',
  'Nostalgia': 'https://images.unsplash.com/photo-1495622930257-1b2b5cb23252?w=800&h=600&fit=crop',
  'Reconciliation': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
  'Future': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
  'Indulgence': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
  'Anxiety': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Glamour': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'Gluttony': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
  'Heartbreak': 'https://images.unsplash.com/photo-1475891917519-40ec17b72e14?w=800&h=600&fit=crop',
  'Insomnia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Lust': 'https://images.unsplash.com/photo-1502902917128-1aa500764cbd?w=800&h=600&fit=crop',
  'Ageism': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Mothering': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop',
  'Parenting': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
  'Childhood': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
  'Aging': 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800&h=600&fit=crop',
  'Loss': 'https://images.unsplash.com/photo-1471879832106-c7ab9019e953?w=800&h=600&fit=crop',
  'Innocence': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop',
};

async function updateTopicsWithImages() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[v0] Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch all topics
    const { data: topics, error: fetchError } = await supabase
      .from('topics')
      .select('id, name, image_url')
      .is('image_url', null);

    if (fetchError) {
      console.error('[v0] Error fetching topics:', fetchError);
      process.exit(1);
    }

    if (!topics || topics.length === 0) {
      console.log('[v0] No topics without images found');
      process.exit(0);
    }

    console.log(`[v0] Found ${topics.length} topics without images. Starting updates...`);

    let updated = 0;
    let skipped = 0;

    // Update each topic with its image
    for (const topic of topics) {
      const imageUrl = topicImages[topic.name];

      if (!imageUrl) {
        console.log(`[v0] Skipping "${topic.name}" - no image mapping found`);
        skipped++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('topics')
        .update({ image_url: imageUrl })
        .eq('id', topic.id);

      if (updateError) {
        console.error(`[v0] Error updating "${topic.name}":`, updateError);
      } else {
        console.log(`[v0] ✓ Updated "${topic.name}"`);
        updated++;
      }
    }

    console.log(`\n[v0] Complete! Updated ${updated} topics, skipped ${skipped}`);
  } catch (error) {
    console.error('[v0] Fatal error:', error);
    process.exit(1);
  }
}

updateTopicsWithImages();
