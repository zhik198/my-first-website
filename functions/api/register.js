export async function onRequestPost(context) {
  const DB = context.env.DB;
  try {
    const body = await context.request.json();
    const { name, password, inviteCode } = body;

    // 插入数据库
    await DB.prepare('INSERT INTO users (name, password) VALUES (?, ?)')
      .bind(name, password)
      .run();

    return new Response(JSON.stringify({ success: true, message: '注册成功' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "注册失败，用户名可能已存在" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
