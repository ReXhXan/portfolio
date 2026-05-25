import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");

const FRAME_COUNT_1 = 240;
const FRAME_COUNT_2 = 230; // Dropped the last frame (231) because it was distorted
const TOTAL_FRAMES = FRAME_COUNT_1 + FRAME_COUNT_2;
const images = [];

// Create a state object to track the current rendering state
const seqState = {
  frame: 0
};

let currentRenderedFrame = -1;

// To handle rendering in requestAnimationFrame
let renderRequested = false;

// Format the frame number to match the image sequence name
// Adjust the path and file format as needed.
const getFrameUrl = (index) => {
  if (index < FRAME_COUNT_1) {
    const paddedIndex = String(index + 1).padStart(4, "0");
    return `/images/frame_${paddedIndex}.webp`;
  } else {
    const paddedIndex = String(index - FRAME_COUNT_1 + 1).padStart(4, "0");
    return `/images_work/frame_${paddedIndex}.webp`;
  }
};

// 1. Preloader Function
function preloadImages() {
  return new Promise((resolve) => {
    let resolved = false;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      
      // Fallback generator in case images don't exist (for testing purposes)
      const generateFallback = (idx) => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 1920;
        tempCanvas.height = 1080;
        const tCtx = tempCanvas.getContext("2d");
        tCtx.fillStyle = "#111";
        tCtx.fillRect(0, 0, 1920, 1080);
        tCtx.fillStyle = "#333";
        tCtx.fillRect(100, 100, 1720, 880);
        tCtx.fillStyle = "#00f0ff";
        tCtx.font = "bold 150px Inter";
        tCtx.textAlign = "center";
        tCtx.textBaseline = "middle";
        tCtx.fillText(`FRAME ${idx + 1}`, 1920 / 2, 1080 / 2);
        return tempCanvas.toDataURL("image/jpeg");
      };

      img.onload = () => {
        // Resolve the promise immediately when the first frame is ready
        // so the landing page opens instantly. The rest will load in background.
        if (!resolved && i === 0) {
          resolved = true;
          resolve();
        }
      };

      img.onerror = () => {
        // If image not found, load a generated fallback
        img.src = generateFallback(i);
        if (!resolved && i === 0) {
          resolved = true;
          resolve();
        }
      };
      
      // Assign the expected URL
      img.src = getFrameUrl(i);
      images.push(img);
    }
    
    // Safety fallback: if frame 0 fails to trigger events, resolve anyway after 500ms
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, 500);
  });
}

// 2. Window Resize and Canvas Recalculation
function resizeCanvas() {
  // Account for High-DPI (Retina) displays to prevent blurriness
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  renderFrame(); // Force re-render on resize
}

window.addEventListener("resize", resizeCanvas);

// 3. Render Loop via requestAnimationFrame
// This function calculates how to draw the image covering the canvas (object-fit: cover logic)
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }
  
  // default offset is center
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;
  
  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  let iw = img.width,
      ih = img.height,
      r = Math.min(w / iw, h / ih),
      nw = iw * r,
      nh = ih * r,
      cx, cy, cw, ch, ar = 1;

  // decide which gap to fill (object-fit: cover)
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  
  nw *= ar;
  nh *= ar;
  
  // calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);
  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // fill image in dest. rectangle
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

