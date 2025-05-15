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
  // This function enhances the existing particles.js effect
  // We'll wait for particles.js to initialize
  setTimeout(() => {
    // Check if particles.js is initialized
    if (window.pJSDom && window.pJSDom.length > 0) {
      const pJS = window.pJSDom[0].pJS;
      
      // Only proceed if we have access to the particles object
      if (pJS && pJS.particles) {
        // Add throttled mousemove event for parallax effect on particles
        const throttle = (func, limit) => {
          let lastCall = 0;
          return function(...args) {
            const now = Date.now();
            if (now - lastCall >= limit) {
              lastCall = now;
              func.apply(this, args);
            }
          };
        };
        
        // Apply parallax effect to hero content with throttling
        document.getElementById('particles-js').addEventListener('mousemove', throttle(function(e) {
          const heroSection = document.getElementById('hero');
          // Reduce movement range for subtler effect
          const moveX = (e.clientX / heroSection.offsetWidth - 0.5) * 10; 
          const moveY = (e.clientY / heroSection.offsetHeight - 0.5) * 10;
          
          // Apply gentler parallax effect to hero content with limited decimal places
          const heroContent = document.querySelector('.hero-content');
          if (heroContent) {
            // Round to 1 decimal place for better performance and smoother movement
            const translateX = Math.round(moveX * -0.3 * 10) / 10;
            const translateY = Math.round(moveY * -0.3 * 10) / 10;
            heroContent.style.transform = `translate(${translateX}px, ${translateY}px)`;
          }
        }, 50)); // Throttle to max 20 updates per second
        
        // Debounced scroll handler for better performance
        const debounce = (func, delay) => {
          let inDebounce;
          return function(...args) {
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(this, args), delay);
          };
        };
        
        // Custom particle adjustment on scroll (with debouncing for performance)
        window.addEventListener('scroll', debounce(function() {
          const scrollY = window.scrollY;
          const heroHeight = document.getElementById('hero').offsetHeight;
          
          // If scrolling within the hero section
          if (scrollY < heroHeight) {
            // Calculate scroll percentage
            const scrollPercent = scrollY / heroHeight;
            // Adjust particle parameters based on scroll (only if significant change)
            if (pJS && pJS.particles && pJS.particles.array && scrollPercent > 0.05) {
              // Only update every nth particle for performance
              for (let i = 0; i < pJS.particles.array.length; i += 3) {
                const particle = pJS.particles.array[i];
                if (particle && particle.radius_original) {
                  particle.radius = particle.radius_original * (1 - scrollPercent * 0.3);
                }
              }
            }
          }
        }, 100)); // 100ms debounce for scroll events
      }
    }
  }, 1000);
}
