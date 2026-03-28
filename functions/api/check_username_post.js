export async function onRequestPost(context) {
  // 1. 获取数据库连接
  const DB = context.env.DB;

  try {
    const url = new URL(context.request.url);
    const path = url.pathname;
    const body = await context.request.json();

    // --- 逻辑分支 A：检查用户名是否存在 ---
    if (path === '/api/check_username') {
      const { name } = body;

      if (!name) {
        return new Response(JSON.stringify({ error: '用户名不能为空' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 注意：表名改为了 users
      const result = await DB.prepare('SELECT COUNT(*) as count FROM users WHERE name = ?')
        .bind(name)
        .first();

      const count = result?.count || 0;

      return new Response(JSON.stringify({ exists: count > 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 逻辑分支 B：用户注册 ---
    if (path === '/api/register') {
      const { name, password, invite_code } = body;

      if (!name || !password || !invite_code) {
        return new Response(JSON.stringify({ error: '缺少必要参数' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 1. 检查用户名是否已被占用
      const checkUser = await DB.prepare('SELECT id FROM users WHERE name = ?')
        .bind(name)
        .first();

      if (checkUser) {
        return new Response(JSON.stringify({ error: '用户名已被注册' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 2. 验证邀请码（这里假设邀请码是 "123456"，请根据实际情况修改）
      if (invite_code !== '123456') {
        return new Response(JSON.stringify({ error: '邀请码无效' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 3. 插入新用户
      // 注意：表名和字段名必须与 SQL 语句匹配
      await DB.prepare('INSERT INTO users (name, password, invite_code) VALUES (?, ?, ?)')
        .bind(name, password, invite_code)
        .run();

      return new Response(JSON.stringify({ message: '注册成功' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 如果路径不匹配，返回 404
    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  } catch (err) {
    // 关键修复：确保无论发生什么错误，都返回 JSON 格式，防止前端报 "Unexpected token '<'"
    console.error('Server Error:', err);
    return new Response(JSON.stringify({ error: '服务器内部错误', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
