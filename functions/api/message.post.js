// functions/api/message.post.js
const { Client } = require('@vercel/postgres');
const client = new Client();

export default async function handler(req, res) {
  await client.connect();

  try {
    // 1. 处理注册请求 (这里假设注册的 API 路径是 /api/register，但为了简化，我们通过 action 区分)
    // 为了配合前端，我们假设前端发送的 JSON 里有 action: 'register'
    if (req.method === 'POST' && req.body.action === 'register') {
      const { name, password, confirmPassword, inviteCode } = req.body;

      // 简单的验证
      if (password !== confirmPassword) {
        return res.status(400).json({ error: '两次密码输入不一致' });
      }

      // 邀请码验证 (硬编码)
      const VALID_INVITE_CODE = 'g6z6q6';
      if (inviteCode !== VALID_INVITE_CODE) {
        return res.status(400).json({ error: '邀请码错误' });
      }

      // 检查用户名是否已存在 (双重保险)
      const checkResult = await client.sql`SELECT COUNT(*) FROM messages WHERE name = ${name}`;
      const count = parseInt(checkResult.rows[0].count);
      if (count > 0) {
        return res.status(400).json({ error: '用户名已存在' });
      }

      // 执行注册 (插入数据)
      await client.sql`
        INSERT INTO messages (name, password, content) 
        VALUES (${name}, ${password}, '这是用户的初始内容，或者留空')
      `;

      return res.status(200).json({ message: '注册成功' });

    } else {
      // 2. 原有的发布留言逻辑 (保持不变)
      const { name, content } = req.body;

      if (!name || !content) {
        return res.status(400).json({ error: '名称和内容不能为空' });
      }

      await client.sql`
        INSERT INTO messages (name, content) 
        VALUES (${name}, ${content})
      `;

      return res.status(200).json({ message: '留言成功' });
    }

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: '服务器错误' });
  } finally {
    await client.end();
  }
}
