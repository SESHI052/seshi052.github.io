// ========================================
// PORTFOLIO SCRIPT.JS — FINAL CLEAN VERSION
// Portfolio Template
// ========================================

/* ──────────────────────────────────────
   REAL MOBILE VIEWPORT HEIGHT FIX
────────────────────────────────────── */
function setRealHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setRealHeight();
window.addEventListener('resize', setRealHeight);
window.addEventListener('orientationchange', setRealHeight);

/* ──────────────────────────────────────
   LUCIDE ICON INIT (safe wrapper)
────────────────────────────────────── */
function initIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ──────────────────────────────────────
   PAGE TRANSITION (replaces spinner)
   Smooth fade-in on arrive, fade-out on leave
────────────────────────────────────── */
function initPageTransitions() {
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (
            !href ||
            href.startsWith('#') ||
            href.startsWith('http') ||
            href.startsWith('mailto') ||
            href.startsWith('tel') ||
            href.startsWith('javascript') ||
            href.endsWith('.pdf') ||
            href.endsWith('.jpg') ||
            href.endsWith('.jpeg') ||
            href.endsWith('.png') ||
            link.target === '_blank'
        ) return;

        link.addEventListener('click', e => {
            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = href; }, 260);
        });
    });
}

/* ──────────────────────────────────────
   VIDEO CACHE SYSTEM
   Backend-ready: change data-src to your server URLs when ready
────────────────────────────────────── */
const _videoCache = new Map();

function initVideoSystem() {
    document.querySelectorAll('.video-wrapper').forEach(wrapper => {
        const thumbnail = wrapper.querySelector('.video-thumbnail');
        const playBtn   = wrapper.querySelector('.video-play-btn');
        const video     = wrapper.querySelector('video');

        if (!video) return;

        const src = video.getAttribute('src') || video.getAttribute('data-src') || '';
        if (src) {
            video.setAttribute('data-src', src);
            video.removeAttribute('src');
        }

        // --- UPGRADED: PERSISTENT CACHE API ---
        async function activateVideo() {
            const dataSrc = video.getAttribute('data-src');
            if (!dataSrc) return;

            // 1. Hide UI elements
            if (thumbnail) { thumbnail.style.opacity = '0'; thumbnail.style.pointerEvents = 'none'; }
            if (playBtn)   playBtn.style.display = 'none';
            video.style.display = 'block';
            
            // 2. Hide your specific overlays
            const parentContainer = wrapper.closest('.work-item') || wrapper.closest('.work-card');
            if (parentContainer) {
                const overlay = parentContainer.querySelector('.work-overlay');
                if (overlay) overlay.style.display = 'none';
            }

            // 3. Check the permanent Browser Cache
            try {
                const cache = await caches.open('portfolio-videos-v1');
                const cachedResponse = await cache.match(dataSrc);

                if (cachedResponse) {
                    // SUCCESS! It's saved from a previous visit. Play instantly.
                    const blob = await cachedResponse.blob();
                    video.src = URL.createObjectURL(blob);
                    video.play().catch(() => {});
                    console.log("Played from persistent cache!");
                } else {
                    // Not saved yet. Play from the network normally...
                    video.src = dataSrc;
                    video.play().catch(() => {});

                    // ...and save it to the cache in the background for next time!
                    fetch(dataSrc, { mode: 'cors' })
                        .then(response => {
                            if (response.ok) cache.put(dataSrc, response);
                        })
                        .catch(() => console.log("Caching failed, but video will still play."));
                }
            } catch (err) {
                // Fallback just in case the browser blocks the Cache API
                video.src = dataSrc;
                video.play().catch(() => {});
            }
        }

        if (thumbnail) thumbnail.addEventListener('click', activateVideo);
        if (playBtn)   playBtn.addEventListener('click', activateVideo);
    });
}

