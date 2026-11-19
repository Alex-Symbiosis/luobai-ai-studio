/* 站点交互：仅三件事——移动端模块抽屉、页内锚点滚动高亮、入场缓动。
   不依赖任何框架；禁用 JS 时页面仍可完整阅读与跳转。 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. 移动端：模块抽屉 */
  var toggle = document.querySelector('.navtoggle');
  var sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      var open = sidebar.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('nav-open')) return;
      if (sidebar.contains(e.target) || toggle.contains(e.target)) return;
      sidebar.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        sidebar.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        toggle.focus();
      }
    });
  }

  /* 2. 页内导航：滚动高亮当前小节 */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.tocbar a[href^="#"]'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    var sections = [];
    tocLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) { map[id] = a; sections.push(el); }
    });

    var current = null;
    var setCurrent = function (id) {
      if (id === current) return;
      current = id;
      tocLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-current', on);
        if (on) { a.setAttribute('aria-current', 'true'); }
        else { a.removeAttribute('aria-current'); }
      });
    };

    var io = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (en) { return en.isIntersecting; });
      if (!visible.length) return;
      visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      setCurrent(visible[0].target.id);
    }, { rootMargin: '-104px 0px -62% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* 3. 阅读进度与回到顶部 */
  var bar = document.querySelector('.readprogress i');
  var toTop = document.querySelector('.totop');
  var onScroll = function () {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop || 0;
    if (bar) bar.style.width = (max > 0 ? Math.min(100, y / max * 100) : 0) + '%';
    if (toTop) toTop.classList.toggle('is-on', y > 360);
  };
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* 4. 入场缓动：仅在允许动效时启用 */
  if (!reduce && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.sec, .objectives, .nextstep, .refs, .figure, .modcard, .chapter-block');
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io2.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (el, i) {
      el.classList.add('will-reveal');
      el.style.animationDelay = Math.min(i % 4, 3) * 60 + 'ms';
      io2.observe(el);
    });
  }
})();
