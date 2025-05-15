/**
 * Timeline Filter Component
 * A dual-handle slider for filtering content by time range
 */

class TimelineFilter {
    constructor(containerId, options = {}) {
        // Set default options
        this.options = {
            minYear: 2018, 
            maxYear: 2025,
            initialRange: [2018, 2025],
            step: 1,
            onChange: null,
            ...options
        };
        
        this.container = document.getElementById(containerId);
        this.range = [...this.options.initialRange];
        this.dragging = null; // 'min', 'max', or null
        
        // Initialize the component
        this.init();
    }
    
    /**
     * Initialize the timeline filter component
     */
    init() {
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
        
        // Create the handles
        this.minHandle = document.createElement('div');
        this.minHandle.className = 'timeline-handle timeline-handle-min';
        this.minHandle.setAttribute('aria-label', 'Minimum year');
        this.minHandle.setAttribute('role', 'slider');
        this.minHandle.setAttribute('tabindex', '0');
        this.track.appendChild(this.minHandle);
        
        this.maxHandle = document.createElement('div');
        this.maxHandle.className = 'timeline-handle timeline-handle-max';
        this.maxHandle.setAttribute('aria-label', 'Maximum year');
        this.maxHandle.setAttribute('role', 'slider');
        this.maxHandle.setAttribute('tabindex', '0');
        this.track.appendChild(this.maxHandle);
        
        // Create tick marks for years
        this.createTicks();
        
        // Create value display
        this.valueDisplay = document.createElement('div');
        this.valueDisplay.className = 'timeline-value-display';
        this.filterEl.appendChild(this.valueDisplay);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set initial positions
        this.updateHandles();
        this.updateDisplay();
    }
    
    /**
     * Create tick marks for each year
     */
    createTicks() {
        const ticksContainer = document.createElement('div');
        ticksContainer.className = 'timeline-ticks';
        
        for (let year = this.options.minYear; year <= this.options.maxYear; year++) {
            const tick = document.createElement('div');
            tick.className = 'timeline-tick';
            
            const label = document.createElement('span');
            label.className = 'timeline-tick-label';
            label.textContent = year;
            
            tick.appendChild(label);
            ticksContainer.appendChild(tick);
        }
        
        this.filterEl.appendChild(ticksContainer);
    }
    
    /**
     * Set up event listeners for handles
     */
    setupEventListeners() {
        // Mouse events for min handle
        this.minHandle.addEventListener('mousedown', (e) => {
            this.startDrag(e, 'min');
        });
        
        // Mouse events for max handle
        this.maxHandle.addEventListener('mousedown', (e) => {
            this.startDrag(e, 'max');
        });
        
        // Mouse events for document (for dragging)
        document.addEventListener('mousemove', (e) => {
            this.drag(e);
        });
        document.addEventListener('mouseup', () => {
            this.endDrag();
        });
        
        // Touch events for min handle
        this.minHandle.addEventListener('touchstart', (e) => {
            this.startDrag(e, 'min');
        });
        
        // Touch events for max handle
        this.maxHandle.addEventListener('touchstart', (e) => {
            this.startDrag(e, 'max');
        });
        
        // Touch events for document (for dragging)
        document.addEventListener('touchmove', (e) => {
            this.drag(e);
        });
        document.addEventListener('touchend', () => {
            this.endDrag();
        });
        
        // Keyboard events for handles
        this.minHandle.addEventListener('keydown', (e) => {
            this.handleKeyDown(e, 'min');
        });
        this.maxHandle.addEventListener('keydown', (e) => {
            this.handleKeyDown(e, 'max');
        });
        
        // Click event for track (for quick jumps)
        this.track.addEventListener('click', (e) => {
            this.handleTrackClick(e);
        });
    }
    
    /**
     * Start dragging a handle
     */
    startDrag(e, handle) {
        e.preventDefault();
        this.dragging = handle;
        
        // Add class to indicate dragging
        if (handle === 'min') {
            this.minHandle.classList.add('dragging');
        } else {
            this.maxHandle.classList.add('dragging');
        }
    }
    
    /**
     * Handle dragging of handles
     */
    drag(e) {
        if (!this.dragging) return;
        e.preventDefault();
        
        // Get mouse/touch position
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        if (!clientX) return;
        
        // Calculate the position as percentage within track
        const trackRect = this.track.getBoundingClientRect();
        let percentage = (clientX - trackRect.left) / trackRect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        // Convert to year value
        const yearRange = this.options.maxYear - this.options.minYear;
        const yearValue = Math.round(percentage * yearRange) + this.options.minYear;
        
        // Update corresponding range value
        if (this.dragging === 'min') {
            this.range[0] = Math.min(yearValue, this.range[1] - this.options.step);
        } else {
            this.range[1] = Math.max(yearValue, this.range[0] + this.options.step);
        }
        
        // Update UI
        this.updateHandles();
        this.updateDisplay();
        
        // Call onChange callback
        if (this.options.onChange) {
            this.options.onChange(this.range);
        }
    }
    
    /**
     * Calculate handle position as percentage
     */
    getHandlePosition(handle) {
        const yearRange = this.options.maxYear - this.options.minYear;
        if (handle === 'min') {
            return ((this.range[0] - this.options.minYear) / yearRange) * 100;
        } else {
            return ((this.range[1] - this.options.minYear) / yearRange) * 100;
        }
    }
    
    /**
     * End dragging
     */
    endDrag() {
        if (!this.dragging) return;
        
        // Remove dragging class
        if (this.dragging === 'min') {
            this.minHandle.classList.remove('dragging');
        } else {
            this.maxHandle.classList.remove('dragging');
        }
        
        this.dragging = null;
    }
    