/* ──────────────────────────────────────
   NAVBAR SCROLL EFFECT
────────────────────────────────────── */
/* ──────────────────────────────────────
   FIXED NAVBAR & BACK TO TOP LOGIC
────────────────────────────────────── */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
        if (backToTopBtn) {
            if (window.scrollY > 350) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    }, { passive: true });
}
/* ──────────────────────────────────────
   MOBILE MENU
────────────────────────────────────── */
window.toggleMenu = function () {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;

    // Toggles the class; CSS handles the rest based on screen size
    const isOpen = menu.classList.toggle('show');
    document.body.classList.toggle('menu-open', isOpen);
};

    function initMobileMenu() {
        document.addEventListener('click', e => {
            const menu = document.getElementById('mobile-menu');
            const btn  = document.querySelector('.mobile-menu-btn');
            if (!menu || !menu.classList.contains('show')) return;
            if (!menu.contains(e.target) && btn && !btn.contains(e.target)) {
                menu.classList.remove('show');
                document.body.classList.remove('menu-open');
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            const menu = document.getElementById('mobile-menu');
            if (menu) { menu.classList.remove('show'); document.body.classList.remove('menu-open'); }
            if (typeof closeLightbox !== 'undefined') closeLightbox();
            if (typeof closeAboutModal !== 'undefined') closeAboutModal();
        });
    }

/* ──────────────────────────────────────
   SMOOTH SCROLL for anchor links
────────────────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const menu = document.getElementById('mobile-menu');
                if (menu && menu.classList.contains('show')) {
                    menu.classList.remove('show');
                    document.body.classList.remove('menu-open');
                }
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}
/* ──────────────────────────────────────
   SMOOTH REVEAL ANIMATION
────────────────────────────────────── */
function initTypingAnimation() {
    const el = document.querySelector('.typed-text');
    if (!el) return;

    const roles = ['Security Analyst', 'SOC Analyst', 'Cybersecurity Professional', 'Cloud Security Enthusiast', 'Threat Hunter',  'Vulnerability Management', 'Incident Responder', 'Security Operations'];
    let rIdx = 0;

    function playAnimation() {
        // 1. Change the text while the window is closed (width is 0)
        el.textContent = roles[rIdx];
        el.style.width = '0px';

        // 2. Calculate exactly how wide this specific word needs to be
        const fullWidth = el.scrollWidth;

        // 3. Slide OPEN (Reveal the word smoothly)
        setTimeout(() => {
            el.style.width = fullWidth + 'px';
        }, 100); // 100ms delay before opening

        // 4. Wait for the user to read it, then slide CLOSED
        setTimeout(() => {
            el.style.width = '0px';
        }, 2500); // Stays open for 2.5 seconds

        // 5. Wait for the door to fully close, then trigger the next word
        setTimeout(() => {
            rIdx = (rIdx + 1) % roles.length;
            playAnimation();
        }, 3400); // 2500ms open time + 800ms closing animation + 100ms buffer
    }
    
    // Start the loop
    playAnimation();
}

/* ──────────────────────────────────────
   SCROLL REVEAL
────────────────────────────────────── */
function initScrollReveal() {
    const cards = document.querySelectorAll('.achievement-card, .stack-card, .timeline-item, .brand-card, .testimonial-card');
    const headings = document.querySelectorAll('h1, h2, h3, .section-title');
    
    headings.forEach(h => h.classList.add('animate-heading'));

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('animate-heading')) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.add('show');
                }
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(el => obs.observe(el));
    headings.forEach(el => obs.observe(el));
}

/* ──────────────────────────────────────
   LAZY IMAGE LOADING
────────────────────────────────────── */
function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
                obs.unobserve(img);
            }
        });
    });
    document.querySelectorAll('img[data-src]').forEach(img => obs.observe(img));
}

/* ──────────────────────────────────────
   GALLERY FILTER
────────────────────────────────────── */
window.filterGallery = function (category, btn) {
    document.querySelectorAll('.gallery-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.display = (category === 'all' || item.classList.contains(category)) ? '' : 'none';
    });
};

/* ──────────────────────────────────────
   OUR WORKS FILTER
────────────────────────────────────── */
window.filterWorks = function (category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.work-item').forEach(item => {
        item.style.display = (category === 'all' || item.dataset.category?.trim() === category) ? '' : 'none';
    });
};

/* ──────────────────────────────────────
   BACK TO TOP
────────────────────────────────────── */
window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ──────────────────────────────────────
   CONTACT FORM — mailto + success message
