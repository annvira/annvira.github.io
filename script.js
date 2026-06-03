/* ========================================
   Portfolio JS — Refined UX
   ======================================== */

// --- Theme: apply ASAP to avoid flash ---
(function() {
    try {
        var saved = localStorage.getItem('theme');
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', () => {

    // --- Theme toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    // --- Footer year ---
    const yr = document.getElementById('footer-year');
    if (yr) yr.textContent = new Date().getFullYear();

    // --- Navbar scroll state + scroll-to-top visibility ---
    const navbar = document.getElementById('navbar');
    const scrollTopBtn = document.getElementById('scroll-top');
    function onScroll() {
        const y = window.scrollY;
        if (navbar) navbar.classList.toggle('scrolled', y > 10);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('show', y > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Mobile menu ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    function toggleNav(force) {
        const open = force !== undefined ? force : !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', open);
        navToggle.classList.toggle('active', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        const spans = navToggle.querySelectorAll('span');
        if (open) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        }
    }
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => toggleNav());
        document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
            link.addEventListener('click', () => toggleNav(false));
        });
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('open')) {
                toggleNav(false);
            }
        });
    }

    // --- Active nav on scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    function updateActive() {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY + 140 >= s.offsetTop) current = s.id;
        });
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();

    // --- Typewriter ---
    const tw = document.getElementById('typewriter');
    if (tw) {
        const phrases = ['clear insights.', 'smarter decisions.', 'strategic value.', 'compelling stories.'];
        let pi = 0, ci = 0, deleting = false;
        function type() {
            const phrase = phrases[pi];
            tw.textContent = phrase.substring(0, deleting ? --ci : ++ci);
            let delay = deleting ? 48 : 88;
            if (!deleting && ci === phrase.length) { delay = 2000; deleting = true; }
            else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 380; }
            setTimeout(type, delay);
        }
        setTimeout(type, 1200);
    }

    // --- Scroll-in animations ---
    const animEls = document.querySelectorAll('.anim');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const parent = entry.target.parentElement;
            const siblings = parent ? Array.from(parent.children).filter(c => c.classList.contains('anim')) : [];
            const idx = siblings.indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('visible'), Math.max(0, idx) * 90);
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.06 });
    animEls.forEach(el => observer.observe(el));

    // --- Animated skill bars ---
    const skillRows = document.querySelectorAll('.skill-row[data-pct]');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const fill = entry.target.querySelector('.skill-fill');
            const pct = entry.target.dataset.pct;
            if (fill && pct) {
                setTimeout(() => { fill.style.width = pct + '%'; }, 150);
            }
            skillObserver.unobserve(entry.target);
        });
    }, { threshold: 0.3 });
    skillRows.forEach(row => skillObserver.observe(row));

    // --- Animated counters ---
    const counters = document.querySelectorAll('.stat-num[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const duration = 1400;
            const start = performance.now();
            function tick(now) {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(target * eased);
                if (t < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            }
            requestAnimationFrame(tick);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.4 });
    counters.forEach(c => counterObserver.observe(c));

    // --- Subtle hero parallax ---
    const heroVisual = document.querySelector('.hero-visual');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (heroVisual && !prefersReducedMotion && window.innerWidth > 860) {
        let raf = null;
        document.addEventListener('mousemove', (e) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth - 0.5) * 8;
                const y = (e.clientY / window.innerHeight - 0.5) * 8;
                heroVisual.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
                raf = null;
            });
        });
    }

    // --- Project filter ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                const cat = card.dataset.category;
                const show = filter === 'all' || cat === filter;
                card.classList.toggle('hidden', !show);
            });
        });
    });

    // --- Smooth scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href === '#' || href === '') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
                window.scrollTo({ top: target.offsetTop - offset + 1, behavior: 'smooth' });
            }
        });
    });

    // --- Photo fallback ---
    const photo = document.getElementById('hero-photo');
    if (photo) {
        photo.addEventListener('error', () => {
            photo.style.display = 'none';
            const p = photo.parentElement;
            p.style.cssText += 'background:linear-gradient(135deg,#4f46e5,#10b981);display:flex;align-items:center;justify-content:center;';
            const s = document.createElement('span');
            s.textContent = 'AB';
            s.style.cssText = 'font-size:5rem;font-weight:900;color:white;letter-spacing:-2px;font-family:Plus Jakarta Sans,sans-serif;';
            p.appendChild(s);
        });
    }

    // --- Lazy image fade ---
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        if (img.complete) return;
        img.style.cssText = 'opacity:0;transition:opacity .5s ease';
        img.addEventListener('load', () => { img.style.opacity = '1'; });
    });

    console.log('Portfolio loaded — refined UX');
});
