import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request) {
  try {
    const body = await request.json();

    const { error } = await supabase.from('leads').insert([
      {
        name: body.name || '',
        company: body.company || '',
        launching: body.launching || '',
        budget: body.budget || '',
        timeline: body.timeline || '',
        link: body.link || '',
        submitted: body.submitted || new Date().toISOString(),
        status: 'new',
      },
    ]);

    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return Response.json({ status: 'ok' }, { status: 200, headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: 'Invalid request' }, { status: 400, headers: corsHeaders });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
