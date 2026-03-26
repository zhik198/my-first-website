// functions/api/message.post.js
export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    const { name, content } = await request.json();
    
    if (!name || !content) {
      return new Response("Missing fields", { status: 400 });
    }

    const stmt = env.DB.prepare("INSERT INTO messages (name, content, created_at) VALUES (?, ?, ?)");
    await stmt.bind(name, content, new Date().toISOString()).run();

    return new Response("Success", { status: 201 });
  } catch (e) {
    return new Response("Error: " + e.message, { status: 500 });
  }
}
