/**
 * Strategic Insight Engine - Enhanced particle visualization system
 * Provides data-like visual effects with advanced interactivity patterns
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if particles container exists
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) {
        console.warn("Particles container not found. Background network effects will not be initialized.");
        return;
    }
    
    // Log initialization
    if (window.SystemLog) {
        window.SystemLog.addEntry({
            type: "system",
            category: "initialization",
            message: "Initializing particle visualization system",
            timestamp: new Date()
        });
    }
    
    // Initialize particle system
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 30, // Further reduced particle count for optimal performance
                    "density": {
                        "enable": true,
                        "value_area": 1500 // Increased area for more breathing room
                    }
                },
                "color": {
                    "value": ["#00BFFF", "#3B4A68", "#5F6B85", "#4A90E2"] // Enhanced color palette
                },
                "shape": {
                    "type": ["circle"], // Only circles for best performance
                    "stroke": {
                        "width": 0.3,
                        "color": "rgba(255,255,255,0.08)"
                    },
                    "polygon": {
                        "nb_sides": 6 // Hexagons for data visualization aesthetic
                    }
                },
                "opacity": {
                    "value": 0.4, // Further reduced opacity for subtler appearance
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 0.3, // Even slower animation for minimal distraction
                        "opacity_min": 0.15, // Lower minimum opacity
                        "sync": false
                    }
                },
                "size": {
                    "value": 2.0, // Even smaller particles for better performance
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 0.6, // Further slowed size animation
                        "size_min": 0.8, // Narrower size range for less visual noise
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 180, // Increased connection distance for fewer, longer connections
                    "color": "#3B4A68",
                    "opacity": 0.15, // More subtle connections
                    "width": 0.8,
                    "shadow": {
                        "enable": false, // Disabled shadows for better performance
                        "blur": 5,
                        "color": "#00BFFF"
                    }
                },
                "move": {
                    "enable": true,
                    "speed": 0.4, // Further slowed movement for an even calmer experience
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": true,
                        "rotateX": 150, // Further reduced for even less chaotic movement
                        "rotateY": 300  // More balanced rotation values
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab", // Kept grab for interactivity
                        // Add throttling for mousemove events
                        "_throttleTime": 60 // Throttle to execute at most every 60ms
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push" // Limited particle addition
                    },
                    "resize": true,
                    // Add debouncing for resize events
                    "_resizeDebounceTime": 200 // Debounce resize to execute at most every 200ms
                },
                "modes": {
                    "grab": {
                        "distance": 180, // Increased interaction distance for subtler effect
                        "line_linked": {
                            "opacity": 0.2, // More subtle connections on hover
                            "color": "#00BFFF" // Highlight color
                        }
                    },
                    "bubble": {
                        "distance": 250, // Increased bubble effect distance
                        "size": 4.0, // Smaller bubbles
                        "duration": 3, // Slower duration
                        "opacity": 1,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 300,
                        "duration": 2.5
                    },
                    "push": {
                        "particles_nb": 6 // Add more particles on click
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
        
        // Log successful initialization
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: "system",
                category: "initialization",
                message: "Particle visualization system initialized successfully",
                timestamp: new Date()
            });
        }
        
        // Publish event to EventBus if available
        if (window.EventBus) {
            window.EventBus.publish('particles:initialized', {
                timestamp: new Date()
            });
        }
        
        // Enhanced particle effects with gentle pulsing for data visualization and startup animation
        setTimeout(() => {
            if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
                const pJS = window.pJSDom[0].pJS;
                
                // Add startup animation
                pJS.particles.array.forEach(particle => {
                    // Start particles from center and expand outward
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 3;
                    const startDistance = Math.random() * 10;
                    
                    particle.x = pJS.canvas.w / 2 + Math.cos(angle) * startDistance;
                    particle.y = pJS.canvas.h / 2 + Math.sin(angle) * startDistance;
                    
                    particle.vx = Math.cos(angle) * speed * 0.5;
                    particle.vy = Math.sin(angle) * speed * 0.5;
                });
                
                // Store original properties for animation
                pJS.particles.array.forEach(particle => {
                    particle.radius_original = particle.radius;
                    particle.opacity_original = particle.opacity;
                });
                
                // Add minimal pulsing effect to even fewer particles - with debouncing for better performance
                let lastPulseTime = Date.now();
                const pulseInterval = 300; // Even longer interval between pulses (300ms)
                
                // Use requestAnimationFrame for more efficient updates
                function updatePulse() {
                    const now = Date.now();
                    if (now - lastPulseTime >= pulseInterval) {
                        lastPulseTime = now;
                        
                        // Process fewer particles and use more efficient loop
                        for (let i = 0; i < pJS.particles.array.length; i++) {
                            // Only affect every 8th particle for better performance and much calmer visuals
                            if (i % 8 === 0) {
                                const particle = pJS.particles.array[i];
                                
                                // Extremely gentle pulsing size effect with very slow frequency
                                const pulseFactor = 1 + 0.1 * Math.sin(now * 0.0005 + i); // Much slower wave
                                if (particle.radius_original) {
                                    particle.radius = particle.radius_original * pulseFactor;
                                }
                                
                                // Minimal opacity variation
                                if (particle.opacity_original) {
                                    particle.opacity = particle.opacity_original * 
                                        (0.92 + 0.08 * Math.sin(now * 0.0008 + i)); // Very subtle change
                                }
                            }
                        }
                        
                        // Force redraw only when needed
                        pJS.fn.particlesRefresh();
                    }
                    
                    // Continue animation loop
                    requestAnimationFrame(updatePulse);
                }
                
                // Start the optimized animation loop
                requestAnimationFrame(updatePulse);
            }
        }, 500);            // Add mouse movement interactivity for subtle particle attraction
        // Using throttled event for better performance
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            // Throttle function to limit event firing frequency
            const throttle = (func, limit) => {
                let inThrottle;
                return function() {
                    const args = arguments;
                    const context = this;
                    if (!inThrottle) {
                        func.apply(context, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                };
            };
            
            // Initialize mouse position at center
            window.mousePosition = {
                x: heroSection.clientWidth / 2,
                y: heroSection.clientHeight / 2
            };
            
            // Throttled mousemove handler
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
            }, 50)); // Only trigger at most once per 50ms
        }
    } else {
        console.error("particlesJS is not defined. Please check the script import.");
    }
});
