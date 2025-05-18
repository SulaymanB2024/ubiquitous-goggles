/**
 * Global Aesthetic & Texture - Palantir Inspired UI
 * Handles dynamic texture, animations and global UI effects
 */

class GlobalAesthetic {
    constructor() {
        // Initialize global aesthetic features
        this.init();
    }

    /**
     * Initialize global aesthetic features
     */
    init() {
        // Add data attributes for depth layers
        this.setupDepthLayers();
        
        // Apply circuit texture to appropriate elements
        this.applyCircuitTextures();
        
        // Setup animation observer
        this.setupAnimationObserver();
    }

    /**
     * Setup depth layers for 3D-like UI composition
     */
    setupDepthLayers() {
        // Get all section containers
        const sections = document.querySelectorAll('section, .card, .module');
        
        // Assign appropriate depth layers based on nesting and content
        sections.forEach((section, index) => {
            // Base layer is 1
            let depthLayer = 1;
            
            // Adjust based on nesting level
            const parents = this.getParentCount(section, 'section, .card, .module');
            depthLayer += parents;
            
            // Adjust for specific elements
            if (section.classList.contains('hero-section')) {
                depthLayer = 1; // Hero is background
            } else if (section.classList.contains('card')) {
                depthLayer = 2; // Cards are elevated
            } else if (section.classList.contains('system-log-container')) {
                depthLayer = 4; // Log is in the foreground
            }
            
            // Set depth layer class
            section.classList.add(`depth-layer-${Math.min(depthLayer, 5)}`);
        });
    }

    /**
     * Count how many parent elements match the selector
     */
    getParentCount(element, selector) {
        let count = 0;
        let parent = element.parentElement;
        
        while (parent) {
            if (parent.matches && parent.matches(selector)) {
                count++;
            }
            parent = parent.parentElement;
        }
        
        return count;
    }

    /**
     * Apply circuit textures to appropriate elements
     */
    applyCircuitTextures() {
        // Add to content sections that should have the circuit texture
        const contentSections = document.querySelectorAll('.content-section, .project-card, .module-container');
        
        contentSections.forEach(section => {
            section.classList.add('circuit-texture');
        });
        
        // Add grid pattern to larger sections
        const largeSections = document.querySelectorAll('.section-container, .projects-grid');
        
        largeSections.forEach(section => {
            section.classList.add('grid-pattern');
        });
    }

    /**
     * Setup animation observer for scroll-triggered animations
     */
    setupAnimationObserver() {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) return;
        
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class when element is visible
                    entry.target.classList.add('animate-gpu', 'animate-visible');
                    
                    // Unobserve after animation starts
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });
        
        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Apply frosted glass effect to an element
     * @param {HTMLElement} element The element to apply the effect to
     */
    applyGlassEffect(element) {
        if (!element) return;
        element.classList.add('glass-backdrop');
    }

    /**
     * Apply glow effect to an element 
     * @param {HTMLElement} element The element to apply the effect to
     */
    applyGlowEffect(element) {
        if (!element) return;
        element.classList.add('glow-effect');
    }

    /**
     * Set theme accent color dynamically
     * @param {string} color CSS color value 
     */
    setAccentColor(color) {
        // Convert color to RGB for CSS variable
        const tempEl = document.createElement('div');
        tempEl.style.color = color;
        document.body.appendChild(tempEl);
        const computedColor = getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        
        // Extract RGB values from computed color
        const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const r = rgbMatch[1];
            const g = rgbMatch[2];
            const b = rgbMatch[3];
            
            // Update CSS variables
            document.documentElement.style.setProperty('--theme-accent-primary', color);
            document.documentElement.style.setProperty('--theme-accent-primary-rgb', `${r}, ${g}, ${b}`);
        }
    }
}

// Initialize the global aesthetic when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.globalAesthetic = new GlobalAesthetic();
});
