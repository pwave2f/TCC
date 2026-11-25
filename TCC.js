/* ============================================================
   ENCHIRIDION — Launcher (OTIMIZADO & CORRIGIDO)
   ============================================================
   Índice:
   01. Utilitários
   02. Cursor personalizado
   03. Loader rápido
   04. Navbar (scroll + menu mobile)
   05. Reveal animations
   06. Download (configuração) + Modal de download
   07. Partículas (pausável)
   08. Galeria Multimídia (grade + lightbox)
   ============================================================ */
'use strict';

/* ---------- 01. UTILITÁRIOS ---------- */
const $ = (id) => document.getElementById(id);

const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 02. CURSOR PERSONALIZADO (OTIMIZADO) ---------- */
(function initCursor() {
  if (isTouchDevice || prefersReducedMotion) return;

  const dot = $('cursorDot');
  const ring = $('cursorRing');
  const glow = $('cursorGlow');

  if (!dot || !ring || !glow) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let hovering = false;
  let rafId = null;
  let lastX = -100;
  let lastY = -100;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(render);
  }, { passive: true });

  document.addEventListener('mouseover', (e) => {
    hovering = !!e.target.closest('a, button, [role="button"]');
  }, { passive: true });

  function render() {
    // Só renderiza se houve mudança
    if (Math.abs(mouseX - lastX) < 0.5 && Math.abs(mouseY - lastY) < 0.5 && ringX === mouseX && ringY === mouseY) {
      rafId = null;
      return;
    }

    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    lastX = mouseX;
    lastY = mouseY;

    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(${hovering ? 0 : 1})`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    ring.style.width = hovering ? '48px' : '32px';
    ring.style.height = hovering ? '48px' : '32px';
    ring.style.borderColor = hovering ? 'rgba(128,14,19,0.6)' : 'rgba(196,154,108,0.5)';
    glow.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    rafId = requestAnimationFrame(render);
  }
})();

/* ---------- 03. LOADER RÁPIDO ---------- */
(function initLoader() {
  const overlay = $('loaderOverlay');
  const bar = $('loaderBar');
  const text = $('loaderText');

  if (!overlay || !bar) return;

  let progress = 0;
  let intervalId = null;

  const startLoader = () => {
    intervalId = setInterval(() => {
      progress += Math.random() * 15 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(intervalId);
        intervalId = null;
      }
      bar.style.width = progress + '%';
      if (text) text.textContent = progress >= 100 ? 'Pronto!' : 'Preparando...';

      if (progress >= 100) {
        setTimeout(() => {
          overlay.classList.add('hidden');
          initReveal();
        }, 300);
      }
    }, 100);
  };

  startLoader();

  // Limpeza
  window.addEventListener('beforeunload', () => {
    if (intervalId) clearInterval(intervalId);
  });
})();

/* ---------- 04. NAVBAR ---------- */
(function initNavbar() {
  const navbar = $('navbar');
  const hamburger = $('hamburger');
  const navLinks = $('navLinks');

  if (!navbar || !hamburger || !navLinks) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    });
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('mobile-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('.nav-link')) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('mobile-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Fecha menu ao redimensionar
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('mobile-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }, { passive: true });
})();

/* ---------- 05. REVEAL ANIMATIONS ---------- */
function initReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach((el) => observer.observe(el));
}

/* ---------- 06. DOWNLOAD + MODAL ---------- */

/* Configuração central do download.
   Para publicar uma nova versão: troque `url` e/ou `version`.
   Para desativar temporariamente: `available: false`. */
const DOWNLOAD_CONFIG = Object.freeze({
  name: 'Enchiridion',
  url: 'https://drive.google.com/uc?export=download&id=1XtxkFtwDwLz3MD6niPTGl-VVgNtS42GK',
  version: '2.3.4 Beta',
  platform: 'Windows',
  format: 'ZIP',
  host: 'Google Drive',
  executable: 'Game.exe',
  available: true
});

const modalOverlay = $('modalOverlay');
const modalConfirmBtn = $('modalConfirmBtn');
let modalFocusTrap = null;

function isDownloadAvailable() {
  return DOWNLOAD_CONFIG.available === true && !!DOWNLOAD_CONFIG.url;
}

function applyDownloadConfig() {
  const available = isDownloadAvailable();

  // Textos (versão, plataforma, formato...)
  document.querySelectorAll('[data-download-field]').forEach((el) => {
    const value = DOWNLOAD_CONFIG[el.dataset.downloadField];
    if (value) el.textContent = value;
  });

  // Botões de download: abrem o Google Drive em nova aba
  document.querySelectorAll('[data-download-link]').forEach((link) => {
    if (available) {
      link.href = DOWNLOAD_CONFIG.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = 'Inicia o download pelo ' + DOWNLOAD_CONFIG.host;
    } else {
      // Sem link: o clique apenas abre o aviso de indisponibilidade
      link.href = '#';
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.removeAttribute('title');
    }
    link.addEventListener('click', (e) => {
      if (isDownloadAvailable()) return;
      e.preventDefault();
      if (modalOverlay && !modalOverlay.classList.contains('open')) openModal();
    });
  });

  const heroLabel = $('heroDownloadLabel');
  if (heroLabel) {
    heroLabel.textContent = available
      ? 'BAIXAR PARA ' + DOWNLOAD_CONFIG.platform.toUpperCase()
      : 'DOWNLOAD INDISPONÍVEL';
  }

  // Estado do modal
  const status = $('modalStatus');
  if (status) {
    status.textContent = available ? '● Disponível' : '● Indisponível';
    status.classList.toggle('info-ok', available);
    status.classList.toggle('info-status', !available);
  }
  const details = $('modalDetails');
  if (details) details.classList.toggle('is-hidden', !available);
  const unavailable = $('modalUnavailable');
  if (unavailable) unavailable.classList.toggle('is-hidden', available);
  if (modalConfirmBtn) modalConfirmBtn.classList.toggle('is-hidden', !available);
}

applyDownloadConfig();

function openModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.add('open');

  // Salva referência do elemento que abriu o modal
  modalFocusTrap = document.activeElement;

  // Move foco para o modal
  const closeBtn = modalOverlay.querySelector('.modal-close');
  if (closeBtn) {
    setTimeout(() => closeBtn.focus(), 100);
  }
}

function closeModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.remove('open');

  // Retorna foco para o elemento que abriu
  if (modalFocusTrap && typeof modalFocusTrap.focus === 'function') {
    setTimeout(() => modalFocusTrap.focus(), 100);
  }
}

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      e.preventDefault();
      closeModal();
    }
  });

  // Focus trap dentro do modal
  modalOverlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusable = modalOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

/* ---------- 07. PARTÍCULAS (OTIMIZADO) ---------- */
(function initParticles() {
  if (prefersReducedMotion) return;

  const canvas = $('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLORS = [
    [128, 14, 19],
    [127, 85, 57],
    [196, 154, 108],
    [164, 74, 63],
  ];

  let width = 0;
  let height = 0;
  let particles = [];
  let rafId = null;
  let isRunning = false;

  function particleCount() {
    return Math.min(50, Math.max(15, Math.floor((width * height) / 40000)));
  }

  function createParticles() {
    const count = particleCount();
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.2 - 0.05,
        r: Math.random() * 1.5 + 0.3,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: Math.random(),
      });
    }
  }

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    createParticles();
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.003;
      if (p.y < -10 || p.life > 1) {
        p.y = height + 10;
        p.x = Math.random() * width;
        p.life = 0;
      }
      const alpha = Math.sin(p.life * Math.PI) * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${alpha})`;
      ctx.fill();
    }
    rafId = requestAnimationFrame(render);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    rafId = requestAnimationFrame(render);
  }

  function stop() {
    isRunning = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, width, height);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  start();
})();

