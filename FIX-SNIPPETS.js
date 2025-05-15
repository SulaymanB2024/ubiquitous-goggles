/**
 * Strategic Engine Fixes - May 15, 2025
 * Apply these changes to fix text legibility and background network issues
 */

// 1. Text Legibility Fixes - enhanced-hero.css
// Update hero heading styles for better readability
.enhanced-hero .hero-content h1 {
    font-size: clamp(2.5rem, 8vw, 4rem);
    letter-spacing: 0.2em; /* Increased letter spacing for better readability */
    margin-bottom: 1.5rem;
    color: var(--theme-light-text);
    font-weight: 700;
    text-shadow: 
        0 0 1px rgba(255, 255, 255, 0.5),
        0 0 4px rgba(var(--theme-accent-primary-rgb), 0.2); /* Refined shadow for clarity */
    position: relative;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 0.1em 0; /* Add vertical padding to separate from other elements */
}

// Add tagline styling for improved clarity
.enhanced-hero .hero-content .tagline {
    font-size: clamp(1rem, 3vw, 1.4rem);
    font-family: 'Source Code Pro', 'Roboto Mono', monospace;
    letter-spacing: 0.25em;
    margin-bottom: 2rem;
    text-transform: uppercase;
    color: var(--theme-accent-primary);
    display: block;
    position: relative;
    padding: 0.5rem 0;
    font-weight: 400;
    /* Improved text shadow for better legibility */
    text-shadow: 
        0 0 1px rgba(255, 255, 255, 0.4),
        0 0 3px rgba(var(--theme-accent-primary-rgb), 0.2);
    /* Better font rendering */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

// 2. Background Network Fixes - particles-config.js
// Add mouse interaction code to particles-config.js
heroSection.addEventListener('mousemove', throttle((e) => {
    const rect = heroSection.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Set global variable for particle attraction
    window.mousePosition = {
        x: mouseX,
        y: mouseY
    };
    
    // Apply mouse influence to particles if pJS is available
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        const pJS = window.pJSDom[0].pJS;
        
        // Add subtle attraction to mouse position
        const attractForce = 90; // Attraction strength (lower = stronger)
        const attractRadius = 250; // Attraction radius
        
        pJS.particles.array.forEach(particle => {
            // Calculate distance to mouse
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply attraction force if within radius
            if (distance < attractRadius) {
                const force = (attractRadius - distance) / attractForce;
                particle.vx += (dx / distance) * force;
                particle.vy += (dy / distance) * force;
            }
        });
    }
}, 50));

// 3. Script Loading Order - index.html
// Update script loading order (top of body closing tag)
<!-- Core System Components -->
<script src="js/event-bus.js"></script>
<script src="js/system-log.js"></script>

<!-- JavaScript Modules -->
<script src="js/main.js"></script>
<script src="js/navigation.js"></script>
<script src="js/animations.js"></script>
<script src="js/timeline-filter.js"></script>
<script src="js/projects.js"></script>
<script src="js/contact.js"></script>
<script src="js/advanced-effects.js"></script>
<script src="js/info-panel.js"></script>
<script src="js/theme-system.js"></script>
<script src="js/network-visualization.js"></script>
<script src="js/particles-config.js"></script>

<!-- Enhanced Interface Components -->
<script src="js/enhanced-system-log.js"></script>
<script src="js/command-palette.js"></script>
<script src="js/enhanced-navigation.js"></script>
<script src="js/modal.js"></script>
<script src="js/enhanced-skills-radar.js"></script>

// 4. EventBus Enhancements - event-bus.js
// Add diagnostic capabilities to EventBus
class EventBus {
    constructor() {
        this.subscribers = {};
        this.eventHistory = [];
        this.maxHistoryLength = 100;
        this.debugMode = false;
    }
    
    // Add diagnostic methods
    getEvents() {
        return Object.keys(this.subscribers);
    }
    
    getEventHistory(limit = this.maxHistoryLength) {
        return this.eventHistory.slice(0, limit);
    }
    
    getSubscriberCount(event) {
        return this.subscribers[event]?.length || 0;
    }
    
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[EventBus] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}
