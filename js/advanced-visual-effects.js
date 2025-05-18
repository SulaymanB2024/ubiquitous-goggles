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

// Add the createDynamicHudElements function call to the DOMContentLoaded event
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
 * Helper function for debouncing function calls
 */
function debounce(func, delay) {
  let inDebounce;
  return function(...args) {
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func.apply(this, args), delay);
  };
}
