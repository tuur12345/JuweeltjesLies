import { supabaseAdmin } from '../../../../lib/supabaseClient';

export async function POST(req) {
  const body = await req.json();
  const { fileName, fileBase64 } = body;

  // Convert base64 string to buffer
  const buffer = Buffer.from(fileBase64, 'base64');

  const { data, error } = await supabaseAdmin
    .storage
    .from('JuwelenImages')
    .upload(fileName, buffer, { upsert: true });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

  const publicUrl = supabaseAdmin
    .storage
    .from('JuwelenImages')
    .getPublicUrl(fileName).data.publicUrl;

  return new Response(JSON.stringify({ publicUrl }), { status: 200 });
}
