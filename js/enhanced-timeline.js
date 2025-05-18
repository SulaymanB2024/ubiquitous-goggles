/**
 * Enhanced Timeline Filter Component
 * A high-performance, accessible timeline filter with smooth animations
 * and comprehensive interaction support across devices
 * @version 2.0.0
 */

class EnhancedTimelineFilter {
    constructor(containerId, options = {}) {
        // Set default options with destructuring
        this.options = {
            minYear: 2018, 
            maxYear: 2025,
            initialRange: [2020, 2023],
            step: 1,
            animationDuration: 400,
            throttleDelay: 16, // ~60fps
            onChange: null,
            onInit: null,
            ...options
        };
        
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Timeline filter container #${containerId} not found`);
            return;
        }
        
        this.range = [...this.options.initialRange];
        this.dragging = null;
        this.yearRange = this.options.maxYear - this.options.minYear;
        this.boundEvents = {};
        this.lastAnimationFrame = null;
        
        // Initialize the component
        this.init();
    }
    
    /**
     * Initialize the timeline filter component
     */
    init() {
        this.createDOMElements();
        this.setupEventListeners();
        
        // Set initial positions
        this.updateHandles();
        this.updateDisplay();
        this.updateTicksActive();
        
        // Store original range for reset functionality
        this.originalRange = [...this.range];
        
        // Call onInit callback if provided
        if (typeof this.options.onInit === 'function') {
            this.options.onInit(this.range);
        }
    }
    
    /**
     * Create all required DOM elements
     */
    createDOMElements() {
        // Create the timeline filter container
        this.filterEl = document.createElement('div');
        this.filterEl.className = 'timeline-filter';
        this.container.appendChild(this.filterEl);
        
        // Create the track
        this.track = document.createElement('div');
        this.track.className = 'timeline-track';
        this.filterEl.appendChild(this.track);
        
        // Create the selected range
        this.selectedRange = document.createElement('div');
        this.selectedRange.className = 'timeline-selected-range';
        this.track.appendChild(this.selectedRange);
        
        // Create handles
        this.createAccessibleHandles();
        
        // Create tick marks for years
        this.createTicks();
        
        // Create value display
        this.valueDisplay = document.createElement('div');
        this.valueDisplay.className = 'timeline-value-display';
        this.valueDisplay.setAttribute('aria-live', 'polite');
        this.valueDisplay.innerHTML = `
            <span class="timeline-min-year">${this.range[0]}</span> - 
            <span class="timeline-max-year">${this.range[1]}</span>
        `;
        this.filterEl.appendChild(this.valueDisplay);
    }
    
    /**
     * Create accessible slider handles
     */
    createAccessibleHandles() {
        // Create min handle with enhanced accessibility
        this.minHandle = document.createElement('div');
        this.minHandle.className = 'timeline-handle timeline-handle-min';
        this.minHandle.setAttribute('aria-label', 'Minimum year');
        this.minHandle.setAttribute('role', 'slider');
        this.minHandle.setAttribute('tabindex', '0');
        this.minHandle.setAttribute('aria-valuemin', this.options.minYear);
        this.minHandle.setAttribute('aria-valuemax', this.options.maxYear);
        this.minHandle.setAttribute('aria-valuenow', this.range[0]);
        this.minHandle.setAttribute('aria-valuetext', `${this.range[0]}`);
        this.track.appendChild(this.minHandle);
        
        // Create max handle with enhanced accessibility
        this.maxHandle = document.createElement('div');
        this.maxHandle.className = 'timeline-handle timeline-handle-max';
        this.maxHandle.setAttribute('aria-label', 'Maximum year');
        this.maxHandle.setAttribute('role', 'slider');
        this.maxHandle.setAttribute('tabindex', '0');
        this.maxHandle.setAttribute('aria-valuemin', this.options.minYear);
        this.maxHandle.setAttribute('aria-valuemax', this.options.maxYear);
        this.maxHandle.setAttribute('aria-valuenow', this.range[1]);
        this.maxHandle.setAttribute('aria-valuetext', `${this.range[1]}`);
        this.track.appendChild(this.maxHandle);
    }
    
    /**
     * Create tick marks for each year
     */
    createTicks() {
        const ticksContainer = document.createElement('div');
        ticksContainer.className = 'timeline-ticks';
        
        const fragment = document.createDocumentFragment();
        for (let year = this.options.minYear; year <= this.options.maxYear; year++) {
            const tick = document.createElement('div');
            tick.className = 'timeline-tick';
            tick.dataset.year = year;
            
            // Check if tick is within active range
            if (year >= this.range[0] && year <= this.range[1]) {
                tick.classList.add('active');
            }
            
            const label = document.createElement('span');
            label.className = 'timeline-tick-label';
            label.textContent = year;
            
            tick.appendChild(label);
            fragment.appendChild(tick);
        }
        
        ticksContainer.appendChild(fragment);
        this.filterEl.appendChild(ticksContainer);
        this.ticksContainer = ticksContainer;
        
        // Add delegated event listener for ticks
        this.ticksContainer.addEventListener('click', (event) => {
            const tick = event.target.closest('.timeline-tick');
            if (tick) {
                const clickedYear = parseInt(tick.dataset.year, 10);
                this.handleTickClick(clickedYear);
            }
        });
    }
    
    /**
     * Set up event listeners with proper binding and cleanup support
     */
    setupEventListeners() {
        // Store bound methods for later removal
        this.boundEvents = {
            minHandleMouseDown: this.startDrag.bind(this, 'min'),
            maxHandleMouseDown: this.startDrag.bind(this, 'max'),
            documentMouseMove: this.throttle(this.drag.bind(this), this.options.throttleDelay),
            documentMouseUp: this.endDrag.bind(this),
            minHandleKeyDown: (e) => this.handleKeyDown(e, 'min'),
            maxHandleKeyDown: (e) => this.handleKeyDown(e, 'max'),
            trackClick: this.handleTrackClick.bind(this)
        };
        
        // Mouse events
        this.minHandle.addEventListener('mousedown', this.boundEvents.minHandleMouseDown);
        this.maxHandle.addEventListener('mousedown', this.boundEvents.maxHandleMouseDown);
        document.addEventListener('mousemove', this.boundEvents.documentMouseMove);
        document.addEventListener('mouseup', this.boundEvents.documentMouseUp);
        
        // Touch events with passive: false for better performance on supported browsers
        this.addTouchEvents();
        
        // Keyboard events
        this.minHandle.addEventListener('keydown', this.boundEvents.minHandleKeyDown);
        this.maxHandle.addEventListener('keydown', this.boundEvents.maxHandleKeyDown);
        
        // Track click
        this.track.addEventListener('click', this.boundEvents.trackClick);
        
        // Reset button event
        const resetBtn = document.getElementById('reset-timeline');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimeline());
        }
        
        // Handle window resize (debounced)
        this.resizeObserver = new ResizeObserver(this.debounce(() => {
            this.updateHandles();
        }, 250));
        this.resizeObserver.observe(this.container);
    }
    
    /**
     * Add touch event listeners with proper options
     */
    addTouchEvents() {
        const touchOpts = { passive: false };
        
        this.minHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrag('min', touch);
        }, touchOpts);
        
        this.maxHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrag('max', touch);
        }, touchOpts);
        
        document.addEventListener('touchmove', (e) => {
            if (this.dragging) {
                e.preventDefault();
                const touch = e.touches[0];
                this.drag(touch);
            }
        }, touchOpts);
        
        document.addEventListener('touchend', this.boundEvents.documentMouseUp);
    }
    
    /**
     * Start dragging a handle
     */
    startDrag(handle, event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        
        this.dragging = handle;
        
        // Add class to indicate dragging
        const handleEl = handle === 'min' ? this.minHandle : this.maxHandle;
        handleEl.classList.add('dragging');
        document.body.classList.add('timeline-dragging');
        
        // Focus the handle for accessibility
        handleEl.focus();
    }
    
    /**
     * Handle dragging of handles with requestAnimationFrame
     */
    drag(event) {
        if (!this.dragging) return;
        
        // Get mouse/touch position
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        if (!clientX) return;
        
        // Use requestAnimationFrame for smooth visual updates
        if (this.lastAnimationFrame) {
            cancelAnimationFrame(this.lastAnimationFrame);
        }
        
        this.lastAnimationFrame = requestAnimationFrame(() => {
            // Calculate position as percentage within track
            const trackRect = this.track.getBoundingClientRect();
            let percentage = (clientX - trackRect.left) / trackRect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            
            // Convert to year value with snapping
            const yearValue = Math.round(percentage * this.yearRange) + this.options.minYear;
            
            // Update corresponding range value
            if (this.dragging === 'min') {
                this.range[0] = Math.min(yearValue, this.range[1] - this.options.step);
                this.updateARIA(this.minHandle, this.range[0]);
            } else {
                this.range[1] = Math.max(yearValue, this.range[0] + this.options.step);
                this.updateARIA(this.maxHandle, this.range[1]);
            }
            
            // Update UI
            this.updateHandles();
            this.updateDisplay();
            this.updateTicksActive();
            
            // Call onChange callback
            this.triggerOnChange();
        });
    }
    
    /**
     * End dragging a handle
     */
    endDrag() {
        if (!this.dragging) return;
        
        // Remove dragging classes
        const handleEl = this.dragging === 'min' ? this.minHandle : this.maxHandle;
        handleEl.classList.remove('dragging');
        document.body.classList.remove('timeline-dragging');
        
        this.dragging = null;
    }
    
    /**
     * Update ARIA attributes for a handle
     */
    updateARIA(handle, value) {
        handle.setAttribute('aria-valuenow', value);
        handle.setAttribute('aria-valuetext', `${value}`);
    }
    
    /**
     * Handle keyboard navigation with improved accessibility
     */
    handleKeyDown(e, handle) {
        const step = this.options.step;
        const handleEl = handle === 'min' ? this.minHandle : this.maxHandle;
        
        // Common keys mapping
        const keyActions = {
            'ArrowLeft': () => this.adjustHandle(handle, -step),
            'ArrowRight': () => this.adjustHandle(handle, step),
            'ArrowDown': () => this.adjustHandle(handle, -step),
            'ArrowUp': () => this.adjustHandle(handle, step),
            'Home': () => handle === 'min' 
                ? this.setHandleValue(handle, this.options.minYear)
                : this.setHandleValue(handle, this.range[0] + step),
            'End': () => handle === 'min'
                ? this.setHandleValue(handle, this.range[1] - step)
                : this.setHandleValue(handle, this.options.maxYear),
            'PageDown': () => this.adjustHandle(handle, -step * 5),
            'PageUp': () => this.adjustHandle(handle, step * 5)
        };
        
        if (keyActions[e.key]) {
            e.preventDefault();
            keyActions[e.key]();
            
            // Update UI
            this.updateHandles();
            this.updateDisplay();
            this.updateTicksActive();
            this.triggerOnChange();
        }
    }
    
    /**
     * Adjust handle value by an amount
     */
    adjustHandle(handle, amount) {
        if (handle === 'min') {
            const newValue = Math.max(
                this.options.minYear,
                Math.min(this.range[1] - this.options.step, this.range[0] + amount)
            );
            this.range[0] = newValue;
            this.updateARIA(this.minHandle, newValue);
        } else {
            const newValue = Math.min(
                this.options.maxYear,
                Math.max(this.range[0] + this.options.step, this.range[1] + amount)
            );
            this.range[1] = newValue;
            this.updateARIA(this.maxHandle, newValue);
        }
    }
    
    /**
     * Set handle to specific value
     */
    setHandleValue(handle, value) {
        if (handle === 'min') {
            this.range[0] = Math.max(
                this.options.minYear,
                Math.min(this.range[1] - this.options.step, value)
            );
            this.updateARIA(this.minHandle, this.range[0]);
        } else {
            this.range[1] = Math.min(
                this.options.maxYear,
                Math.max(this.range[0] + this.options.step, value)
            );
            this.updateARIA(this.maxHandle, this.range[1]);
        }
    }
    
    /**
     * Trigger onChange callback with debouncing
     */
    triggerOnChange() {
        if (typeof this.options.onChange === 'function') {
            this.options.onChange([...this.range]);
        }
    }
    
    /**
     * Handle click on year tick
     */
    handleTickClick(clickedYear) {
        // Find closest handle
        const midPoint = (this.range[0] + this.range[1]) / 2;
        
        if (clickedYear < midPoint) {
            this.setHandleValue('min', clickedYear);
        } else {
            this.setHandleValue('max', clickedYear);
        }
        
        // Update UI with animation
        this.updateHandles(true);
        this.updateDisplay();
        this.updateTicksActive();
        this.triggerOnChange();
    }
    
    /**
     * Handle click on the track
     */
    handleTrackClick(e) {
        // Only handle direct clicks on track (not handles or other elements)
        if (e.target !== this.track) return;
        
        // Calculate position as percentage within track
        const trackRect = this.track.getBoundingClientRect();
        let percentage = (e.clientX - trackRect.left) / trackRect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        // Convert to year value
        const clickedYear = Math.round(percentage * this.yearRange) + this.options.minYear;
        
        // Find closest handle to update
        const distToMin = Math.abs(this.range[0] - clickedYear);
        const distToMax = Math.abs(this.range[1] - clickedYear);
        
        if (distToMin <= distToMax) {
            this.setHandleValue('min', clickedYear);
            this.minHandle.focus();
        } else {
            this.setHandleValue('max', clickedYear);
            this.maxHandle.focus();
        }
        
        // Update UI with animation
        this.updateHandles(true);
        this.updateDisplay();
        this.updateTicksActive();
        this.triggerOnChange();
    }
    
    /**
     * Reset timeline to original values with animation
     */
    resetTimeline() {
        // Animate the reset
        this.range = [...this.originalRange];
        
        // Update ARIA values
        this.updateARIA(this.minHandle, this.range[0]);
        this.updateARIA(this.maxHandle, this.range[1]);
        
        // Update UI with animation
        this.updateHandles(true);
        this.updateDisplay();
        this.updateTicksActive();
        this.triggerOnChange();
    }
    
    /**
     * Update the positions of the handles
     * @param {boolean} animate - Whether to animate the transition
     */
    updateHandles(animate = false) {
        // Calculate positions as percentages
        const minPercentage = (this.range[0] - this.options.minYear) / this.yearRange * 100;
        const maxPercentage = (this.range[1] - this.options.minYear) / this.yearRange * 100;
        
        if (animate) {
            this.addTransition();
        }
        
        // Update handle positions
        this.minHandle.style.left = `${minPercentage}%`;
        this.maxHandle.style.left = `${maxPercentage}%`;
        
        // Update selected range
        this.selectedRange.style.left = `${minPercentage}%`;
        this.selectedRange.style.width = `${maxPercentage - minPercentage}%`;
        
        if (animate) {
            this.removeTransitionAfterAnimation();
        }
    }
    
    /**
     * Add transition effect to elements
     */
    addTransition() {
        const transition = `all ${this.options.animationDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        this.minHandle.style.transition = transition;
        this.maxHandle.style.transition = transition;
        this.selectedRange.style.transition = transition;
    }
    
    /**
     * Remove transition after animation completes
     */
    removeTransitionAfterAnimation() {
        setTimeout(() => {
            this.minHandle.style.transition = '';
            this.maxHandle.style.transition = '';
            this.selectedRange.style.transition = '';
        }, this.options.animationDuration);
    }
    
    /**
     * Update the selected range display
     */
    updateDisplay() {
        const minYearDisplay = this.valueDisplay.querySelector('.timeline-min-year');
        const maxYearDisplay = this.valueDisplay.querySelector('.timeline-max-year');
        
        if (minYearDisplay) minYearDisplay.textContent = this.range[0];
        if (maxYearDisplay) maxYearDisplay.textContent = this.range[1];
    }
    
    /**
     * Update the active state of tick marks
     */
    updateTicksActive() {
        if (!this.ticksContainer) return;
        
        const ticks = this.ticksContainer.querySelectorAll('.timeline-tick');
        ticks.forEach(tick => {
            const year = parseInt(tick.dataset.year, 10);
            tick.classList.toggle('active', year >= this.range[0] && year <= this.range[1]);
        });
    }
    
    /**
     * Get the current range
     */
    getRange() {
        return [...this.range];
    }
    
    /**
     * Set the range programmatically
     */
    setRange(min, max, animate = false) {
        // Validate range
        min = Math.max(this.options.minYear, Math.min(min, max - this.options.step));
        max = Math.min(this.options.maxYear, Math.max(max, min + this.options.step));
        
        this.range = [min, max];
        
        // Update ARIA values
        this.updateARIA(this.minHandle, min);
        this.updateARIA(this.maxHandle, max);
        
        // Update UI
        this.updateHandles(animate);
        this.updateDisplay();
        this.updateTicksActive();
    }
    
    /**
     * Utility method for throttling function calls
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }
    
    /**
     * Utility method for debouncing function calls
     */
    debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * Clean up event listeners and observers to prevent memory leaks
     */
    destroy() {
        // Remove event listeners
        this.minHandle.removeEventListener('mousedown', this.boundEvents.minHandleMouseDown);
        this.maxHandle.removeEventListener('mousedown', this.boundEvents.maxHandleMouseDown);
        document.removeEventListener('mousemove', this.boundEvents.documentMouseMove);
        document.removeEventListener('mouseup', this.boundEvents.documentMouseUp);
        
        this.minHandle.removeEventListener('keydown', this.boundEvents.minHandleKeyDown);
        this.maxHandle.removeEventListener('keydown', this.boundEvents.maxHandleKeyDown);
        
        this.track.removeEventListener('click', this.boundEvents.trackClick);
        
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Cancel any pending animation frames
        if (this.lastAnimationFrame) {
            cancelAnimationFrame(this.lastAnimationFrame);
        }
    }
}

/**
 * ProjectsFilter - Handles filtering and animation of project cards
 */
class ProjectsFilter {
    constructor(gridSelector, options = {}) {
        this.grid = document.querySelector(gridSelector);
        if (!this.grid) return;
        
        this.options = {
            animationDuration: 300,
            staggerDelay: 50,
            ...options
        };
        
        this.projects = this.grid.querySelectorAll('.project-card');
        this.addYearBadges();
    }
    
    /**
     * Add year badges to all project cards
     */
    addYearBadges() {
        this.projects.forEach(card => {
            const year = card.getAttribute('data-year');
            if (year && !card.querySelector('.project-year-badge')) {
                const badge = document.createElement('div');
                badge.className = 'project-year-badge';
                badge.textContent = year;
                
                const imageContainer = card.querySelector('.project-image');
                if (imageContainer) {
                    imageContainer.appendChild(badge);
                }
            }
        });
    }
    
    /**
     * Filter projects by year range with staggered animations
     */
    filterByYearRange(minYear, maxYear) {
        if (!this.grid) return;
        
        this.grid.classList.add('filtering');
        let visibleCount = 0;
        
        // First pass: mark cards as visible/hidden
        this.projects.forEach(card => {
            const projectYear = parseInt(card.getAttribute('data-year'), 10);
            const visible = projectYear >= minYear && projectYear <= maxYear;
            
            card.classList.toggle('filtered-in', visible);
            card.classList.toggle('filtered-out', !visible);
            
            if (visible) visibleCount++;
        });
        
        // Second pass: apply staggered animations and handle display
        let delay = 0;
        this.projects.forEach(card => {
            if (card.classList.contains('filtered-in')) {
                setTimeout(() => {
                    card.style.display = '';
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                }, delay);
                delay += this.options.staggerDelay;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (card.classList.contains('filtered-out')) {
                        card.style.display = 'none';
                    }
                }, this.options.animationDuration);
            }
        });
        
        // Show empty state if no projects match
        this.toggleEmptyState(visibleCount === 0);
        
        // Remove filtering class when complete
        setTimeout(() => {
            this.grid.classList.remove('filtering');
        }, delay + this.options.animationDuration);
    }
    
    /**
     * Toggle empty state message
     */
    toggleEmptyState(isEmpty) {
        let emptyState = this.grid.querySelector('.empty-state');
        
        if (isEmpty && !emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>No projects found in the selected time range.</p>
                <p>Try adjusting your filter criteria.</p>
            `;
            this.grid.appendChild(emptyState);
        } else if (!isEmpty && emptyState) {
            emptyState.remove();
        }
    }
}

