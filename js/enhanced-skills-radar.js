/**
 * Enhanced Skills Radar Chart
 * Interactive visualization of skills across different domains with animation and interaction
 * @version 1.3.0
 */

class SkillsRadarChart {
    /**
     * @param {string} containerId - ID of the container element
     * @param {Array} data - Optional data array to override default skills data
     */
    constructor(containerId, data = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        
        this.data = data || this.getDefaultData();
        this.chart = null;
        this.canvas = null;
        this.tooltip = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.maxValue = 10;
        this.levels = 5;
        this.valueLabels = ['Beginner', 'Familiar', 'Proficient', 'Advanced', 'Expert'];
        this.labelFactor = 1.2;
        this.wrapWidth = 60;
        this.opacityArea = 0.25; // Reduced opacity for better performance
        this.dotRadius = 3; // Smaller dots for better performance
        this.strokeWidth = 1.5; // Thinner strokes for better performance
        this.roundStrokes = true;
        this.transitionDuration = 1200; // Longer transition for smoother animation
        this.colorScheme = {
            'technical': 'rgba(var(--theme-accent-primary-rgb), 0.7)',
            'leadership': 'rgba(0, 177, 106, 0.7)',
            'creative': 'rgba(214, 51, 132, 0.7)',
            'business': 'rgba(var(--theme-accent-secondary-rgb), 0.7)',
            'languages': 'rgba(241, 196, 15, 0.7)'
        };
        this.activeCategory = null;
        this.animatedFactor = 0;
        this.animationStartTime = null;
        this.resizeDebounceTimeout = null; // For debouncing resize events
        this._lastTooltipContent = ''; // Cache for tooltip content
        this._boundEventListeners = {}; // Store bound event listeners for cleanup
        this._renderFrameId = null; // Track animation frame requests for proper cleanup
        
        // Enhanced visual effects settings
        this.visualEffects = {
            pulseEffect: true,
            glowIntensity: 1.5,
            hoverScaleFactor: 1.08,
            entryStaggerDelay: 120,
            pointsEntryDuration: 800,
            axisEntryDuration: 600,
            polygonEntryEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
            particleEffects: true,
            particlesCount: 8,
            tooltipAnimationDuration: 300
        };
        
        // Particle system for highlights
        this.particles = [];
        this._cachedPositions = {}; // Cache for calculated positions to improve performance
        this._lastInteractionTime = Date.now(); // Track last interaction for adaptive rendering
        this._adaptivePerformanceMode = true; // Enable adaptive performance by default
        this.debug = false; // Debug mode flag
        
        // Enhanced visual effects settings
        this.visualEffects = {
            pulseEffect: true,
            glowIntensity: 1.5,
            hoverScaleFactor: 1.08,
            entryStaggerDelay: 120,
            pointsEntryDuration: 800,
            axisEntryDuration: 600,
            polygonEntryEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
            particleEffects: true,
            particlesCount: 8,
            tooltipAnimationDuration: 300
        };
        
        // Particle system for highlights
        this.particles = [];
        
        // Accessibility options
        this.a11y = {
            enabled: true,
            labels: {
                chartDescription: 'Radar chart showing skills across different domains',
                categoryAnnounce: name => `${name} category selected`,
                valueAnnounce: (skill, value) => `${skill}: ${value} out of 10`
            },
            announceChanges: true
        };

        // Initialize the chart
        this.init();
        this.setupResponsiveness();
    }

    /**
     * Initialize the chart
     * Sets up the container, canvas, tooltip, and event listeners
     * @public
     */
    init() {
        // Validate container before proceeding
        if (!this.container) {
            console.error('SkillsRadarChart: Container element is required');
            return;
        }

        try {
            // Set up the container with necessary HTML elements
            this.setupContainer();
            
            // Create canvas for radar chart
            this.setupCanvas();
            
            // Create tooltip element
            this.setupTooltip();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Draw the chart with animation
            this.startAnimation();
            
            // Setup accessibility features
            if (this.a11y.enabled) {
                this.setupAccessibility();
            }
            
            // Log initialization for debugging
            this._logDebug('Chart initialized successfully');
        } catch (error) {
            console.error('SkillsRadarChart: Initialization error', error);
            // Create fallback content if initialization fails
            this._createFallbackContent();
        }
    }

