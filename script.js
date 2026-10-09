const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');

/* theme */
document.getElementById('theme').addEventListener('click', () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  const next = dark ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

document.getElementById('year').textContent = new Date().getFullYear();

/* mobile menu */
const menu = document.getElementById('menu');
const links = document.querySelector('.links');
menu.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
});
links.addEventListener('click', e => {
  if (e.target.closest('a')) { links.classList.remove('open'); menu.setAttribute('aria-expanded', false); }
});

/* reveal on scroll, staggered inside each group */
const groups = '.timeline > li, .projects > .card, .skills > div, .stats > div, .two > p, h2, .contact .lead, .contact .cta, .grid4 > div';
document.querySelectorAll(groups).forEach(el => {
  el.classList.add('reveal');
  const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal') || c === el);
  el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 5) * 0.08}s`);
});
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* count-up stats */
document.querySelectorAll('.stats dt[data-to]').forEach(dt => {
  const to = parseFloat(dt.dataset.to), dec = +(dt.dataset.dec || 0), suf = dt.dataset.suffix || '';
  if (reduced) return;
  dt.textContent = (0).toFixed(dec) + suf;
  new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    const t0 = performance.now(), dur = 1100;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      dt.textContent = (to * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }).observe(dt);
});

/* scroll progress + active nav */
const bar = document.getElementById('progress');
const secs = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.links a')];
let ticking = false;
function onScroll() {
  const h = root.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  let cur = null;
  for (const s of secs) if (s.getBoundingClientRect().top <= innerHeight * 0.35) cur = s.id;
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* avatar parallax + card tilt (pointer devices only) */
if (!reduced && matchMedia('(hover: hover)').matches) {
  const av = document.getElementById('avatar');
  const hero = document.querySelector('.hero');
  hero.addEventListener('pointermove', e => {
    const r = av.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
    const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
    av.style.setProperty('--px', `${dx * 24}px`);
    av.style.setProperty('--py', `${dy * 16}px`);
  });
  hero.addEventListener('pointerleave', () => { av.style.setProperty('--px', '0px'); av.style.setProperty('--py', '0px'); });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transition = 'box-shadow .2s';
      card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transition = 'transform .35s, box-shadow .2s'; card.style.transform = ''; });
  });
}
