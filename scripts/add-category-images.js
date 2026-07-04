import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Themed images from Unsplash for each category
const categoryImages = {
  'Love': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=300&fit=crop',
  'Nature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
  'Dreams': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&h=300&fit=crop',
  'Heartbreak': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=300&fit=crop',
  'Adventure': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop',
  'Inspiration': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
  'Nostalgia': 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=300&fit=crop',
  'Family': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=300&fit=crop',
  'Friendship': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=300&fit=crop',
  'Travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop',
  'Art': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
  'Music': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop',
  'Career': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
  'Health': 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=500&h=300&fit=crop',
  'Growth': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
  'Success': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
};

async function addCategoryImages() {
  try {
    console.log('Fetching topics without images...');
    
    // Get all topics
    const { data: topics, error: fetchError } = await supabase
      .from('topics')
      .select('id, name, image_url')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching topics:', fetchError);
      process.exit(1);
    }

    console.log(`Found ${topics.length} total topics`);

    // Filter topics without images
    const topicsWithoutImages = topics.filter(t => !t.image_url);
    console.log(`Found ${topicsWithoutImages.length} topics without images`);

    if (topicsWithoutImages.length === 0) {
      console.log('All topics already have images!');
      process.exit(0);
    }

    // Update each topic with a themed image
    for (const topic of topicsWithoutImages) {
      const imageUrl = categoryImages[topic.name] || 'https://images.unsplash.com/photo-1515378960830-ce8fdc60154d?w=500&h=300&fit=crop';
      
      const { error: updateError } = await supabase
        .from('topics')
        .update({ image_url: imageUrl })
        .eq('id', topic.id);

      if (updateError) {
        console.error(`Error updating topic "${topic.name}":`, updateError);
      } else {
        console.log(`✓ Updated "${topic.name}" with image`);
      }
    }

    console.log('\n✓ Successfully added images to all categories!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

addCategoryImages();