────────────────────────────────────── */
window.handleFormSubmit = function (e) {
    e.preventDefault();
    const fd      = new FormData(e.target);
    const name    = fd.get('name')    || '';
    const email   = fd.get('email')   || '';
    const phone   = fd.get('phone')   || '';
    const message = fd.get('message') || '';

    const subject    = encodeURIComponent(`Contact from ${name}`);
    const body       = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`);
    window.location.href = `mailto:annapareddyseshi052@gmail.com?subject=${subject}&body=${body}`;

    const success = document.getElementById('successMessage');
    if (success) {
        e.target.style.display = 'none';
        success.classList.remove('hidden');
        initIcons();
        setTimeout(() => {
            e.target.reset();
            e.target.style.display = 'flex';
            success.classList.add('hidden');
        }, 3000);
    }
    return false;
};

/* ──────────────────────────────────────
   FORM VALIDATION — live border feedback
────────────────────────────────────── */
function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', function () {
            this.style.borderColor = (this.hasAttribute('required') && !this.value.trim()) ? '#ef4444' : '';
        });
        input.addEventListener('input', function () {
            if (this.value.trim()) this.style.borderColor = '';
        });
    });
}

/* ──────────────────────────────────────
   ABOUT MODAL
────────────────────────────────────── */
window.openAboutModal = function () {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = '8px'; // Prevent layout shift
        initIcons();
        console.log("Modal opened");
    }
};

window.closeAboutModal = function () {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        console.log("Modal closed");
    }
};
/* ──────────────────────────────────────
   LIGHTBOX
────────────────────────────────────── */
window.openLightbox = function (overlayEl) {
    const workItem = overlayEl.closest?.('.work-item') || overlayEl.parentElement;
    const img      = workItem?.querySelector('img');
    if (!img) return;

    const details = overlayEl.querySelector?.('.work-details');
    const lb      = document.getElementById('lightbox');
    const lbImg   = document.getElementById('lightbox-img');
    const lbTitle = document.getElementById('lightbox-title');
    const lbDesc  = document.getElementById('lightbox-description');

    if (!lb || !lbImg) return;
    lbImg.src = img.src;
    if (details && lbTitle) lbTitle.textContent = details.querySelector('h3')?.textContent || '';
    if (details && lbDesc)  lbDesc.textContent  = details.querySelector('p')?.textContent  || '';

    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    initIcons();
};

window.closeLightbox = function () {
    const lb = document.getElementById('lightbox');
    if (lb) { lb.classList.add('hidden'); document.body.style.overflow = ''; }
};

/* ──────────────────────────────────────
   WORKS CAROUSEL — delay start so layout settles
────────────────────────────────────── */
function initWorksCarousel() {
    const track = document.querySelector('.works-track');
    if (!track) return;
    track.style.animationPlayState = 'paused';
    setTimeout(() => { track.style.animationPlayState = 'running'; }, 800);
}

/* ──────────────────────────────────────
   PREVENT BROWSER SCROLL RESTORATION
────────────────────────────────────── */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ──────────────────────────────────────
   MAIN INIT
────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    initPageTransitions();
    initVideoSystem();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initTypingAnimation();
    initScrollReveal();
    initLazyImages();
    initFormValidation();
    initWorksCarousel();
    initCounters(); 
    initFAQ();
    // initUniverseBackground(); // [Animations disabled in this edition]
    // initBlackHoleFooter(); // [Animations disabled in this edition]
    
    // ... existing code ...
    // Lightbox backdrop close
    const lb = document.getElementById('lightbox');

  // About modal backdrop close
document.addEventListener('click', e => {
    const modal = document.getElementById('aboutModal');
    if (modal && e.target === modal) {
        closeAboutModal();
    }
});

// Close modal when pressing Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('aboutModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeAboutModal();
        }
    }
});
    console.log('%c 🛡️ ANNAPAREDDY SESHI REDDY Portfolio',               'color:#3b82f6;font-size:20px;font-weight:bold;');
    console.log('%cSecurity Analyst | SOC Analyst | Cybersecurity Professional', 'color:#60a5fa;font-size:14px;');
    console.log('%c© 2026 ANNAPAREDDY SESHI REDDY. All Rights Reserved.',         'color:#06b6d4;font-size:12px;');
});

/* Second pass after everything loads */
window.addEventListener('load', () => {
    initIcons();
    document.querySelectorAll('.gallery-item').forEach(item => { item.style.display = ''; });
});

/* ========================================
   ABOUT MODAL FIX
======================================== */
window.openAboutModal = function () {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        // Force the modal to show
        modal.style.display = 'flex';
        // A tiny delay ensures the fade-in animation plays smoothly
        setTimeout(() => {
            modal.classList.remove('hidden');
            modal.style.opacity = '1';
            modal.style.visibility = 'visible';
            modal.style.pointerEvents = 'auto';
        }, 10);
        
        document.body.style.overflow = 'hidden'; // Stops background scrolling
        initIcons(); // Reloads the icons inside the modal
    }
};

window.closeAboutModal = function () {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modal.style.pointerEvents = 'none';
        
        // Wait for animation to finish before fully hiding
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }, 350);
        
        document.body.style.overflow = ''; // Restores background scrolling
    }
};

/* Interactive Cursor Glow */
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        window.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursorGlow.style.left = `${e.clientX}px`;
                cursorGlow.style.top = `${e.clientY}px`;
            });
        });
    }

    /* ──────────────────────────────────────
   DYNAMIC STATS COUNTER
────────────────────────────────────── */
function initCounters() {
    // 1. Calculate dynamic videos based on start date (May 2026)
    const startDate = new Date('2026-05-01');
    const currentDate = new Date();
    
    // Safely calculate how many months have passed
    let monthsPassed = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
    monthsPassed -= startDate.getMonth();
    monthsPassed += currentDate.getMonth();
    monthsPassed = Math.max(0, monthsPassed); // Ensures it never goes negative

    const avgVideosPerMonth = 125; // Average of 120-130
    const baseVideos = 250;
    const totalVideos = baseVideos + (monthsPassed * avgVideosPerMonth);

    // Apply calculated total to the HTML attribute
    const videoCounterSpan = document.getElementById('videoCounter');
    if(videoCounterSpan) {
        videoCounterSpan.setAttribute('data-target', totalVideos);
    }

    // 2. Animate all counters when they scroll into view
    const counters = document.querySelectorAll('.counter');
    const speed = 100; // The higher the number, the slower the counting animation

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                
                const updateCount = () => {
                    const currentCount = +counter.innerText;
                    // Divide target by speed to get increment steps
                    const inc = target / speed;

                    if (currentCount < target) {
                        counter.innerText = Math.ceil(currentCount + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target; // Ensure it ends on exact number
                    }
                };
                
                updateCount();
                obs.unobserve(counter); // Stop observing once animated so it doesn't repeat
            }
        });
    }, { threshold: 0.5 }); // Starts animating when 50% of the element is visible

    counters.forEach(counter => observer.observe(counter));
}

/* ──────────────────────────────────────
   FAQ ACCORDION (BULLETPROOF VERSION)
────────────────────────────────────── */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // This simply toggles the 'active' class on and off when you click
            item.classList.toggle('active');
        });
    });
}

/* ──────────────────────────────────────
   THREE.JS UNIVERSE BACKGROUND
────────────────────────────────────── */
function initUniverseBackground() {
    return; // [Animations disabled in this edition]
    // 1. Create and inject the canvas into the background
    const canvas = document.createElement('canvas');
    canvas.id = 'universe-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    // 2. Dynamically load Three.js so you don't have to edit all HTML files
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    script.onload = () => buildUniverseScene(canvas);
    document.head.appendChild(script);
}

function buildUniverseScene(canvas) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.0015); // Smooth fade into your dark background

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization

    // Create the Particle System
    const starCount = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    // Map your custom CSS variables to Three.js colors
    const palette = [
        new THREE.Color(0xffffff), // White
        new THREE.Color(0x3b82f6), // Primary accent
        new THREE.Color(0x7dd3fc), // Accent shade
        new THREE.Color(0x06b6d4)  // Secondary accent
    ];

    for(let i = 0; i < starCount; i++) {
        // Spread stars in a wide 3D space
        positions[i*3] = (Math.random() - 0.5) * 1000;
        positions[i*3+1] = (Math.random() - 0.5) * 1000;
        positions[i*3+2] = (Math.random() - 0.5) * 1000;

        // Assign random theme color
        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Gentle space rotation
        starField.rotation.y += 0.0004;
        starField.rotation.x += 0.0002;

        // Smooth camera movement based on mouse position
        camera.position.x += (mouseX * 15 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 15 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    // Responsive window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function buildUniverseScene(canvas) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.002); // Darker fade to match your theme

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 1. Generate a soft, glowing radial gradient texture on the fly
    function createGlowTexture() {
        const ctxCanvas = document.createElement('canvas');
        ctxCanvas.width = 64;
        ctxCanvas.height = 64;
        const ctx = ctxCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        
        // Pure white center fading into a soft transparent edge
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.4, 'rgba(59, 130, 246, 0.3)'); // Your brand purple glow
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(ctxCanvas);
    }

    // 2. Set up advanced attributes for independent twinkling
    const starCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount); // Controls individual twinkle timing

    const palette = [
        new THREE.Color(0xffffff), // White
        new THREE.Color(0x3b82f6), // Primary accent
        new THREE.Color(0x7dd3fc), // Accent shade
        new THREE.Color(0x06b6d4)  // Secondary accent
    ];

    for(let i = 0; i < starCount; i++) {
        // Spread stars in a sphere
        positions[i*3] = (Math.random() - 0.5) * 1200;
        positions[i*3+1] = (Math.random() - 0.5) * 1200;
        positions[i*3+2] = (Math.random() - 0.5) * 1200;

        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;

        sizes[i] = Math.random() * 15 + 5; // Base glow size
        phases[i] = Math.random() * Math.PI * 2; // Random start point for the twinkle
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    // 3. Custom Shaders for ultra-realistic glowing and pulsing
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            pointTexture: { value: createGlowTexture() }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 customColor;
            attribute float phase;
            
            varying vec3 vColor;
            varying float vPhase;
            
            void main() {
                vColor = customColor;
                vPhase = phase;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                // Adjust size based on depth to create 3D perspective
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform sampler2D pointTexture;
            
            varying vec3 vColor;
            varying float vPhase;
            
            void main() {
                // Creates a smooth pulsing math wave for the twinkle
                float twinkle = 0.5 + 0.5 * sin(time * 2.0 + vPhase);
                
                // Combine the texture, color, and dynamic opacity
                vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                gl_FragColor = vec4(vColor, texColor.a * twinkle) * texColor;
            }
        `,
        blending: THREE.AdditiveBlending, // This makes overlapping glows super bright!
        depthWrite: false,
        transparent: true
    });

    const starField = new THREE.Points(geometry, shaderMaterial);
    scene.add(starField);

    // 4. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (e) => {
        // Calculate normalized mouse coordinates
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0015;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0015;
    });

    // 5. The Animation Loop
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        shaderMaterial.uniforms.time.value = elapsedTime; // Drives the twinkle effect

        // Gentle space rotation
        starField.rotation.y += 0.0003;
        starField.rotation.x += 0.0001;

        // Smoothly interpolate camera movement for a premium feel
        targetX = mouseX * 25;
        targetY = -mouseY * 25;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    // 6. Responsive window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* ──────────────────────────────────────
   3D COVERFLOW ENGINE
