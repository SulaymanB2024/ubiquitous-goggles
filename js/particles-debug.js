/**
 * Particles Debug Script
 * Checks particles.js initialization and provides fallback
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Particles Debug: DOM loaded');
    
    // Check if particles.js is available
    if (typeof particlesJS === 'undefined') {
        console.error('❌ Particles Debug: particlesJS not found - script may not have loaded');
        return;
    }
    
    console.log('✅ Particles Debug: particlesJS found');
    
    // Check if particles container exists
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) {
        console.error('❌ Particles Debug: particles-js container not found');
        return;
    }
    
    console.log('✅ Particles Debug: particles container found');
    
    // Try to initialize particles with a simple config
    try {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 50,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#00BFFF"
                },
                "shape": {
                    "type": "circle"
                },
                "opacity": {
                    "value": 0.5,
                    "random": false
                },
                "size": {
                    "value": 3,
                    "random": true
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#00BFFF",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    }
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "push": {
                        "particles_nb": 4
                    }
                }
            },
            "retina_detect": true
        });
        
        console.log('✅ Particles Debug: particles initialized successfully');
        
        // Check if canvas was created
        setTimeout(() => {
            const canvas = particlesContainer.querySelector('canvas');
            if (canvas) {
                console.log('✅ Particles Debug: canvas created', canvas);
            } else {
                console.error('❌ Particles Debug: canvas not created');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Particles Debug: initialization failed', error);
    }
});