    /**
     * Handle keyboard navigation for accessibility
     */
    handleKeyDown(e, handle) {
        const step = this.options.step;
        let value = handle === 'min' ? this.range[0] : this.range[1];
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
                e.preventDefault();
                value = Math.max(
                    handle === 'min' ? this.options.minYear : this.range[0] + step, 
                    value - step
                );
                break;
                
            case 'ArrowRight':
            case 'ArrowUp':
                e.preventDefault();
                value = Math.min(
                    handle === 'min' ? this.range[1] - step : this.options.maxYear, 
                    value + step
                );
                break;
                
            case 'Home':
                e.preventDefault();
                value = handle === 'min' ? this.options.minYear : this.range[0] + step;
                break;
                
            case 'End':
                e.preventDefault();
                value = handle === 'min' ? this.range[1] - step : this.options.maxYear;
                break;
                
            default:
                return; // Exit for other keys
        }
        
        // Update range value
        if (handle === 'min') {
            this.range[0] = value;
        } else {
            this.range[1] = value;
        }
        
        // Update UI
        this.updateHandles();
        this.updateDisplay();
        
        // Call onChange callback
        if (this.options.onChange) {
            this.options.onChange(this.range);
            console.log(`Timeline updated via keyboard: ${this.range[0]} - ${this.range[1]}`);
        }
    }
    
    /**
     * Handle click on the track for quick jumps
     */
    handleTrackClick(e) {
        // Don't handle clicks if we're dragging or if click was on a handle
        if (this.dragging || 
            e.target === this.minHandle || 
            e.target === this.maxHandle) {
            return;
        }
        
        // Calculate the position as percentage within track
        const trackRect = this.track.getBoundingClientRect();
        let percentage = (e.clientX - trackRect.left) / trackRect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        // Convert to year value
        const yearRange = this.options.maxYear - this.options.minYear;
        const yearValue = Math.round(percentage * yearRange) + this.options.minYear;
        
        // Determine which handle to move (the closest one)
        const distToMin = Math.abs(yearValue - this.range[0]);
        const distToMax = Math.abs(yearValue - this.range[1]);
        
        if (distToMin <= distToMax) {
            this.range[0] = Math.min(yearValue, this.range[1] - this.options.step);
        } else {
            this.range[1] = Math.max(yearValue, this.range[0] + this.options.step);
        }
        
        // Update UI
        this.updateHandles();
        this.updateDisplay();
        
        // Call onChange callback
        if (this.options.onChange) {
            this.options.onChange(this.range);
        }
    }
    
    /**
     * Update handle positions based on current range
     */
    updateHandles() {
        const yearRange = this.options.maxYear - this.options.minYear;
        const minPercentage = (this.range[0] - this.options.minYear) / yearRange * 100;
        const maxPercentage = (this.range[1] - this.options.minYear) / yearRange * 100;
        
        // Update handle positions
        this.minHandle.style.left = `${minPercentage}%`;
        this.maxHandle.style.left = `${maxPercentage}%`;
        
        // Update selected range track
        this.selectedRange.style.left = `${minPercentage}%`;
        this.selectedRange.style.width = `${maxPercentage - minPercentage}%`;
        
        // Update ARIA attributes
        this.minHandle.setAttribute('aria-valuemin', this.options.minYear);
        this.minHandle.setAttribute('aria-valuemax', this.options.maxYear);
        this.minHandle.setAttribute('aria-valuenow', this.range[0]);
        
        this.maxHandle.setAttribute('aria-valuemin', this.options.minYear);
        this.maxHandle.setAttribute('aria-valuemax', this.options.maxYear);
        this.maxHandle.setAttribute('aria-valuenow', this.range[1]);
        
        // Update tick label active states
        this.updateTickLabels();
    }
    
    /**
     * Update tick labels to highlight those in the selected range
     */
    updateTickLabels() {
        const ticks = this.filterEl.querySelectorAll('.timeline-tick');
        ticks.forEach((tick, index) => {
            const year = this.options.minYear + index;
            if (year >= this.range[0] && year <= this.range[1]) {
                tick.classList.add('active');
            } else {
                tick.classList.remove('active');
            }
        });
    }
    
    /**
     * Update the value display
     */
    updateDisplay() {
        this.valueDisplay.textContent = `Timeline: ${this.range[0]} - ${this.range[1]}`;
    }
    
    /**
     * Get the current range
     * @returns {Array} The current [min, max] range
     */
    getRange() {
        return [...this.range];
    }
    
    /**
     * Set the range programmatically
     * @param {Array} range - The [min, max] range to set
     */
    setRange(range) {
        if (!Array.isArray(range) || range.length !== 2) {
            console.error('Invalid range format. Expected [min, max]');
            return;
        }
        
        let [min, max] = range;
        
        // Validate and constrain values
        min = Math.max(this.options.minYear, Math.min(max - this.options.step, min));
        max = Math.min(this.options.maxYear, Math.max(min + this.options.step, max));
        
        this.range = [min, max];
        
        // Update UI
        this.updateHandles();
        this.updateDisplay();
        
        // Trigger onChange callback
        if (typeof this.options.onChange === 'function') {
            this.options.onChange(this.range);
        }
    }
    
    /**
     * Reset the timeline to initial range
     */
    reset() {
        this.range = [...this.options.initialRange];
        this.updateHandles();
        this.updateDisplay();
        
        // Trigger onChange callback
        if (typeof this.options.onChange === 'function') {
            this.options.onChange(this.range);
        }
    }
}
