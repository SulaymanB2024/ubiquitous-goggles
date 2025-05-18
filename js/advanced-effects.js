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
  
  // Create interactive blueprint grid
  createInteractiveBlueprintGrid();
  
  // Add cursor blink effect to data points
  addCursorBlinkToDataPoints();
  
  // Create subtle background patterns
  createBackgroundPatterns();
  
  // Enhanced particle effects for hero section
  enhanceParticlesEffect();
  
  // Create cursor trail effect
  createCursorTrailEffect();
  
  // Create focus mode
  createFocusMode();

  // Create dynamic HUD elements
  createDynamicHudElements();
});

/**
 * Helper function for debouncing function calls
 */
function debounce(func, delay) {
  let inDebounce;
  return function(...args) {
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func.apply(this, args), delay);
  };
}

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
 * Create decorative data flow lines with reduced visual complexity and improved performance
 */
function createDataFlowLines() {
  // Create a canvas for the data flow effect
  const dataFlowCanvas = document.createElement('canvas');
  dataFlowCanvas.className = 'data-flow-canvas';
  dataFlowCanvas.style.position = 'fixed';
  dataFlowCanvas.style.top = '0';
  dataFlowCanvas.style.left = '0';
  dataFlowCanvas.style.width = '100%';
  dataFlowCanvas.style.height = '100%';
  dataFlowCanvas.style.pointerEvents = 'none';
  dataFlowCanvas.style.zIndex = '1';
  dataFlowCanvas.style.opacity = '0.15';
  document.body.appendChild(dataFlowCanvas);

  // Set canvas size to match window
  const resizeCanvas = () => {
    dataFlowCanvas.width = window.innerWidth;
    dataFlowCanvas.height = window.innerHeight;
    if (dataFlowLines) {
      // Reset lines when canvas is resized
      dataFlowLines.forEach(line => {
        initializeLine(line);
      });
    }
  };
  
  // Initialize canvas size
  resizeCanvas();
  
  // Add window resize listener
  window.addEventListener('resize', debounce(resizeCanvas, 250));
  
  // Get canvas context
  const ctx = dataFlowCanvas.getContext('2d');
  
  // Data flow line properties
  const lineCount = Math.min(15, Math.floor(window.innerWidth / 100)); // Adaptive line count based on screen width
  const dataFlowLines = [];
  
  // Direction enumeration
  const Direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
  };
  
  // Create data lines
  for (let i = 0; i < lineCount; i++) {
    dataFlowLines.push({
      x: 0,
      y: 0,
      direction: Direction.RIGHT, // Starting direction
      length: randomBetween(50, 150),
      speed: randomBetween(0.5, 2),
      width: randomBetween(1, 3),
      color: Math.random() > 0.7 ? 'var(--theme-accent-primary)' : 'var(--theme-accent-secondary)',
      dataPackets: [],
      active: false,
      activationDelay: randomBetween(0, 5000), // Stagger activation
      lastTurn: 0,
      turnInterval: randomBetween(1000, 3000) // Time between direction changes
    });
  }
  
  // Initialize line positions randomly
  dataFlowLines.forEach(initializeLine);
  
  function initializeLine(line) {
    // Decide on a random starting position and direction
    const side = Math.floor(Math.random() * 4); // 0-3 for top, right, bottom, left
    
    switch(side) {
      case 0: // Top
        line.x = randomBetween(0, dataFlowCanvas.width);
        line.y = 0;
        line.direction = Direction.DOWN;
        break;
      case 1: // Right
        line.x = dataFlowCanvas.width;
        line.y = randomBetween(0, dataFlowCanvas.height);
        line.direction = Direction.LEFT;
        break;
      case 2: // Bottom
        line.x = randomBetween(0, dataFlowCanvas.width);
        line.y = dataFlowCanvas.height;
        line.direction = Direction.UP;
        break;
      case 3: // Left
        line.x = 0;
        line.y = randomBetween(0, dataFlowCanvas.height);
        line.direction = Direction.RIGHT;
        break;
    }
    
    // Generate 1-3 data packets on the line
    line.dataPackets = [];
    const packetCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < packetCount; i++) {
      line.dataPackets.push({
        position: Math.random(), // 0-1 position along the line
        size: randomBetween(3, 6),
        speed: randomBetween(0.005, 0.015) // Speed of packet along the line
      });
    }
    
    line.active = false;
    line.activationDelay = randomBetween(0, 5000);
    line.lastTurn = 0;
  }
  
  // Animation loop
  let lastTime = 0;
  function animateDataFlow(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, dataFlowCanvas.width, dataFlowCanvas.height);
    
    // Update and draw each line
    dataFlowLines.forEach(line => {
      // Handle delayed activation
      if (!line.active) {
        line.activationDelay -= deltaTime;
        if (line.activationDelay <= 0) {
          line.active = true;
        } else {
          return; // Skip inactive lines
        }
      }
      
      // Move the line based on direction
      const moveAmount = line.speed * (deltaTime / 16); // Normalize to 60fps
      
      switch(line.direction) {
        case Direction.UP:
          line.y -= moveAmount;
          break;
        case Direction.RIGHT:
          line.x += moveAmount;
          break;
        case Direction.DOWN:
          line.y += moveAmount;
          break;
        case Direction.LEFT:
          line.x -= moveAmount;
          break;
      }
      
      // Calculate end point based on line length and direction
      let endX = line.x;
      let endY = line.y;
      
      switch(line.direction) {
        case Direction.UP:
          endY = line.y + line.length;
          break;
        case Direction.RIGHT:
          endX = line.x - line.length;
          break;
        case Direction.DOWN:
          endY = line.y - line.length;
          break;
        case Direction.LEFT:
          endX = line.x + line.length;
          break;
      }
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      
      // Draw data packets
      line.dataPackets.forEach(packet => {
        // Update packet position
        packet.position += packet.speed * (deltaTime / 16);
        if (packet.position > 1) packet.position -= 1;
        
        // Calculate packet position along the line
        let packetX, packetY;
        switch(line.direction) {
          case Direction.UP:
            packetX = line.x;
            packetY = line.y + (line.length * packet.position);
            break;
          case Direction.RIGHT:
            packetX = line.x - (line.length * packet.position);
            packetY = line.y;
            break;
          case Direction.DOWN:
            packetX = line.x;
            packetY = line.y - (line.length * packet.position);
            break;
          case Direction.LEFT:
            packetX = line.x + (line.length * packet.position);
            packetY = line.y;
            break;
        }
        
        // Draw packet
        ctx.beginPath();
        ctx.arc(packetX, packetY, packet.size, 0, Math.PI * 2);
        ctx.fillStyle = line.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        
        // Add glow effect
        ctx.beginPath();
        ctx.arc(packetX, packetY, packet.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          packetX, packetY, packet.size, 
          packetX, packetY, packet.size * 2
        );
        gradient.addColorStop(0, line.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        ctx.fill();
      });
      
      // Check if line is out of bounds
      const isOutOfBounds = 
        line.x < -line.length || 
        line.x > dataFlowCanvas.width + line.length ||
        line.y < -line.length || 
        line.y > dataFlowCanvas.height + line.length;
      
      // Reset line if out of bounds
      if (isOutOfBounds) {
        initializeLine(line);
        return;
      }
      
      // Random direction changes
      const now = timestamp;
      if (now - line.lastTurn > line.turnInterval) {
        line.lastTurn = now;
        if (Math.random() < 0.3) { // 30% chance to change direction
          const directions = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];
          const oppositeDirection = (line.direction + 2) % 4;
          directions.splice(oppositeDirection, 1); // Remove opposite direction to prevent reversal
          line.direction = directions[Math.floor(Math.random() * 3)];
        }
      }
    });
    
    // Request next frame
    requestAnimationFrame(animateDataFlow);
  }
  
  // Helper function
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }
  
  // Start animation
  requestAnimationFrame(animateDataFlow);
  
  // Also add traditional data flow lines for older sections as a fallback/complement
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
                const gradient = ctx.createRadialGradient(
                  p.x, p.y, glowSize * 0.5, 
                  p.x, p.y, glowSize * 2.5
                );
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