// Initialize both components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if timeline container exists
    const timelineContainer = document.getElementById('projects-timeline');
    if (!timelineContainer) return;
    
    // Create projects filter instance
    const projectsFilter = new ProjectsFilter('.projects-grid');
    
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlMinYear = parseInt(params.get('minYear'), 10);
    const urlMaxYear = parseInt(params.get('maxYear'), 10);
    
    // Create instance of enhanced timeline filter
    const timelineFilter = new EnhancedTimelineFilter('projects-timeline', {
        minYear: 2018,
        maxYear: 2025,
        initialRange: urlMinYear && urlMaxYear && !isNaN(urlMinYear) && !isNaN(urlMaxYear) 
            ? [urlMinYear, urlMaxYear] 
            : [2020, 2023],
        onChange: function(range) {
            // Filter projects based on year
            projectsFilter.filterByYearRange(range[0], range[1]);
            
            // Update URL with filter parameters
            const url = new URL(window.location);
            url.searchParams.set('minYear', range[0]);
            url.searchParams.set('maxYear', range[1]);
            window.history.replaceState({}, '', url);
        },
        onInit: function(range) {
            // Initial filtering
            projectsFilter.filterByYearRange(range[0], range[1]);
        }
    });
    
    // Clean up on page unload to prevent memory leaks
    window.addEventListener('beforeunload', () => {
        timelineFilter.destroy();
    });
});
