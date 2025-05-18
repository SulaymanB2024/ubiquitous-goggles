/**
 * Palantir-style advanced animations and visual effects
 * Enhanced scroll reveal, parallax, staggered animations, and interactive effects
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Initialize all animation systems
    initScrollRevealSystem();
    initParallaxSystem();
    initStaggeredTextAnimations();
    initInteractiveElements();
    
    // Performance measurement
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    
    // Debounced scroll handler for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        // Clear the timeout if it has been set
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        // Set a timeout to run after scrolling ends
        scrollTimeout = window.requestAnimationFrame(() => {
            // Measure FPS
            const now = performance.now();
            const delta = now - lastFrameTime;
            if (delta > 1000) { // Update FPS every second
                fps = frameCount * 1000 / delta;
                frameCount = 0;
                lastFrameTime = now;
                
                // Log FPS if it drops below threshold
                if (fps < 40 && window.SystemLog) {
                    window.SystemLog.addEntry({
                        type: 'performance',
                        message: `Low animation performance: ${fps.toFixed(1)} FPS`,
                        timestamp: new Date()
                    });
                }
            }
            frameCount++;
            
            // Run animation checks
            checkReveal();
            animateSkillBars();
            updateParallaxElements();
        });
    });
    
    // Run initial animations
    window.addEventListener('load', () => {
        checkReveal();
        animateSkillBars();
        updateParallaxElements();
        runHeadingAnimations();
    });
    
    // Run animations on initial load without waiting for load event
    checkReveal();
    animateSkillBars();
    updateParallaxElements();
});

/**
 * Initialize scroll reveal animation system
 */
function initScrollRevealSystem() {
    // Global variables
    window.animationElements = {
        revealable: document.querySelectorAll('.revealable'),
        skillBars: document.querySelectorAll('.skill-progress-bar'),
        parallaxLayers: document.querySelectorAll('[data-parallax]'),
        headings: document.querySelectorAll('.animate-heading')
    };
    
    // Enhanced reveal checks
    window.checkReveal = function() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        window.animationElements.revealable.forEach(element => {
            const revealTop = element.getBoundingClientRect().top;
            
            if (revealTop < windowHeight - revealPoint) {
                // Get animation style if specified
                const animationType = element.getAttribute('data-animation') || 'fade-up';
                const delay = parseFloat(element.getAttribute('data-delay') || 0);
                const duration = parseFloat(element.getAttribute('data-duration') || 0.7);
                
                // Apply appropriate animation class with delay
                setTimeout(() => {
                    element.classList.add('active');
                    element.classList.add(animationType);
                    element.style.animationDuration = `${duration}s`;
                    
                    // Add pulse/glow effect for elements with data-glow attribute
                    if (element.hasAttribute('data-glow')) {
                        element.classList.add('glow-effect');
                    }
                }, delay * 1000);
            }
        });
    };
    
    // Animate skill bars when in viewport
    window.animateSkillBars = function() {
        const skillBars = window.animationElements.skillBars;
        if (skillBars.length === 0) return;
        
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        skillBars.forEach(bar => {
            const barTop = bar.getBoundingClientRect().top;
            const width = bar.parentElement.parentElement.querySelector('.skill-percentage').textContent;
            
            if (barTop < windowHeight - revealPoint) {
                // Add the width with an animated striped effect
                bar.style.width = width;
                bar.classList.add('animate-progress');
                
                // Add pulsing glow effect
                bar.parentElement.classList.add('pulse-glow');
            } else {
                bar.style.width = '0';
                bar.classList.remove('animate-progress');
                bar.parentElement.classList.remove('pulse-glow');
            }
        });
    };
}

/**
 * Initialize parallax scroll effect system
 */
function initParallaxSystem() {
    // Update parallax elements on scroll
    window.updateParallaxElements = function() {
        const parallaxLayers = window.animationElements.parallaxLayers;
        if (parallaxLayers.length === 0) return;
        
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-parallax') || 0.2);
            const offset = window.pageYOffset * speed;
            
            // Apply transform based on layer's data-parallax-direction
            const direction = layer.getAttribute('data-parallax-direction') || 'y';
            
            if (direction === 'y') {
                layer.style.transform = `translateY(${offset}px)`;
            } else if (direction === 'x') {
                layer.style.transform = `translateX(${offset}px)`;
            } else if (direction === 'scale') {
                const scale = 1 + (offset * 0.001);
                layer.style.transform = `scale(${scale})`;
            }
        });
    };
}

/**
 * Initialize staggered text animations for headings
 */
function initStaggeredTextAnimations() {
    // Setup heading animations - splits text into letters for staggered animation
    const headings = window.animationElements.headings;
    
    headings.forEach(heading => {
        const text = heading.textContent;
        heading.textContent = ''; // Clear text
        
        // Create spans for each letter with staggered delays
        [...text].forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space for spaces
            span.style.animationDelay = `${index * 0.03}s`; // 30ms between letters
            span.className = 'animate-letter';
            heading.appendChild(span);
        });
    });
    
    // Function to trigger heading animations when in viewport
    window.runHeadingAnimations = function() {
        const windowHeight = window.innerHeight;
        
        headings.forEach(heading => {
            const headingTop = heading.getBoundingClientRect().top;
            
            if (headingTop < windowHeight - 100) {
                heading.classList.add('animate-heading-active');
            }
        });
    };
    
    // Add scroll listener specifically for heading animations
    window.addEventListener('scroll', window.runHeadingAnimations);
}

/**
 * Initialize interactive element effects (hover glows, click particles)
 */
function initInteractiveElements() {
    // Add interactive effects to buttons and cards
    const interactiveElements = document.querySelectorAll('.btn, .card, .interactive-element');
    
    interactiveElements.forEach(element => {
        // Add hover glow effect
        element.addEventListener('mouseenter', () => {
            element.classList.add('hover-glow');
        });
        
        element.addEventListener('mouseleave', () => {
            element.classList.remove('hover-glow');
        });
        
        // Add click particle effect
        element.addEventListener('click', (e) => {
            createClickParticles(e.clientX, e.clientY, element);
        });
    });
}

/**
 * Create particle effects on click
 */
function createClickParticles(x, y, sourceElement) {
    // Create particle container if it doesn't exist
    let particleContainer = document.querySelector('.particle-container');
    if (!particleContainer) {
        particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        document.body.appendChild(particleContainer);
    }
    
    // Get accent color from the source element or use default
    const computedStyle = window.getComputedStyle(sourceElement);
    const elementColor = computedStyle.getPropertyValue('--theme-accent-primary') || '#04A3FF';
    
    // Create multiple particles
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        
        // Random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        
        // Calculate end position
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        // Set particle properties
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = elementColor;
        particle.style.setProperty('--end-x', `${endX}px`);
        particle.style.setProperty('--end-y', `${endY}px`);
        
        // Add to container and start animation
        particleContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}