────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card-3d');
    const prevBtn = document.getElementById('prev-3d');
    const nextBtn = document.getElementById('next-3d');
    const track = document.getElementById('carousel-track');
    
    if (cards.length === 0) return;

    let activeIndex = 0;
    let autoPlayInterval;
    
    // Function to calculate and update 3D positions
    function update3DCarousel() {
        cards.forEach((card, index) => {
            card.setAttribute('data-pos', 'hidden'); // Default to hidden in back
            
            if (index === activeIndex) {
                card.setAttribute('data-pos', 'active');
            } else if (index === (activeIndex - 1 + cards.length) % cards.length) {
                card.setAttribute('data-pos', 'prev'); // Pushed back Left
            } else if (index === (activeIndex + 1) % cards.length) {
                card.setAttribute('data-pos', 'next'); // Pushed back Right
            }
        });
    }

    // Navigation logic
    function goNext() {
        activeIndex = (activeIndex + 1) % cards.length;
        update3DCarousel();
    }

    function goPrev() {
        activeIndex = (activeIndex - 1 + cards.length) % cards.length;
        update3DCarousel();
    }

    // Button Listeners
    if (nextBtn) nextBtn.addEventListener('click', () => { goNext(); resetAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { goPrev(); resetAutoPlay(); });

    // Allow clicking the side cards to bring them forward
    cards.forEach(card => {
        card.addEventListener('click', function() {
            if (this.getAttribute('data-pos') === 'next') { goNext(); resetAutoPlay(); }
            if (this.getAttribute('data-pos') === 'prev') { goPrev(); resetAutoPlay(); }
        });
    });

    // Auto-Scroll Logic (Continuous loop)
    function startAutoPlay() {
        autoPlayInterval = setInterval(goNext, 3500); // Rotates every 3.5 seconds
    }
    
    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Pause Auto-Scroll when hovering (Desktop) or tapping (Mobile)
    track.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    track.addEventListener('mouseleave', startAutoPlay);

    // Mobile Swipe (Touch) Logic
    let startX = 0;
    track.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
        clearInterval(autoPlayInterval);
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        let endX = e.changedTouches[0].screenX;
        if (startX - endX > 50) goNext(); // Swipe Left -> Next
        if (endX - startX > 50) goPrev(); // Swipe Right -> Prev
        startAutoPlay();
    }, { passive: true });

    // Initialize the engine
    update3DCarousel();
    startAutoPlay();
});

