// functions/api/message.js
const { Client } = require('@vercel/postgres');
const client = new Client();

export default async function handler(req, res) {
  await client.connect();

  try {
    // 1. 如果是 GET 请求且带有 checkName 参数，则执行检查用户名逻辑
    if (req.method === 'GET' && req.query.checkName) {
      const { checkName } = req.query;

      const result = await client.sql`SELECT COUNT(*) FROM messages WHERE name = ${checkName}`;
      const count = parseInt(result.rows[0].count);

      if (count > 0) {
        return res.status(400).json({ exists: true, message: '用户名已存在，请更换' });
      } else {
        return res.status(200).json({ exists: false, message: '用户名可用' });
      }
    }

    // 2. 原有的获取留言列表逻辑
    const result = await client.sql`SELECT * FROM messages ORDER BY created_at DESC LIMIT 50`;
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ error: '数据库查询失败' });
  } finally {
    await client.end();
  }
}