    /**
     * Set up the container with necessary DOM elements with improved semantics
     * @private
     */
    setupContainer() {
        // Save original content for potential fallback
        this._originalContent = this.container.innerHTML;
    
        // Create container elements with proper ARIA attributes
        this.container.innerHTML = `
            <div class="skills-grid-bg" aria-hidden="true"></div>
            <div class="skills-radar-header">
                <h3 class="skills-radar-title">SKILLS VISUALIZATION</h3>
                <p class="skills-radar-description">Interactive visualization of competencies across technical, leadership, and business domains. Hover over data points for detailed information.</p>
            </div>
            <div class="skills-radar-chart" role="img" aria-label="${this.a11y.labels.chartDescription}">
                <canvas class="radar-chart-canvas"></canvas>
                <div class="radar-decoration radar-circle-1" aria-hidden="true"></div>
                <div class="radar-decoration radar-circle-2" aria-hidden="true"></div>
                <div class="radar-decoration radar-circle-3" aria-hidden="true"></div>
            </div>
            <div class="skills-radar-controls" role="toolbar" aria-label="Chart controls">
                <button class="radar-control-btn radar-control-insights-btn" data-action="insights" aria-label="Show strategic insights">
                    <i class="fas fa-lightbulb" aria-hidden="true"></i> Strategic Insights
                </button>
                <button class="radar-control-btn" data-action="reset" aria-label="Reset chart view">Reset View</button>
                <button class="radar-control-btn" data-action="animate" aria-label="Animate chart">Animate</button>
            </div>
            <div class="skills-radar-legend" role="tablist" aria-label="Filter skills by category"></div>
            <div class="skills-radar-status" role="status" aria-live="polite"></div>
        `;

        // Create legend items with improved accessibility
        const legendEl = this.container.querySelector('.skills-radar-legend');
        Object.keys(this.colorScheme).forEach((category, index) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.dataset.category = category;
            item.setAttribute('role', 'tab');
            item.setAttribute('id', `legend-${category}`);
            item.setAttribute('aria-selected', 'false');
            item.setAttribute('tabindex', index === 0 ? '0' : '-1');
            
            item.innerHTML = `
                <span class="legend-color" style="background-color: ${this.colorScheme[category]}"></span>
                <span class="legend-label">${this.capitalizeFirstLetter(category)}</span>
            `;
            legendEl.appendChild(item);
        });
    }

    /**
     * Set up the canvas element with high DPI support
     * @private
     */
    setupCanvas() {
        this.canvas = this.container.querySelector('.radar-chart-canvas');
    
        // Check for canvas support
        if (!this.canvas || !this.canvas.getContext) {
            throw new Error('Canvas not supported in this browser');
        }
        
        this.ctx = this.canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: false // Performance optimization
        });
        
        // Enable antialiasing for smoother rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Set canvas dimensions with high DPI support
        this.resizeCanvas();
    }

    /**
     * Set up the tooltip element with enhanced styling and accessibility
     * @private
     */
    setupTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'radar-tooltip';
        this.tooltip.setAttribute('role', 'tooltip');
        this.tooltip.setAttribute('aria-hidden', 'true');
        this.container.appendChild(this.tooltip);
        
        // Add arrow element for better positioning
        const tooltipArrow = document.createElement('div');
        tooltipArrow.className = 'tooltip-arrow';
        this.tooltip.appendChild(tooltipArrow);
        
        // Add content container
        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        this.tooltip.appendChild(tooltipContent);
    }

    /**
     * Set up accessibility features
     * @private
     */
    setupAccessibility() {
        // Create status element for screen reader announcements
        this.a11yStatus = this.container.querySelector('.skills-radar-status');
    
        // Add keyboard navigation
        this.container.setAttribute('tabindex', '0');
        this.container.setAttribute('role', 'application');
        this.container.setAttribute('aria-label', 'Skills radar chart');
        
        // Add keyboard event listeners
        this._boundEventListeners.keydown = this._handleKeyboardNavigation.bind(this);
        this.container.addEventListener('keydown', this._boundEventListeners.keydown);
        
        // Make legend keyboard navigable
        const legendItems = this.container.querySelectorAll('.legend-item');
        legendItems.forEach(item => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item._legendHandler && item._legendHandler();
                }
            });
        });
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - The keyboard event
     * @private
     */
    _handleKeyboardNavigation(e) {
        // Tab key navigation is handled by the browser
    
        // Left/right arrows to navigate between legend items
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const legendItems = Array.from(this.container.querySelectorAll('.legend-item'));
            const currentFocusIndex = legendItems.findIndex(item => item === document.activeElement);
            
            if (currentFocusIndex >= 0) {
                let newIndex;
                if (e.key === 'ArrowLeft') {
                    newIndex = (currentFocusIndex - 1 + legendItems.length) % legendItems.length;
                } else {
                    newIndex = (currentFocusIndex + 1) % legendItems.length;
                }
                
                legendItems[newIndex].focus();
            }
        }
        
        // Escape key to reset view
        if (e.key === 'Escape') {
            this.resetView();
        }
    }

    /**
     * Set up event listeners for interactions with improved performance
     * @private
     */
    setupEventListeners() {
        // Use passive event listeners where possible for performance
        const passiveOpts = { passive: true };
        const nonPassiveOpts = { passive: false };
        
        // Canvas interactions - store bound functions for cleanup
        this._boundEventListeners.mousemove = this._throttle(
            this.handleMouseMove.bind(this), 
            30 // 30ms throttle
        );
        this._boundEventListeners.mouseleave = this.handleMouseLeave.bind(this);
        this._boundEventListeners.touchstart = this._handleTouch.bind(this);
        
        this.canvas.addEventListener('mousemove', this._boundEventListeners.mousemove);
        this.canvas.addEventListener('mouseleave', this._boundEventListeners.mouseleave);
        this.canvas.addEventListener('touchstart', this._boundEventListeners.touchstart, passiveOpts);
        
        // Legend interactions with touch and keyboard support
        const legendItems = this.container.querySelectorAll('.legend-item');
        legendItems.forEach((item) => {
            const handler = () => {
                const category = item.dataset.category;
                this.toggleCategory(category);
                this.updateLegendState();
                this.redrawChart();
                
                // Update ARIA attributes
                legendItems.forEach(li => li.setAttribute('aria-selected', 'false'));
                item.setAttribute('aria-selected', this.activeCategory === category ? 'true' : 'false');
                
                // Announce change for screen readers
                if (this.a11y.enabled && this.a11y.announceChanges) {
                    this._announceToScreenReader(
                        this.activeCategory ? 
                        this.a11y.labels.categoryAnnounce(this.capitalizeFirstLetter(category)) : 
                        'All categories shown'
                    );
                }
            };
            
            // Store handler for potential cleanup later
            item._legendHandler = handler;
            
            // Store bound event handlers for proper cleanup
            const touchHandler = (e) => {
                e.preventDefault();
                handler();
            };
            
            // Store references to event handlers for cleanup
            this._boundEventListeners[`legend_click_${item.dataset.category}`] = handler;
            this._boundEventListeners[`legend_touch_${item.dataset.category}`] = touchHandler;
            
            item.addEventListener('click', handler);
            item.addEventListener('touchend', touchHandler, nonPassiveOpts);
        });
        
        // Control buttons
        const controlButtons = this.container.querySelectorAll('.radar-control-btn');
        controlButtons.forEach(btn => {
            const handler = () => {
                const action = btn.dataset.action;
                if (action === 'reset') {
                    this.resetView();
                } else if (action === 'animate') {
                    this.startAnimation();
                } else if (action === 'insights') {
                    this.showInsightSummary();
                    
                    // Log event if system log is available
                    if (window.SystemLog) {
                        window.SystemLog.addEntry({
                            type: "user",
                            category: "analytics",
                            message: "[STRATEGIC ENGINE] User requested skills domain insights analysis",
                            timestamp: new Date(),
                            priority: "high"
                        });
                    }
                    
                    // Publish event for cross-component communication
                    if (window.EventBus) {
                        window.EventBus.publish('skills:insightRequested', {
                            source: 'skillsRadar',
                            timestamp: new Date()
                        });
                    }
                }
                
                // Record interaction time for adaptive performance
                this._lastInteractionTime = Date.now();
            };
            
            // Store handler for potential cleanup later
            btn._controlHandler = handler;
            
            // Store bound event handlers for proper cleanup
            const touchHandler = (e) => {
                e.preventDefault();
                handler();
            };
            
            // Store references to event handlers for cleanup
            this._boundEventListeners[`control_click_${btn.dataset.action}`] = handler;
            this._boundEventListeners[`control_touch_${btn.dataset.action}`] = touchHandler;
            
            btn.addEventListener('click', handler);
            btn.addEventListener('touchend', touchHandler, nonPassiveOpts);
        });
    }

    /**
     * Set up responsive behavior for the chart
     * @private
     */
    setupResponsiveness() {
        // Use ResizeObserver if available for better performance
        if (window.ResizeObserver) {
            this._resizeObserver = new ResizeObserver(this._throttle(() => {
                this.resizeCanvas();
                this.redrawChart();
                this._cachedPositions = {}; // Clear position cache after resize
            }, 100));
            
            this._resizeObserver.observe(this.container);
        } else {
            // Fallback to window resize event
            this._boundEventListeners.resize = this._throttle(() => {
                this.resizeCanvas();
                this.redrawChart();
                this._cachedPositions = {}; // Clear position cache after resize
            }, 100);
            
            window.addEventListener('resize', this._boundEventListeners.resize);
        }
        
        // Check for reduced motion preference
        this._checkReducedMotion();
        
        // Add media query listener for color scheme changes
        this._boundEventListeners.colorSchemeChange = this._handleColorSchemeChange.bind(this);
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',
            this._boundEventListeners.colorSchemeChange
        );
        
        // Add visibility change listener to pause rendering when not visible
        this._boundEventListeners.visibilityChange = this._handleVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this._boundEventListeners.visibilityChange);
    }

    /**
     * Utility function for throttling function calls
     * @param {Function} func - The function to throttle
     * @param {number} limit - Throttle limit in milliseconds
     * @returns {Function} Throttled function
     * @private
     */
    _throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Handle touch events for mobile interaction
     * @param {TouchEvent} event - The touch event
     * @private
     */
    _handleTouch(event) {
        // Convert touch to equivalent mouse event
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            
            // Create synthetic mouse event
            const syntheticEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: event.preventDefault.bind(event)
            };
            
            this.handleMouseMove(syntheticEvent);
        }
    }

    /**
     * Check for reduced motion preference
     * @private
     */
    _checkReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Adjust animation settings for reduced motion
            this.transitionDuration = 400; // Shorter duration
            this._logDebug('Reduced motion preference detected, adjusting animations');
        }
    }

    /**
     * Handle color scheme changes
     * @private
     */
    _handleColorSchemeChange() {
        // Update colors if necessary and redraw
        this.redrawChart();
        this._logDebug('Color scheme changed, updating chart');
    }
    
    /**
     * Handle document visibility changes
     * @private
     */
    _handleVisibilityChange() {
        if (document.hidden) {
            // Cancel any animations when tab is not visible
            if (this._renderFrameId) {
                cancelAnimationFrame(this._renderFrameId);
                this._renderFrameId = null;
            }
        } else if (this.animatedFactor < 1) {
            // Resume animation if it was in progress
            this.startAnimation();
        }
    }

    /**
     * Announce message to screen readers
     * @param {string} message - The message to announce
     * @private
     */
    _announceToScreenReader(message) {
        if (this.a11yStatus) {
            this.a11yStatus.textContent = message;
            
            // Clear after a delay to allow for multiple announcements
            setTimeout(() => {
                this.a11yStatus.textContent = '';
            }, 1000);
        }
    }

    /**
     * Create fallback content in case of initialization failure
     * @private
     */
    _createFallbackContent() {
        // Restore original content if available
        if (this._originalContent) {
            this.container.innerHTML = this._originalContent;
        } else {
            // Create simple fallback
            this.container.innerHTML = `
                <div class="skills-radar-fallback">
                    <h3>Skills Visualization</h3>
                    <p>Unable to display interactive skills radar. Please check your browser settings or try a different browser.</p>
                </div>
            `;
        }
    }

    /**
     * Log debug messages, only when debug mode is enabled
     * @param {string} message - The debug message
     * @private
     */
    _logDebug(message) {
        if (this.debug) {
            console.log(`SkillsRadarChart: ${message}`);
        }
    }

    /**
     * Clean up event listeners and references
     * @public
     */
    destroy() {
        // Cancel any animation frame requests
        if (this._renderFrameId) {
            cancelAnimationFrame(this._renderFrameId);
            this._renderFrameId = null;
        }

        // Clean up ResizeObserver if used
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        
        // Remove canvas event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this._boundEventListeners.mousemove);
            this.canvas.removeEventListener('mouseleave', this._boundEventListeners.mouseleave);
            this.canvas.removeEventListener('touchstart', this._boundEventListeners.touchstart);
        }
        
        // Remove window event listeners
        window.removeEventListener('resize', this._boundEventListeners.resize);
        document.removeEventListener('visibilitychange', this._boundEventListeners.visibilityChange);
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change',
            this._boundEventListeners.colorSchemeChange
        );
        
        // Remove container event listeners
        if (this.container) {
            this.container.removeEventListener('keydown', this._boundEventListeners.keydown);
        }
        
        // Clean up legend handlers
        const legendItems = this.container.querySelectorAll('.legend-item');
        legendItems.forEach(item => {
            const category = item.dataset.category;
            // Remove click event listener
            if (this._boundEventListeners[`legend_click_${category}`]) {
                item.removeEventListener('click', this._boundEventListeners[`legend_click_${category}`]);
            }
            // Remove touchend event listener
            if (this._boundEventListeners[`legend_touch_${category}`]) {
                item.removeEventListener('touchend', this._boundEventListeners[`legend_touch_${category}`]);
            }
            // Clean up legacy handler if it exists
            if (item._legendHandler) {
                delete item._legendHandler;
            }
        });
        
        // Clean up control button handlers
        const controlButtons = this.container.querySelectorAll('.radar-control-btn');
        controlButtons.forEach(btn => {
            const action = btn.dataset.action;
            // Remove click event listener
            if (this._boundEventListeners[`control_click_${action}`]) {
                btn.removeEventListener('click', this._boundEventListeners[`control_click_${action}`]);
            }
            // Remove touchend event listener
            if (this._boundEventListeners[`control_touch_${action}`]) {
                btn.removeEventListener('touchend', this._boundEventListeners[`control_touch_${action}`]);
            }
            // Clean up legacy handler if it exists
            if (btn._controlHandler) {
                delete btn._controlHandler;
            }
        });
        
        // Remove tooltip
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
        
        // Clear references
        this._boundEventListeners = null;
        this._cachedFilteredData = null;
    }
    
    /**
     * Handle mouse move events for tooltip and interaction
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Find the closest point to show tooltip for
        const hitboxSize = 15; // Size of hitbox for interaction
        let closestPoint = null;
        let closestDistance = Infinity;
        
        // Get filtered data based on active category
        const filteredData = this.activeCategory 
            ? this.data.filter(d => d.category === this.activeCategory)
            : this.data;
            
        // Search for closest point
        filteredData.forEach(d => {
            const allAxes = this.getAllSkillNames();
            
            allAxes.forEach(axis => {
                const skill = d.skills.find(s => s.name === axis);
                if (!skill) return;
                
                // Get position from cache or calculate
                const cacheKey = `${axis}_${skill.value}_${d.category}`;
                let x, y;
                
                if (this._cachedPositions[cacheKey]) {
                    x = this._cachedPositions[cacheKey].x;
                    y = this._cachedPositions[cacheKey].y;
                } else {
                    // Calculate position (ideally we'd implement this calculation)
                    x = this.centerX;
                    y = this.centerY;
                }
                
                // Simpler distance calculation - avoid square root when possible
                const dx = mouseX - x;
                const dy = mouseY - y;
                const distanceSquared = dx * dx + dy * dy;
                const hitboxSquared = hitboxSize * hitboxSize;
                
                // Only compute the actual distance if we're within the hitbox area
                if (distanceSquared <= hitboxSquared) {
                    const distance = Math.sqrt(distanceSquared);
                    
                    if (distance <= hitboxSize && distance < closestDistance) {
                        closestDistance = distance;
                        closestPoint = {
                            x,
                            y,
                            name: axis,
                            value: skill.value,
                            category: d.category,
                            description: skill.description || ''
                        };
                    }
                }
            });
        });
        
        // Show tooltip if point found
        if (closestPoint) {
            const tooltipX = closestPoint.x + rect.left;
            const tooltipY = closestPoint.y + rect.top - 10;
            
            // Only update tooltip HTML if content has changed
            const tooltipContent = `
                <div class="tooltip-skill-name">${closestPoint.name}</div>
                <div class="tooltip-skill-value">${this.getSkillLevelText(closestPoint.value)} (${closestPoint.value}/10)</div>
                ${closestPoint.description ? `<p>${closestPoint.description}</p>` : ''}
            `;
            
            if (this._lastTooltipContent !== tooltipContent) {
                this.tooltip.querySelector('.tooltip-content').innerHTML = tooltipContent;
                this._lastTooltipContent = tooltipContent;
            }
            
            this.tooltip.style.left = `${tooltipX}px`;
            this.tooltip.style.top = `${tooltipY}px`;
            this.tooltip.classList.add('active');
        } else {
            this.tooltip.classList.remove('active');
        }
    }

    /**
     * Handle mouse leaving the canvas
     */
    handleMouseLeave() {
        this.tooltip.classList.remove('active');
    }

    /**
     * Toggle category selection
     * @param {string} category - Category name to toggle
     */
    toggleCategory(category) {
        if (this.activeCategory === category) {
            this.activeCategory = null; // Deselect if already selected
        } else {
            this.activeCategory = category;
        }
    }

    /**
     * Update legend item active states
     */
    updateLegendState() {
        const legendItems = this.container.querySelectorAll('.legend-item');
        legendItems.forEach(item => {
            if (item.dataset.category === this.activeCategory) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Reset the chart view to show all categories
     */
    resetView() {
        this.activeCategory = null;
        this.updateLegendState();
        this.startAnimation();
    }
    
    /**
     * Start the animation sequence for the chart
     * @public 
     */
    startAnimation() {
        // Cancel any existing animation
        if (this._renderFrameId) {
            cancelAnimationFrame(this._renderFrameId);
            this._renderFrameId = null;
        }
        
        // Reset animation state
        this.animatedFactor = 0;
        this.animationStartTime = Date.now();
        
        // Create animation frame handler
        const animate = () => {
            const elapsed = Date.now() - this.animationStartTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1);
            
            // Use easing function for smooth animation
            this.animatedFactor = this._easeOutCubic(progress);
            
            // Redraw with current animation state
            this.redrawChart();
            
            // Continue animation if not complete
            if (progress < 1) {
                this._renderFrameId = requestAnimationFrame(animate);
            } else {
                this._renderFrameId = null;
            }
        };
        
        // Start animation
        this._renderFrameId = requestAnimationFrame(animate);
        this._logDebug('Animation started');
    }
    
    /**
     * Cubic ease-out function for smooth animations
     * @param {number} t - Progress value from 0 to 1
     * @returns {number} Eased value
     * @private
     */
    _easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * Resize the canvas to match container size
     * @public
     */
    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        // Get the radar chart container size
        const radarContainer = this.container.querySelector('.skills-radar-chart');
        if (!radarContainer) return;
        
        const containerRect = radarContainer.getBoundingClientRect();
        
        // Calculate device pixel ratio for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        // Set logical size for the canvas
        const width = containerRect.width;
        const height = containerRect.height;
        
        // Set physical size of the canvas (accounting for DPI)
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // Set display size
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        // Scale context to device pixel ratio
        this.ctx.scale(dpr, dpr);
        
        // Store dimensions for calculations
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        
        // Clear cached positions as they need to be recalculated
        this._cachedPositions = {};
        
        this._logDebug(`Canvas resized to ${width}x${height} with DPR ${dpr}`);
    }
    
    /**
     * Redraw the chart with current state
     * @public
     */
    redrawChart() {
        if (!this.ctx || !this.canvas || this.width === 0 || this.height === 0) return;
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Get filtered data based on active category
        const filteredData = this.activeCategory 
            ? this.data.filter(d => d.category === this.activeCategory)
            : this.data;
            
        // Skip drawing if no data
        if (!filteredData.length) return;
        
        // Calculate the radius of the chart
        const chartRadius = Math.min(this.width, this.height) / 2.5;
        
        // Get all unique skill names
        const allAxes = this.getAllSkillNames();
        this.allAxis = allAxes; // Store for use in other methods
        const axisCount = allAxes.length;
        
        // Skip drawing if no axes
        if (axisCount === 0) return;
        
        // Draw background levels
        this._drawEnhancedLevels(chartRadius, axisCount);
        
        // Draw axes lines
        this._drawEnhancedAxes(allAxes, chartRadius);
        
        // Draw radar areas
        this._drawAreas(filteredData, allAxes, chartRadius);
        
        // Draw pulsing glow effects under data points for visual enhancement
        this._drawPulsingGlow(filteredData, chartRadius);
        
        // Draw enhanced data points
        this._drawEnhancedDataPoints(filteredData, allAxes, chartRadius);
        
        // Draw axis labels
        this._drawEnhancedAxisLabels(allAxes, chartRadius);
        
        // Request next animation frame for continuous pulsing effect
        if (!this._renderFrameId) {
            this._renderFrameId = requestAnimationFrame(() => {
                this._renderFrameId = null;
                this.redrawChart();
            });
        }
    }
    
    /**
     * Draws a pulsing glow effect for active data points
     * @param {Array} data - The data points to draw
     * @param {number} radius - Chart radius
     * @private
     */
    _drawPulsingGlow(data, radius) {
        if (!data || !data.length) return;
        
        const ctx = this.ctx;
        const now = performance.now() / 1000;
        
        // Only draw glow for the active category or all categories if none active
        const filteredData = this.activeCategory 
            ? data.filter(d => d.category === this.activeCategory) 
            : data;
        
        ctx.save();
        
        filteredData.forEach(category => {
            category.skills.forEach((skill, i) => {
                // Find the axis index
                const axisIndex = this.allAxis.indexOf(skill.name);
                if (axisIndex === -1) return;
                
                // Calculate position
                const angleSlice = (Math.PI * 2) / this.allAxis.length;
                const angle = axisIndex * angleSlice;
                
                // Calculate position based on data value
                const value = parseFloat(skill.value);
                if (isNaN(value)) return;
                
                const posX = this.centerX + (value / this.maxValue) * radius * Math.cos(angle) * this.animatedFactor;
                const posY = this.centerY + (value / this.maxValue) * radius * Math.sin(angle) * this.animatedFactor;
                
                // Create pulsing effect - oscillate between 0.6 and 1
                const pulseIntensity = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now * 2 + i * 0.3));
                
                // Draw glow
                const gradientSize = this.dotRadius * (6 + 4 * pulseIntensity);
                const gradient = ctx.createRadialGradient(posX, posY, 0, posX, posY, gradientSize);
                
                // Get the appropriate color based on category
                let color = this.colorScheme[category.category] || 'rgba(255, 255, 255, 0.7)';
                
                // Extract RGB values from rgba color
                let rgbValues = color.match(/\d+/g);
                if (rgbValues && rgbValues.length >= 3) {
                    // Create gradient with fading opacity
                    gradient.addColorStop(0, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${0.7 * pulseIntensity})`);
                    gradient.addColorStop(0.5, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${0.3 * pulseIntensity})`);
                    gradient.addColorStop(1, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0)`);
                    
                    // Draw glow
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(posX, posY, gradientSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });
        
        ctx.restore();
    }

    /**
     * Enhanced method to draw visually appealing data points with glowing effects
     * @param {Array} data - The data to render
     * @param {Array} axes - Array of axis names
     * @param {number} radius - Chart radius
     * @private
     */
    _drawEnhancedDataPoints(data, axes, radius) {
        if (!data || !data.length || !axes || !axes.length) return;
        
        const ctx = this.ctx;
        const axisCount = axes.length;
        const now = performance.now() / 1000;
        
        // Save context state
        ctx.save();
        
        // Draw each category's points
        data.forEach(category => {
            const categoryName = category.category;
            const color = this.colorScheme[categoryName] || 'rgba(255, 255, 255, 0.5)';
            
            // Get RGB values from the color string
            let rgbValues = color.match(/\d+/g);
            if (!rgbValues || rgbValues.length < 3) {
                rgbValues = [255, 255, 255]; // Fallback to white
            }
            
            // Draw points for each axis
            category.skills.forEach((skill, i) => {
                // Find the axis index
                const axisIndex = axes.indexOf(skill.name);
                if (axisIndex === -1) return;
                
                // Calculate value and position
                const value = skill.value * this.animatedFactor;
                const angle = (Math.PI * 2 * axisIndex) / axisCount;
                const ratio = value / this.maxValue;
                const x = this.centerX + radius * ratio * Math.cos(angle);
                const y = this.centerY + radius * ratio * Math.sin(angle);
                
                // Enhance dot size based on whether this is the active category
                const isActiveCategory = !this.activeCategory || this.activeCategory === categoryName;
                const dotPulse = isActiveCategory ? 0.2 * Math.sin(now * 3 + i * 0.7) : 0;
                const dotSize = this.dotRadius * (isActiveCategory ? (1.5 + dotPulse) : 1);
                
                // Draw inner glow
                const glowRadius = dotSize * 2.5;
                const gradient = ctx.createRadialGradient(x, y, dotSize * 0.5, x, y, glowRadius);
                gradient.addColorStop(0, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.8)`);
                gradient.addColorStop(1, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw outer rim with shadow for depth
                ctx.shadowColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.6)`;
                ctx.shadowBlur = 8;
                ctx.strokeStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.9)`;
                ctx.lineWidth = 1.5;
                
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.stroke();
                
                // Reset shadow before filling
                ctx.shadowBlur = 0;
                
                // Draw dot fill with highlight
                const dotGradient = ctx.createRadialGradient(
                    x - dotSize * 0.3, y - dotSize * 0.3, 0, 
                    x, y, dotSize
                );
                dotGradient.addColorStop(0, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 1)`);
                dotGradient.addColorStop(1, `rgba(${Math.min(255, parseInt(rgbValues[0]) * 0.8)}, ${Math.min(255, parseInt(rgbValues[1]) * 0.8)}, ${Math.min(255, parseInt(rgbValues[2]) * 0.8)}, 0.9)`);
                
                ctx.fillStyle = dotGradient;
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Add highlight spot
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(x - dotSize * 0.3, y - dotSize * 0.3, dotSize * 0.25, 0, Math.PI * 2);
                ctx.fill();
            });
        });
        
        // Restore context state
        ctx.restore();
    }

    /**
     * Enhanced method to draw level circles with visual effects
     * @param {number} radius - Chart radius
     * @param {number} axisCount - Number of axes
     * @private
     */
    _drawEnhancedLevels(radius, axisCount) {
        const levelFactor = radius / this.levels;
        const ctx = this.ctx;
        const now = performance.now() / 1000;
        
        // Save context state
        ctx.save();
        
        // Define color palette based on theme
        const isActiveFilter = this.activeCategory !== null;
        
        // Draw each level with enhanced styling
        for (let level = 0; level < this.levels; level++) {
            const currentLevelFactor = levelFactor * (level + 1);
            
            // Create subtle breathing animation
            const breatheFactor = 1 + 0.01 * Math.sin(now * 0.5 + level * 0.2);
            const animatedRadius = currentLevelFactor * breatheFactor;
            
            // Calculate gradient color based on level
            const opacity = 0.03 + (level / this.levels) * 0.05;
            const lineOpacity = 0.03 + (level / this.levels) * 0.1;
            
            // Draw level circle
            ctx.beginPath();
            for (let i = 0; i < axisCount; i++) {
                const angle = (Math.PI * 2 * i) / axisCount;
                const x = this.centerX + animatedRadius * Math.cos(angle);
                const y = this.centerY + animatedRadius * Math.sin(angle);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    // Use quadratic curves for smoother circles
                    const prevAngle = (Math.PI * 2 * (i - 1)) / axisCount;
                    const midAngle = (prevAngle + angle) / 2;
                    const ctrlX = this.centerX + animatedRadius * 1.1 * Math.cos(midAngle);
                    const ctrlY = this.centerY + animatedRadius * 1.1 * Math.sin(midAngle);
                    
                    ctx.quadraticCurveTo(ctrlX, ctrlY, x, y);
                }
            }
            ctx.closePath();
            
            // Create radial gradient for level circles
            const gradient = ctx.createRadialGradient(
                this.centerX, this.centerY, 0,
                this.centerX, this.centerY, animatedRadius
            );
            
            // Add gradient stops for a more dramatic effect
            gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.1})`);
            
            if (isActiveFilter) {
                const color = this.colorScheme[this.activeCategory] || 'rgba(255, 255, 255, 0.7)';
                let rgbValues = color.match(/\d+/g);
                if (rgbValues && rgbValues.length >= 3) {
                    gradient.addColorStop(0.7, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity * 0.3})`);
                    gradient.addColorStop(1, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`);
                    ctx.strokeStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${lineOpacity})`;
                }
            } else {
                gradient.addColorStop(0.7, `rgba(255, 255, 255, ${opacity * 0.3})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);
                ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
            }
            
            // Apply fill and stroke styles
            ctx.fillStyle = gradient;
            ctx.lineWidth = 0.5;
            
            // Fill and stroke the path
            ctx.fill();
            ctx.stroke();
            
            // Draw level labels if needed
            if (this.valueLabels && this.valueLabels[level]) {
                const labelY = this.centerY - animatedRadius;
                
                // Set label text style
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                
                // Create a subtle glow effect for text
                ctx.fillStyle = isActiveFilter 
                    ? this.colorScheme[this.activeCategory] || 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(255, 255, 255, 0.7)';
                
                ctx.fillText(this.valueLabels[level], this.centerX, labelY - 5);
            }
        }
        
        // Restore context state
        ctx.restore();
    }

    /**
     * Enhanced method to draw axis lines with visual effects
     * @param {Array} axes - Array of axis names
     * @param {number} radius - Chart radius
     * @private
     */
    _drawEnhancedAxes(axes, radius) {
        const axisCount = axes.length;
        const ctx = this.ctx;
        const now = performance.now() / 1000;
        
        // Save context state
        ctx.save();
        
        // Get active category details
        const isActiveFilter = this.activeCategory !== null;
        let activeColor = 'rgba(255, 255, 255, 0.15)';
        let fadeColor = 'rgba(255, 255, 255, 0.05)';
        
        if (isActiveFilter) {
            const color = this.colorScheme[this.activeCategory] || 'rgba(255, 255, 255, 0.7)';
            let rgbValues = color.match(/\d+/g);
            if (rgbValues && rgbValues.length >= 3) {
                activeColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.2)`;
                fadeColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.05)`;
            }
        }
        
        // Draw each axis with enhanced styling
        for (let i = 0; i < axisCount; i++) {
            const angle = (Math.PI * 2 * i) / axisCount;
            const x = this.centerX + radius * Math.cos(angle);
            const y = this.centerY + radius * Math.sin(angle);
            
            // Create pulsing effect for line width
            const pulse = 0.3 * Math.sin(now * 1.5 + i * 0.5);
            const lineWidth = isActiveFilter ? 1.2 + pulse : 0.8 + pulse * 0.5;
            
            // Create gradient for axis line
            const gradient = ctx.createLinearGradient(this.centerX, this.centerY, x, y);
            gradient.addColorStop(0, fadeColor);
            gradient.addColorStop(0.5, activeColor);
            gradient.addColorStop(1, fadeColor);
            
            // Set line styles
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            
            // Draw axis line with subtle glow
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(x, y);
            
            // Add shadow glow for active category
            if (isActiveFilter) {
                ctx.shadowColor = this.colorScheme[this.activeCategory] || 'rgba(255, 255, 255, 0.5)';
                ctx.shadowBlur = 3 + 2 * Math.sin(now + i * 0.7);
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow
            
            // Draw dot at the end of each axis line
            const dotSize = 1 + 0.5 * Math.sin(now * 2 + i);
            ctx.fillStyle = activeColor;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Restore context state
        ctx.restore();
    }

    /**
     * Enhanced method to draw axis labels with visual effects
     * @param {Array} axes - Array of axis names
     * @param {number} radius - Chart radius
     * @private
     */
    _drawEnhancedAxisLabels(axes, radius) {
        const axisCount = axes.length;
        const ctx = this.ctx;
        const now = performance.now() / 1000;
        
        // Save context state
        ctx.save();
        
        // Get active category details
        const isActiveFilter = this.activeCategory !== null;
        
        // Set text style
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw each axis label
        axes.forEach((axis, i) => {
            const angle = (Math.PI * 2 * i) / axisCount;
            
            // Calculate label position with slight animation
            const labelFactor = this.labelFactor + 0.02 * Math.sin(now * 1.2 + i * 0.5);
            const labelX = this.centerX + radius * labelFactor * Math.cos(angle);
            const labelY = this.centerY + radius * labelFactor * Math.sin(angle);
            
            // Create text shadow for glow effect
            if (isActiveFilter) {
                const color = this.colorScheme[this.activeCategory];
                let rgbValues = color.match(/\d+/g);
                if (rgbValues && rgbValues.length >= 3) {
                    ctx.shadowColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.7)`;
                    ctx.shadowBlur = 3 + Math.sin(now + i * 0.3) * 2;
                    ctx.fillStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.9)`;
                }
            } else {
                ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                ctx.shadowBlur = 2;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            }
            
            // Apply pulse animation to opacity
            const opacityPulse = 0.8 + 0.2 * Math.sin(now * 1.5 + i * 0.4);
            ctx.globalAlpha = opacityPulse;
            
            // Draw text with proper wrapping
            this.wrapText(ctx, axis, labelX, labelY, this.wrapWidth, 15);
        });
        
        // Reset globalAlpha
        ctx.globalAlpha = 1;
        
        // Restore context state
        ctx.restore();
    }

    /**
     * Show insight summary modal with skill analysis
     */
    showInsightSummary() {
        // Generate insights from skills data
        const insights = this.generateSkillsInsights();
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'insight-summary-modal';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'insight-header';
        header.innerHTML = `
            <h3>Strategic Skills Analysis</h3>
            <div class="insight-subtitle">Palantir-Grade Insight Engine</div>
        `;
        modalContent.appendChild(header);
        
        // Add primary insights
        const primaryInsight = document.createElement('div');
        primaryInsight.className = 'primary-insight';
        primaryInsight.innerHTML = `
            <div class="insight-metric">${insights.topCategory.name}</div>
            <div class="insight-description">Primary skill domain with ${insights.topCategory.avgScore.toFixed(1)} average proficiency</div>
        `;
        modalContent.appendChild(primaryInsight);
        
        // Add skill distribution visualization
        const distribution = document.createElement('div');
        distribution.className = 'skill-distribution';
        distribution.innerHTML = `
            <h4>Skill Distribution Analysis</h4>
            <div class="distribution-bars">
                ${Object.entries(insights.categoryScores).map(([category, score]) => `
                    <div class="distribution-bar-container">
                        <div class="distribution-label">${this.capitalizeFirstLetter(category)}</div>
                        <div class="distribution-bar">
                            <div class="distribution-fill" style="width: ${score * 10}%; background-color: ${this.colorScheme[category]}"></div>
                        </div>
                        <div class="distribution-value">${score.toFixed(1)}</div>
                    </div>
                `).join('')}
            </div>
        `;
        modalContent.appendChild(distribution);
        
        // Add recommendations section
        const recommendations = document.createElement('div');
        recommendations.className = 'skill-recommendations';
        recommendations.innerHTML = `
            <h4>Strategic Recommendations</h4>
            <ul>
                ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
        modalContent.appendChild(recommendations);
        
        // Create modal if not already present
        let modalContainer = document.querySelector('.insight-modal-container');
        
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.className = 'insight-modal-container';
            modalContainer.innerHTML = `
                <div class="insight-modal-backdrop"></div>
                <div class="insight-modal">
                    <div class="insight-modal-close">&times;</div>
                    <div class="insight-modal-content"></div>
                </div>
            `;
            document.body.appendChild(modalContainer);
            
            // Add close button listener
            const closeBtn = modalContainer.querySelector('.insight-modal-close');
            const closeHandler = () => {
                modalContainer.classList.remove('active');
                // Remove event listeners before removing from DOM
                closeBtn.removeEventListener('click', closeBtn._closeHandler);
                backdrop.removeEventListener('click', backdrop._closeHandler);
                setTimeout(() => {
                    modalContainer.remove();
                }, 300);
            };
            closeBtn._closeHandler = closeHandler;
            closeBtn.addEventListener('click', closeHandler);
            
            // Add backdrop click to close
            const backdrop = modalContainer.querySelector('.insight-modal-backdrop');
            backdrop._closeHandler = closeHandler;
            backdrop.addEventListener('click', closeHandler);
        }
        
        // Add content to modal
        const modalContentContainer = modalContainer.querySelector('.insight-modal-content');
        modalContentContainer.innerHTML = '';
        modalContentContainer.appendChild(modalContent);
        
        // Show modal with animation
        setTimeout(() => {
            modalContainer.classList.add('active');
        }, 100);
        
        // Log insight generation
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: "system",
                category: "analytics",
                message: "Generated strategic skills insight analysis",
                timestamp: new Date()
            });
        }
        
        // Publish event
        if (window.EventBus) {
            window.EventBus.publish('skills:insightGenerated', insights);
        }
    }
    
    /**
     * Generate insights from skills data
     * @returns {Object} Insights data object
     */
    generateSkillsInsights() {
        // Analysis container
        const insights = {
            topSkills: [],
            developmentAreas: [],
            categoryScores: {},
            balance: 0,
            recommendations: []
        };
        
        // Calculate average scores by category
        this.data.forEach(category => {
            let totalScore = 0;
            category.skills.forEach(skill => {
                totalScore += skill.value;
            });
            const avgScore = totalScore / category.skills.length;
            insights.categoryScores[category.category] = avgScore;
        });
        
        // Find top category
        let maxScore = 0;
        let topCategory = '';
        
        Object.entries(insights.categoryScores).forEach(([category, score]) => {
            if (score > maxScore) {
                maxScore = score;
                topCategory = category;
            }
        });
        
        insights.topCategory = {
            name: this.capitalizeFirstLetter(topCategory),
            avgScore: maxScore
        };
        
        // Get top skills
        const allSkills = [];
        this.data.forEach(category => {
            category.skills.forEach(skill => {
                allSkills.push({
                    name: skill.name,
                    value: skill.value,
                    category: category.category
                });
            });
        });
        
        // Sort by value and get top 3
        allSkills.sort((a, b) => b.value - a.value);
        insights.topSkills = allSkills.slice(0, 3);
        
        // Get development areas (lowest 3 skills)
        insights.developmentAreas = [...allSkills].sort((a, b) => a.value - b.value).slice(0, 3);
        
        // Calculate skill balance (standard deviation of category averages)
        const categoryValues = Object.values(insights.categoryScores);
        const meanCategoryScore = categoryValues.reduce((sum, val) => sum + val, 0) / categoryValues.length;
        
        const variance = categoryValues.reduce((sum, val) => sum + Math.pow(val - meanCategoryScore, 2), 0) / categoryValues.length;
        insights.balance = Math.sqrt(variance);
        
        // Generate recommendations based on analysis
        if (insights.balance > 1.5) {
            insights.recommendations.push(`Focus on balancing skills across ${this.getLowestCategory(insights.categoryScores)} domain to create a more well-rounded profile.`);
        } else {
            insights.recommendations.push("Maintain current balanced approach across different skill domains.");
        }
        
        // Add specific skill recommendations
        if (insights.developmentAreas.length > 0) {
            insights.recommendations.push(`Consider developing ${insights.developmentAreas[0].name} to enhance overall capabilities.`);
        }
        
        // Add domain-specific recommendations
        insights.recommendations.push(`Leverage strong ${insights.topCategory.name} skills as a core differentiator in strategic initiatives.`);
        
        return insights;
    }
    
    /**
     * Get the lowest scoring category
     * @param {Object} categoryScores - Object containing category scores
     * @returns {string} Name of lowest scoring category
     */
    getLowestCategory(categoryScores) {
        let minScore = Infinity;
        let lowestCategory = '';
        
        Object.entries(categoryScores).forEach(([category, score]) => {
            if (score < minScore) {
                minScore = score;
                lowestCategory = category;
            }
        });
        
        return this.capitalizeFirstLetter(lowestCategory);
    }

    /**
     * Get all unique skill names from all categories
     * @returns {Array} Array of skill names
     */
    getAllSkillNames() {
        if (this._cachedAllSkillNames) {
            return this._cachedAllSkillNames;
        }
        
        const names = new Set();
        this.data.forEach(category => {
            category.skills.forEach(skill => {
                names.add(skill.name);
            });
        });
        
        this._cachedAllSkillNames = Array.from(names);
        return this._cachedAllSkillNames;
    }

    /**
     * Convert skill value to text level
     * @param {number} value - Numeric skill value
     * @returns {string} Text representation of skill level
     */
    getSkillLevelText(value) {
        if (value >= 9) return 'Expert';
        if (value >= 7) return 'Advanced';
        if (value >= 5) return 'Proficient';
        if (value >= 3) return 'Familiar';
        return 'Beginner';
    }

    /**
     * Helper function to wrap text in canvas
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {string} text - Text to wrap
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} maxWidth - Maximum width in pixels
     * @param {number} lineHeight - Line height in pixels
     */
    wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = 1;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y - ((lines - 1) * lineHeight) / 2);
                line = words[n] + ' ';
                lines++;
            } else {
                line = testLine;
            }
        }
        
        const yOffset = lines > 1 ? ((lines - 1) * lineHeight) / 2 : 0;
        context.fillText(line, x, y + lineHeight * ((lines - 1) / 2) - yOffset);
    }

    /**
     * Helper function to capitalize first letter
     * @param {string} string - Input string
     * @returns {string} String with first letter capitalized
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Default data structure for skills radar
     * @returns {Array} Default skills data
     */
    getDefaultData() {
        return [
            {
                category: 'technical',
                skills: [
                    { name: 'JavaScript', value: 9, description: 'Modern JS, ES6+, functional programming' },
                    { name: 'TypeScript', value: 8, description: 'Type systems, interfaces, generics' },
                    { name: 'React', value: 9, description: 'Hooks, context, state management' },
                    { name: 'Node.js', value: 8, description: 'API development, Express, middleware' },
                    { name: 'GraphQL', value: 7, description: 'Schema design, resolvers, Apollo' },
                    { name: 'DevOps', value: 6, description: 'CI/CD, Docker, infrastructure as code' }
                ]
            },
            {
                category: 'leadership',
                skills: [
                    { name: 'Team Management', value: 8, description: 'Leading cross-functional teams' },
                    { name: 'Product Strategy', value: 9, description: 'Vision, roadmap development' },
                    { name: 'Mentoring', value: 8, description: 'Developer growth and coaching' },
                    { name: 'Communication', value: 9, description: 'Clear, effective stakeholder communication' },
                    { name: 'Process Optimization', value: 7, description: 'Agile methodologies and workflows' },
                    { name: 'Conflict Resolution', value: 7, description: 'Mediating team challenges' }
                ]
            },
            {
                category: 'business',
                skills: [
                    { name: 'Financial Analysis', value: 6, description: 'P&L, budgeting, forecasting' },
                    { name: 'Market Research', value: 7, description: 'Competitive analysis, market trends' },
                    { name: 'Business Strategy', value: 8, description: 'Growth planning, pivoting' },
                    { name: 'Client Relations', value: 9, description: 'Partnership building, retention' },
                    { name: 'Negotiation', value: 7, description: 'Contract negotiations, partnerships' },
                    { name: 'Digital Marketing', value: 6, description: 'SEO, content strategy, analytics' }
                ]
            },
            {
                category: 'creative',
                skills: [
                    { name: 'Design Thinking', value: 8, description: 'Human-centered solutions' },
                    { name: 'UX/UI Design', value: 7, description: 'Wireframing, prototyping, user flows' },
                    { name: 'Visual Design', value: 6, description: 'Typography, color theory, composition' },
                    { name: 'Content Creation', value: 7, description: 'Technical writing, presentations' },
                    { name: 'Brand Development', value: 8, description: 'Identity, messaging, positioning' },
                    { name: 'Data Visualization', value: 7, description: 'Presenting complex data clearly' }
                ]
            },
            {
                category: 'languages',
                skills: [
                    { name: 'English', value: 10, description: 'Native fluency' },
                    { name: 'Arabic', value: 7, description: 'Professional working proficiency' },
                    { name: 'French', value: 5, description: 'Intermediate proficiency' },
                    { name: 'Spanish', value: 4, description: 'Basic conversational' },
                    { name: 'Python', value: 7, description: 'Data analysis, automation' },
                    { name: 'SQL', value: 8, description: 'Complex queries, performance optimization' }
                ]
            }
        ];
    }
    
    /**
     * Creates and animates particles around the highlighted data point
     * @param {number} x - X position of particle origin
     * @param {number} y - Y position of particle origin
     * @param {string} color - Base color of the particle
     * @private
     */
    _createParticles(x, y, color) {
        if (!this.visualEffects.particleEffects) return;
        
        const colorRgb = this._extractRgbValues(color);
        const count = this.visualEffects.particlesCount;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            const size = 1 + Math.random() * 3;
            const life = 30 + Math.random() * 30;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, ${0.7 + Math.random() * 0.3})`,
                life: life,
                maxLife: life
            });
        }
    }
    
    /**
     * Updates and renders particles
     * @private
     */
    _updateParticles() {
        if (!this.visualEffects.particleEffects || this.particles.length === 0) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity and friction
            p.vy += 0.05;
            p.vx *= 0.99;
            p.vy *= 0.99;
            
            // Decrease life
            p.life--;
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Fade out based on life
            const normalizedLife = p.life / p.maxLife;
            const alpha = normalizedLife * 0.7;
            const fadeColor = p.color.replace(/[\d.]+\)$/g, `${alpha})`);
            
            // Draw particle
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = fadeColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * normalizedLife, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Extract RGB values from a color string
     * @param {string} colorString - CSS color string
     * @returns {Object} - Object with r, g, b values
     * @private
     */
    _extractRgbValues(colorString) {
        // Default values
        const defaultRgb = { r: 255, g: 255, b: 255 };
        
        if (!colorString) return defaultRgb;
        
        // For rgba format
        const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (rgbaMatch) {
            return {
                r: parseInt(rgbaMatch[1], 10),
                g: parseInt(rgbaMatch[2], 10),
                b: parseInt(rgbaMatch[3], 10)
            };
        }
        
        // For hex format
        const hexMatch = colorString.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        if (hexMatch) {
            return {
                r: parseInt(hexMatch[1], 16),
                g: parseInt(hexMatch[2], 16),
                b: parseInt(hexMatch[3], 16)
            };
        }
        
        return defaultRgb;
    }
    
    /**
     * Adds interactive hover effects to data points 
     * @param {Array} points - Array of data points with coordinates
     * @param {string} category - The category of the points
     * @private
     */
    _addPointHoverEffects(points, category) {
        const ctx = this.ctx;
        const now = Date.now() / 1000;
        const color = this.colorScheme[category];
        
        points.forEach((point, i) => {
            // Skip if point is undefined
            if (!point || typeof point.x === 'undefined') return;
            
            // Check if mouse is hovering over this point
            const distToMouse = this._lastMousePos ? 
                Math.sqrt(Math.pow(this._lastMousePos.x - point.x, 2) + Math.pow(this._lastMousePos.y - point.y, 2)) : 
                Infinity;
            
            const isHovering = distToMouse < 20;
            
            // Apply interactive effects
            if (isHovering) {
                // Grow the dot
                const hoverSize = this.dotRadius * this.visualEffects.hoverScaleFactor;
                
                // Draw glow effect
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.shadowColor = color;
                ctx.shadowBlur = 15 * this.visualEffects.glowIntensity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, hoverSize * 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                // Draw the larger dot for hover state
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, hoverSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Create particles on first hover detection
                if (!point.wasHovering && this.visualEffects.particleEffects) {
                    this._createParticles(point.x, point.y, color);
                }
                
                // Remember hover state
                point.wasHovering = true;
            } else {
                // Normal dot with subtle animation
                const pulseAmount = this.visualEffects.pulseEffect ? 
                    Math.sin(now * 2 + i * 0.7) * 0.3 + 1 : 
                    1;
                    
                const normalSize = this.dotRadius * pulseAmount;
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, normalSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Reset hover state
                point.wasHovering = false;
            }
        });
    }
    
    /**
     * Draws staggered entry animation for skills data points
     * @param {number} progress - Animation progress from 0 to 1
     * @private
     */
    _drawStaggeredEntryAnimation(progress) {
        if (!this.data || !this.ctx) return;
        
        const ctx = this.ctx;
        const categories = this.data;
        
        categories.forEach((category, categoryIndex) => {
            const categoryColor = this.colorScheme[category.category];
            const skills = category.skills;
            
            skills.forEach((skill, skillIndex) => {
                // Calculate staggered delay for each point
                const staggerDelay = 
                    (categoryIndex * skills.length + skillIndex) * 
                    this.visualEffects.entryStaggerDelay / this.transitionDuration;
                
                // Calculate individual point progress with staggered delay
                const pointProgress = Math.max(0, Math.min(1, 
                    (progress - staggerDelay) * (1 / (1 - staggerDelay))
                ));
                
                if (pointProgress <= 0) return;
                
                // Calculate position
                const angleSlice = (Math.PI * 2) / this.getTotalAxesCount();
                const axis = this.getAllAxes().findIndex(a => 
                    a.category === category.category && a.name === skill.name);
                
                if (axis === -1) return;
                
                const angle = angleSlice * axis;
                const value = skill.value * pointProgress; // Animate value from 0 to actual
                
                const radius = (value / this.maxValue) * this.getChartRadius();
                const x = this.centerX + radius * Math.cos(angle - Math.PI / 2);
                const y = this.centerY + radius * Math.sin(angle - Math.PI / 2);
                
                // Draw animated point
                ctx.fillStyle = categoryColor;
                
                // Add entry animation effect
                const entrySize = this.dotRadius * (0.5 + 0.5 * Math.pow(pointProgress, 2));
                const opacity = pointProgress;
                
                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(x, y, entrySize, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });
        });
    }
    
    /**
     * Override the draw method to include enhanced visual effects
     * @param {number} factor - Animation factor between 0 and 1
     */
    drawEnhanced(factor = 1) {
        // Clear the canvas
        this.clearCanvas();
        
        // Get chart parameters
        const chartRadius = this.getChartRadius();
        const allAxes = this.getAllAxes();
        
        // Draw grid levels
        this._drawEnhancedLevels(chartRadius, allAxes.length);
        
        // Draw axes lines with entry animation
        this._drawEnhancedAxes(allAxes, chartRadius, factor);
        
        // Draw enhanced data polygons with animation
        this._drawEnhancedDataPolygons(chartRadius, factor);
        
        // Draw data points with hover effects if animation complete
        if (factor >= 0.9) {
            this._drawEnhancedDataPoints();
        }
        
        // Draw entry animation for data points
        if (factor < 1) {
            this._drawStaggeredEntryAnimation(factor);
        }
        
        // Update and draw particles
        this._updateParticles();
        
        // Draw radar decorations
        this._drawRadarDecorations();
        
        // Draw axis labels
        this._drawEnhancedAxisLabels(allAxes, chartRadius);
    }
    
    /**
     * Draw enhanced grid levels with animated opacity
     * @param {number} radius - Chart radius
     * @param {number} axisCount - Number of axes
     * @private 
     */
    _drawEnhancedLevels(radius, axisCount) {
        // Call the original _drawLevels method from helpers
        if (typeof this._drawLevels === 'function') {
            this._drawLevels(radius, axisCount);
        }
        
        // Add pulsing glow to the active level
        const now = Date.now() / 1000;
        const ctx = this.ctx;
        
        // Highlight active level based on interaction
        if (this.activeCategory) {
            const activeLevelIndex = 3; // Typically the "proficient" level
            const levelFactor = radius / this.levels;
            const currentLevelFactor = levelFactor * activeLevelIndex;
            
            ctx.save();
            
            // Pulsing opacity for highlight
            const pulseOpacity = 0.1 + 0.1 * Math.sin(now * 2);
            
            // Draw highlighted level
            ctx.strokeStyle = 'rgba(var(--theme-accent-primary-rgb), ' + pulseOpacity + ')';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            
            for (let i = 0; i < axisCount; i++) {
                const angle = (Math.PI * 2 * i) / axisCount;
                const x = this.centerX + currentLevelFactor * Math.cos(angle);
                const y = this.centerY + currentLevelFactor * Math.sin(angle);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }
    
    /**
     * Draw enhanced axis lines with animation
     * @param {Array} axes - Array of axis objects
     * @param {number} radius - Chart radius 
     * @param {number} factor - Animation factor
     * @private
     */
    _drawEnhancedAxes(axes, radius, factor) {
        const ctx = this.ctx;
        const axisCount = axes.length;
        
        // Draw each axis with animation
        for (let i = 0; i < axisCount; i++) {
            const axis = axes[i];
            const angle = (Math.PI * 2 * i) / axisCount;
            
            // Calculate animated length based on factor
            const axisProgress = Math.min(1, factor * 2); // Axes appear in first half of animation
            const animatedRadius = radius * axisProgress;
            
            // Get axis color based on category
            const category = axis.category;
            const isActive = this.activeCategory === null || this.activeCategory === category;
            
            // Set line style based on active state
            if (isActive) {
                ctx.strokeStyle = this.colorScheme[category] || 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = this.strokeWidth;
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = this.strokeWidth / 2;
            }
            
            // Draw axis line
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(
                this.centerX + animatedRadius * Math.cos(angle - Math.PI / 2),
                this.centerY + animatedRadius * Math.sin(angle - Math.PI / 2)
            );
            ctx.stroke();
        }
    }
    
    /**
     * Draw enhanced data polygons with animation
     * @param {number} radius - Chart radius
     * @param {number} factor - Animation factor
     * @private
     */
    _drawEnhancedDataPolygons(radius, factor) {
        if (!this.data) return;
        
        const ctx = this.ctx;
        const axisCount = this.getTotalAxesCount();
        
        if (axisCount <= 0) return;
        
        const angleSlice = (Math.PI * 2) / axisCount;
        
        // Group data points by category
        const categoryPolygons = {};
        const allAxes = this.getAllAxes();
        
        this.data.forEach(categoryData => {
            const category = categoryData.category;
            const isActive = this.activeCategory === null || this.activeCategory === category;
            
            if (!categoryPolygons[category]) {
                categoryPolygons[category] = [];
            }
            
            // Calculate points for this category
            categoryData.skills.forEach(skill => {
                const axisIndex = allAxes.findIndex(
                    axis => axis.category === category && axis.name === skill.name
                );
                
                if (axisIndex >= 0) {
                    const angle = angleSlice * axisIndex;
                    
                    // Apply animation using easing function
                    const progress = this._easingFunction(factor, this.visualEffects.polygonEntryEasing);
                    const animatedValue = skill.value * progress;
                    
                    const valueRadius = (animatedValue / this.maxValue) * radius;
                    
                    categoryPolygons[category].push({
                        x: this.centerX + valueRadius * Math.cos(angle - Math.PI / 2),
                        y: this.centerY + valueRadius * Math.sin(angle - Math.PI / 2),
                        value: skill.value,
                        name: skill.name
                    });
                }
            });
            
            // Draw polygon for this category
            const points = categoryPolygons[category];
            
            if (points.length > 2) {
                // Fill polygon with semi-transparent color
                ctx.fillStyle = this.colorScheme[category] || 'rgba(255, 255, 255, 0.5)';
                
                // Adjust opacity based on active state
                ctx.globalAlpha = isActive ? this.opacityArea : this.opacityArea * 0.3;
                
                ctx.beginPath();
                points.forEach((point, i) => {
                    if (i === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.closePath();
                ctx.fill();
                
                // Reset opacity
                ctx.globalAlpha = 1;
                
                // Draw category boundary
                ctx.strokeStyle = this.colorScheme[category] || 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = this.strokeWidth * (isActive ? 1 : 0.5);
                
                // Apply rounded strokes if enabled
                if (this.roundStrokes) {
                    ctx.lineJoin = 'round';
                }
                
                ctx.beginPath();
                points.forEach((point, i) => {
                    if (i === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.closePath();
                ctx.stroke();
            }
        });
    }
    
    /**
     * Draw enhanced data points with hover effects
     * @private
     */
    _drawEnhancedDataPoints() {
        if (!this.data) return;
        
        // Group points by category for interaction
        const categoryPoints = {};
        
        this.data.forEach(categoryData => {
            const category = categoryData.category;
            const isActive = this.activeCategory === null || this.activeCategory === category;
            
            if (!isActive) return;
            
            if (!categoryPoints[category]) {
                categoryPoints[category] = [];
            }
            
            // Get all data points
            const allAxes = this.getAllAxes();
            const axisCount = allAxes.length;
            const angleSlice = (Math.PI * 2) / axisCount;
            const chartRadius = this.getChartRadius();
            
            categoryData.skills.forEach(skill => {
                const axisIndex = allAxes.findIndex(
                    axis => axis.category === category && axis.name === skill.name
                );
                
                if (axisIndex >= 0) {
                    const angle = angleSlice * axisIndex;
                    const valueRadius = (skill.value / this.maxValue) * chartRadius;
                    
                    categoryPoints[category].push({
                        x: this.centerX + valueRadius * Math.cos(angle - Math.PI / 2),
                        y: this.centerY + valueRadius * Math.sin(angle - Math.PI / 2),
                        value: skill.value,
                        name: skill.name,
                        description: skill.description,
                        category: category
                    });
                }
            });
        });
        
        // Draw points with hover effects for each category
        Object.keys(categoryPoints).forEach(category => {
            this._addPointHoverEffects(categoryPoints[category], category);
        });
    }
    
    /**
     * Draw enhanced axis labels with animation and interaction
     * @param {Array} axes - Array of axis objects
     * @param {number} radius - Chart radius
     * @private 
     */
    _drawEnhancedAxisLabels(axes, radius) {
        const ctx = this.ctx;
        const axisCount = axes.length;
        
        // Draw each axis label
        for (let i = 0; i < axisCount; i++) {
            const axis = axes[i];
            const angle = (Math.PI * 2 * i) / axisCount;
            
            // Get axis position
            const labelX = this.centerX + this.labelFactor * radius * Math.cos(angle - Math.PI / 2);
            const labelY = this.centerY + this.labelFactor * radius * Math.sin(angle - Math.PI / 2);
            
            // Get category and check if active
            const category = axis.category;
            const isActive = this.activeCategory === null || this.activeCategory === category;
            
            // Check if mouse is hovering near this label
            const distToMouse = this._lastMousePos ? 
                Math.sqrt(Math.pow(this._lastMousePos.x - labelX, 2) + Math.pow(this._lastMousePos.y - labelY, 2)) : 
                Infinity;
                
            const isHovering = distToMouse < 30;
            
            // Set text styles based on state
            if (isActive) {
                if (isHovering) {
                    // Hover state
                    ctx.fillStyle = this.colorScheme[category] || 'rgba(255, 255, 255, 1)';
                    ctx.font = 'bold 11px Roboto, sans-serif';
                    
                    // Add glow effect
                    ctx.shadowColor = this.colorScheme[category] || 'rgba(255, 255, 255, 0.8)';
                    ctx.shadowBlur = 8;
                } else {
                    // Active state
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.font = '10px Roboto, sans-serif';
                    ctx.shadowBlur = 0;
                }
            } else {
                // Inactive state
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.font = '9px Roboto, sans-serif';
                ctx.shadowBlur = 0;
            }
            
            // Wrap text if needed
            const textWidth = this.wrapWidth;
            const text = axis.name;
            const lines = this.wrapText(ctx, text, textWidth);
            
            // Position text based on angle
            const textAlign = (angle < Math.PI / 2 || angle > 3 * Math.PI / 2) ? 'start' : 
                              (angle === Math.PI / 2 || angle === 3 * Math.PI / 2) ? 'middle' : 'end';
                              
            ctx.textAlign = textAlign;
            ctx.textBaseline = 'middle';
            
            // Calculate line height
            const lineHeight = 12;
            
            // Draw each line
            lines.forEach((line, lineIndex) => {
                const lineY = labelY + lineIndex * lineHeight;
                ctx.fillText(line, labelX, lineY);
            });
            
            // Reset shadow effects
            ctx.shadowBlur = 0;
        }
    }
    
    /**
     * Draw decorative elements for the radar
     * @private
     */
    _drawRadarDecorations() {
        const ctx = this.ctx;
        const now = Date.now() / 1000;
        
        // Draw pulsing center point
        ctx.fillStyle = 'rgba(var(--theme-accent-primary-rgb), 0.8)';
        
        // Pulsing effect
        const pulseSize = 3 + Math.sin(now * 2) * 1;
        
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow to center point
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, pulseSize + 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(var(--theme-accent-primary-rgb), 0.3)';
        ctx.fill();
        
        // Draw decorative rays emanating from center (if no category is active)
        if (!this.activeCategory) {
            ctx.save();
            
            // Draw 12 rays with varying length and opacity
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 * i) / 12;
                const rayLength = 15 + 10 * Math.sin(now * 0.5 + i * 0.5);
                
                ctx.strokeStyle = `rgba(var(--theme-accent-primary-rgb), ${0.1 + 0.1 * Math.sin(now + i)})`;
                ctx.lineWidth = 0.5;
                
                ctx.beginPath();
                ctx.moveTo(this.centerX, this.centerY);
                ctx.lineTo(
                    this.centerX + rayLength * Math.cos(angle),
                    this.centerY + rayLength * Math.sin(angle)
                );
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    
    /**
     * Apply easing function to animation progress
     * @param {number} t - Input time/progress (0-1)
     * @param {string} easingType - Easing type identifier or cubic-bezier string
     * @returns {number} - Output time/progress with easing applied
     * @private
     */
    _easingFunction(t, easingType) {
        // Default to linear if no easingType provided
        if (!easingType) return t;
        
        // Handle cubic-bezier format
        if (easingType.includes('cubic-bezier')) {
            const values = easingType.match(/cubic-bezier\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
            if (values && values.length === 5) {
                return this._cubicBezier(
                    parseFloat(values[1]),
                    parseFloat(values[2]),
                    parseFloat(values[3]),
                    parseFloat(values[4]),
                    t
                );
            }
            return t; // Fallback to linear if parsing failed
        }
        
        // Handle named easing functions
        switch (easingType) {
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'easeOutQuad':
                return 1 - (1 - t) * (1 - t);
            case 'easeInQuad':
                return t * t;
            case 'easeInOutCubic':
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            case 'easeOutExpo':
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            case 'easeOutBack':
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            default:
                return t; // Linear easing as fallback
        }
    }
    
    /**
     * Cubic bezier easing implementation
     * @param {number} x1 - First control point x
     * @param {number} y1 - First control point y
     * @param {number} x2 - Second control point x
     * @param {number} y2 - Second control point y
     * @param {number} t - Input time/progress (0-1)
     * @returns {number} - Output time/progress with easing applied
     * @private
     */
    _cubicBezier(x1, y1, x2, y2, t) {
        // Helper function for cubic bezier curves
        // Approximation for simple cases
        const term1 = 3 * t * Math.pow(1 - t, 2) * y1;
        const term2 = 3 * Math.pow(t, 2) * (1 - t) * y2;
        const term3 = Math.pow(t, 3);
        
        return term1 + term2 + term3;
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the skills radar container exists
    const skillsRadarContainer = document.getElementById('skills-radar-container');
    if (skillsRadarContainer) {
        // We need to make sure that helper methods are available
        setTimeout(() => {
            const radarChart = new SkillsRadarChart('skills-radar-container');
            
            // Store reference for potential cleanup later
            window.radarChart = radarChart;
            
            // Log successful initialization
            if (window.SystemLog) {
                window.SystemLog.addEntry({
                    type: "component",
                    category: "visualization",
                    message: "Skills Radar Chart initialized"
                });
            }
        }, 100); // Small timeout to ensure helpers are loaded
    }
});