/* ──────────────────────────────────────
   HERO SECTION 3D RIPPLE WAVES
────────────────────────────────────── */
function initHeroRipple() {
    return; // [Animations disabled in this edition]
    const canvas = document.getElementById('hero-ripple-canvas');
    const heroContainer = document.getElementById('home');
    
    // If we aren't on the home page, abort safely
    if (!canvas || !heroContainer) return;

    // Load Three.js if it isn't already loaded by the universe script
    if (typeof THREE === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
        script.onload = () => buildHeroWaves(canvas, heroContainer);
        document.head.appendChild(script);
    } else {
        buildHeroWaves(canvas, heroContainer);
    }
}

function buildHeroWaves(canvas, heroContainer) {
    const scene = new THREE.Scene();
    
    // Setup camera relative to the hero section, not the whole window
    const camera = new THREE.PerspectiveCamera(60, heroContainer.clientWidth / heroContainer.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 60); // Angle the camera looking slightly down
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create a highly detailed flat plane
    const geometry = new THREE.PlaneGeometry(250, 150, 80, 50);
    
    // The Material: We use your brand purple in a glowing wireframe
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x3b82f6, // Primary accent
        wireframe: true,
        transparent: true,
        opacity: 0.25 // Subtle so it doesn't distract from your portfolio
    });

    const plane = new THREE.Mesh(geometry, material);
    // Tilt the plane so it looks like a floor/surface moving away from us
    plane.rotation.x = -Math.PI / 2; 
    plane.position.y = -10; // Push it down to frame the bottom half nicely
    scene.add(plane);

    // Save the original, flat vertices so we can distort them smoothly
    const positionAttribute = geometry.attributes.position;
    const vertexData = [];
    for (let i = 0; i < positionAttribute.count; i++) {
        vertexData.push({
            x: positionAttribute.getX(i),
            y: positionAttribute.getY(i),
            z: positionAttribute.getZ(i)
        });
    }

    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Manipulate every point on the plane to create rolling waves
        for (let i = 0; i < positionAttribute.count; i++) {
            const data = vertexData[i];
            
            // Complex math wave combining X and Y axis for organic movement
            const wave1 = Math.sin(data.x * 0.05 + time * 1.5) * 3;
            const wave2 = Math.cos(data.y * 0.05 + time * 1.2) * 3;
            
            positionAttribute.setZ(i, wave1 + wave2);
        }
        
        positionAttribute.needsUpdate = true;
        renderer.render(scene, camera);
    }
    
    animate();

    // Make sure the canvas resizes perfectly if the user resizes their browser or rotates their phone
    window.addEventListener('resize', () => {
        if (!heroContainer) return;
        camera.aspect = heroContainer.clientWidth / heroContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
    });
}


