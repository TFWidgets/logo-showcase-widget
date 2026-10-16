/*!
 * TF Widgets — Logo Showcase v1
 * Встраивание: <script src=".../embed.js" data-id="CLIENT_ID"></script>
 * Конфиг клиента: configs/CLIENT_ID.json
 * Логотипы партнёров, клиентов, СМИ. Три вида: сетка на карточке (grid), блок с заголовком (panel),
 * бегущая лента (marquee). Логотипы ссылками, у каждого можно указать название и ссылку.
 * Цвета логотипов: как есть / серые с цветом при наведении / одним цветом.
 * Виджет встаёт на место тега <script>. Все стили ограничены классом .bhw-lg.
 */
(function () {
    'use strict';
    var VERSION = '1.0.0';
    var LOG = '[TFW Logos]';
    // Где работает живое превью BHWLogos.render() (конфигуратор на сайте)
    var PREVIEW_DOMAINS = ['tf-widgets.com', '*.tf-widgets.com', '9ac5za-h1.myshopify.com'];
    var MAX_LOGOS = 30;
    var LAYOUTS = ['grid', 'panel', 'marquee'];
    var SPEEDS = { slow: 70, normal: 45, fast: 25 }; // секунд на полный круг ленты при 10 логотипах

    var inlineCSS = `
        .bhw-lg { font-family: var(--bhw-font, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif); -webkit-font-smoothing: antialiased;
            display: block; position: relative; width: 100%; max-width: var(--bhw-max, 1000px); margin: 0 auto; padding: var(--bhw-pad, 0px);
            background: var(--bhw-bg, transparent); color: var(--bhw-text, #111827); border-radius: var(--bhw-r, 18px);
            line-height: 1.45; font-size: 15px; text-align: left; box-sizing: border-box; }
        .bhw-lg *, .bhw-lg *::before, .bhw-lg *::after { box-sizing: border-box; }
        .bhw-lg .bhw-lg-head { margin: 0 0 18px; text-align: center; }
        .bhw-lg .bhw-lg-h { margin: 0; padding: 0; font-size: 26px; font-weight: 800; line-height: 1.2; letter-spacing: -.01em; color: inherit; }
        .bhw-lg .bhw-lg-sub { margin: 6px 0 0; font-size: 15px; opacity: .7; color: inherit; }

        /* карточка, на которой лежат логотипы */
        .bhw-lg .bhw-lg-card { position: relative; background: var(--bhw-card, #ffffff); color: var(--bhw-card-text, #111827); border-radius: var(--bhw-r, 18px);
            padding: var(--bhw-card-pad, 28px); box-shadow: var(--bhw-shadow, 0 10px 30px rgba(0,0,0,.08)); border: 1px solid var(--bhw-card-line, rgba(0,0,0,.06)); }

        /* логотип */
        .bhw-lg .bhw-lg-it { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-width: 0; margin: 0; padding: 6px;
            color: inherit; text-decoration: none; border-radius: 10px; outline-offset: 3px; }
        .bhw-lg a.bhw-lg-it { cursor: pointer; }
        .bhw-lg a.bhw-lg-it:focus-visible { outline: 3px solid var(--bhw-card-text, #111827); }
        .bhw-lg .bhw-lg-img { display: block; width: auto !important; height: var(--bhw-h, 56px) !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important;
            border: 0 !important; border-radius: 0 !important; object-fit: contain; transition: filter .25s, opacity .25s, transform .25s; }
        .bhw-lg a.bhw-lg-it:hover .bhw-lg-img { transform: scale(1.04); }
        .bhw-lg.bhw-lg-gray .bhw-lg-img { filter: grayscale(1); opacity: .62; }
        .bhw-lg.bhw-lg-gray .bhw-lg-it:hover .bhw-lg-img, .bhw-lg.bhw-lg-gray .bhw-lg-it:focus-visible .bhw-lg-img { filter: none; opacity: 1; }
        .bhw-lg.bhw-lg-mono .bhw-lg-img { filter: brightness(0); opacity: .78; }
        .bhw-lg.bhw-lg-mono.bhw-lg-dark .bhw-lg-img { filter: brightness(0) invert(1); opacity: .85; }
        .bhw-lg.bhw-lg-mono .bhw-lg-it:hover .bhw-lg-img { opacity: 1; }
        .bhw-lg .bhw-lg-name { display: block; max-width: 100%; font-size: 13px; font-weight: 600; line-height: 1.3; text-align: center; opacity: .75; color: inherit;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bhw-lg .bhw-lg-it.bhw-broken .bhw-lg-img { visibility: hidden; }

        /* 1. сетка */
        .bhw-lg .bhw-lg-grid { display: grid; grid-template-columns: repeat(var(--bhw-cols, 4), minmax(0, 1fr)); gap: var(--bhw-gap, 28px) calc(var(--bhw-gap, 28px) * .8); align-items: center; }

        /* 2. блок с заголовком */
        .bhw-lg.bhw-lg-l-panel { max-width: min(var(--bhw-max, 560px), 720px); }
        .bhw-lg.bhw-lg-l-panel .bhw-lg-card { padding: var(--bhw-card-pad, 32px) calc(var(--bhw-card-pad, 32px) * .9); }
        .bhw-lg .bhw-lg-label { margin: 0 0 22px; text-align: center; font-size: 15px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: inherit; }
        .bhw-lg .bhw-lg-label-sub { margin: -14px 0 22px; text-align: center; font-size: 14px; opacity: .7; color: inherit; }

        /* 3. бегущая лента */
        .bhw-lg.bhw-lg-l-marquee .bhw-lg-card { padding: calc(var(--bhw-card-pad, 28px) * .8) 0; overflow: hidden; }
        .bhw-lg .bhw-lg-viewport { position: relative; overflow: hidden;
            -webkit-mask-image: linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%); mask-image: linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%); }
        .bhw-lg .bhw-lg-track { display: flex; width: max-content; animation: bhw-lg-move var(--bhw-dur, 45s) linear infinite; }
        .bhw-lg .bhw-lg-set { display: flex; flex: none; align-items: center; gap: var(--bhw-gap, 28px); padding-right: var(--bhw-gap, 28px); }
        .bhw-lg .bhw-lg-set .bhw-lg-it { flex: none; max-width: 220px; }
        .bhw-lg.bhw-lg-pause .bhw-lg-viewport:hover .bhw-lg-track, .bhw-lg.bhw-lg-pause .bhw-lg-viewport:focus-within .bhw-lg-track { animation-play-state: paused; }
        .bhw-lg.bhw-lg-static .bhw-lg-track { animation: none; }
        .bhw-lg.bhw-lg-static .bhw-lg-viewport { overflow-x: auto; -webkit-mask-image: none; mask-image: none; }
        .bhw-lg.bhw-lg-static .bhw-lg-set[aria-hidden] { display: none; }
        @keyframes bhw-lg-move { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .bhw-lg .bhw-lg-empty { margin: 8px 0; text-align: center; opacity: .65; font-size: 15px; }

        @media (max-width: 560px) {
            .bhw-lg { padding: var(--bhw-pad-m, 0px); }
            .bhw-lg .bhw-lg-h { font-size: 22px; }
            .bhw-lg .bhw-lg-card { padding: calc(var(--bhw-card-pad, 28px) * .7); }
            .bhw-lg .bhw-lg-img { height: calc(var(--bhw-h, 56px) * .82) !important; }
        }
        @media (prefers-reduced-motion: reduce) {
            .bhw-lg .bhw-lg-track { animation: none; }
            .bhw-lg .bhw-lg-viewport { overflow-x: auto; -webkit-mask-image: none; mask-image: none; }
            .bhw-lg .bhw-lg-set[aria-hidden] { display: none; }
            .bhw-lg .bhw-lg-img { transition: none; }
        }

        /* защита от тем сайта, которые красят текст и ссылки через !important */
        .bhw-lg :where(.bhw-lg-h, .bhw-lg-sub, .bhw-lg-empty) { color: var(--bhw-text, #111827) !important; }
        .bhw-lg .bhw-lg-card :where(.bhw-lg-label, .bhw-lg-label-sub, .bhw-lg-name) { color: var(--bhw-card-text, #111827) !important; }
        .bhw-lg a.bhw-lg-it { text-decoration: none !important; border: 0 !important; background: none !important; box-shadow: none !important; }
        .bhw-lg :where(h3, p, span, a, b) { font-family: inherit !important; letter-spacing: normal; text-transform: none; }
        .bhw-lg .bhw-lg-label { letter-spacing: .06em !important; text-transform: uppercase !important; }
    `;

    /* =========================================================
       ПУБЛИЧНЫЕ API
       ========================================================= */
    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    window.BusinessHoursWidgets.logos = window.BusinessHoursWidgets.logos || {};

    // Живое превью для конфигуратора: BHWLogos.render(container, config) -> { update, destroy, el }
    var api = window.BHWLogos = window.BHWLogos || {};
    api.version = VERSION;
    api.defaults = getDefaultConfig;
    api.checkAccess = bhwCheckAccess;
    api.limits = { logos: MAX_LOGOS };
    api.render = function (container, config) {
        var noop = { destroy: function () {}, update: function () {}, el: null };
        if (!bhwCheckAccess({ domains: PREVIEW_DOMAINS }).ok) { console.warn(LOG, 'preview is only available on tf-widgets.com'); return noop; }
        injectBaseStyles();
        if (container._bhwLgDestroy) container._bhwLgDestroy();
        var cls = container.__bhwLgClass || (container.__bhwLgClass = 'bhw-lg-preview-' + Math.random().toString(36).slice(2, 8));
        var widget = null;
        var ctrl = {
            el: null,
            update: function (cfg) {
                if (widget) widget.destroy();
                widget = mountWidget(normalizeConfig(cfg || {}), cls, 'preview', { inline: container });
                ctrl.el = widget.root;
            },
            destroy: function () { if (widget) widget.destroy(); widget = null; ctrl.el = null; container._bhwLgDestroy = null; }
        };
        ctrl.update(config);
        container._bhwLgDestroy = ctrl.destroy;
        return ctrl;
    };

    /* =========================================================
       АВТОЗАПУСК ПО <script data-id="..."> (только свой тег)
       ========================================================= */
    try {
        var currentScript = document.currentScript || (function () {
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();
        if (currentScript && currentScript.dataset && currentScript.dataset.id && currentScript.dataset.bhwMounted !== '1') {
            currentScript.dataset.bhwMounted = '1';
            var debug = currentScript.dataset.debug === '1';
            var clientId = normalizeId(currentScript.dataset.id);
            var baseUrl = getBasePath(currentScript.src);
            loadConfig(clientId, baseUrl)
                .then(function (fetched) {
                    var access = bhwCheckAccess(fetched);
                    if (!access.ok) {
                        console.warn(LOG, 'widget "' + clientId + '" is not active on ' + (location.hostname || 'this page') + ': ' + access.reason);
                        return;
                    }
                    var cfg = normalizeConfig(fetched);
                    if (debug) console.log(LOG, 'config "' + clientId + '":', cfg);
                    injectBaseStyles();
                    var mount = function () {
                        var w = mountWidget(cfg, 'bhw-lg-' + clientId.replace(/[^a-z0-9_-]/gi, '') + '-' + Date.now(), clientId, { anchor: currentScript });
                        window.BusinessHoursWidgets.logos[clientId] = w;
                    };
                    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
                })
                .catch(function (error) {
                    console.warn(LOG, 'config "' + clientId + '" not loaded:', error.message);
                });
        }
    } catch (error) {
        console.error(LOG, 'critical error:', error);
    }

    /* =========================================================
       ФУНКЦИИ
       ========================================================= */
    function injectBaseStyles() {
        if (!document.getElementById('tfw-logos-styles')) {
            var style = document.createElement('style');
            style.id = 'tfw-logos-styles';
            style.textContent = inlineCSS;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    /* ---------------------------------------------------------
       ДОСТУП (общий блок для всех виджетов TF Widgets — копировать без изменений)
       --------------------------------------------------------- */
    function bhwCheckAccess(config) {
        config = config || {};
        if (config.active === false) return { ok: false, reason: 'widget is switched off ("active": false)' };
        var host = String(location.hostname || '').toLowerCase().replace(/^www\./, '');
        if (!host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return { ok: true };
        var list = config.domains;
        if (typeof list === 'string') list = list.split(/[\s,]+/);
        if (!Array.isArray(list) || !list.length) return { ok: false, reason: 'no "domains" in config' };
        for (var i = 0; i < list.length; i++) {
            var d = String(list[i] || '').trim().toLowerCase()
                .replace(/^[a-z]+:\/\//, '').replace(/[\/:].*$/, '').replace(/^www\./, '');
            if (!d) continue;
            if (d.indexOf('*.') === 0) {
                var base = d.slice(2);
                if (host === base || host.slice(-(base.length + 1)) === '.' + base) return { ok: true };
            } else if (host === d) {
                return { ok: true };
            }
        }
        return { ok: false, reason: 'domain is not in "domains"' };
    }

    function normalizeId(id) { return String(id || 'demo').replace(/\.(json|js)$/i, ''); }
    function getBasePath(src) {
        if (!src) return './';
        try { var url = new URL(src, location.href); return url.origin + url.pathname.replace(/\/[^\/]*$/, '/'); }
        catch (error) { return './'; }
    }
    function loadConfig(clientId, baseUrl) {
        if (clientId === 'local') {
            var el = document.querySelector('#bhw-lg-local-config');
            if (!el) return Promise.reject(new Error('#bhw-lg-local-config not found'));
            try { return Promise.resolve(JSON.parse(el.textContent)); } catch (e) { return Promise.reject(e); }
        }
        var url = baseUrl + 'configs/' + encodeURIComponent(clientId) + '.json?v=' + Date.now();
        return fetch(url, { cache: 'no-store', headers: { 'Accept': 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }

    function getDefaultConfig() {
        return {
            layout: 'grid',                // grid | panel | marquee
            heading: '',
            subheading: '',
            logos: [],                     // [{ src, name, link }]
            logoColor: 'original',         // original | gray (цвет при наведении) | mono (одним цветом)
            showNames: false,
            columns: 4,                    // сетка и блок
            logoHeight: 56,
            speed: 'normal',               // лента: slow | normal | fast
            pauseOnHover: true,
            style: {
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
                colors: { background: '', text: '#111827', card: '#ffffff', cardText: '' },
                sizes: { maxWidth: 1000, radius: 18 },
                shadow: true
            }
        };
    }

    function str(v, max) { return String(v == null ? '' : v).trim().slice(0, max); }
    function normalizeConfig(raw) {
        raw = raw || {};
        var logos = Array.isArray(raw.logos) ? raw.logos : [];
        var cfg = mergeDeep(getDefaultConfig(), raw);
        if (LAYOUTS.indexOf(cfg.layout) < 0) cfg.layout = 'grid';
        if (['original', 'gray', 'mono'].indexOf(cfg.logoColor) < 0) cfg.logoColor = 'original';
        if (!SPEEDS[cfg.speed]) cfg.speed = 'normal';
        cfg.logos = logos.map(function (l) {
            l = l || {};
            return { src: safeImg(l.src), name: str(l.name, 60), link: safeLink(l.link) };
        }).filter(function (l) { return l.src; }).slice(0, MAX_LOGOS);
        cfg.heading = str(cfg.heading, 80);
        cfg.subheading = str(cfg.subheading, 160);
        cfg.columns = Math.round(Math.min(8, Math.max(1, num(cfg.columns, 4))));
        cfg.logoHeight = Math.round(Math.min(120, Math.max(24, num(cfg.logoHeight, 56))));
        cfg.showNames = cfg.showNames === true;
        cfg.pauseOnHover = cfg.pauseOnHover !== false;
        cfg.style.shadow = cfg.style.shadow !== false;
        cfg.style.sizes.maxWidth = Math.min(1600, Math.max(280, num(cfg.style.sizes.maxWidth, 1000)));
        cfg.style.sizes.radius = Math.min(32, Math.max(0, num(cfg.style.sizes.radius, 18)));
        return cfg;
    }

    function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
    function mergeDeep(base, over) {
        var out = {};
        Object.keys(base || {}).forEach(function (k) { out[k] = isObj(base[k]) ? mergeDeep(base[k], {}) : base[k]; });
        Object.keys(over || {}).forEach(function (k) {
            var v = over[k];
            if (isObj(v) && isObj(out[k])) out[k] = mergeDeep(out[k], v);
            else if (v !== undefined) out[k] = v;
        });
        return out;
    }
    function cssValue(v, fallback) { if (v === undefined || v === null || v === '') return fallback; return String(v).replace(/[;{}<>]/g, ''); }
    function num(v, fallback) { var n = Number(v); return isFinite(n) && v !== '' && v !== null ? n : fallback; }
    function escapeHtml(text) {
        return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function safeImg(url) {
        var u = String(url || '').trim();
        if (/^https:\/\/[^\s"'<>]+$/i.test(u)) return u;
        if (/^data:image\/(svg\+xml|png|jpe?g|webp)[;,]/i.test(u) && u.length < 200000) return u;
        return '';
    }
    function safeLink(url) {
        var u = String(url || '').trim();
        if (!u) return '';
        if (/^https?:\/\/[^\s"'<>]+$/i.test(u)) return u;
        if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([\/?#][^\s"'<>]*)?$/i.test(u)) return 'https://' + u;
        return '';
    }
    function hexToRgb(hex) {
        var h = String(hex || '').replace('#', '');
        if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
        if (!/^[0-9a-f]{6}$/i.test(h)) return null;
        var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function isDark(hex) {
        var c = hexToRgb(hex); if (!c) return false;
        return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 < 0.5;
    }
    function rgba(hex, a) { var c = hexToRgb(hex); return c ? 'rgba(' + c.join(',') + ',' + a + ')' : 'rgba(0,0,0,' + a + ')'; }

    function applyCustomStyles(uniqueClass, cfg) {
        var id = 'bhw-lg-style-' + uniqueClass;
        var el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; (document.head || document.documentElement).appendChild(el); }
        var s = cfg.style || {}, c = s.colors || {}, z = s.sizes || {};
        var bg = cssValue(c.background, '');
        var noCard = c.card === '' || c.card === 'transparent';
        var card = noCard ? 'transparent' : cssValue(c.card, '#ffffff');
        var cardText = cssValue(c.cardText, noCard ? cssValue(c.text, '#111827') : (isDark(card) ? '#ffffff' : '#111827'));
        var dur = SPEEDS[cfg.speed] * Math.max(0.6, cfg.logos.length / 10);
        el.textContent = '.' + uniqueClass + '{' +
            '--bhw-font:' + cssValue(s.fontFamily, "'Inter', system-ui, sans-serif") + ';' +
            '--bhw-bg:' + (bg || 'transparent') + ';' +
            '--bhw-pad:' + (bg ? '28px' : '0px') + ';' +
            '--bhw-pad-m:' + (bg ? '16px' : '0px') + ';' +
            '--bhw-text:' + cssValue(c.text, '#111827') + ';' +
            '--bhw-card:' + card + ';' +
            '--bhw-card-text:' + cardText + ';' +
            '--bhw-card-line:' + (noCard ? 'transparent' : rgba(cardText, isDark(card) ? .1 : .07)) + ';' +
            '--bhw-shadow:' + (s.shadow && !noCard ? (isDark(card) ? '0 14px 34px rgba(0,0,0,.35)' : '0 12px 32px rgba(17,24,39,.09)') : 'none') + ';' +
            (noCard ? '--bhw-card-pad:8px;' : '') +
            '--bhw-max:' + num(z.maxWidth, 1000) + 'px;' +
            '--bhw-r:' + num(z.radius, 18) + 'px;' +
            '--bhw-h:' + cfg.logoHeight + 'px;' +
            '--bhw-gap:' + Math.round(cfg.logoHeight * .55 + 6) + 'px;' +
            '--bhw-dur:' + dur.toFixed(1) + 's;' +
            '}';
        return id;
    }

    function logoHtml(l, cfg, k) {
        var inner = '<img class="bhw-lg-img" alt="' + escapeHtml(l.name) + '" loading="lazy" decoding="async" src="' + escapeHtml(l.src) + '">' +
            (cfg.showNames && l.name ? '<span class="bhw-lg-name">' + escapeHtml(l.name) + '</span>' : '');
        var title = l.name ? ' title="' + escapeHtml(l.name) + '"' : '';
        if (l.link) return '<a class="bhw-lg-it" data-k="' + k + '" href="' + escapeHtml(l.link) + '" target="_blank" rel="noopener"' + title + '>' + inner + '</a>';
        return '<span class="bhw-lg-it" data-k="' + k + '"' + title + '>' + inner + '</span>';
    }

    function mountWidget(cfg, uniqueClass, id, opts) {
        opts = opts || {};
        var inline = opts.inline || null;
        var styleId = applyCustomStyles(uniqueClass, cfg);
        var card = (cfg.style.colors || {}).card; if (card == null) card = '#ffffff';
        var root = document.createElement('div');
        root.id = 'tfw-logos-' + id;
        root.className = 'bhw-lg ' + uniqueClass + ' bhw-lg-l-' + cfg.layout +
            (cfg.logoColor === 'gray' ? ' bhw-lg-gray' : cfg.logoColor === 'mono' ? ' bhw-lg-mono' : '') +
            (((card === '' || card === 'transparent') ? !isDark((cfg.style.colors || {}).text || '#111827') : isDark(card)) ? ' bhw-lg-dark' : '') + (cfg.pauseOnHover ? ' bhw-lg-pause' : '');

        var logos = cfg.logos;
        var head = (cfg.heading || cfg.subheading) ? '<header class="bhw-lg-head">' +
            (cfg.heading ? '<h3 class="bhw-lg-h">' + escapeHtml(cfg.heading) + '</h3>' : '') +
            (cfg.subheading ? '<p class="bhw-lg-sub">' + escapeHtml(cfg.subheading) + '</p>' : '') + '</header>' : '';
        var body;
        if (!logos.length) body = '<div class="bhw-lg-card"><p class="bhw-lg-empty">Add logo links to see your showcase</p></div>';
        else if (cfg.layout === 'marquee') {
            var set = logos.map(function (l, k) { return logoHtml(l, cfg, k); }).join('');
            body = '<div class="bhw-lg-card"><div class="bhw-lg-viewport"><div class="bhw-lg-track">' +
                '<div class="bhw-lg-set">' + set + '</div><div class="bhw-lg-set" aria-hidden="true">' + set + '</div></div></div></div>';
        } else if (cfg.layout === 'panel') {
            // в блоке заголовок стоит внутри карточки
            body = '<div class="bhw-lg-card">' +
                (cfg.heading ? '<p class="bhw-lg-label">' + escapeHtml(cfg.heading) + '</p>' : '') +
                (cfg.subheading ? '<p class="bhw-lg-label-sub">' + escapeHtml(cfg.subheading) + '</p>' : '') +
                '<div class="bhw-lg-grid">' + logos.map(function (l, k) { return logoHtml(l, cfg, k); }).join('') + '</div></div>';
            head = '';
        } else {
            body = '<div class="bhw-lg-card"><div class="bhw-lg-grid">' + logos.map(function (l, k) { return logoHtml(l, cfg, k); }).join('') + '</div></div>';
        }
        root.innerHTML = head + body;

        if (inline) inline.appendChild(root);
        else if (opts.anchor && opts.anchor.parentNode) opts.anchor.parentNode.insertBefore(root, opts.anchor.nextSibling);
        else document.body.appendChild(root);

        var cleanups = [];
        function on(t, e, h, o) { t.addEventListener(e, h, o); cleanups.push(function () { t.removeEventListener(e, h, o); }); }

        root.querySelectorAll('.bhw-lg-img').forEach(function (img) {
            img.addEventListener('error', function () { var it = img.closest('.bhw-lg-it'); if (it) it.classList.add('bhw-broken'); });
        });
        // копия ленты не должна получать фокус клавиатурой
        root.querySelectorAll('.bhw-lg-set[aria-hidden] a').forEach(function (a) { a.setAttribute('tabindex', '-1'); });

        // колонки по ширине блока; лента — без анимации, если все логотипы и так помещаются
        function layout() {
            var w = (inline ? inline.clientWidth : root.clientWidth) || root.clientWidth;
            w = Math.min(w, cfg.layout === 'panel' ? Math.min(cfg.style.sizes.maxWidth, 1600) : cfg.style.sizes.maxWidth);
            if (cfg.layout !== 'marquee') {
                var minCell = cfg.logoHeight * 1.9 + 16;
                var fit = Math.max(1, Math.floor((w - 40) / minCell));
                root.style.setProperty('--bhw-cols', String(Math.max(1, Math.min(cfg.columns, fit, logos.length || 1))));
            } else {
                var set = root.querySelector('.bhw-lg-set'), vp = root.querySelector('.bhw-lg-viewport');
                if (set && vp) root.classList.toggle('bhw-lg-static', set.scrollWidth <= vp.clientWidth);
            }
        }
        layout();
        if (window.ResizeObserver) {
            var ro = new ResizeObserver(layout);
            ro.observe(inline || root);
            cleanups.push(function () { ro.disconnect(); });
        } else on(window, 'resize', layout);
        root.querySelectorAll('.bhw-lg-img').forEach(function (img) { if (!img.complete) img.addEventListener('load', layout); });

        return {
            root: root, config: cfg, id: id,
            destroy: function () {
                cleanups.forEach(function (f) { try { f(); } catch (e) {} });
                root.remove();
                var s = document.getElementById(styleId); if (s) s.remove();
            }
        };
    }
})();
