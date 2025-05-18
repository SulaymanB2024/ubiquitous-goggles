/**
 * Advanced visual effects and animations
 */
document.addEventListener('DOMContentLoaded', function() {
  // Boot sequence animation
  createBootSequence();
  
  // System log animation
  initSystemLog();
  
  // Create data flow lines for visual effect
  createDataFlowLines();
  
  // Add cursor blink effect to data points
  addCursorBlinkToDataPoints();
  
  // Create subtle background patterns
  createBackgroundPatterns();
  
  // Enhanced particle effects for hero section
  enhanceParticlesEffect();
});

/**
 * Create boot sequence animation overlay
 */
function createBootSequence() {
  // Create boot sequence overlay
  const bootOverlay = document.createElement('div');
  bootOverlay.className = 'boot-overlay';
  
  // Boot sequence text lines
  const bootText1 = document.createElement('div');
  bootText1.className = 'boot-text boot-text-1';
  bootText1.innerText = 'INITIALIZING S.BOWLES_OS_V2.0...';
  
  const bootText2 = document.createElement('div');
  bootText2.className = 'boot-text boot-text-2';
  bootText2.innerText = 'LOADING CORE MODULES: FINANCE, TECHNOLOGY, MUSIC...';
  
  const bootText3 = document.createElement('div');
  bootText3.className = 'boot-text boot-text-3';
  bootText3.innerText = 'SYSTEM ONLINE. INTERFACE READY.';
  
  // Boot loader
  const bootLoader = document.createElement('div');
  bootLoader.className = 'boot-loader';
  
  // Append all elements
  bootOverlay.appendChild(bootText1);
  bootOverlay.appendChild(bootText2);
  bootOverlay.appendChild(bootText3);
  bootOverlay.appendChild(bootLoader);
  
  document.body.appendChild(bootOverlay);
  
  // Make sure the boot overlay is fully visible initially
  bootOverlay.style.opacity = '1';
  bootOverlay.style.display = 'flex';
  
  // Remove boot overlay after animation completes
  setTimeout(() => {
    bootOverlay.style.opacity = '0';
    bootOverlay.style.pointerEvents = 'none';
    setTimeout(() => bootOverlay.remove(), 1000);
  }, 3500);
}

/**
 * Initialize the system log animation
 */
function initSystemLog() {
  // Create system log container
  const systemLog = document.createElement('div');
  systemLog.className = 'system-log';
  
  // Log header with title and toggle
  const logHeader = document.createElement('div');
  logHeader.className = 'log-header';
  
  const logTitle = document.createElement('div');
  logTitle.className = 'log-title';
  logTitle.innerText = '// SYSTEM_LOG';
  
  const logToggle = document.createElement('div');
  logToggle.className = 'log-toggle';
  logToggle.innerHTML = '<i class="fas fa-minus"></i>';
  logToggle.onclick = function() {
    const logContent = document.querySelector('.log-content');
    if (logContent.style.display === 'none') {
      logContent.style.display = 'block';
      logToggle.innerHTML = '<i class="fas fa-minus"></i>';
    } else {
      logContent.style.display = 'none';
      logToggle.innerHTML = '<i class="fas fa-plus"></i>';
    }
  };
  
  logHeader.appendChild(logTitle);
  logHeader.appendChild(logToggle);
  
  // Log content area
  const logContent = document.createElement('div');
  logContent.className = 'log-content';
  
  // Append all elements
  systemLog.appendChild(logHeader);
  systemLog.appendChild(logContent);
  
  document.body.appendChild(systemLog);
  
  // Initialize with some log entries
  addLogEntry('System initialized successfully', 'system');
  
  // Add log entries as user scrolls through sections
  window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (sectionTop < windowHeight / 2 && sectionTop > -windowHeight / 2) {
        if (!section.hasAttribute('data-logged')) {
          // Add log entry for this section
          addLogEntry(`Accessing ${section.id.toUpperCase()} module...`, 'system');
          section.setAttribute('data-logged', 'true');
          
          // Add specific log messages based on section
          switch(section.id) {
            case 'hero':
              setTimeout(() => addLogEntry('Interface connection established'), 1000);
              break;
            case 'about':
              setTimeout(() => addLogEntry('Loading system architecture overview'), 1000);
              break;
            case 'projects':
              setTimeout(() => addLogEntry('Cataloging available applications'), 1000);
              break;
            case 'skills':
              setTimeout(() => addLogEntry('Evaluating system libraries and dependencies'), 1000);
              break;
            case 'leadership':
              setTimeout(() => addLogEntry('Analyzing network protocols and governance'), 1000);
              break;
            case 'contact':
              setTimeout(() => addLogEntry('Communication channels available'), 1000);
              break;
          }
        }
      }
    });
  });
  
  // Add interactions log entries
  document.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target.classList.contains('btn')) {
      addLogEntry('Action triggered: ' + target.textContent.trim());
    }
    
    if (target.classList.contains('filter-btn')) {
      addLogEntry('Filtering projects: ' + target.textContent.trim());
    }
    
    if (target.classList.contains('modal-close')) {
      addLogEntry('Closing detail view');
    }
  });
}

