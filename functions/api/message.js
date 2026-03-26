// functions/api/message.js

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  // 处理 GET 请求：获取留言列表
  if (request.method === "GET") {
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM messages ORDER BY created_at DESC LIMIT 50"
      ).all();
      return Response.json(results);
    } catch (e) {
      return new Response("Error fetching messages: " + e.message, { status: 500 });
    }
  } 
  
  // 处理 POST 请求：提交新留言
  else if (request.method === "POST") {
    try {
      // 1. 解析前端传来的 JSON 数据
      const { name, content } = await request.json();

      // 简单验证
      if (!name || !content) {
        return new Response("Missing name or content", { status: 400 });
      }

      // 2. 准备插入数据库的 SQL 语句
      // 假设您的 D1 数据库表结构包含 id, name, content, created_at
      const stmt = env.DB.prepare(
        "INSERT INTO messages (name, content, created_at) VALUES (?, ?, ?)"
      );
      
      // 3. 执行插入操作
      // bind 绑定参数，run() 执行写入操作
      await stmt.bind(name, content, new Date().toISOString()).run();

      // 4. 返回成功响应
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });

    } catch (e) {
      return new Response("Error saving message: " + e.message, { status: 500 });
    }
  }

  // 处理其他不支持的请求方法
  return new Response("Method not allowed", { status: 405 });
}
