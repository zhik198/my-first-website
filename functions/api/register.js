export async function onRequestPost(context) {
  // 1. 获取 D1 数据库绑定 (变量名必须在 Cloudflare 后台设置为 DB)
  const DB = context.env.DB;

  try {
    // 2. 解析前端发来的 JSON 数据
    const body = await context.request.json();
    const { name, password, inviteCode } = body;

    // 3. 基础后端校验
    if (!name || !password || !inviteCode) {
      return new Response(JSON.stringify({ error: '字段不能为空' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 4. 校验邀请码 (必须匹配你前端定义的 g6z6q6)
    if (inviteCode !== 'g6z6q6') {
      return new Response(JSON.stringify({ error: '邀请码无效' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. 检查用户名是否已存在 (防止 UNIQUE 约束冲突报错)
    const existingUser = await DB.prepare('SELECT id FROM users WHERE name = ?')
      .bind(name)
      .first();
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: '该用户名已被占用' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 6. 插入新用户到数据库
    // 假设你的表名是 users，字段有 name, password
    await DB.prepare('INSERT INTO users (name, password) VALUES (?, ?)')
      .bind(name, password)
      .run();

    // 7. 返回成功响应
    return new Response(JSON.stringify({ success: true, message: '注册成功' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    // 捕获意外错误并以 JSON 形式返回，防止前端解析出错
    return new Response(JSON.stringify({ error: '服务器内部错误', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