// Ensure the ripple initializes after the page fully loads
window.addEventListener('load', () => {
    initHeroRipple();
    
});

/* ──────────────────────────────────────
   HIGH-PERFORMANCE 3D SLEEK HORIZONTAL WAVES (GPU OPTIMIZED)
────────────────────────────────────── */
function buildHorizontalWaves(canvas, heroContainer) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

    const camera = new THREE.PerspectiveCamera(60, heroContainer.clientWidth / heroContainer.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // PERFORMANCE OPTIMIZATION 1: Merge geometries.
    // Instead of rendering 12 individual Lines, we merge them into one geometry.
    const masterGeometry = new THREE.BufferGeometry();
    const width = 250;
    const pointsPerLine = 120;
    const linesCount = 12;
    const depth = 60;

    const totalPoints = linesCount * pointsPerLine;
    const positions = new Float32Array(totalPoints * 3);
    const indices = []; // We need indices to define where the lines break

    for (let i = 0; i < linesCount; i++) {
        const z = (i / linesCount) * -depth + 10;
        const baseY = (i / linesCount) * -12 + 6;
        const lineOffset = i * 0.5;

        for (let j = 0; j < pointsPerLine; j++) {
            const x = (j / pointsPerLine) * width - (width / 2);
            const index = (i * pointsPerLine + j) * 3;
            
            // X, Y (will be animated in shader), Z
            positions[index] = x;
            positions[index + 1] = baseY; // Start at baseY, add sine in shader
            positions[index + 2] = z;

            // Define the indices for the LineSegments draw call
            if (j < pointsPerLine - 1) {
                const currentVertex = (i * pointsPerLine + j);
                indices.push(currentVertex, currentVertex + 1);
            }
        }
    }

    masterGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    masterGeometry.setIndex(indices);

    // PERFORMANCE OPTIMIZATION 2: The Custom Shader (GPU Animation)
    // We send only one variable (time) to the GPU and let it handle the math.
    const customUniforms = {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x60a5fa) }, // Line accent
        color2: { value: new THREE.Color(0x3b82f6) }, // Primary accent
        fogColor: { value: scene.fog.color },
        fogDensity: { value: scene.fog.density }
    };

    const material = new THREE.ShaderMaterial({
        uniforms: customUniforms,
        fog: true, // Tell THREE to integrate fog automatically
        transparent: true,
        
        // --- Vertex Shader (Executed on GPU for every vertex) ---
        vertexShader: `
            uniform float time;
            varying float vDist; // For coloring based on distortion
            varying vec3 vViewPosition; // Needed for Fog

            void main() {
                vec3 pos = position;
                
                // Calculate the beautiful sweeping horizontal curves on the GPU
                // We use gl_VertexID or position.x to create the wave offset per vertex
                float wave1 = sin(pos.x * 0.02 + time + pos.z * 0.01) * 5.0;
                float wave2 = sin(pos.x * 0.015 - time * 0.8) * 3.0;
                
                pos.y += wave1 + wave2; // Apply Y movement
                vDist = wave1 + wave2; // Send distortion value to fragment shader for colors
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                vViewPosition = -mvPosition.xyz; // Store view position for fog calc
                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        // --- Fragment Shader (Executed on GPU for every pixel) ---
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying float vDist;
            
            // Fog uniforms (integrated by THREE)
            uniform vec3 fogColor;
            uniform float fogDensity;
            varying vec3 vViewPosition;

            void main() {
                // Mix colors slightly based on height (vDist) for glowing depth
                float colorMix = (vDist + 8.0) / 16.0; // Normalize from roughly -8/8 to 0/1
                vec3 finalColor = mix(color1, color2, clamp(colorMix, 0.0, 1.0));
                
                gl_FragColor = vec4(finalColor, 0.9); // Basic color output
                
                // Manually apply FogExp2 since we are using ShaderMaterial
                #ifdef USE_FOG
                    float depth = length(vViewPosition);
                    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * depth * depth );
                    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
                #endif
            }
        `,
        blending: THREE.AdditiveBlending // Makes the lines look like glowing neon
    });

    // We use LineSegments because it's slightly faster than Line
    const lines = new THREE.LineSegments(masterGeometry, material);
    scene.add(lines);

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime() * 0.4;
        
        // Update ONLY the time uniform. The GPU handles the rest.
        customUniforms.time.value = time;
        
        renderer.render(scene, camera);
    }
    
    animate();

    window.addEventListener('resize', () => {
        if (!heroContainer) return;
        camera.aspect = heroContainer.clientWidth / heroContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
    });
}