/**
 * Create interactive blueprint grid overlay that reacts to mouse movements
 */
function createInteractiveBlueprintGrid() {
  // Create a canvas for the blueprint grid effect
  const gridCanvas = document.createElement('canvas');
  gridCanvas.className = 'blueprint-grid-canvas';
  gridCanvas.style.position = 'fixed';
  gridCanvas.style.top = '0';
  gridCanvas.style.left = '0';
  gridCanvas.style.width = '100%';
  gridCanvas.style.height = '100%';
  gridCanvas.style.pointerEvents = 'none';
  gridCanvas.style.zIndex = '0';
  gridCanvas.style.opacity = '0.12';
  document.body.appendChild(gridCanvas);

  // Set canvas size to match window
  const resizeCanvas = () => {
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;
    drawGrid(); // Redraw grid when canvas is resized
  };
  
  // Initialize canvas size
  resizeCanvas();
  
  // Add window resize listener
  window.addEventListener('resize', debounce(resizeCanvas, 250));
  
  // Get canvas context
  const ctx = gridCanvas.getContext('2d');
  
  // Grid properties
  const gridSize = 40;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetGridOffset = { x: 0, y: 0 };
  let currentGridOffset = { x: 0, y: 0 };
  
  // Mouse movement tracking
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Calculate grid offset based on mouse position
    targetGridOffset.x = (mouseX - window.innerWidth / 2) * 0.03;
    targetGridOffset.y = (mouseY - window.innerHeight / 2) * 0.03;
  });
  
  // Draw the blueprint grid
  function drawGrid() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    
    // Smooth transition of grid offset
    currentGridOffset.x += (targetGridOffset.x - currentGridOffset.x) * 0.05;
    currentGridOffset.y += (targetGridOffset.y - currentGridOffset.y) * 0.05;
    
    // Translate the context to create the offset effect
    ctx.save();
    ctx.translate(currentGridOffset.x, currentGridOffset.y);
    
    // Draw main grid lines
    const offsetX = (gridCanvas.width % gridSize) / 2;
    const offsetY = (gridCanvas.height % gridSize) / 2;
    
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'var(--theme-accent-secondary)';
    ctx.beginPath();
    
    // Vertical lines
    for (let x = offsetX; x < gridCanvas.width + gridSize; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridCanvas.height);
    }
    
    // Horizontal lines
    for (let y = offsetY; y < gridCanvas.height + gridSize; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(gridCanvas.width, y);
    }
    
    ctx.stroke();
    
    // Draw thicker grid lines (every 5 cells)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'var(--theme-accent-primary)';
    ctx.beginPath();
    
    // Vertical thick lines
    for (let x = offsetX; x < gridCanvas.width + gridSize; x += gridSize * 5) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridCanvas.height);
    }
    
    // Horizontal thick lines
    for (let y = offsetY; y < gridCanvas.height + gridSize; y += gridSize * 5) {
      ctx.moveTo(0, y);
      ctx.lineTo(gridCanvas.width, y);
    }
    
    ctx.stroke();
    
    // Calculate the distance from mouse to each grid intersection
    const maxDistance = 300; // Maximum influence distance
    
    // Draw highlight dots at grid intersections
    ctx.fillStyle = 'var(--theme-accent-primary)';
    
    for (let x = offsetX; x < gridCanvas.width + gridSize; x += gridSize) {
      for (let y = offsetY; y < gridCanvas.height + gridSize; y += gridSize) {
        const dx = mouseX - x + currentGridOffset.x;
        const dy = mouseY - y + currentGridOffset.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          // Calculate dot size inversely proportional to distance from mouse
          const dotSize = 3 * (1 - distance / maxDistance);
          
          if (dotSize > 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow for closer dots
            if (distance < maxDistance * 0.5) {
              ctx.beginPath();
              ctx.arc(x, y, dotSize * 3, 0, Math.PI * 2);
              const gradient = ctx.createRadialGradient(
                x, y, dotSize, 
                x, y, dotSize * 3
              );
              gradient.addColorStop(0, 'rgba(var(--theme-accent-primary-rgb), 0.3)');
              gradient.addColorStop(1, 'rgba(var(--theme-accent-primary-rgb), 0)');
              ctx.fillStyle = gradient;
              ctx.fill();
              ctx.fillStyle = 'var(--theme-accent-primary)';
            }
          }
        }
      }
    }
    
    // Draw subtle radial grid origin indicators
    const centerX = gridCanvas.width / 2;
    const centerY = gridCanvas.height / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'var(--theme-accent-primary)';
    ctx.fill();
    
    // Radial pulse effect at the center
    ctx.beginPath();
    const pulseTime = Date.now() % 3000 / 3000;
    const pulseSize = 50 + 30 * Math.sin(pulseTime * Math.PI * 2);
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0, 
      centerX, centerY, pulseSize
    );
    gradient.addColorStop(0, 'rgba(var(--theme-accent-primary-rgb), 0.08)');
    gradient.addColorStop(0.7, 'rgba(var(--theme-accent-primary-rgb), 0.03)');
    gradient.addColorStop(1, 'rgba(var(--theme-accent-primary-rgb), 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Restore the context
    ctx.restore();
  }
  
  // Animation loop
  function animateGrid() {
    drawGrid();
    requestAnimationFrame(animateGrid);
  }
  
  // Start animation
  requestAnimationFrame(animateGrid);
}

