export async function onRequestPost(context) {
  // 1. 获取数据库连接
  // 注意：这里的 'DB' 必须和你在 Cloudflare 绑定的名称（截图中的 Name 列）完全一致
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

      // D1 标准查询语法
      const result = await DB.prepare('SELECT COUNT(*) as count FROM messages WHERE name = ?').bind(name).first();

      // result 可能是 null，需要安全访问
      const count = result?.count || 0;

      return new Response(JSON.stringify({ exists: count > 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 逻辑分支 B：处理注册请求 ---
    if (path === '/api/register') {
      const { name, password, confirmPassword, inviteCode } = body;

      // 验证逻辑（保持不变）
      if (password !== confirmPassword) {
        return new Response(JSON.stringify({ error: '两次密码输入不一致' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 请确保这是你实际想用的邀请码
      const VALID_INVITE_CODE = 'g6z6q6';
      if (inviteCode !== VALID_INVITE_CODE) {
        return new Response(JSON.stringify({ error: '邀请码错误，无法注册' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 检查用户名是否已存在
      const checkResult = await DB.prepare('SELECT COUNT(*) as count FROM messages WHERE name = ?').bind(name).first();
      const userCount = checkResult?.count || 0;

      if (userCount > 0) {
        return new Response(JSON.stringify({ error: '用户名已被占用' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 执行注册（插入数据）
      // 注意：这里假设你的表叫 messages，且有 name, password, content 字段
      await DB.prepare('INSERT INTO messages (name, password, content) VALUES (?, ?, ?)')
        .bind(name, password, '这是用户的初始内容')
        .run();

      return new Response(JSON.stringify({ message: '注册成功，欢迎加入' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 如果路径不匹配，返回 404
    return new Response('Not Found', { status: 404 });

  } catch (error) {
    console.error('后端错误:', error);
    // 即使发生错误，也返回 JSON，防止前端报 "Unexpected token '<'"
    return new Response(JSON.stringify({ error: '服务器繁忙，请稍后再试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
