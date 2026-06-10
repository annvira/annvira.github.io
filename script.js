// ============================================================
//  ANVIRA — landing interactions
// ============================================================
(function () {
    'use strict';

    // First-load intro (3D data-viz reveal) -> dismiss and choreograph hero in
    (function () {
        var intro = document.getElementById('intro');
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var done = false;
        function finish() {
            if (done) return; done = true;
            document.body.classList.add('loaded');
            if (intro) {
                intro.classList.add('intro--done');
                setTimeout(function () { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 1100);
            }
        }
        if (reduce || !intro) { finish(); }
        else { setTimeout(finish, 1900); }
    })();

    // Year
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // Nav: scrolled state
    var nav = document.getElementById('nav');
    function onScroll() {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile menu
    var toggle = document.getElementById('toggle');
    var menu = document.getElementById('menu');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('open');
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        menu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                menu.classList.remove('open');
                toggle.classList.remove('open');
            });
        });
    }

    // Smooth scroll for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = a.getAttribute('href');
            if (id.length < 2) return;
            var el = document.querySelector(id);
            if (!el) return;
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Scroll reveal
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var ro = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var parent = entry.target.parentElement;
                var sibs = parent ? Array.prototype.filter.call(parent.children, function (c) { return c.classList.contains('reveal'); }) : [];
                var idx = sibs.indexOf(entry.target);
                setTimeout(function () { entry.target.classList.add('in'); }, Math.max(0, idx) * 80);
                ro.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.08 });
        revealEls.forEach(function (el) { ro.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    }

    // Animated counters
    function animateCount(el) {
        var target = parseFloat(el.getAttribute('data-count'));
        if (isNaN(target)) return;
        var dur = 1400, start = null;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toString();
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target.toString();
        }
        requestAnimationFrame(step);
    }
    // Contact form -> Web3Forms (AJAX, inline status)
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    if (form && status) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var key = (form.querySelector('[name="access_key"]') || {}).value || '';
            if (key.indexOf('YOUR_ACCESS_KEY') !== -1 || !key) {
                showStatus('error', "Form isn't connected yet — add your Web3Forms access key. Meanwhile, email anneushka017@gmail.com.");
                return;
            }
            var btn = form.querySelector('button[type="submit"]');
            var label = btn ? btn.innerHTML : '';
            if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
            showStatus('pending', 'Sending your details…');

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(form)
            }).then(function (r) { return r.json(); }).then(function (data) {
                if (data.success) {
                    form.reset();
                    showStatus('ok', '✓ Thanks! Your details are on the way — we\'ll reply within one business day.');
                } else {
                    showStatus('error', (data.message || 'Something went wrong.') + ' You can also email anneushka017@gmail.com.');
                }
            }).catch(function () {
                showStatus('error', 'Network error — please email anneushka017@gmail.com instead.');
            }).finally(function () {
                if (btn) { btn.disabled = false; btn.innerHTML = label; }
            });
        });
    }
    function showStatus(type, msg) {
        if (!status) return;
        status.hidden = false;
        status.textContent = msg;
        status.className = 'form-status ' + type;
    }

    // 3D cursor tilt on cards (skip on touch / reduced-motion)
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (canHover && !reduceMotion) {
        document.querySelectorAll('.pillar, .svc, .why-card, .aud').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - 0.5;
                var py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(800px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 5).toFixed(2) + 'deg) translateY(-4px)';
            });
            card.addEventListener('mouseleave', function () { card.style.transform = ''; });
        });
    }

    // Lifecycle 3D scene — JS timeline engine
    (function () {
        var lc = document.getElementById('lifecycle');
        if (!lc) return;
        var phases = lc.querySelectorAll('.lc-phase');
        var numEl = document.getElementById('lc-num');
        var labelEl = document.getElementById('lc-label');
        var dotsWrap = document.getElementById('lc-dots');
        var meta = [
            ['01', 'Raw, scattered data'],
            ['02', 'Cleaning & analysis'],
            ['03', 'Building the dashboard'],
            ['04', 'Visuals & insights'],
            ['05', 'Presenting to the client'],
            ['06', 'Client approved']
        ];
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var rnd = function (n) { return Math.floor(Math.random() * n); };

        // raw-data cells scattered in 3D
        var raw = document.getElementById('lc-raw');
        if (raw) {
            var samples = ['8.2', '1,204', 'A12', '0.4', '$99', 'NULL', '3,914', 'TX', '7.1', '24%', 'ID9', '—'];
            for (var i = 0; i < 32; i++) {
                var s = document.createElement('span');
                s.textContent = samples[i % samples.length];
                if (i % 7 === 3) s.className = 'err';
                var z = rnd(120) - 60;
                s.style.left = rnd(78) + '%';
                s.style.top = rnd(80) + '%';
                s.style.setProperty('--z', z + 'px');
                s.style.transform = 'translate3d(0,0,' + z + 'px)';
                s.style.animationDelay = (Math.random() * 2).toFixed(2) + 's';
                raw.appendChild(s);
            }
        }

        // confetti for the approval phase
        var conf = document.getElementById('lc-confetti');
        if (conf) {
            var cols = ['#818cf8', '#34d399', '#f59e0b', '#f472b6', '#ffffff'];
            for (var j = 0; j < 18; j++) {
                var p = document.createElement('i');
                p.style.left = rnd(100) + '%';
                p.style.background = cols[j % cols.length];
                p.style.animationDelay = (Math.random() * 1.6).toFixed(2) + 's';
                conf.appendChild(p);
            }
        }

        // progress dots
        var dots = [];
        if (dotsWrap) {
            for (var d = 0; d < meta.length; d++) { var dot = document.createElement('i'); dotsWrap.appendChild(dot); dots.push(dot); }
        }

        var cur = -1;
        function show(i) {
            cur = i;
            for (var k = 0; k < phases.length; k++) phases[k].classList.toggle('is-active', k === i);
            if (numEl) numEl.textContent = meta[i][0];
            if (labelEl) labelEl.textContent = meta[i][1];
            for (var m = 0; m < dots.length; m++) dots[m].classList.toggle('on', m === i);
        }

        if (reduce) { show(3); return; }   // static visuals frame, no auto-motion
        show(0);
        setInterval(function () { show((cur + 1) % phases.length); }, 3200);
    })();

    var counters = document.querySelectorAll('[data-count]');
    if ('IntersectionObserver' in window) {
        var co = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                animateCount(entry.target);
                co.unobserve(entry.target);
            });
        }, { threshold: 0.5 });
        counters.forEach(function (el) { co.observe(el); });
    } else {
        counters.forEach(animateCount);
    }
})();
