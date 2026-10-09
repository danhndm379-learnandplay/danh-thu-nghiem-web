const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PROFILE = path.join(__dirname, 'data', 'profile.json');
const MESSAGES = path.join(__dirname, 'messages.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Đọc lại mỗi request để sửa profile.json là thấy thay đổi ngay
const loadProfile = () => JSON.parse(fs.readFileSync(PROFILE, 'utf8'));

app.get('/', (req, res) => res.render('index', { p: loadProfile() }));

app.get('/projects/:slug', (req, res) => {
  const p = loadProfile();
  const i = p.projects.findIndex((x) => x.slug === req.params.slug);
  if (i === -1) return res.status(404).render('404', { p });
  const n = p.projects.length;
  res.render('project', {
    p,
    pr: p.projects[i],
    prev: p.projects[(i - 1 + n) % n],
    next: p.projects[(i + 1) % n],
  });
});

// Giới hạn đơn giản: 5 tin nhắn / 10 phút / IP
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  const ok = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  if (!ok(name, 100) || !ok(email, 150) || !ok(message, 3000) || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ và đúng thông tin.' });
  }
  if (rateLimited(req.ip)) {
    return res.status(429).json({ error: 'Bạn gửi quá nhiều, vui lòng thử lại sau.' });
  }
  let list = [];
  try { list = JSON.parse(fs.readFileSync(MESSAGES, 'utf8')); } catch {}
  list.push({ name: name.trim(), email: email.trim(), message: message.trim(), at: new Date().toISOString() });
  fs.writeFileSync(MESSAGES, JSON.stringify(list, null, 2));
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Portfolio chạy tại http://localhost:${PORT}`));