/* ──────────────────────────────────────
   THE ULTIMATE SMART MOBILE SCROLL LOCK
────────────────────────────────────── */
(function fixMobileScroll() {
    let scrollPosition = 0;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isMenuOpen = document.body.classList.contains('menu-open');
                
                if (isMenuOpen && document.body.style.position !== 'fixed') {
                    // 1. Save exact scroll position
                    scrollPosition = window.scrollY;
                    
                    // 2. Lock the body perfectly in place
                    document.body.style.position = 'fixed';
                    document.body.style.top = `-${scrollPosition}px`;
                    document.body.style.width = '100%';
                } 
                else if (!isMenuOpen && document.body.style.position === 'fixed') {
                    // 1. Unlock the body
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    
                    // 2. Instantly restore scroll position (bypass smooth scroll)
                    document.documentElement.style.scrollBehavior = 'auto';
                    window.scrollTo(0, scrollPosition);
                    document.documentElement.style.scrollBehavior = ''; 
                }
            }
        });
    });

    // Automatically watch the body for the menu opening/closing
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();

/* ──────────────────────────────────────
   3D BLACK HOLE FOOTER (RAINBOW BLUR)
────────────────────────────────────── */
function initBlackHoleFooter() {
    return; // [Animations disabled in this edition]
    const canvas = document.getElementById('blackhole-canvas');
    const footer = document.querySelector('.footer');

    if (!canvas || !footer) return;

    // THE FIX: Check if the Hero Lightning already loaded the 3D Engine! 
    // If not, load it. If yes, just build the black hole safely.
    if (typeof THREE === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
        script.onload = () => buildBlackHoleScene(canvas, footer);
        document.head.appendChild(script);
    } else {
        buildBlackHoleScene(canvas, footer);
    }
}

