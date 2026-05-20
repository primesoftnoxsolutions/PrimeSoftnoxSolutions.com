// Initialize Minimal Modal
const initMinimalModal = () => {
  const modal = document.getElementById('minimalModal');
  const closeBtn = document.getElementById('minimalModalClose');
  const timerLabel = document.getElementById('minimalModalTimer');
  if (!modal) return;

  let autoCloseTimer = null;
  let countdownInterval = null;
  let remainingSeconds = 10;

  const renderTimer = () => {
    if (timerLabel) {
      timerLabel.textContent = `${remainingSeconds}s`;
    }
  };

  const closeModal = () => {
    if (modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    document.body.classList.remove('minimal-modal-open');
    if (autoCloseTimer) {
      window.clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    if (countdownInterval) {
      window.clearInterval(countdownInterval);
      countdownInterval = null;
    }
  };

  // Always show modal on page load/refresh
  modal.classList.remove('hidden');
  document.body.classList.add('minimal-modal-open');
  renderTimer();
  autoCloseTimer = window.setTimeout(closeModal, 10000);
  countdownInterval = window.setInterval(() => {
    if (remainingSeconds <= 0) return;
    remainingSeconds -= 1;
    renderTimer();
  }, 1000);

  // Close on close icon click
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
};

// Initialize modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMinimalModal);
} else {
  initMinimalModal();
}

const setupContentProtection = () => {
  const isEditableTarget = (target) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest('input, textarea, [contenteditable="true"], [contenteditable=""]'));
  };

  document.documentElement.classList.add('no-copy-protection');

  const disableNativeDrag = (root) => {
    if (!(root instanceof Element || root instanceof Document)) return;
    root.querySelectorAll('img, a').forEach((node) => node.setAttribute('draggable', 'false'));
  };

  disableNativeDrag(document);

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches('img, a')) node.setAttribute('draggable', 'false');
        disableNativeDrag(node);
      });
    });
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  ['copy', 'cut', 'contextmenu', 'dragstart', 'dragover', 'drop', 'selectstart'].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (isEditableTarget(event.target) && eventName !== 'dragstart' && eventName !== 'dragover' && eventName !== 'drop') {
        return;
      }
      event.preventDefault();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (isEditableTarget(event.target)) return;

    const key = event.key.toLowerCase();
    const withMod = event.ctrlKey || event.metaKey;
    const blockedSimpleCombos = ['a', 'c', 'x', 's', 'p', 'u'];
    const blockedDevtoolCombos = event.shiftKey && ['i', 'j', 'c'].includes(key);

    if ((withMod && blockedSimpleCombos.includes(key)) || (withMod && blockedDevtoolCombos) || key === 'f12') {
      event.preventDefault();
    }
  });
};

setupContentProtection();


const header = document.getElementById('siteHeader');
let lastY = window.scrollY;
let ticking = false;
let moveHeaderY = null;

const setupWebsiteLoader = () => {
  if (document.getElementById('siteLoader')) return;

  const style = document.createElement('style');
  style.id = 'siteLoaderStyles';
  style.textContent = `
    #siteLoader {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: grid;
      place-items: center;
      background: #000;
      transition: opacity .35s ease, visibility .35s ease;
      overflow: hidden;
    }
    #siteLoader.is-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .site-loader-inner {
      position: relative;
      z-index: 1;
      display: grid;
      justify-items: center;
      gap: 14px;
    }
    .site-loader-logo {
      width: clamp(170px, 22vw, 280px);
      height: auto;
      object-fit: contain;
      filter: drop-shadow(0 8px 18px rgba(0,0,0,.35));
      opacity: .95;
    }
    .site-loader-dots {
      display: flex;
      flex-direction: row;
      gap: 6px;
    }
    .site-loader-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #84cc16;
      animation: siteLoaderBounce 1s infinite;
      box-shadow: 0 0 10px rgba(132, 204, 22, .35);
    }
    .site-loader-dot:nth-child(1),
    .site-loader-dot:nth-child(3) { animation-delay: .7s; }
    .site-loader-dot:nth-child(2) { animation-delay: .3s; }
    @keyframes siteLoaderBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }
  `;
  document.head.appendChild(style);

  const loader = document.createElement('div');
  loader.id = 'siteLoader';
  loader.setAttribute('aria-hidden', 'true');
  const logoSrc = window.location.pathname.includes('/pages/')
    ? '../public/Logo Prime Softnox Solutions.png'
    : './public/Logo Prime Softnox Solutions.png';
  loader.innerHTML = `
    <div class="site-loader-inner">
      <img class="site-loader-logo" src="${logoSrc}" alt="Prime Softnox Solutions logo" decoding="async" fetchpriority="high" />
      <div class="site-loader-dots">
        <div class="site-loader-dot"></div>
        <div class="site-loader-dot"></div>
        <div class="site-loader-dot"></div>
      </div>
    </div>
  `;
  document.body.appendChild(loader);

  const hideLoader = () => {
    if (!loader || loader.classList.contains('is-hidden')) return;
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), 420);
  };

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
    window.setTimeout(hideLoader, 6000);
  }
};

