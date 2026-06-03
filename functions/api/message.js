export async function onRequest(context) {
    const { request, env } = context;
    const DB = env.DB;
    const method = request.method;

    if (method === "GET") {
        const { results } = await DB.prepare(
            "SELECT * FROM messages ORDER BY created_at ASC"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (method === "POST") {
        const { name, content, image_url } = await request.json();

        await DB.prepare(
            "INSERT INTO messages (name, content, image_url) VALUES (?, ?, ?)"
        ).bind(name, content || "", image_url || null).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (method === "DELETE") {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return new Response("Missing ID", { status: 400 });
        }

        await DB.prepare("DELETE FROM messages WHERE id = ?")
            .bind(id)
            .run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response("Method not allowed", { status: 405 });
}
