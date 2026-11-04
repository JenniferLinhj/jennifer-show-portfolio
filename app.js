(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smooth = value => {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  };
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const main = $('main');
  const header = $('.sitebar');
  const intro = $('#intro');
  const cinema = $('#cinema');
  const viewer = $('#viewer');
  const track = $('#workTrack');
  const closeButton = $('#closeViewer');
  const prevButton = $('#prevWork');
  const nextButton = $('#nextWork');
  const counter = $('#workCounter');
  const rollLabel = $('#rollLabel');
  const activeCanister = $('#activeCanister');
  const workWindow = $('.work-window');
  const viewerHint = $('#viewerHint');
  const hintTimers = new WeakMap();
  const introLayers = {
    corridor: $('.corridor-bg'),
    leftPoster: $('.poster-left'),
    rightPoster: $('.poster-right'),
    ticket: $('.opening-ticket'),
    door: $('.corridor-door'),
    glimpse: $('.cinema-glimpse'),
    curtainPair: $('.curtain-pair'),
    leftCurtain: $('.curtain-left'),
    rightCurtain: $('.curtain-right')
  };

  const fallbackLibrary = {
    creative: {
      number: '01', label: '创意设计', english: 'CREATIVE DESIGN',
      works: [
        { title: '梅梅', type: 'IP 设计' },
        { title: 'Play Play剧场', type: '空间设计' }
      ]
    },
    audiovisual: {
      number: '02', label: '视听创作', english: 'AUDIOVISUAL',
      works: [
        { title: '上理筑迹', type: '微纪录片', video: true },
        { title: '别苦苦干，让库库干', type: 'AI 编码创意动画' },
        { title: '金色征橙', type: 'AIGC 视觉短片' },
        { title: '好吃就是豪士，豪士就是好吃', type: '影视广告' },
        { title: '看见（HBN概念短片）', type: '概念短片' },
        { title: '暴富教程', type: '影像作品' }
      ]
    },
    copy: {
      number: '03', label: '文案策划', english: 'COPY & STRATEGY',
      works: [
        { title: '光的温度', type: '文案策划' },
        { title: '京万红修复膏广告文案', type: '品牌文案' },
        { title: '妙可蓝多·成艺术', type: '品牌文案' },
        { title: '毓婷品牌营销策划', type: '营销策划' },
        { title: '七里坪红色文旅剧本杀策划', type: '文旅策划' }
      ]
    },
    interactive: {
      number: '04', label: '交互游戏', english: 'INTERACTIVE',
      works: [
        { title: '和潮趣过一天', type: 'H5 互动', url: 'sanfu.html' }
      ]
    }
  };

  const suppliedData = window.PORTFOLIO_DATA || {};
  const library = Object.fromEntries(Object.entries(fallbackLibrary).map(([key, fallback]) => {
    const supplied = suppliedData[key];
    if (Array.isArray(supplied)) return [key, { ...fallback, works: supplied }];
    return [key, {
      ...fallback,
      ...(supplied && typeof supplied === 'object' ? supplied : {}),
      works: Array.isArray(supplied?.works) ? supplied.works : fallback.works
    }];
  }));

  function showHint(element, text, duration = 1050) {
    if (!element) return;
    clearTimeout(hintTimers.get(element));
    if (text) element.textContent = text;
    element.classList.add('visible');
    hintTimers.set(element, setTimeout(() => element.classList.remove('visible'), duration));
  }

  const entranceStart = performance.now();
  let scrollFrame = 0;
  function updateEntrance() {
    scrollFrame = 0;
    const travel = Math.max(1, intro.offsetHeight - window.innerHeight);
    const p = clamp(-intro.getBoundingClientRect().top / travel);
    const ticketRise = reduceMotion.matches ? 1 : smooth((performance.now() - entranceStart - 100) / 1500);
    const ticketExit = smooth((p - 0.025) / 0.24);
    const walk = smooth(p / 0.80);
    const portal = smooth((p - 0.80) / 0.16);
    const curtainOpen = smooth((p - 0.84) / 0.16);

    intro.style.setProperty('--entrance-progress', p.toFixed(4));
    introLayers.corridor.style.transform = `scale(${(1 + 1.15 * walk * walk).toFixed(4)})`;
    introLayers.leftPoster.style.transform = `translate3d(${-24 * walk}vw,${-7 * walk}vh,0) rotate(-7deg) scale(${1 + 0.65 * walk})`;
    introLayers.rightPoster.style.transform = `translate3d(${24 * walk}vw,${-7 * walk}vh,0) rotate(7deg) scale(${1 + 0.65 * walk})`;
    introLayers.ticket.style.transform = `translate(-50%,${(1 - ticketRise) * 105 + ticketExit * 95}vh) rotate(${lerp(-2, 3, ticketExit)}deg)`;
    introLayers.ticket.style.opacity = String(1 - smooth((p - 0.15) / 0.13));
    introLayers.door.style.opacity = String(smooth((p - 0.80) / 0.045) * (1 - smooth((p - 0.94) / 0.04)));
    introLayers.door.style.transform = `translate(-50%,-50%) scale(${lerp(1.8, 5.5, portal)})`;
    introLayers.glimpse.style.opacity = String(smooth((p - 0.75) / 0.12));
    introLayers.curtainPair.style.opacity = String(smooth((p - 0.73) / 0.06));
    introLayers.leftCurtain.style.transform = `translateX(${-108 * curtainOpen}%)`;
    introLayers.rightCurtain.style.transform = `translateX(${108 * curtainOpen}%) scaleX(-1)`;
    if (p > 0.04) $('#introHint').classList.remove('visible');
    if (ticketRise < 1) scrollFrame = requestAnimationFrame(updateEntrance);
  }

  function requestEntranceUpdate() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateEntrance);
  }
  window.addEventListener('scroll', requestEntranceUpdate, { passive: true });
  window.addEventListener('resize', requestEntranceUpdate, { passive: true });
  window.addEventListener('pageshow', requestEntranceUpdate);
  updateEntrance();
  setTimeout(() => {
    if (window.scrollY < window.innerHeight * 0.12) showHint($('#introHint'), null, 1250);
  }, 1800);

  let cinemaHintShown = false;
  if ('IntersectionObserver' in window) {
    const cinemaObserver = new IntersectionObserver(entries => {
      if (!cinemaHintShown && entries.some(entry => entry.isIntersecting)) {
        cinemaHintShown = true;
        showHint($('#cinemaHint'), null, 1100);
      }
    }, { threshold: 0.42 });
    cinemaObserver.observe(cinema);
  }

  let activeKey = 'creative';
  let activeIndex = 0;
  let returnFocus = null;
  let closeTimer = 0;
  let spinTimer = 0;
  let openingFrame = 0;

  function textElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  const imageLightbox = document.createElement('dialog');
  imageLightbox.className = 'image-lightbox';
  imageLightbox.setAttribute('aria-label', '放大查看作品页面');
  const closeImageButton = textElement('button', 'lightbox-close', '×');
  closeImageButton.type = 'button';
  closeImageButton.setAttribute('aria-label', '关闭放大图片');
  const lightboxImage = document.createElement('img');
  lightboxImage.decoding = 'async';
  imageLightbox.append(closeImageButton, lightboxImage);
  document.body.append(imageLightbox);
  let returnImageFocus = null;

  function closeImage() {
    if (!imageLightbox.open) return;
    imageLightbox.close();
    lightboxImage.removeAttribute('src');
    if (returnImageFocus instanceof HTMLElement && returnImageFocus.isConnected) returnImageFocus.focus({ preventScroll: true });
  }

  function openImage(page, trigger) {
    returnImageFocus = trigger;
    lightboxImage.src = page.src;
    lightboxImage.alt = page.alt || '作品页面';
    imageLightbox.setAttribute('aria-label', lightboxImage.alt);
    imageLightbox.scrollTop = 0;
    imageLightbox.showModal();
    closeImageButton.focus({ preventScroll: true });
  }
  closeImageButton.addEventListener('click', closeImage);
  imageLightbox.addEventListener('cancel', event => {
    event.preventDefault();
    closeImage();
  });
  imageLightbox.addEventListener('click', event => {
    if (event.target === imageLightbox || event.target === lightboxImage) closeImage();
  });

  function externalLink(label, className, href) {
    const link = textElement('a', className, label);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function buildCard(work, index, category, key) {
    const article = document.createElement('article');
    article.className = 'work-card';
    article.tabIndex = 0;
    article.setAttribute('aria-label', `${work.title}，${work.type || category.label}`);
    const pages = Array.isArray(work.pages) ? work.pages.filter(page => page?.src) : [];

    const cover = document.createElement('div');
    cover.className = 'cover-art real-cover';
    const image = document.createElement('img');
    image.src = work.cover || `assets__cover-${key}.webp`;
    image.alt = `${work.title}作品封面`;
    image.loading = index === 0 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    cover.append(image);
    article.append(cover);

    const info = document.createElement('div');
    info.className = 'work-info';
    info.append(
      textElement('p', 'kicker', `ROLL ${category.number} / FRAME ${String(index + 1).padStart(2, '0')}`),
      textElement('h2', work.title.length > 18 ? 'long-title' : '', work.title),
      textElement('p', 'work-type', work.type || category.label)
    );
    if (work.description) info.append(textElement('p', 'work-description', work.description));
    if (work.videoUrl) info.append(externalLink('打开视频 ↗', 'video-link', work.videoUrl));
    if (work.url) info.append(externalLink('打开交互体验 ↗', 'experience-link', work.url));
    if (!pages.length && !work.videoUrl && !work.url) info.append(textElement('p', 'source-pending', '作品原件待接入'));
    article.append(info);

    if (pages.length) {
      const gallery = document.createElement('div');
      gallery.className = 'page-gallery';
      gallery.setAttribute('aria-label', `${work.title}完整方案，${pages.length}页`);
      pages.forEach((page, pageIndex) => {
        const figure = document.createElement('figure');
        const zoom = document.createElement('button');
        zoom.type = 'button';
        zoom.className = 'page-zoom';
        zoom.setAttribute('aria-label', `放大查看${page.alt || `${work.title}第${pageIndex + 1}页`}`);
        const pageImage = document.createElement('img');
        pageImage.src = page.src;
        pageImage.alt = page.alt || `${work.title} · 第${pageIndex + 1}页`;
        pageImage.loading = 'lazy';
        pageImage.decoding = 'async';
        if (Number(page.width) > 0) pageImage.width = Number(page.width);
        if (Number(page.height) > 0) pageImage.height = Number(page.height);
        zoom.append(pageImage);
        zoom.addEventListener('click', () => openImage({ ...page, alt: pageImage.alt }, zoom));
        figure.append(zoom, textElement('figcaption', '', `${pageIndex + 1} / ${pages.length}`));
        gallery.append(figure);
      });
      article.append(gallery);
    }
    return article;
  }

  function spinReel() {
    clearTimeout(spinTimer);
    viewer.classList.remove('spinning');
    void viewer.offsetWidth;
    viewer.classList.add('spinning');
    spinTimer = setTimeout(() => viewer.classList.remove('spinning'), 1050);
  }

  function updateWork(shouldResetScroll = true) {
    const category = library[activeKey];
    track.style.transform = `translate3d(${-activeIndex * 100}%,0,0)`;
    track.style.setProperty('--frame-index', String(activeIndex));
    counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(category.works.length).padStart(2, '0')}`;
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === category.works.length - 1;
    $$('.work-card', track).forEach((card, index) => {
      const current = index === activeIndex;
      card.classList.toggle('is-current', current);
      card.setAttribute('aria-hidden', String(!current));
      card.inert = !current;
      card.tabIndex = current ? 0 : -1;
      if (current && shouldResetScroll) card.scrollTop = 0;
    });
  }

  function openViewer(key, trigger) {
    const category = library[key];
    if (!category) return;
    clearTimeout(closeTimer);
    cancelAnimationFrame(openingFrame);
    activeKey = key;
    activeIndex = 0;
    returnFocus = trigger || document.activeElement;
    track.replaceChildren(...category.works.map((work, index) => buildCard(work, index, category, key)));
    rollLabel.textContent = `ROLL ${category.number} / ${category.english}`;
    viewer.setAttribute('aria-label', `${category.label}作品胶片`);
    activeCanister.src = `assets__canister-${key}.webp`;
    viewer.hidden = false;
    document.body.classList.add('locked', 'viewer-open');
    main.inert = true;
    header.inert = true;
    updateWork();
    closeButton.focus({ preventScroll: true });
    openingFrame = requestAnimationFrame(() => {
      viewer.classList.add('open');
      spinReel();
    });
    setTimeout(() => {
      if (!viewer.hidden && activeKey === key) showHint(viewerHint, '左右切换 · 在当前画格向下阅读', 1050);
    }, reduceMotion.matches ? 100 : 750);
  }

  function closeViewer() {
    if (viewer.hidden) return;
    if (imageLightbox.open) closeImage();
    cancelAnimationFrame(openingFrame);
    clearTimeout(spinTimer);
    clearTimeout(hintTimers.get(viewerHint));
    viewer.classList.remove('open', 'spinning');
    viewerHint.classList.remove('visible');
    main.inert = false;
    header.inert = false;
    document.body.classList.remove('locked', 'viewer-open');
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    closeTimer = setTimeout(() => {
      viewer.hidden = true;
    }, reduceMotion.matches ? 0 : 420);
  }

  function changeWork(step) {
    if (viewer.hidden || !viewer.classList.contains('open')) return;
    const nextIndex = clamp(activeIndex + step, 0, library[activeKey].works.length - 1);
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;
    updateWork();
    spinReel();
  }

  $$('.roll[data-roll]').forEach(button => {
    button.addEventListener('click', () => openViewer(button.dataset.roll, button));
  });
  closeButton.addEventListener('click', closeViewer);
  prevButton.addEventListener('click', () => changeWork(-1));
  nextButton.addEventListener('click', () => changeWork(1));

  document.addEventListener('keydown', event => {
    if (imageLightbox.open) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeImage();
      }
      return;
    }
    if (viewer.hidden || !viewer.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeViewer();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changeWork(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Tab') {
      const focusable = $$('button:not([disabled]), a[href], [tabindex="0"]', viewer)
        .filter(element => !element.closest('[inert]') && element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !viewer.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !viewer.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  let swipeStart = null;
  workWindow.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || event.target.closest('a,button')) return;
    swipeStart = { x: event.clientX, y: event.clientY, time: performance.now() };
  }, { passive: true });
  workWindow.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    const quick = performance.now() - swipeStart.time < 900;
    swipeStart = null;
    if (quick && Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) changeWork(dx < 0 ? 1 : -1);
  }, { passive: true });
  workWindow.addEventListener('pointercancel', () => { swipeStart = null; }, { passive: true });
})();