/**
 * Create cursor trail effect that follows the mouse movement
 */
function createCursorTrailEffect() {
  // Create a canvas for the cursor trail effect
  const cursorCanvas = document.createElement('canvas');
  cursorCanvas.className = 'cursor-trail-canvas';
  cursorCanvas.style.position = 'fixed';
  cursorCanvas.style.top = '0';
  cursorCanvas.style.left = '0';
  cursorCanvas.style.width = '100%';
  cursorCanvas.style.height = '100%';
  cursorCanvas.style.pointerEvents = 'none';
  cursorCanvas.style.zIndex = '9998'; // High z-index, but below modals
  document.body.appendChild(cursorCanvas);
  
  // Set canvas size to match window
  const resizeCanvas = () => {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  };
  
  // Initialize canvas size
  resizeCanvas();
  
  // Add window resize listener
  window.addEventListener('resize', debounce(resizeCanvas, 250));
  
  // Get canvas context
  const ctx = cursorCanvas.getContext('2d');
  
  // Cursor properties
  let mouseX = -100; // Start offscreen
  let mouseY = -100; // Start offscreen
  let mouseSpeed = 0;
  let lastMouseX = -100;
  let lastMouseY = -100;
  const particles = [];
  const particleCount = 15;
  let isMouseDown = false;
  let lastUpdateTime = Date.now();
  
  // Mouse movement tracking with speed calculation
  document.addEventListener('mousemove', function(e) {
    const currentTime = Date.now();
    const dt = currentTime - lastUpdateTime;
    lastUpdateTime = currentTime;
    
    // Calculate mouse speed
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    mouseSpeed = Math.min(20, distance / (dt || 16) * 16); // Normalize to ~60fps
    
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Add a particle burst on fast movements
    if (mouseSpeed > 8) {
      const burstCount = Math.floor(mouseSpeed / 4);
      for (let i = 0; i < burstCount; i++) {
        addParticle(mouseX, mouseY, mouseSpeed);
      }
    }
  });
  
  // Track mouse button state
  document.addEventListener('mousedown', () => {
    isMouseDown = true;
    // Add a particle burst on click
    for (let i = 0; i < 10; i++) {
      addParticle(mouseX, mouseY, 10);
    }
  });
  
  document.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
  
  // Create initial particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: -100,
      y: -100,
      size: 0,
      alpha: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      color: 'var(--theme-accent-primary)',
      type: 'circle' // circle, square, triangle
    });
  }
  
  // Add a new particle to the system
  function addParticle(x, y, speed) {
    // Find an inactive particle to reuse
    let particle = particles.find(p => p.alpha <= 0);
    
    // If no inactive particles, find the oldest one
    if (!particle) {
      const oldestIndex = particles.reduce((oldest, p, i, arr) => 
        p.life > arr[oldest].life ? i : oldest, 0);
      particle = particles[oldestIndex];
    }
    
    // Random angle for velocity
    const angle = Math.random() * Math.PI * 2;
    const velocity = 1 + Math.random() * speed * 0.2;
    
    // Reset particle with new properties
    particle.x = x;
    particle.y = y;
    particle.size = Math.random() * 4 + (speed * 0.2);
    particle.alpha = 0.7;
    particle.vx = Math.cos(angle) * velocity;
    particle.vy = Math.sin(angle) * velocity;
    particle.life = 0;
    particle.maxLife = 30 + Math.random() * 40;
    particle.gravity = Math.random() * 0.1;
    
    // Varied particle types
    const types = ['circle', 'square', 'triangle'];
    particle.type = types[Math.floor(Math.random() * types.length)];
    
    // Varied particle colors based on speed
    if (speed > 15) {
      particle.color = 'var(--theme-accent-primary)';
    } else if (speed > 8) {
      particle.color = 'var(--theme-accent-secondary)';
    } else {
      particle.color = 'rgba(var(--theme-accent-primary-rgb), 0.7)';
    }
    
    return particle;
  }
  
  // Draw and update particles
  function updateParticles() {
    // Add particles based on mouse position and speed
    if (mouseSpeed > 1 || isMouseDown) {
      addParticle(mouseX, mouseY, mouseSpeed);
    }
    
    // Update and draw particles
    particles.forEach(p => {
      // Skip inactive particles
      if (p.alpha <= 0) return;
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply gravity
      p.vy += p.gravity;
      
      // Update life
      p.life++;
      
      // Fade out based on life
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
      
      // Shrink size over time
      const sizeScale = 1 - (p.life / p.maxLife) * 0.5;
      const currentSize = p.size * sizeScale * p.alpha;
      
      // Draw particle based on type
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      
      switch(p.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'square':
          ctx.fillRect(
            p.x - currentSize / 2, 
            p.y - currentSize / 2, 
            currentSize, 
            currentSize
          );
          break;
          
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - currentSize);
          ctx.lineTo(p.x + currentSize, p.y + currentSize / 2);
          ctx.lineTo(p.x - currentSize, p.y + currentSize / 2);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      // Optional glow effect for larger particles
      if (currentSize > 3 && p.alpha > 0.4) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          p.x, p.y, currentSize * 0.5, 
          p.x, p.y, currentSize * 2
        );
        gradient.addColorStop(0, p.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
        gradient.addColorStop(1, p.color.replace(')', ', 0)').replace('rgb', 'rgba'));
        ctx.fillStyle = gradient;
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.fill();
      }
    });
    
    // Reset global alpha
    ctx.globalAlpha = 1;
  }
  
  // Draw cursor halo effect
  function drawCursorHalo() {
    const haloSize = 20 + mouseSpeed * 0.5;
    
    // Draw outer glow
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, haloSize, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      mouseX, mouseY, haloSize * 0.2, 
      mouseX, mouseY, haloSize
    );
    gradient.addColorStop(0, 'rgba(var(--theme-accent-primary-rgb), 0.15)');
    gradient.addColorStop(1, 'rgba(var(--theme-accent-primary-rgb), 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'var(--theme-accent-primary)';
    ctx.fill();
    
    // Draw ring
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'var(--theme-accent-primary)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  
  // Animation loop
  function animateCursorTrail() {
    // Clear canvas
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    
    // Update and draw cursor effects
    updateParticles();
    drawCursorHalo();
    
    // Request next frame
    requestAnimationFrame(animateCursorTrail);
  }
  
  // Start animation
  requestAnimationFrame(animateCursorTrail);
  
  // Set a custom cursor to better integrate with the particle effect
  document.body.style.cursor = 'none';
}