function renderFrame() {
  const frameIndex = Math.round(seqState.frame);
  
  // Performance Constraint: Only call drawImage if the frame index has changed (or on resize)
  const expectedWidth = window.innerWidth * (window.devicePixelRatio || 1);
  
  if (frameIndex !== currentRenderedFrame || canvas.width !== expectedWidth) {
    // Smart Lazy Loading: If the exact frame isn't loaded yet, search backwards 
    // for the closest frame that is fully downloaded to prevent the video from freezing.
    let targetIndex = frameIndex;
    let found = false;

    while (targetIndex >= 0 && (frameIndex - targetIndex < 100)) {
      if (images[targetIndex] && images[targetIndex].complete && images[targetIndex].naturalWidth > 0) {
        found = true;
        break;
      }
      targetIndex--;
    }
    
    // Only redraw if we found a valid frame, and it's different from the one currently on screen
    if (found && (targetIndex !== currentRenderedFrame || canvas.width !== expectedWidth)) {
      // Offset Y: 0.5 (center) for desktop, 0.1 (top) for mobile to keep the robot's head in frame
      const isMobile = window.innerWidth < 768;
      const offsetY = isMobile ? 0.1 : 0.5;
      
      drawImageProp(ctx, images[targetIndex], 0, 0, canvas.width, canvas.height, 0.5, offsetY);
      currentRenderedFrame = targetIndex;
    }
  }
  
  renderRequested = false;
}

function requestRender() {
  if (!renderRequested) {
    renderRequested = true;
    requestAnimationFrame(renderFrame);
  }
}

// 4. Initialization and GSAP Setup
async function init() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // For mobile devices, bypass heavy preloading and GSAP canvas rendering entirely
    // so we get a buttery smooth native scroll experience with the static CSS background.
    console.log("Mobile device detected: using static premium fallback.");
    
    // Simple GSAP animations for the natural scroll layout
    gsap.utils.toArray('.overlay-element').forEach((el) => {
      // Small fade-in effect on scroll for mobile
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out"
      });
    });
    
    return;
  }

  // Preload all images
  await preloadImages();
  
  // Initial size and render
  resizeCanvas();
  
  // GSAP ScrollTrigger Setup
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-wrapper",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5, // 0.5s physical smoothing delay
      onUpdate: requestRender // Update canvas dynamically
    }
  });

  // Map scroll progress to total frame index (0 to 470)
  tl.to(seqState, {
    frame: TOTAL_FRAMES - 1,
    ease: "none",
    duration: 1 // Baseline duration for the timeline
  }, 0);

  // DOM Overlay Transitions
  
  // 1. Fade out hero title early
  tl.to("#hero-title", {
    opacity: 0,
    ease: "none",
    duration: 0.05
  }, 0);

  // 2. "About Me" (Sequence 1)
  // Fade in around frame 160
  const aboutFadeInPos = 160 / (TOTAL_FRAMES - 1);
  tl.fromTo("#about-text", 
    { opacity: 0, x: -50 },
    { opacity: 1, x: 0, ease: "power1.out", duration: 0.075 }, 
    aboutFadeInPos
  );
  
  // Fade out as camera pans to right hand (around frame 230)
  const aboutFadeOutPos = 230 / (TOTAL_FRAMES - 1);
  tl.to("#about-text", {
    opacity: 0, x: -50, ease: "power1.in", duration: 0.05
  }, aboutFadeOutPos);

  // 3. "Featured Work" (Sequence 2)
  // Fade in around frame 360 (which is frame 120 of the second sequence)
  const workFadeInPos = 360 / (TOTAL_FRAMES - 1);
  tl.fromTo("#work-text", 
    { opacity: 0, x: 50 },
    { opacity: 1, x: 0, ease: "power1.out", duration: 0.075 }, 
    workFadeInPos
  );

  // Fade out work text as the sequence comes to an end
  const workFadeOutPos = 440 / (TOTAL_FRAMES - 1);
  tl.to("#work-text", {
    opacity: 0, x: 50, ease: "power1.in", duration: 0.05
  }, workFadeOutPos);
}

document.addEventListener("DOMContentLoaded", init);

/* =========================================
   INTERACTIVE FEATURES (Cursor & Reveal)
========================================= */

// Reveal on Scroll Logic
const revealElements = document.querySelectorAll('.reveal-on-scroll');

const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    } else {
      // Remove if you want it to hide again when scrolling back up
      entry.target.classList.remove('is-visible');
    }
  });
};

const revealOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15 // Trigger when 15% of the element is visible
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
  revealObserver.observe(el);
});
