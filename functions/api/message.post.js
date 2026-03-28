// functions/api/message.post.js
const { Client } = require('@vercel/postgres');
const client = new Client();

export default async function handler(req, res) {
  await client.connect();

  try {
    // 1. 处理注册请求 (新增逻辑)
    // 判断标准：请求体中是否包含 action: "register"
    if (req.method === 'POST' && req.body.action === 'register') {
      const { name, password, confirmPassword, inviteCode } = req.body;

      // --- 安全验证开始 ---
      // 验证1：两次密码是否一致
      if (password !== confirmPassword) {
        return res.status(400).json({ error: '两次密码输入不一致' });
      }

      // 验证2：邀请码验证 (硬编码在后端，前端看不到)
      const VALID_INVITE_CODE = 'g6z6q6'; // 👈 把你的邀请码写在这里
      if (inviteCode !== VALID_INVITE_CODE) {
        return res.status(400).json({ error: '邀请码错误，无法注册' });
      }

      // 验证3：检查用户名是否已存在 (防止重复注册)
      const checkResult = await client.sql`SELECT COUNT(*) FROM messages WHERE name = ${name}`;
      const count = parseInt(checkResult.rows[0].count);
      if (count > 0) {
        return res.status(400).json({ error: '用户名已被占用' });
      }
      // --- 安全验证结束 ---

      // 执行注册：将新用户信息插入数据库
      // 注意：这里假设你的表名叫 messages，且有 name, password 字段
      await client.sql`
        INSERT INTO messages (name, password, content) 
        VALUES (${name}, ${password}, '这是用户的初始内容')
      `;

      return res.status(200).json({ message: '注册成功，欢迎加入' });

    } else {
      // 2. 原有的发布留言逻辑 (保持不变)
      // 如果不是注册请求，就默认是发消息
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
    return res.status(500).json({ error: '服务器繁忙，请稍后再试' });
  } finally {
    await client.end();
  }
}