/**
 * Add a new entry to the system log
 */
function addLogEntry(message, type = '') {
  const logContent = document.querySelector('.log-content');
  if (!logContent) return;
  
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  
  const logTimestamp = document.createElement('span');
  logTimestamp.className = 'log-timestamp';
  logTimestamp.innerText = timestamp;
  
  const logMessage = document.createElement('span');
  logMessage.className = `log-message ${type}`;
  logMessage.innerText = message;
  
  logEntry.appendChild(logTimestamp);
  logEntry.appendChild(logMessage);
  
  logContent.appendChild(logEntry);
  logContent.scrollTop = logContent.scrollHeight;
  
  // Remove old entries if there are too many
  const entries = document.querySelectorAll('.log-entry');
  if (entries.length > 20) {
    entries[0].remove();
  }
}

/**
 * Create decorative data flow lines with reduced visual complexity
 */
function createDataFlowLines() {
  // Add data flow lines to each section for visual effect, but limit to fewer sections
  const sections = document.querySelectorAll('section:not(#hero)');
  
  sections.forEach((section, index) => {
    // Only add flow lines to every other section to reduce visual complexity
    if (index % 2 === 0) {
      const left = document.createElement('div');
      left.className = 'data-flow-line left';
      
      const right = document.createElement('div');
      right.className = 'data-flow-line right';
      
      section.style.position = 'relative';
      section.appendChild(left);
      section.appendChild(right);
      
      // Only add center line to one section for minimalist design
      if (index === 2) {  // Only add to the 3rd applicable section
        const center = document.createElement('div');
        center.className = 'data-flow-line center';
        section.appendChild(center);
      }
    }
  });
}

/**
 * Add blinking cursor to data points
 */
function addCursorBlinkToDataPoints() {
  const dataPoints = document.querySelectorAll('.data-point');
  dataPoints.forEach(dp => {
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    dp.appendChild(cursor);
  });
}

/**
 * Create subtle background patterns for visual interest
 */
function createBackgroundPatterns() {
  // Add grid background pattern to sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    const gridPattern = document.createElement('div');
    gridPattern.className = 'grid-bg-pattern';
    section.prepend(gridPattern);
    
    // Add tech pattern to alternating sections
    if (sections.indexOf(section) % 2 === 1) {
      const techPattern = document.createElement('div');
      techPattern.className = 'tech-pattern';
      section.prepend(techPattern);
    }
  });
}

/**
 * Enhance the particles effect for the hero section with optimized performance
 */
