/**
 * Button effects module for Palantir-style UI enhancements
 * Implements advanced button interactions including:
 * - Neon radial halo effect on hover
 * - Click particle animations
 * - 3D bevel effects
 */
document.addEventListener('DOMContentLoaded', function() {
    initButtonEffects();
    
    // Log initialization
    if (window.SystemLog) {
        window.SystemLog.addEntry({
            type: "system",
            category: "initialization",
            message: "Button effects system initialized",
            timestamp: new Date()
        });
    }
    
    // Publish to event bus
    if (window.EventBus) {
        window.EventBus.publish('buttons:initialized', {
            timestamp: new Date()
        });
    }
});

/**
 * Initialize enhanced button effects
 */
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Create neon halo container
        const haloContainer = document.createElement('div');
        haloContainer.className = 'btn-neon-halo';
        
        // Create inner halo element
        const halo = document.createElement('div');
        halo.className = 'neon-halo';
        haloContainer.appendChild(halo);
        
        // Insert halo into button
        button.appendChild(haloContainer);
        
        // Setup event listeners
        setupButtonEvents(button);
    });
}

/**
 * Set up event listeners for button interaction effects
 */
function setupButtonEvents(button) {
    // Mouse move tracking for halo effect
    button.addEventListener('mousemove', handleHaloEffect);
    
    // Mouse enter/leave for halo visibility
    button.addEventListener('mouseenter', function() {
        const halo = this.querySelector('.neon-halo');
        if (halo) {
            halo.classList.add('active');
        }
    });
    
    button.addEventListener('mouseleave', function() {
        const halo = this.querySelector('.neon-halo');
        if (halo) {
            halo.classList.remove('active');
            // Reset halo position
            halo.style.top = '50%';
            halo.style.left = '50%';
        }
    });
    
    // Click particle effect
    button.addEventListener('click', createClickParticles);
}

/**
 * Handle mouse movement to control halo effect position
 */
function handleHaloEffect(e) {
    const button = e.currentTarget;
    const halo = button.querySelector('.neon-halo');
    
    if (!halo) return;
    
    const rect = button.getBoundingClientRect();
    
    // Calculate mouse position relative to button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update halo position with slight lag for smooth effect
    halo.style.left = `${x}px`;
    halo.style.top = `${y}px`;
}

/**
 * Create particle effects on button click
 */
function createClickParticles(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate click position relative to button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create particle container if it doesn't exist
    let particleContainer = button.querySelector('.btn-particles');
    if (!particleContainer) {
        particleContainer = document.createElement('div');
        particleContainer.className = 'btn-particles';
        button.appendChild(particleContainer);
    }
    
    // Create particles
    const numParticles = 12;
    const colors = [
        'var(--theme-accent-primary)',
        'rgba(var(--theme-accent-primary-rgb), 0.7)',
        '#ffffff',
        'rgba(var(--theme-accent-primary-rgb), 0.9)'
    ];
    
    for (let i = 0; i < numParticles; i++) {
        // Create particle element
        const particle = document.createElement('div');
        particle.className = 'btn-particle';
        
        // Set particle position
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 60 + 20;
        
        // Calculate end position
        const endX = distance * Math.cos(angle);
        const endY = distance * Math.sin(angle);
        
        // Set random size
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Set random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = color;
        
        // Set animation variables
        particle.style.setProperty('--end-x', `${endX}px`);
        particle.style.setProperty('--end-y', `${endY}px`);
        
        // Add particle to container
        particleContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode === particleContainer) {
                particleContainer.removeChild(particle);
            }
        }, 1000);
    }
    
    // Add click ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'btn-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode === button) {
            button.removeChild(ripple);
        }
    }, 600);
}
