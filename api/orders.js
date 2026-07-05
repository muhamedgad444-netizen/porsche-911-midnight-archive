import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(500).json({ 
      error: 'Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' 
    });
  }

  try {
    if (req.method === 'GET') {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      return res.status(200).json(orders || []);
    }

    if (req.method === 'POST') {
      const { 
        first_name, 
        last_name, 
        address, 
        city, 
        postal_code, 
        shipping_method, 
        payment_method, 
        total_price,
        items 
      } = req.body;

      if (
        !first_name || 
        !last_name || 
        !address || 
        !city || 
        !postal_code || 
        !shipping_method || 
        !payment_method || 
        total_price === undefined || 
        !items || 
        !Array.isArray(items)
      ) {
        return res.status(400).json({ error: 'Missing required order details' });
      }

      // 1. Insert order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ 
          first_name, 
          last_name, 
          address, 
          city, 
          postal_code, 
          shipping_method, 
          payment_method, 
          total_price: parseFloat(total_price) 
        }])
        .select();

      if (orderError) throw orderError;
      const orderId = orderData[0].id;

      // 2. Map items with order_id and insert
      const itemsToInsert = items.map(item => ({
        order_id: orderId,
        name: item.name,
        price: parseFloat(item.price),
        size: item.selectedSize || 'N/A'
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return res.status(201).json({ success: true, orderId });
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error('Serverless error:', err);
    return res.status(500).json({ error: err.message });
  }
}
