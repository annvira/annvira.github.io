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

    // Data lifecycle loop — JS-driven data packets flowing around the pipeline
    (function () {
        var loop = document.getElementById('flowLoop');
        var packets = document.querySelectorAll('.flow-packet');
        if (!loop || !loop.getTotalLength || !packets.length) return;
        var n = packets.length;
        var progress = 0; // 0..1 around the loop
        function place() {
            var len = loop.getTotalLength();
            if (!len) return;
            for (var k = 0; k < n; k++) {
                var frac = ((k / n) + progress) % 1;
                var pt = loop.getPointAtLength(frac * len);
                packets[k].setAttribute('cx', pt.x.toFixed(1));
                packets[k].setAttribute('cy', pt.y.toFixed(1));
            }
        }
        var tries = 0;
        (function init() {                     // retry until SVG geometry is ready (handles deferred layout)
            if (loop.getTotalLength()) place();
            else if (tries++ < 40) setTimeout(init, 80);
        })();
        window.addEventListener('load', place);
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;
        var last = null;
        function frame(ts) {
            if (last === null) last = ts;
            progress = (progress + (ts - last) / 7000) % 1; // ~7s per full loop
            last = ts;
            place();
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
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