setupWebsiteLoader();

const setupNavFlipLabels = () => {
  const links = document.querySelectorAll('#siteHeader .nav a, #siteHeader nav.glass a');
  links.forEach((link) => {
    const label = (link.textContent || '').trim();
    if (label && !link.dataset.label) {
      link.dataset.label = label;
    }
  });
};

setupNavFlipLabels();

if (header && window.gsap) {
  moveHeaderY = gsap.quickTo(header, 'y', {
    duration: 0.5,
    ease: 'power3.out',
    overwrite: 'auto'
  });

  gsap.from('#siteHeader .glass, #siteHeader .nav', {
    y: -40,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out'
  });
}

function handleHeader() {
  if (!header || !moveHeaderY) {
    ticking = false;
    return;
  }

  const currentY = window.scrollY;
  const delta = currentY - lastY;
  const nearTop = currentY < 18;

  if (nearTop) {
    moveHeaderY(0);
  } else if (delta > 10) {
    moveHeaderY(-120);
  } else if (delta < -10) {
    moveHeaderY(0);
  }

  lastY = currentY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(handleHeader);
    ticking = true;
  }
}, { passive: true });

const setupAdaptiveLogos = () => {
  const logos = [...document.querySelectorAll('.adaptive-logo')];
  if (!logos.length) return;

  const themeSections = [...document.querySelectorAll('[data-nav-theme]')];
  if (!themeSections.length) return;

  const swapLogoSourceSmooth = (logo, nextSrc) => {
    if (!nextSrc || logo.getAttribute('src') === nextSrc) return;

    const token = String(Date.now()) + Math.random().toString(16).slice(2);
    logo.dataset.swapToken = token;
    logo.classList.add('is-swapping');

    const revealIfCurrent = () => {
      if (logo.dataset.swapToken !== token) return;
      logo.classList.remove('is-swapping');
    };

    const probe = new Image();
    probe.onload = () => {
      if (logo.dataset.swapToken !== token) return;
      logo.setAttribute('src', nextSrc);
      requestAnimationFrame(revealIfCurrent);
    };
    probe.onerror = () => {
      if (logo.dataset.swapToken !== token) return;
      logo.setAttribute('src', nextSrc);
      requestAnimationFrame(revealIfCurrent);
    };
    probe.src = nextSrc;
  };

  const setLogosTheme = (theme) => {
    logos.forEach((logo) => {
      const darkSrc = logo.dataset.logoDark;
      const lightSrc = logo.dataset.logoLight;

      if (darkSrc && lightSrc) {
        const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
        swapLogoSourceSmooth(logo, nextSrc);
        logo.classList.remove('is-inverted');
        return;
      }

      logo.classList.toggle('is-inverted', theme === 'dark');
    });
  };

  const getCurrentTheme = () => {
    const probeY = header ? header.getBoundingClientRect().bottom + 8 : 72;
    const probeX = window.innerWidth / 2;
    const stack = document.elementsFromPoint(
      probeX,
      Math.max(0, Math.min(window.innerHeight - 1, probeY))
    );
    const themed = stack.find((node) => node && node.dataset && node.dataset.navTheme);
    return (themed && themed.dataset && themed.dataset.navTheme) || 'dark';
  };

  const onScrollTheme = () => setLogosTheme(getCurrentTheme());
  onScrollTheme();
  window.addEventListener('scroll', onScrollTheme, { passive: true });
  window.addEventListener('resize', onScrollTheme);
};

setupAdaptiveLogos();

// Hero section animations
if (window.gsap) {
  gsap.from('main section > div > *', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.06,
    ease: 'power2.out',
    clearProps: 'all'
  });
}
