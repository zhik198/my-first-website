// functions/api/message.js
export async function onRequest(context) {
  const { env } = context;
  
  try {
    const { results } = await env.DB.prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT 50").all();
    return Response.json(results);
  } catch (e) {
    return new Response("Error: " + e.message, { status: 500 });
  }
}
