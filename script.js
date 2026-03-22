/**
 * script.js — Mangalam HDPE Pipes
 * Handles:
 *  1. Sticky header (show/hide on scroll)
 *  2. Mobile hamburger menu
 *  3. Image carousel with prev/next + thumbnail navigation
 *  4. Carousel zoom-on-hover (magnifying glass effect)
 *  5. Industries horizontal carousel
 *  6. Process tabs switching
 *  7. FAQ accordion
 *  8. Testimonials auto-scroll
 */

(function () {
  'use strict';

  /* ============================================================
     1. STICKY HEADER
     Shows when user scrolls past the hero's first fold height.
     Hides when scrolling back to top.
     ============================================================ */
  const stickyHeader = document.getElementById('stickyHeader');
  const mainNavbar   = document.getElementById('mainNavbar');

  let lastScrollY = 0;

  function handleStickyHeader() {
    const heroHeight = document.getElementById('hero').offsetHeight;
    const scrollY    = window.scrollY;

    if (scrollY > heroHeight * 0.6) {
      // Past the first fold → show sticky header
      stickyHeader.classList.add('visible');
    } else {
      // Back near the top → hide sticky header
      stickyHeader.classList.remove('visible');
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleStickyHeader, { passive: true });


  /* ============================================================
     2. HAMBURGER / MOBILE MENU
     ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
  }


  /* ============================================================
     3. MAIN IMAGE CAROUSEL (prev / next / thumbnail)
     ============================================================ */
  const track      = document.getElementById('carouselTrack');
  const slides     = track ? Array.from(track.querySelectorAll('.carousel__slide')) : [];
  const thumbs     = Array.from(document.querySelectorAll('.carousel__thumb'));
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');

  let currentSlide = 0;

  /**
   * Move carousel to a specific slide index.
   * @param {number} index - target slide index
   */
  function goToSlide(index) {
    if (!track || slides.length === 0) return;

    // Clamp index
    currentSlide = (index + slides.length) % slides.length;

    // Slide the track
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update active thumbnail
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === currentSlide);
    });

    // Update zoom preview source for the new active slide
    updateZoomPreviewSrc();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Click on thumbnails
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', function () {
      goToSlide(parseInt(this.dataset.index, 10));
    });
  });


  /* ============================================================
     4. ZOOM-ON-HOVER  (magnifying glass effect)
     On mouse move over the active slide image, show a zoom lens
     and a zoomed preview panel to the right of the carousel.
     ============================================================ */
  const carousel      = document.getElementById('mainCarousel');
  const zoomPreview   = document.getElementById('zoomPreview');
  const zoomPreviewImg = document.getElementById('zoomPreviewImg');
  const ZOOM_FACTOR   = 2.5;  // how much to zoom in
  const LENS_W        = 120;  // lens width  (px)
  const LENS_H        = 120;  // lens height (px)

  /**
   * Get the image element of the currently active slide.
   */
  function getActiveImg() {
    if (!track) return null;
    return track.querySelectorAll('.carousel__slide')[currentSlide]?.querySelector('.carousel__img');
  }

  /**
   * Get the zoom lens element of the currently active slide.
   */
  function getActiveLens() {
    if (!track) return null;
    return track.querySelectorAll('.carousel__slide')[currentSlide]?.querySelector('.zoom-lens');
  }

  /**
   * Sync the zoom preview's src with the active slide image src.
   */
  function updateZoomPreviewSrc() {
    const img = getActiveImg();
    if (img && zoomPreviewImg) {
      zoomPreviewImg.src = img.src;
      // Reset the background-size for the zoomed image
      const previewW = zoomPreview ? zoomPreview.offsetWidth : 300;
      const previewH = zoomPreview ? zoomPreview.offsetHeight : 300;
      zoomPreviewImg.style.width  = img.offsetWidth  * ZOOM_FACTOR + 'px';
      zoomPreviewImg.style.height = img.offsetHeight * ZOOM_FACTOR + 'px';
    }
  }

  if (carousel) {
    carousel.addEventListener('mousemove', function (e) {
      const img  = getActiveImg();
      const lens = getActiveLens();
      if (!img || !lens) return;

      const rect = img.getBoundingClientRect();

      // Mouse position relative to the image
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      // Clamp so lens doesn't go outside image
      x = Math.max(LENS_W / 2, Math.min(x, rect.width  - LENS_W / 2));
      y = Math.max(LENS_H / 2, Math.min(y, rect.height - LENS_H / 2));

      // Position the lens
      lens.style.display = 'block';
      lens.style.left    = (x - LENS_W / 2) + 'px';
      lens.style.top     = (y - LENS_H / 2) + 'px';
      lens.style.width   = LENS_W + 'px';
      lens.style.height  = LENS_H + 'px';

      // Calculate what portion of the original image to show in the preview
      const ratioX = x / rect.width;
      const ratioY = y / rect.height;

      const previewW = zoomPreview.offsetWidth;
      const previewH = zoomPreview.offsetHeight;

      // The zoomed image dimensions
      const zoomedW = rect.width  * ZOOM_FACTOR;
      const zoomedH = rect.height * ZOOM_FACTOR;

      // Offset so the hovered point is centered in the preview
      const offsetX = ratioX * zoomedW - previewW / 2;
      const offsetY = ratioY * zoomedH - previewH / 2;

      // Sync preview image
      if (zoomPreviewImg) {
        zoomPreviewImg.src    = img.src;
        zoomPreviewImg.style.width    = zoomedW + 'px';
        zoomPreviewImg.style.height   = zoomedH + 'px';
        zoomPreviewImg.style.position = 'absolute';
        zoomPreviewImg.style.left     = -offsetX + 'px';
        zoomPreviewImg.style.top      = -offsetY + 'px';
        zoomPreviewImg.style.maxWidth = 'none';
      }

      // Show the preview panel
      zoomPreview.classList.add('active');
    });

    carousel.addEventListener('mouseleave', function () {
      const lens = getActiveLens();
      if (lens) lens.style.display = 'none';

      // Hide all lenses
      track.querySelectorAll('.zoom-lens').forEach(l => { l.style.display = 'none'; });

      if (zoomPreview) zoomPreview.classList.remove('active');
    });
  }


  /* ============================================================
     5. INDUSTRIES CAROUSEL (horizontal scroll with arrows)
     ============================================================ */
  const indTrack  = document.getElementById('industriesTrack');
  const indPrev   = document.getElementById('indPrev');
  const indNext   = document.getElementById('indNext');

  let indOffset = 0;
  const IND_CARD_W = 300; // approximate card + gap width

  function getIndMaxOffset() {
    if (!indTrack) return 0;
    const cards    = indTrack.querySelectorAll('.industry-card');
    const wrapper  = document.getElementById('industriesCarousel');
    const visible  = wrapper ? wrapper.offsetWidth : 0;
    const total    = cards.length * IND_CARD_W;
    return Math.max(0, total - visible);
  }

  if (indPrev) {
    indPrev.addEventListener('click', () => {
      indOffset = Math.max(0, indOffset - IND_CARD_W);
      indTrack.style.transform = `translateX(-${indOffset}px)`;
    });
  }
  if (indNext) {
    indNext.addEventListener('click', () => {
      indOffset = Math.min(getIndMaxOffset(), indOffset + IND_CARD_W);
      indTrack.style.transform = `translateX(-${indOffset}px)`;
    });
  }


  /* ============================================================
     6. PROCESS TABS
     ============================================================ */
  const processTabs   = document.querySelectorAll('.process-tab');
  const processPanels = document.querySelectorAll('.process-panel');

  processTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const targetId = 'tab-' + this.dataset.tab;

      // Update tab active state
      processTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      // Show matching panel
      processPanels.forEach(function (panel) {
        panel.classList.toggle('active', panel.id === targetId);
      });
    });
  });


  /* ============================================================
     7. FAQ ACCORDION
     ============================================================ */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn  = item.querySelector('.faq-question');
    const icon = item.querySelector('.faq-icon');

    btn.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Close all items first
      faqItems.forEach(function (fi) {
        fi.classList.remove('open');
        fi.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        const ic = fi.querySelector('.faq-icon');
        ic.classList.remove('fa-chevron-up');
        ic.classList.add('fa-chevron-down');
      });

      // If it wasn't open, open it now
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      }
    });
  });


  /* ============================================================
     8. TESTIMONIALS AUTO-SCROLL
     Continuously scrolls left; pauses on hover.
     ============================================================ */
  const testimonialsTrack = document.getElementById('testimonialsTrack');

  if (testimonialsTrack) {
    let scrollPos   = 0;
    let paused      = false;
    const SPEED     = 0.5; // pixels per frame

    function autoScrollTestimonials() {
      if (!paused) {
        scrollPos += SPEED;
        const maxScroll = testimonialsTrack.scrollWidth - testimonialsTrack.parentElement.offsetWidth;

        if (scrollPos >= maxScroll) {
          // Reset to beginning for seamless loop
          scrollPos = 0;
        }
        testimonialsTrack.style.transform = `translateX(-${scrollPos}px)`;
      }
      requestAnimationFrame(autoScrollTestimonials);
    }

    testimonialsTrack.addEventListener('mouseenter', () => { paused = true; });
    testimonialsTrack.addEventListener('mouseleave', () => { paused = false; });

    autoScrollTestimonials();
  }


  /* ============================================================
     INIT
     ============================================================ */
  // Ensure correct initial slide position
  goToSlide(0);

})();