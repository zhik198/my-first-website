export async function onRequestGet(context) {
  const DB = context.env.DB;
  const { searchParams } = new URL(context.request.url);
  const name = searchParams.get('name');

  if (!name) return new Response(JSON.stringify({ error: '名字呢？' }), { status: 400 });

  try {
    const result = await DB.prepare('SELECT COUNT(*) as count FROM users WHERE name = ?')
      .bind(name)
      .first();
    return new Response(JSON.stringify({ exists: (result?.count || 0) > 0 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
