import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const DEFAULT_PRODUCTS = [
  { name: "MAPF1 Oversized Tee", price: 85, type: "Hardware", img: "MAPF1RPMensLHOversizedfitTeeWhiteSC4_f4ea1258-1fba-46fa-9bb8-782c4eb87ed0.webp" },
  { name: "BMW M-Power Bomber", price: 320, type: "Armor", img: "d9f55388b2984f7d910917942e4cde6f.webp" },
  { name: "Porsche Heritage Crew", price: 165, type: "Shell", img: "OIP (6).webp" },
  { name: "Porsche Crest Sweatshirt", price: 190, type: "Utility", img: "OIP (5).webp" },
  { name: "RS Geometry Tech Tee", price: 110, type: "Armor", img: "OIP (4).webp" },
  { name: "Mercedes Paddock Tee", price: 95, type: "Shell", img: "OIP (3).webp" },
  { name: "BMW Motorsport Jacket", price: 210, type: "Utility", img: "OIP (2).webp" },
  { name: "Stuttgart Base Layer", price: 75, type: "Base", img: "OIP (4).webp" },
  { name: "GT3 Carbon Helmet", price: 850, type: "Armor", img: "OIP (2).webp" },
  { name: "Midnight Nomex Gloves", price: 145, type: "Hardware", img: "OIP (3).webp" },
  { name: "Stuttgart Track Pants", price: 130, type: "Shell", img: "OIP (4).webp" },
  { name: "911 Silhouette Hoodie", price: 175, type: "Utility", img: "OIP (5).webp" },
  { name: "RS Titanium Watch", price: 1200, type: "Hardware", img: "OIP (6).webp" },
  { name: "Endurance Duffle Bag", price: 280, type: "Utility", img: "d9f55388b2984f7d910917942e4cde6f.webp" },
  { name: "Paddock Umbrella", price: 65, type: "Hardware", img: "OIP (2).webp" },
  { name: "Heritage Leather Jacket", price: 650, type: "Armor", img: "MAPF1RPMensLHOversizedfitTeeWhiteSC4_f4ea1258-1fba-46fa-9bb8-782c4eb87ed0.webp" }
];

export default async function handler(req, res) {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY variables.' });
  }

  try {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if (count > 0) {
      return res.status(200).json({ 
        message: `Database already seeded. Total products: ${count}.` 
      });
    }

    const { data, error: insertError } = await supabase
      .from('products')
      .insert(DEFAULT_PRODUCTS)
      .select();

    if (insertError) throw insertError;

    return res.status(201).json({ 
      success: true, 
      message: `Database successfully seeded with ${data.length} products.` 
    });
  } catch (err) {
    console.error('Seeding error:', err);
    return res.status(500).json({ error: err.message });
  }
}
