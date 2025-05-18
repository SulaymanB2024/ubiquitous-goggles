/**
 * Enhanced typography effects for Palantir-style UI
 * Handles advanced letter animations, path drawing, and interactive typography
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the letter animations with proper animation order
    initLetterAnimations();
    
    // Initialize SVG path animations
    initSvgPathAnimations();
    
    // Initialize text effects
    if (window.EventBus) {
        window.EventBus.publish('typography:initialized', {
            timestamp: new Date()
        });
    }
});

/**
 * Initialize letter animations by setting CSS animation order variables
 */
function initLetterAnimations() {
    const letterElements = document.querySelectorAll('.letter-animate');
    
    letterElements.forEach(letter => {
        // Get the animation order from the data attribute
        const order = letter.getAttribute('data-animation-order');
        if (order) {
            // Set CSS variable for animation delay calculation
            letter.style.setProperty('--order', order);
        }
    });
    
    // Log initialization
    if (window.SystemLog) {
        window.SystemLog.addEntry({
            type: "system",
            category: "initialization",
            message: "Letter animation system initialized",
            timestamp: new Date()
        });
    }
}

/**
 * Initialize SVG path animations for drawing effects
 */
function initSvgPathAnimations() {
    const pathElements = document.querySelectorAll('.svg-path-animate');
    
    // Wait for page to load before triggering animations
    setTimeout(() => {
        pathElements.forEach(pathContainer => {
            pathContainer.classList.add('active');
        });
    }, 200);
}

/**
 * Handle hover interactions with letters for enhanced interactivity
 */
function initLetterInteractions() {
    const letters = document.querySelectorAll('.hero-content h1 .letter-animate');
    
    letters.forEach(letter => {
        letter.addEventListener('mouseenter', function() {
            this.style.textShadow = `
                0 0 5px rgba(255, 255, 255, 0.95),
                0 0 10px rgba(255, 255, 255, 0.8),
                0 0 15px rgba(var(--theme-accent-primary-rgb), 1.0),
                0 0 20px rgba(var(--theme-accent-primary-rgb), 0.8),
                0 0 35px rgba(var(--theme-accent-primary-rgb), 0.4)
            `;
        });
        
        letter.addEventListener('mouseleave', function() {
            this.style.textShadow = '';
        });
    });
}

// Run letter interactions after initial animations complete
setTimeout(initLetterInteractions, 3000);
