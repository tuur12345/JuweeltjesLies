import { supabaseAdmin } from '../../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, price, description, image } = body;

    if (!name || !price || !image) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ name, price, description, image }])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ product: data }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
