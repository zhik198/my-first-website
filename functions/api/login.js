export async function onRequestPost(context) {
  const DB = context.env.DB;

  try {
    const body = await context.request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, message: '请填写用户名和密码' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 在数据库中查找匹配的用户和密码
    const user = await DB.prepare('SELECT * FROM users WHERE name = ? AND password = ?')
      .bind(username, password)
      .first();

    if (user) {
      // 登录成功
      return new Response(JSON.stringify({ 
        success: true, 
        token: "mock-token-" + Date.now() // 这里生成一个简单的模拟 Token
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // 账号或密码错误
      return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: '服务器错误: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