/**
 * Create focus mode for desaturating/blurring non-focal parts during interaction
 */
function createFocusMode() {
  // Create a canvas for the focus effect
  const focusCanvas = document.createElement('canvas');
  focusCanvas.className = 'focus-mode-canvas';
  focusCanvas.style.position = 'fixed';
  focusCanvas.style.top = '0';
  focusCanvas.style.left = '0';
  focusCanvas.style.width = '100%';
  focusCanvas.style.height = '100%';
  focusCanvas.style.pointerEvents = 'none';
  focusCanvas.style.zIndex = '5'; // Above content but below other overlays
  focusCanvas.style.opacity = '0'; // Start hidden
  focusCanvas.style.transition = 'opacity 0.5s ease';
  document.body.appendChild(focusCanvas);
  
  // Set canvas size to match window
  const resizeCanvas = () => {
    focusCanvas.width = window.innerWidth;
    focusCanvas.height = window.innerHeight;
    drawFocusEffect();
  };
  
  // Initialize canvas size
  resizeCanvas();
  
  // Add window resize listener
  window.addEventListener('resize', debounce(resizeCanvas, 250));
  
  // Get canvas context
  const ctx = focusCanvas.getContext('2d');
  
  // Focus state
  let isFocused = false;
  let focusTarget = null;
  let focusX = 0;
  let focusY = 0;
  let focusRadius = 200;
  let focusStrength = 0;
  
  // Track focus-able elements
  const focusableSelectors = [
    'a', 'button', 'input', 'textarea', 'select',
    '.project-card', '.skill-item', '.contact-method',
    '.hero-cta', '.info-panel-trigger'
  ];
  
  // Helper to check if element matches any focusable selector
  function isFocusableElement(element) {
    return focusableSelectors.some(selector => {
      return element.matches(selector) || element.closest(selector);
    });
  }
  
  // Mouse movement tracking
  document.addEventListener('mousemove', debounce(function(e) {
    // Get element under mouse
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    // Check if it's a focusable element
    if (element && isFocusableElement(element)) {
      // Get the actual focusable element (parent if needed)
      focusTarget = element.closest(focusableSelectors.join(',')) || element;
      
      // Set focus center to element center
      const rect = focusTarget.getBoundingClientRect();
      focusX = rect.left + rect.width / 2;
      focusY = rect.top + rect.height / 2;
      
      // Adjust focus radius based on element size
      focusRadius = Math.max(200, Math.max(rect.width, rect.height) * 1.2);
      
      // Activate focus mode
      if (!isFocused) {
        isFocused = true;
        focusCanvas.style.opacity = '1';
        // Add log entry
        if (typeof addLogEntry === 'function') {
          addLogEntry('Focus mode activated');
        }
      }
      
      // Gradually increase focus strength
      focusStrength = Math.min(1, focusStrength + 0.1);
    } else {
      // Gradually decrease focus strength
      focusStrength = Math.max(0, focusStrength - 0.1);
      
      // Deactivate focus mode when strength reaches zero
      if (isFocused && focusStrength === 0) {
        isFocused = false;
        focusCanvas.style.opacity = '0';
        // Add log entry
        if (typeof addLogEntry === 'function') {
          addLogEntry('Focus mode deactivated');
        }
      }
    }
    
    // Update the focus effect
    drawFocusEffect();
  }, 50));
  
  // Draw the focus effect
  function drawFocusEffect() {
    if (!ctx) return;
    
    // Don't draw if not focused or canvas is invisible
    if (focusStrength <= 0) {
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, focusCanvas.width, focusCanvas.height);
    
    // Draw radial gradient for focus/blur effect
    const gradient = ctx.createRadialGradient(
      focusX, focusY, 10, 
      focusX, focusY, focusRadius
    );
    
    // Adjust gradient stops based on focus strength
    const opacity = 0.75 * focusStrength; // Max 75% darkening
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, `rgba(0, 0, 0, ${opacity * 0.2})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, focusCanvas.width, focusCanvas.height);
    
    // Add subtle vignette effect around the focused area
    const vignetteGradient = ctx.createRadialGradient(
      focusX, focusY, focusRadius * 0.8, 
      focusX, focusY, focusRadius
    );
    
    vignetteGradient.addColorStop(0, 'rgba(var(--theme-accent-primary-rgb), 0)');
    vignetteGradient.addColorStop(1, `rgba(var(--theme-accent-primary-rgb), ${0.1 * focusStrength})`);
    
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, focusCanvas.width, focusCanvas.height);
    
    // Optional: Add focus highlight ring
    ctx.beginPath();
    ctx.arc(focusX, focusY, focusRadius * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(var(--theme-accent-primary-rgb), ${0.3 * focusStrength})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // Also add keyboard focus support
  document.addEventListener('keydown', function(e) {
    // Tab key activates keyboard focus mode
    if (e.key === 'Tab') {
      // Wait for the focus to change after the default tab behavior
      setTimeout(() => {
        const focusedElement = document.activeElement;
        if (focusedElement && isFocusableElement(focusedElement)) {
          // Get element position
          const rect = focusedElement.getBoundingClientRect();
          focusX = rect.left + rect.width / 2;
          focusY = rect.top + rect.height / 2;
          focusRadius = Math.max(200, Math.max(rect.width, rect.height) * 1.2);
          
          // Activate focus mode
          isFocused = true;
          focusStrength = 1;
          focusCanvas.style.opacity = '1';
          
          // Update the focus effect
          drawFocusEffect();
          
          // Add log entry
          if (typeof addLogEntry === 'function') {
            addLogEntry('Keyboard focus activated');
          }
        }
      }, 10);
    }
    // Escape key deactivates focus mode
    if (e.key === 'Escape' && isFocused) {
      isFocused = false;
      focusStrength = 0;
      focusCanvas.style.opacity = '0';
      
      // Add log entry
      if (typeof addLogEntry === 'function') {
        addLogEntry('Focus mode deactivated');
      }
    }
  });
}

/**
 * Create dynamic HUD elements with real-time updates in the corners of the screen
 */
function createDynamicHudElements() {
  // Create the HUD container
  const hudContainer = document.createElement('div');
  hudContainer.className = 'dynamic-hud-container';
  document.body.appendChild(hudContainer);
  
  // Create the different HUD elements
  createTopLeftHud(hudContainer);
  createTopRightHud(hudContainer);
  createBottomLeftHud(hudContainer);
  createBottomRightHud(hudContainer);
  
  // Initialize updates
  updateHudElements();
  
  // Set up continuous updates
  setInterval(updateHudElements, 1000);
}

/**
 * Create Top Left HUD - System Status
 */
function createTopLeftHud(container) {
  const hud = document.createElement('div');
  hud.className = 'hud-element top-left';
  hud.innerHTML = `
    <div class="hud-title">SYSTEM STATUS</div>
    <div class="hud-content">
      <div class="hud-item">
        <span class="hud-label">CPU</span>
        <div class="hud-progress">
          <div class="hud-progress-bar" id="cpu-bar"></div>
        </div>
        <span class="hud-value" id="cpu-value">0%</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">MEMORY</span>
        <div class="hud-progress">
          <div class="hud-progress-bar" id="memory-bar"></div>
        </div>
        <span class="hud-value" id="memory-value">0%</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">NETWORK</span>
        <div class="hud-progress">
          <div class="hud-progress-bar" id="network-bar"></div>
        </div>
        <span class="hud-value" id="network-value">0kb/s</span>
      </div>
    </div>
  `;
  container.appendChild(hud);
}

/**
 * Create Top Right HUD - Navigation Coordinates
 */
function createTopRightHud(container) {
  const hud = document.createElement('div');
  hud.className = 'hud-element top-right';
  hud.innerHTML = `
    <div class="hud-title">NAVIGATION</div>
    <div class="hud-content">
      <div class="hud-item">
        <span class="hud-label">SECTION</span>
        <span class="hud-value" id="current-section">HOME</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">COORDINATES</span>
        <span class="hud-value" id="mouse-coordinates">0,0</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">SCROLL</span>
        <span class="hud-value" id="scroll-position">0%</span>
      </div>
    </div>
  `;
  container.appendChild(hud);
}

/**
 * Create Bottom Left HUD - System Time
 */
function createBottomLeftHud(container) {
  const hud = document.createElement('div');
  hud.className = 'hud-element bottom-left';
  hud.innerHTML = `
    <div class="hud-title">SYSTEM TIME</div>
    <div class="hud-content">
      <div class="hud-item">
        <span class="hud-value large" id="system-time">00:00:00</span>
      </div>
      <div class="hud-item">
        <span class="hud-value" id="system-date">2025-05-18</span>
      </div>
    </div>
  `;
  container.appendChild(hud);
}

/**
 * Create Bottom Right HUD - Activity Log
 */
function createBottomRightHud(container) {
  const hud = document.createElement('div');
  hud.className = 'hud-element bottom-right';
  hud.innerHTML = `
    <div class="hud-title">ACTIVITY LOG</div>
    <div class="hud-content">
      <div class="hud-mini-log" id="hud-mini-log">
        <div class="hud-log-entry">System initialized</div>
      </div>
    </div>
  `;
  container.appendChild(hud);
}

/**
 * Update all HUD elements with current data
 */
function updateHudElements() {
  // Update CPU, Memory, Network (simulated)
  updateSystemResources();
  
  // Update navigation data
  updateNavigationData();
  
  // Update time
  updateSystemTime();
  
  // Any additional updates
  updateHudClassesBasedOnActivity();
}

/**
 * Update simulated system resources
 */
function updateSystemResources() {
  // Simulate CPU usage (fluctuating)
  const cpuUsage = Math.floor(20 + Math.sin(Date.now() / 2000) * 15 + Math.random() * 10);
  document.getElementById('cpu-bar').style.width = `${cpuUsage}%`;
  document.getElementById('cpu-value').textContent = `${cpuUsage}%`;
  
  // Simulate memory usage (slowly increasing, then reset)
  const memBaseValue = (Date.now() % 60000) / 60000 * 40; // 0-40% over 1 minute
  const memUsage = Math.floor(30 + memBaseValue);
  document.getElementById('memory-bar').style.width = `${memUsage}%`;
  document.getElementById('memory-value').textContent = `${memUsage}%`;
  
  // Simulate network activity (random spikes)
  const networkBaseValue = Math.sin(Date.now() / 1000) * 30;
  const networkSpike = Math.random() > 0.9 ? Math.random() * 200 : 0;
  const networkUsage = Math.floor(Math.abs(networkBaseValue) + networkSpike);
  document.getElementById('network-bar').style.width = `${Math.min(100, networkUsage)}%`;
  document.getElementById('network-value').textContent = `${networkUsage}kb/s`;
  
  // Add warning class for high usage
  document.getElementById('cpu-bar').classList.toggle('warning', cpuUsage > 70);
  document.getElementById('memory-bar').classList.toggle('warning', memUsage > 70);
  document.getElementById('network-bar').classList.toggle('warning', networkUsage > 70);
}

/**
 * Update navigation data in HUD
 */
function updateNavigationData() {
  // Update current section
  const sections = document.querySelectorAll('section');
  let currentSection = 'HOME';
  
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
      currentSection = section.id.toUpperCase();
    }
  });
  
  document.getElementById('current-section').textContent = currentSection;
  
  // Update mouse coordinates
  document.addEventListener('mousemove', function(e) {
    document.getElementById('mouse-coordinates').textContent = `${e.clientX},${e.clientY}`;
  });
  
  // Update scroll position
  const scrollPercent = Math.floor((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  document.getElementById('scroll-position').textContent = `${scrollPercent}%`;
}

/**
 * Update system time display
 */
function updateSystemTime() {
  const now = new Date();
  
  // Format time as HH:MM:SS
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  document.getElementById('system-time').textContent = `${hours}:${minutes}:${seconds}`;
  
  // Format date as YYYY-MM-DD
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  document.getElementById('system-date').textContent = `${year}-${month}-${day}`;
}

/**
 * Add log entry to HUD mini-log
 */
function addHudLogEntry(message) {
  const miniLog = document.getElementById('hud-mini-log');
  if (!miniLog) return;
  
  const logEntry = document.createElement('div');
  logEntry.className = 'hud-log-entry';
  logEntry.textContent = message;
  
  // Add new entry at the top
  miniLog.insertBefore(logEntry, miniLog.firstChild);
  
  // Limit number of entries
  if (miniLog.children.length > 4) {
    miniLog.removeChild(miniLog.lastChild);
  }
  
  // Highlight briefly
  logEntry.classList.add('highlight');
  setTimeout(() => {
    logEntry.classList.remove('highlight');
  }, 2000);
}

/**
 * Update HUD classes based on user activity
 */
function updateHudClassesBasedOnActivity() {
  // Get all HUD elements
  const hudElements = document.querySelectorAll('.hud-element');
  
  // Add subtle animations to random HUD items to simulate activity
  const randomHudIndex = Math.floor(Math.random() * hudElements.length);
  hudElements[randomHudIndex].classList.add('ping');
  
  // Remove the animation class after it completes
  setTimeout(() => {
    hudElements[randomHudIndex].classList.remove('ping');
  }, 1000);
}

// Modify the main addLogEntry function to also add entries to the HUD log
const originalAddLogEntry = window.addLogEntry || function() {};
window.addLogEntry = function(message, type = '') {
  // Call the original function
  originalAddLogEntry(message, type);
  
  // Also add to HUD mini-log
  addHudLogEntry(message);
};