/* ---------- 08. GALERIA MULTIMÍDIA (grade + lightbox) ---------- */
(function initGallery() {
  // Dados centralizados — para adicionar ou trocar imagens, edite apenas esta lista (ordem de exibição)
  const GALLERY_IMAGES = [
    'https://res.cloudinary.com/nwnanwxl/image/upload/v1795567943/Imagem_1_y2xahg.png',
    'https://res.cloudinary.com/nwnanwxl/image/upload/v1795567943/Imagem_2_vitbnb.png',
    'https://res.cloudinary.com/nwnanwxl/image/upload/v1795567943/Imagem_3_jaxiyp.png',
    'https://res.cloudinary.com/nwnanwxl/image/upload/v1795567943/Imagem_4_v0uogh.png',
    'https://res.cloudinary.com/nwnanwxl/image/upload/v1795567944/Imagem_5_vf9lzn.png',
    'https://res.cloudinary.com/nwnanwxl/image/upload/v1795567943/Imagem_6_mvgucz.jpg',
    'https://res.cloudinary.com/nwnanwxl/image/upload/v1795567943/Imagem_7_lsyoh6.jpg'
  ];

  // Títulos neutros (não há descrições individuais fornecidas)
  const mediaItems = GALLERY_IMAGES.map((src, i) => ({
    src,
    title: `Captura de tela ${i + 1} do Enchiridion`
  }));

  const grid = $('galleryGrid');
  const lightbox = $('lightbox');
  const lbImg = $('lightboxImage');
  const lbError = $('lightboxError');
  const lbTitle = $('lightboxTitle');
  const lbCounter = $('lightboxCounter');
  const lbClose = $('lightboxClose');
  const lbPrev = $('lightboxPrev');
  const lbNext = $('lightboxNext');

  if (!grid || !lightbox || !lbImg || !lbClose || !lbPrev || !lbNext) return;

  const total = mediaItems.length;
  const buttons = [];
  let current = 0;
  let touchStartX = null;

  /* --- Grade --- */
  mediaItems.forEach((item, idx) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-item';
    btn.setAttribute('aria-label', `Ampliar ${item.title}`);
    btn.setAttribute('aria-haspopup', 'dialog');

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => btn.classList.add('is-broken'));

    const num = document.createElement('span');
    num.className = 'gallery-item-index';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(idx + 1).padStart(2, '0');

    btn.append(img, num);
    btn.addEventListener('click', () => openLightbox(idx));
    li.appendChild(btn);
    grid.appendChild(li);
    buttons.push(btn);
  });

  /* --- Lightbox --- */
  const isOpen = () => lightbox.classList.contains('open');

  function show(idx) {
    current = (idx + total) % total;
    const item = mediaItems[current];

    lbError.classList.add('is-hidden');
    lbImg.classList.remove('is-hidden');
    lbImg.alt = item.title;
    lbImg.src = item.src;
    lbTitle.textContent = item.title;
    lbCounter.textContent = `${current + 1} / ${total}`;

    // Pré-carrega as imagens vizinhas para a navegação ficar fluida
    [current + 1, current - 1].forEach((i) => {
      new Image().src = mediaItems[(i + total) % total].src;
    });
  }

  function openLightbox(idx) {
    show(idx);
    lightbox.classList.add('open');
    document.documentElement.classList.add('lightbox-open');
    setTimeout(() => lbClose.focus(), 50);
  }

  function closeLightbox() {
    if (!isOpen()) return;
    lightbox.classList.remove('open');
    document.documentElement.classList.remove('lightbox-open');
    // Devolve o foco à miniatura da imagem que estava aberta
    const target = buttons[current];
    if (target) setTimeout(() => target.focus(), 50);
  }

  lbImg.addEventListener('error', () => {
    lbImg.classList.add('is-hidden');
    lbError.classList.remove('is-hidden');
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => show(current - 1));
  lbNext.addEventListener('click', () => show(current + 1));

  // Clique fora da imagem (e fora dos controles) fecha
  lightbox.addEventListener('click', (e) => {
    if (e.target.closest('.lightbox-image, .lightbox-nav, .lightbox-close, .lightbox-caption, .lightbox-error')) return;
    closeLightbox();
  });

  // Gesto de deslizar no celular
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < 50) return;
    show(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  // Teclado: só atua com o lightbox aberto
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(current - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(current + 1);
    } else if (e.key === 'Tab') {
      // Mantém o foco dentro do lightbox
      const focusable = lightbox.querySelectorAll('button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
