/**
 * script.js — Mangalam HDPE Pipes
 * ─────────────────────────────────
 * 1.  Sticky header  (show on scroll past hero, hide on scroll back)
 * 2.  Mobile hamburger menu
 * 3.  Main image carousel  (prev/next arrows + thumbnail click)
 * 4.  Zoom-on-hover  (lens on image + zoomed preview box beside carousel)
 * 5.  Industries horizontal carousel  (left/right arrows)
 * 6.  Process tabs  (click to switch panel)
 * 7.  FAQ accordion  (click to expand / collapse)
 * 8.  Testimonials auto-scroll  (pauses on hover)
 */

(function () {
  'use strict';

  /* ============================================================
     1.  STICKY HEADER
     Appears after user scrolls past 60 % of the hero section height.
     Disappears when scrolling back toward the top.
     ============================================================ */
  var stickyHeader = document.getElementById('stickyHeader');
  var heroSection  = document.getElementById('hero');

  function handleStickyHeader() {
    if (!stickyHeader || !heroSection) return;
    var threshold = heroSection.offsetHeight * 0.6;
    if (window.scrollY > threshold) {
      stickyHeader.classList.add('visible');
    } else {
      stickyHeader.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleStickyHeader, { passive: true });


  /* ============================================================
     2.  MOBILE HAMBURGER MENU
     Toggles the mobile-nav open/closed on hamburger click.
     ============================================================ */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
  }


  /* ============================================================
     3.  MAIN IMAGE CAROUSEL
     ============================================================ */
  var track       = document.getElementById('carouselTrack');
  var slides      = track ? Array.from(track.querySelectorAll('.carousel__slide')) : [];
  var thumbs      = Array.from(document.querySelectorAll('.carousel__thumb'));
  var prevBtn     = document.getElementById('prevBtn');
  var nextBtn     = document.getElementById('nextBtn');
  var currentSlide = 0;

  /**
   * Moves carousel to the given slide index.
   * Wraps around (circular).
   * @param {number} index
   */
  function goToSlide(index) {
    if (!track || slides.length === 0) return;
    currentSlide = (index + slides.length) % slides.length;

    /* Slide the track */
    track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';

    /* Update active thumbnail highlight */
    thumbs.forEach(function (t, i) {
      t.classList.toggle('active', i === currentSlide);
    });

    /* Keep zoom preview in sync with new slide's image */
    updateZoomSrc();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(currentSlide - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(currentSlide + 1); });

  /* Thumbnail clicks */
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      goToSlide(parseInt(this.dataset.index, 10));
    });
  });

  /* Helper: get the <img> element of the currently visible slide */
  function getActiveImg() {
    if (!track) return null;
    var slide = track.querySelectorAll('.carousel__slide')[currentSlide];
    return slide ? slide.querySelector('.carousel__img') : null;
  }

  /* Helper: get the lens element of the currently visible slide */
  function getActiveLens() {
    if (!track) return null;
    var slide = track.querySelectorAll('.carousel__slide')[currentSlide];
    return slide ? slide.querySelector('.zoom-lens') : null;
  }


  /* ============================================================
     4.  ZOOM-ON-HOVER
     ──────────────────
     When the user moves the mouse over the carousel image:
       a) A semi-transparent lens rectangle follows the cursor on the image.
       b) A separate "Zoom Preview Box" (to the right) shows the
          magnified section of the image under the cursor.

     The preview box is hidden by default and revealed with a smooth
     CSS transition when the .active class is added.
     ============================================================ */
  var carousel        = document.getElementById('mainCarousel');
  var zoomArea        = document.getElementById('zoomArea');
  var zoomPreviewBox  = document.getElementById('zoomPreviewBox');
  var zoomViewport    = document.getElementById('zoomViewport');
  var zoomPreviewImg  = document.getElementById('zoomPreviewImg');

  var ZOOM_FACTOR = 2.8;   /* magnification level  */
  var LENS_W      = 110;   /* lens rectangle width  (px) */
  var LENS_H      = 110;   /* lens rectangle height (px) */

  /**
   * Updates the zoomPreviewImg src to match the active slide.
   * Called whenever the slide changes.
   */
  function updateZoomSrc() {
    var img = getActiveImg();
    if (img && zoomPreviewImg && img.src) {
      zoomPreviewImg.src = img.src;
    }
  }

  if (carousel && zoomPreviewBox && zoomPreviewImg && zoomViewport) {

    /* ── Mouse MOVE over the carousel ── */
    carousel.addEventListener('mousemove', function (e) {
      var img  = getActiveImg();
      var lens = getActiveLens();
      if (!img || !lens) return;

      var rect = img.getBoundingClientRect();

      /* Cursor position relative to the image element */
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      /* Ignore if cursor is outside the image bounds */
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        hideZoom(lens);
        return;
      }

      /* ── Show the lens ── */
      /* Clamp so lens stays inside the image */
      var lensLeft = Math.max(0, Math.min(x - LENS_W / 2, rect.width  - LENS_W));
      var lensTop  = Math.max(0, Math.min(y - LENS_H / 2, rect.height - LENS_H));

      lens.style.display = 'block';
      lens.style.left    = lensLeft + 'px';
      lens.style.top     = lensTop  + 'px';
      lens.style.width   = LENS_W   + 'px';
      lens.style.height  = LENS_H   + 'px';

      /* ── Position the zoomed image inside the preview box ──
         The preview viewport is a fixed-size clipping box.
         We need to move the enlarged image so that the point
         the cursor is hovering becomes centred in the viewport.
      */
      var vpW = zoomViewport.offsetWidth;
      var vpH = zoomViewport.offsetHeight;

      /* How large the image becomes after zooming */
      var zoomedW = rect.width  * ZOOM_FACTOR;
      var zoomedH = rect.height * ZOOM_FACTOR;

      /* Where on the zoomed image the cursor lands */
      var zoomedX = (x / rect.width)  * zoomedW;
      var zoomedY = (y / rect.height) * zoomedH;

      /* Shift so cursor point is centred in the viewport */
      var imgLeft = vpW / 2 - zoomedX;
      var imgTop  = vpH / 2 - zoomedY;

      /* Clamp so we don't show blank space outside the image */
      imgLeft = Math.min(0, Math.max(imgLeft, vpW - zoomedW));
      imgTop  = Math.min(0, Math.max(imgTop,  vpH - zoomedH));

      /* Apply to the preview image */
      zoomPreviewImg.src          = img.src;
      zoomPreviewImg.style.width  = zoomedW + 'px';
      zoomPreviewImg.style.height = zoomedH + 'px';
      zoomPreviewImg.style.left   = imgLeft  + 'px';
      zoomPreviewImg.style.top    = imgTop   + 'px';

      /* ── Reveal the preview box ── */
      zoomPreviewBox.classList.add('active');

      /* Add a class to the zoom-area so the hint label fades */
      if (zoomArea) zoomArea.classList.add('zooming');
    });

    /* ── Mouse LEAVE the carousel ── */
    carousel.addEventListener('mouseleave', function () {
      var lens = getActiveLens();
      hideZoom(lens);
    });

    /**
     * Hides the lens and the preview box.
     * @param {HTMLElement|null} lens
     */
    function hideZoom(lens) {
      /* Hide every lens (safety — only one should be visible) */
      if (track) {
        track.querySelectorAll('.zoom-lens').forEach(function (l) {
          l.style.display = 'none';
        });
      }
      zoomPreviewBox.classList.remove('active');
      if (zoomArea) zoomArea.classList.remove('zooming');
    }
  }


  /* ============================================================
     5.  INDUSTRIES HORIZONTAL CAROUSEL
     ============================================================ */
  var indTrack = document.getElementById('industriesTrack');
  var indPrev  = document.getElementById('indPrev');
  var indNext  = document.getElementById('indNext');
  var indOffset = 0;
  var IND_STEP  = 300; /* px per click */

  function indMaxOffset() {
    if (!indTrack) return 0;
    var wrapper = document.getElementById('industriesCarousel');
    var total   = indTrack.querySelectorAll('.industry-card').length * IND_STEP;
    var visible = wrapper ? wrapper.offsetWidth : 0;
    return Math.max(0, total - visible);
  }

  if (indPrev) {
    indPrev.addEventListener('click', function () {
      indOffset = Math.max(0, indOffset - IND_STEP);
      indTrack.style.transform = 'translateX(-' + indOffset + 'px)';
    });
  }
  if (indNext) {
    indNext.addEventListener('click', function () {
      indOffset = Math.min(indMaxOffset(), indOffset + IND_STEP);
      indTrack.style.transform = 'translateX(-' + indOffset + 'px)';
    });
  }


  /* ============================================================
     6.  PROCESS TABS
     Clicking a tab button hides all panels and shows the matching one.
     ============================================================ */
  var processTabs   = document.querySelectorAll('.process-tab');
  var processPanels = document.querySelectorAll('.process-panel');

  processTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = 'tab-' + this.dataset.tab;

      /* Update button states */
      processTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      /* Update panel visibility */
      processPanels.forEach(function (panel) {
        panel.classList.toggle('active', panel.id === targetId);
      });
    });
  });


  /* ============================================================
     7.  FAQ ACCORDION
     Only one item open at a time.
     ============================================================ */
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var btn  = item.querySelector('.faq-question');
    var icon = item.querySelector('.faq-icon');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      /* Close all */
      faqItems.forEach(function (fi) {
        fi.classList.remove('open');
        var q = fi.querySelector('.faq-question');
        var ic = fi.querySelector('.faq-icon');
        if (q)  q.setAttribute('aria-expanded', 'false');
        if (ic) { ic.classList.remove('fa-chevron-up'); ic.classList.add('fa-chevron-down'); }
      });

      /* Open clicked one (if it was closed) */
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
      }
    });
  });


  /* ============================================================
     8.  TESTIMONIALS AUTO-SCROLL
     Continuously scrolls left at a slow speed.
     Pauses when the user hovers over the track.
     ============================================================ */
  var testimonialsTrack = document.getElementById('testimonialsTrack');

  if (testimonialsTrack) {
    var scrollPos = 0;
    var paused    = false;
    var SPEED     = 0.6; /* px per animation frame */

    function autoScroll() {
      if (!paused) {
        scrollPos += SPEED;
        var maxScroll = testimonialsTrack.scrollWidth - testimonialsTrack.parentElement.offsetWidth;
        if (scrollPos >= maxScroll) scrollPos = 0; /* seamless loop */
        testimonialsTrack.style.transform = 'translateX(-' + scrollPos + 'px)';
      }
      requestAnimationFrame(autoScroll);
    }

    testimonialsTrack.addEventListener('mouseenter', function () { paused = true;  });
    testimonialsTrack.addEventListener('mouseleave', function () { paused = false; });

    autoScroll();
  }


  /* ============================================================
     INITIALISE
     ============================================================ */
  goToSlide(0);   /* ensure correct starting position */
  updateZoomSrc(); /* pre-load zoom preview src */

})();
