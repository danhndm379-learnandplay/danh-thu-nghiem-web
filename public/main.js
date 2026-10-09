// Menu mobile
const menu = document.getElementById('menu');
const menuBtn = document.querySelector('.menu-btn');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') menu.classList.remove('open');
});

// Lọc dự án
const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project');
filters.forEach((btn) =>
  btn.addEventListener('click', () => {
    filters.forEach((b) => b.classList.toggle('active', b === btn));
    projects.forEach((p) => {
      p.hidden = btn.dataset.filter !== 'all' && p.dataset.cat !== btn.dataset.filter;
    });
  })
);

// Form liên hệ (chỉ có ở trang chủ)
const form = document.getElementById('contact-form');
const status = form && form.querySelector('.status');
if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(form));
  status.className = 'status';
  status.textContent = 'Đang gửi...';
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    status.className = 'status ok';
    status.textContent = 'Đã gửi! Mình sẽ phản hồi sớm nhé.';
    form.reset();
  } catch (err) {
    status.className = 'status err';
    status.textContent = err.message || 'Có lỗi xảy ra, vui lòng thử lại.';
  }
});