function enhanceParticlesEffect() {
  // Initialize multiple particle instances for depth layers
  initializeMultiLayerParticles();

  // We'll wait for particles.js to initialize
  setTimeout(() => {
    // Check if particles.js is initialized
    if (window.pJSDom && window.pJSDom.length > 0) {
      // Helper function for throttling with last value caching for smoother transitions
      const throttle = (func, limit) => {
        let lastCall = 0;
        let lastArgs = null;
        let timeoutId = null;
        
        return function(...args) {
          const now = Date.now();
          lastArgs = args;
          
          // If we haven't called recently, call immediately
          if (now - lastCall >= limit) {
            lastCall = now;
            func.apply(this, args);
          } else {
            // Otherwise, schedule a deferred call for smoother motion
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              lastCall = Date.now();
              func.apply(this, lastArgs);
            }, limit - (now - lastCall));
          }
        };
      };
      
      // Enhanced parallax effect with smoother motion and depth separation
      const heroSection = document.getElementById('hero');
      
      // Track previous transform values for smoother interpolation
      const transforms = {
        back: { x: 0, y: 0 },
        mid: { x: 0, y: 0 },
        front: { x: 0, y: 0 },
        content: { x: 0, y: 0 }
      };
      
      // Apply smooth parallax on mouse movement
      heroSection.addEventListener('mousemove', throttle(function(e) {
        // Get mouse position relative to hero section
        const rect = heroSection.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate movement factors with enhanced sensitivity
        const moveFactorX = (mouseX / rect.width - 0.5) * 26; // Increased range for more noticeable effect
        const moveFactorY = (mouseY / rect.height - 0.5) * 26;
        
        // Get all particle layers
        const layers = document.querySelectorAll('.hero-layer');
        
        // Apply different movement to each layer based on depth
        layers.forEach(layer => {
          const depth = parseFloat(layer.getAttribute('data-depth')) || 1;
          const layerId = layer.id;
          const layerType = layerId.includes('back') ? 'back' : 
                           layerId.includes('mid') ? 'mid' : 'front';
          
          // Calculate target position with depth factor
          // Back layer moves less, front layer moves more
          const targetX = Math.round(moveFactorX * -1 * depth * 10) / 10;
          const targetY = Math.round(moveFactorY * -1 * depth * 10) / 10;
          
          // Smooth interpolation between current and target position (easing)
          transforms[layerType].x += (targetX - transforms[layerType].x) * 0.1;
          transforms[layerType].y += (targetY - transforms[layerType].y) * 0.1;
          
          // Apply transform with hardware acceleration
          const translateX = Math.round(transforms[layerType].x * 10) / 10;
          const translateY = Math.round(transforms[layerType].y * 10) / 10;
          
          // Apply scale factor based on depth for enhanced 3D effect
          const scale = 1 + Math.abs(depth - 0.5) * 0.02;
          
          // Apply transform with both translation and subtle scale
          layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        });
        
        // Apply gentler parallax effect to hero content with smoother interpolation
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
          // Move content in opposite direction of background for enhanced depth
          const targetContentX = Math.round(moveFactorX * 0.08 * 10) / 10; // Reversed direction
          const targetContentY = Math.round(moveFactorY * 0.08 * 10) / 10; // Reversed direction
          
          // Smooth interpolation for content
          transforms.content.x += (targetContentX - transforms.content.x) * 0.07;
          transforms.content.y += (targetContentY - transforms.content.y) * 0.07;
          
          // Apply transform with subtle rotation for dynamic effect
          const rotateX = Math.round(moveFactorY * -0.4 * 10) / 10; // Subtle rotation based on mouse Y
          const rotateY = Math.round(moveFactorX * 0.4 * 10) / 10; // Subtle rotation based on mouse X
          
          heroContent.style.transform = `translate3d(${transforms.content.x}px, ${transforms.content.y}px, 0) 
                                         rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
      }, 16)); // 60fps update rate for smoother animation
      
      // Debounced scroll handler for better performance
      const debounce = (func, delay) => {
        let inDebounce;
        return function(...args) {
          clearTimeout(inDebounce);
          inDebounce = setTimeout(() => func.apply(this, args), delay);
        };
      };
      
      // Enhanced scroll effects with bloom intensity control
      window.addEventListener('scroll', debounce(function() {
        const scrollY = window.scrollY;
        const heroHeight = document.getElementById('hero').offsetHeight;
        
        // If scrolling within the hero section
        if (scrollY < heroHeight) {
          // Calculate scroll percentage
          const scrollPercent = scrollY / heroHeight;
          
          // Adjust bloom opacity based on scroll position
          const bloomOverlay = document.querySelector('.hero-bloom-overlay');
          if (bloomOverlay) {
            bloomOverlay.style.opacity = Math.max(0, 1 - scrollPercent * 2);
          }
          
          // Adjust particle sizes in different layers based on scroll
          window.pJSDom.forEach((pJSDomItem, index) => {
            if (pJSDomItem && pJSDomItem.pJS && pJSDomItem.pJS.particles && pJSDomItem.pJS.particles.array) {
              // Only update every nth particle for performance
              for (let i = 0; i < pJSDomItem.pJS.particles.array.length; i += 3) {
                const particle = pJSDomItem.pJS.particles.array[i];
                if (particle && particle.radius_original) {
                  particle.radius = particle.radius_original * (1 - scrollPercent * 0.3);
                }
              }
            }
          });
        }
      }, 100)); // 100ms debounce for scroll events
      
      // Add pulse effect to bright particles
      addPulseEffectToParticles();
    }
  }, 1000);
}

/**
 * Initialize different particle layers with varying configurations
 */
function initializeMultiLayerParticles() {
  // Back layer (distant particles)
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-back', getParticlesConfig('back'));
    
    // Mid layer
    setTimeout(() => {
      particlesJS('particles-mid', getParticlesConfig('mid'));
    }, 100);
    
    // Front layer (already initialized in main.js)
  }
}

/**
 * Get different particle configurations based on layer
 */
function getParticlesConfig(layer) {
  // Base configuration with modifications per layer
  const baseConfig = {
    "particles": {
      "number": {
        "value": layer === 'back' ? 35 : layer === 'mid' ? 25 : 18,
        "density": {
          "enable": true,
          "value_area": layer === 'back' ? 2200 : layer === 'mid' ? 1800 : 1400
        }
      },
      "color": {
        "value": layer === 'back' ? ["#1A2438"] : layer === 'mid' ? ["#3B4A68", "#4B5A78"] : ["#04A3FF", "#4A90E2", "#5F9AE8"] 
      },
      "shape": {
        "type": ["circle"],
        "stroke": {
          "width": layer === 'back' ? 0.2 : layer === 'mid' ? 0.3 : 0.6,
          "color": "rgba(255,255,255,0.1)"
        }
      },
      "opacity": {
        "value": layer === 'back' ? 0.35 : layer === 'mid' ? 0.55 : 0.75,
        "random": true,
        "anim": {
          "enable": true,
          "speed": layer === 'back' ? 0.15 : layer === 'mid' ? 0.25 : 0.35,
          "opacity_min": layer === 'back' ? 0.08 : layer === 'mid' ? 0.18 : 0.25,
          "sync": false
        }
      },
      "size": {
        "value": layer === 'back' ? 1.0 : layer === 'mid' ? 1.5 : 2.2,
        "random": true,
        "anim": {
          "enable": true,
          "speed": layer === 'back' ? 0.3 : layer === 'mid' ? 0.4 : 0.5,
          "size_min": layer === 'back' ? 0.5 : layer === 'mid' ? 0.7 : 1.0,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": layer === 'back' ? 240 : layer === 'mid' ? 190 : 160,
        "color": layer === 'back' ? "#1F2B47" : layer === 'mid' ? "#3B4A68" : "#04A3FF",
        "opacity": layer === 'back' ? 0.06 : layer === 'mid' ? 0.10 : 0.15,
        "width": layer === 'back' ? 0.4 : layer === 'mid' ? 0.55 : 0.75
      },
      "move": {
        "enable": true,
        "speed": layer === 'back' ? 0.2 : layer === 'mid' ? 0.3 : 0.4,
        "direction": "none",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": true,
          "rotateX": layer === 'back' ? 300 : layer === 'mid' ? 200 : 150,
          "rotateY": layer === 'back' ? 600 : layer === 'mid' ? 400 : 300  
        }
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
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": layer === 'back' ? 200 : layer === 'mid' ? 180 : 160,
          "line_linked": {
            "opacity": layer === 'back' ? 0.2 : layer === 'mid' ? 0.3 : 0.4
          }
        },
        "push": {
          "particles_nb": layer === 'back' ? 2 : layer === 'mid' ? 3 : 4
        }
      }
    },
    "retina_detect": true
  };
  
  return baseConfig;
}

/**
 * Add pulsing effect to particles with brighter colors
 */
function addPulseEffectToParticles() {
  // Wait for particles to be fully initialized
  setTimeout(() => {
    if (window.pJSDom && window.pJSDom.length > 0) {
      // Apply to all particle layers for a coordinated bloom effect
      window.pJSDom.forEach((pJSDomItem, layerIndex) => {
        if (pJSDomItem && pJSDomItem.pJS && pJSDomItem.pJS.particles && pJSDomItem.pJS.particles.array) {
          const layer = pJSDomItem.pJS;
          // Apply more pulse particles to front layer, fewer to back layers
          // This creates a more dramatic depth effect
          const pulsePercent = layerIndex === 2 ? 0.25 : layerIndex === 1 ? 0.15 : 0.08;
          const pulseParticles = Math.floor(layer.particles.array.length * pulsePercent);
          
          // Track pulsing particles by ID to avoid duplicates
          const pulsingParticleIds = new Set();
          
          for (let i = 0; i < pulseParticles; i++) {
            const randIndex = Math.floor(Math.random() * layer.particles.array.length);
            const randParticle = layer.particles.array[randIndex];
            
            if (randParticle && !pulsingParticleIds.has(randIndex)) {
              pulsingParticleIds.add(randIndex);
              
              // Mark this particle for special rendering with enhanced properties
              randParticle.isPulsing = true;
              randParticle.pulsePhase = Math.random() * Math.PI * 2; // Random starting phase
              randParticle.pulseSpeed = 0.03 + Math.random() * 0.08; // Slightly slower for more gentle pulsing
              randParticle.pulseColor = layerIndex === 2 ? '#04A3FF' : layerIndex === 1 ? '#3B4A68' : '#1A2438';
              randParticle.pulseIntensity = layerIndex === 2 ? 1.0 : layerIndex === 1 ? 0.7 : 0.4;
              
              // Store original values for animation
              randParticle.original_radius = randParticle.radius;
              randParticle.original_opacity = randParticle.opacity;
            }
          }
          
          // Override the draw function to add pulsation with different behavior per layer
          const originalDrawParticle = layer.fn.particlesDraw;
          layer.fn.particlesDraw = function() {
            originalDrawParticle.call(this);
            
            // Add enhanced bloom effect to pulsing particles
            const ctx = layer.canvas.ctx;
            
            // Enable composite operations for better bloom
            ctx.globalCompositeOperation = 'screen';
            
            layer.particles.array.forEach(p => {
              if (p.isPulsing) {
                // Update pulse phase with varied speeds
                p.pulsePhase += p.pulseSpeed;
                if (p.pulsePhase > Math.PI * 2) p.pulsePhase -= Math.PI * 2;
                
                // Calculate pulse factor with smoother sine wave (0 to 1)
                const pulseFactor = (Math.sin(p.pulsePhase) + 1) / 2;
                
                // Enhanced glow effect with larger bloom radius
                const glowSize = p.original_radius * (1 + pulseFactor * p.pulseIntensity);
                const glowOpacity = p.original_opacity * (0.3 + pulseFactor * 0.5);
                
                // Extract RGB components from pulse color for bloom
                let r, g, b;
                if (p.pulseColor.startsWith('#')) {
                  const hex = p.pulseColor.substring(1);
                  r = parseInt(hex.substring(0, 2), 16);
                  g = parseInt(hex.substring(2, 4), 16);
                  b = parseInt(hex.substring(4, 6), 16);
                } else {
                  r = g = b = 255; // Fallback to white
                }
                
                // Draw outer glow with gradient for soft edges
                const gradient = ctx.createRadialGradient(p.x, p.y, glowSize * 0.5, p.x, p.y, glowSize * 2.5);
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowOpacity * 0.15})`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Draw mid glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize * 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${glowOpacity * 0.25})`;
                ctx.fill();
                
                // Draw inner glow (brightest)
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${glowOpacity * 0.4})`;
                ctx.fill();
                
                // Reset composite operation
                if (layerIndex === window.pJSDom.length - 1) {
                  ctx.globalCompositeOperation = 'source-over';
                }
              }
            });
          };
        }
      });
    }
  }, 1200);
}