function buildBlackHoleScene(canvas, footer) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, footer.clientWidth / footer.clientHeight, 0.1, 1000);
    camera.position.set(0, 45, 75); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(footer.clientWidth, footer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 1. The Event Horizon (Pure Black Void)
    const bhGeometry = new THREE.SphereGeometry(14, 32, 32);
    const bhMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(bhGeometry, bhMaterial);
    scene.add(blackHole);

    // 2. THE FIX: Generates the soft, blurry circle texture you requested
    function createDotTexture() {
        const texCanvas = document.createElement('canvas');
        texCanvas.width = 64;
        texCanvas.height = 64;
        const ctx = texCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(texCanvas);
    }

    // 3. The Accretion Disk (Colorful Swirling Particles)
    const particleCount = 4000; 
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    // THE FIX: Your custom vibrant Rainbow palette!
    const colorPalette = [
        new THREE.Color(0xff0000), // Red
        new THREE.Color(0xffff00), // Yellow
        new THREE.Color(0x0000ff), // Blue
        new THREE.Color(0x00008b), // Dark Blue
        new THREE.Color(0xff00ff), // Magenta (Rainbow)
        new THREE.Color(0x00ffff), // Cyan (Rainbow)
        new THREE.Color(0xff8c00)  // Orange (Rainbow)
    ];

    for (let i = 0; i < particleCount; i++) {
        const radius = 15.5 + Math.random() * 60; 
        const angle = Math.random() * Math.PI * 2;
        
        radii[i] = radius;
        angles[i] = angle;
        speeds[i] = (1 / radius) * 3.5; 

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * (200 / radius); 
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        const colorBase = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        // Make the very center ring white-hot, and the rest colorful
        if (radius < 16.5) {
            colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
        } else {
            colors[i * 3] = colorBase.r;
            colors[i * 3 + 1] = colorBase.g;
            colors[i * 3 + 2] = colorBase.b;
        }
        
        sizes[i] = Math.random() * 4 + 1.5; 
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('angle', new THREE.BufferAttribute(angles, 1));
    
    // Applies the blurry texture to the particles
    const material = new THREE.PointsMaterial({
        size: 2.0,
        vertexColors: true,
        map: createDotTexture(), 
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
    });

    const disk = new THREE.Points(geometry, material);
    disk.rotation.x = 0.15; 
    scene.add(disk);

    // 4. Animation Loop
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        const positionsAttr = geometry.attributes.position;
        const anglesAttr = geometry.attributes.angle;
        
        for (let i = 0; i < particleCount; i++) {
            let currentAngle = anglesAttr.getX(i);
            const speed = speeds[i];
            const r = radii[i];
            
            currentAngle -= speed * delta; 
            anglesAttr.setX(i, currentAngle);
            
            positionsAttr.setX(i, Math.cos(currentAngle) * r);
            positionsAttr.setZ(i, Math.sin(currentAngle) * r);
        }
        
        positionsAttr.needsUpdate = true;
        
        disk.rotation.y -= 0.03 * delta;
        disk.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;

        renderer.render(scene, camera);
    }
    
    animate();

    window.addEventListener('resize', () => {
        if (!footer) return;
        camera.aspect = footer.clientWidth / footer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(footer.clientWidth, footer.clientHeight);
    });
}

/* ──────────────────────────────────────
   CSS 3D WALL GENERATOR (No Three.js)
────────────────────────────────────── */
function initPureCSSWalls() {
    return; // [Animations disabled in this edition]
    const wallGrids = document.querySelectorAll('.css-wall-grid');
    
    wallGrids.forEach(grid => {
        // Calculate how many blocks are needed based on screen size
        const gridWidth = grid.offsetWidth;
        const gridHeight = grid.offsetHeight;
        
        // 50px block width + 4px gap = 54px total space per block
        const cols = Math.floor(gridWidth / 54);
        const rows = Math.floor(gridHeight / 54);
        const totalBlocks = cols * rows;

        // Create the blocks
        let blocksHTML = '';
        for (let i = 0; i < totalBlocks; i++) {
            blocksHTML += '<div class="css-wall-block"></div>';
        }
        
        // Inject into the DOM
        grid.innerHTML = blocksHTML;
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initPureCSSWalls();
});

// Re-calculate blocks if the user rotates their phone or resizes window
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initPureCSSWalls, 250);
});
