/* ============================================================
   ENCHIRIDION — Launcher (OTIMIZADO & CORRIGIDO)
   ============================================================
   Índice:
   01. Utilitários
   02. Cursor personalizado
   03. Loader rápido
   04. Navbar (scroll + menu mobile)
   05. Reveal animations
   06. Modal de download
   07. Partículas (pausável)
   08. Galeria Multimídia (com tratamento de erros)
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

/* ---------- 06. MODAL DE DOWNLOAD ---------- */
const modalOverlay = $('modalOverlay');
const modalConfirmBtn = $('modalConfirmBtn');
let modalFocusTrap = null;

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

/* ---------- 08. GALERIA MULTIMÍDIA ---------- */
(function initGallery() {
  // Dados de mídia — estrutura pronta para preenchimento
  const mediaItems = [];

  const display = $('galleryDisplay');
  const img = $('mediaImage');
  const video = $('mediaVideo');
  const placeholder = $('mediaPlaceholder');
  const descTitle = $('mediaTitle');
  const descText = $('mediaDesc');
  const thumbnails = $('galleryThumbnails');
  const prevBtn = $('galleryPrev');
  const nextBtn = $('galleryNext');

  if (!display || !thumbnails || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function renderThumbnails() {
    thumbnails.innerHTML = '';
    mediaItems.forEach((item, idx) => {
      const thumb = document.createElement('button');
      thumb.className = `gallery-thumbnail ${idx === currentIndex ? 'active' : ''}`;
      thumb.setAttribute('aria-label', `Selecionar ${item.title}`);
      thumb.setAttribute('aria-current', idx === currentIndex ? 'true' : 'false');

      if (item.thumb) {
        thumb.style.backgroundImage = `url(${item.thumb})`;
      } else {
        thumb.textContent = '◈';
      }

      thumb.addEventListener('click', () => selectMedia(idx));
      thumbnails.appendChild(thumb);
    });
  }

  function selectMedia(idx) {
    if (idx < 0 || idx >= mediaItems.length) return;

    currentIndex = idx;
    const item = mediaItems[currentIndex];

    // Para vídeo anterior
    if (video && video.src) {
      video.pause();
      video.currentTime = 0;
    }

    // Limpa exibição anterior
    if (img) img.style.display = 'none';
    if (video) video.style.display = 'none';
    if (placeholder) placeholder.style.display = 'none';

    // Exibe o tipo correto
    if (item.type === 'image' && item.src && img) {
      img.src = item.src;
      img.alt = item.alt || item.title;
      img.onerror = () => {
        if (placeholder) placeholder.style.display = 'flex';
        if (img) img.style.display = 'none';
      };
      img.style.display = 'block';
    } else if (item.type === 'video' && item.src && video) {
      video.src = item.src;
      video.style.display = 'block';
      video.onerror = () => {
        if (placeholder) placeholder.style.display = 'flex';
        if (video) video.style.display = 'none';
      };
    } else {
      if (placeholder) placeholder.style.display = 'flex';
    }

    // Atualiza descrição
    if (descTitle) descTitle.textContent = item.title;
    if (descText) descText.textContent = item.description;

    // Atualiza miniaturas
    renderThumbnails();

    // Controla visibilidade dos botões
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === mediaItems.length - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) selectMedia(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < mediaItems.length - 1) selectMedia(currentIndex + 1);
    });
  }

  // Navegação por teclado (apenas quando galeria está em foco)
  document.addEventListener('keydown', (e) => {
    // Não interfere em campos de texto ou vídeos
    if (e.target === video || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      selectMedia(currentIndex - 1);
    }
    if (e.key === 'ArrowRight' && currentIndex < mediaItems.length - 1) {
      e.preventDefault();
      selectMedia(currentIndex + 1);
    }
  });

  // Inicializa
  renderThumbnails();
  if (mediaItems.length > 0) {
    selectMedia(0);
  } else {
    if (placeholder) placeholder.style.display = 'flex';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
  }
})();
