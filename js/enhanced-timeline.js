/**
 * Enhanced Timeline Filter Component
 * Provides improved interactivity with smooth animations and better visual feedback
 */

class EnhancedTimelineFilter {
    constructor(containerId, options = {}) {
        // Set default options
        this.options = {
            minYear: 2018, 
            maxYear: 2025,
            initialRange: [2020, 2023],
            step: 1,
            onChange: null,
            onInit: null,
            ...options
        };
        
        this.container = document.getElementById(containerId);
        this.range = [...this.options.initialRange];
        this.dragging = null; // 'min', 'max', or null
        this.yearRange = this.options.maxYear - this.options.minYear;
        
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
        
        // Create the handles with enhanced accessibility
        this.minHandle = document.createElement('div');
        this.minHandle.className = 'timeline-handle timeline-handle-min';
        this.minHandle.setAttribute('aria-label', 'Minimum year');
        this.minHandle.setAttribute('role', 'slider');
        this.minHandle.setAttribute('tabindex', '0');
        this.minHandle.setAttribute('aria-valuemin', this.options.minYear);
        this.minHandle.setAttribute('aria-valuemax', this.options.maxYear);
        this.minHandle.setAttribute('aria-valuenow', this.range[0]);
        this.track.appendChild(this.minHandle);
        
        this.maxHandle = document.createElement('div');
        this.maxHandle.className = 'timeline-handle timeline-handle-max';
        this.maxHandle.setAttribute('aria-label', 'Maximum year');
        this.maxHandle.setAttribute('role', 'slider');
        this.maxHandle.setAttribute('tabindex', '0');
        this.maxHandle.setAttribute('aria-valuemin', this.options.minYear);
        this.maxHandle.setAttribute('aria-valuemax', this.options.maxYear);
        this.maxHandle.setAttribute('aria-valuenow', this.range[1]);
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
        this.updateTicksActive();
        
        // Call onInit callback if provided
        if (this.options.onInit) {
            this.options.onInit(this.range);
        }
        
        // Store original range for reset functionality
        this.originalRange = [...this.range];
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
            tick.dataset.year = year;
            
            // Check if tick is within active range
            if (year >= this.range[0] && year <= this.range[1]) {
                tick.classList.add('active');
            }
            
            const label = document.createElement('span');
            label.className = 'timeline-tick-label';
            label.textContent = year;
            
            tick.appendChild(label);
            ticksContainer.appendChild(tick);
            
            // Add click event for tick labels
            tick.addEventListener('click', (e) => {
                const clickedYear = parseInt(tick.dataset.year);
                this.handleTickClick(clickedYear);
            });
        }
        
        this.filterEl.appendChild(ticksContainer);
        this.ticksContainer = ticksContainer;
    }
    
    /**
     * Handle click on year tick
     */
    handleTickClick(clickedYear) {
        // Find closest handle
        const midPoint = (this.range[0] + this.range[1]) / 2;
        
        if (clickedYear < midPoint) {
            // Update min handle
            this.range[0] = clickedYear;
        } else {
            // Update max handle
            this.range[1] = clickedYear;
        }
        
        // Ensure min <= max
        if (this.range[0] > this.range[1] - this.options.step) {
            this.range[0] = this.range[1] - this.options.step;
        }
        
        // Update UI
        this.updateHandles();
        this.updateDisplay();
        this.updateTicksActive();
        
        // Call onChange callback
        if (this.options.onChange) {
            this.options.onChange(this.range);
        }
    }
    
    /**
     * Set up event listeners for handles
     */
    setupEventListeners() {
        // Mouse events for min handle
        this.minHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startDrag(e, 'min');
        });
        
        // Mouse events for max handle
        this.maxHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
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
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrag(touch, 'min');
        });
        
        // Touch events for max handle
        this.maxHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrag(touch, 'max');
        });
        
        // Touch events for document (for dragging)
        document.addEventListener('touchmove', (e) => {
            if (this.dragging) {
                e.preventDefault();
                const touch = e.touches[0];
                this.drag(touch);
            }
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
            // Only handle direct clicks on track (not handles)
            if (e.target === this.track) {
                this.handleTrackClick(e);
            }
        });
        
        // Reset button event
        const resetBtn = document.getElementById('reset-timeline');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimeline());
            resetBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.resetTimeline();
                }
            });
        }
    }
    
    /**
     * Reset timeline to original values
     */
    resetTimeline() {
        // Animate the reset
        this.range = [...this.originalRange];
        
        // Update UI with animation
        this.animateReset();
        
        // Call onChange callback
        if (this.options.onChange) {
            this.options.onChange(this.range);
        }
    }
    
    /**
     * Animate the reset of timeline handles
     */
    animateReset() {
        // Add transition class
        this.minHandle.style.transition = 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        this.maxHandle.style.transition = 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        this.selectedRange.style.transition = 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Update positions
        this.updateHandles();
        this.updateDisplay();
        this.updateTicksActive();
        
        // Clear transitions after animation
        setTimeout(() => {
            this.minHandle.style.transition = '';
            this.maxHandle.style.transition = '';
            this.selectedRange.style.transition = '';
        }, 400);
    }
    
    /**
     * Start dragging a handle
     */
    startDrag(e, handle) {
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
        
        // Get mouse/touch position
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        if (!clientX) return;
        
        // Calculate the position as percentage within track
        const trackRect = this.track.getBoundingClientRect();
        let percentage = (clientX - trackRect.left) / trackRect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        // Convert to year value with snapping
        const yearRange = this.options.maxYear - this.options.minYear;
        const yearValue = Math.round(percentage * yearRange) + this.options.minYear;
        
        // Update corresponding range value
        if (this.dragging === 'min') {
            this.range[0] = Math.min(yearValue, this.range[1] - this.options.step);
            this.minHandle.setAttribute('aria-valuenow', this.range[0]);
        } else {
            this.range[1] = Math.max(yearValue, this.range[0] + this.options.step);
            this.maxHandle.setAttribute('aria-valuenow', this.range[1]);
        }
        
        // Update UI
        this.updateHandles();
        this.updateDisplay();
        this.updateTicksActive();
        
        // Call onChange callback
        if (this.options.onChange) {
            this.options.onChange(this.range);
        }
    }
    
    /**
     * End dragging a handle
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
     * Handle keyboard navigation
     */
    handleKeyDown(e, handle) {
        let keyHandled = false;
        const step = this.options.step;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            // Decrease value
            if (handle === 'min') {
                this.range[0] = Math.max(this.options.minYear, this.range[0] - step);
            } else {
                this.range[1] = Math.max(this.range[0] + step, this.range[1] - step);
            }
            keyHandled = true;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            // Increase value
            if (handle === 'min') {
                this.range[0] = Math.min(this.range[1] - step, this.range[0] + step);
            } else {
                this.range[1] = Math.min(this.options.maxYear, this.range[1] + step);
            }
            keyHandled = true;
        } else if (e.key === 'Home') {
            // Jump to min
            if (handle === 'min') {
                this.range[0] = this.options.minYear;
            } else {
                this.range[1] = this.range[0] + step;
            }
            keyHandled = true;
        } else if (e.key === 'End') {
            // Jump to max
            if (handle === 'min') {
                this.range[0] = this.range[1] - step;
            } else {
                this.range[1] = this.options.maxYear;
            }
            keyHandled = true;
        }
        
        if (keyHandled) {
            e.preventDefault();
            
            // Update aria values
            if (handle === 'min') {
                this.minHandle.setAttribute('aria-valuenow', this.range[0]);
            } else {
                this.maxHandle.setAttribute('aria-valuenow', this.range[1]);
            }
            
            // Update UI
            this.updateHandles();
            this.updateDisplay();
            this.updateTicksActive();
            
            // Call onChange callback
            if (this.options.onChange) {
                this.options.onChange(this.range);
            }
        }
    }
    
    /**
     * Handle click on the track
     */
    handleTrackClick(e) {
        // Calculate the position as percentage within track
        const trackRect = this.track.getBoundingClientRect();
        let percentage = (e.clientX - trackRect.left) / trackRect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        // Convert to year value
        const yearRange = this.options.maxYear - this.options.minYear;
        const clickedYear = Math.round(percentage * yearRange) + this.options.minYear;
        
        // Find closest handle to update
        const distToMin = Math.abs(this.range[0] - clickedYear);
        const distToMax = Math.abs(this.range[1] - clickedYear);
        
        if (distToMin <= distToMax) {
            // Update min handle
            this.range[0] = Math.min(clickedYear, this.range[1] - this.options.step);
            this.minHandle.setAttribute('aria-valuenow', this.range[0]);
        } else {
            // Update max handle
            this.range[1] = Math.max(clickedYear, this.range[0] + this.options.step);
            this.maxHandle.setAttribute('aria-valuenow', this.range[1]);
        }
        
        // Update UI
        this.updateHandles();
        this.updateDisplay();
        this.updateTicksActive();
        
        // Call onChange callback
        if (this.options.onChange) {
            this.options.onChange(this.range);
        }
    }
    
    /**
     * Update the positions of the handles
     */
    updateHandles() {
        // Calculate positions as percentages
        const minPercentage = (this.range[0] - this.options.minYear) / (this.options.maxYear - this.options.minYear) * 100;
        const maxPercentage = (this.range[1] - this.options.minYear) / (this.options.maxYear - this.options.minYear) * 100;
        
        // Update handle positions
        this.minHandle.style.left = `${minPercentage}%`;
        this.maxHandle.style.left = `${maxPercentage}%`;
        
        // Update selected range
        this.selectedRange.style.left = `${minPercentage}%`;
        this.selectedRange.style.width = `${maxPercentage - minPercentage}%`;
    }
    
    /**
     * Update the selected range display
     */
    updateDisplay() {
        // Update min/max year display
        const minYearDisplay = document.querySelector('.timeline-min-year');
        const maxYearDisplay = document.querySelector('.timeline-max-year');
        
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
            const year = parseInt(tick.dataset.year);
            if (year >= this.range[0] && year <= this.range[1]) {
                tick.classList.add('active');
            } else {
                tick.classList.remove('active');
            }
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
    setRange(min, max) {
        // Validate range
        min = Math.max(this.options.minYear, Math.min(min, max - this.options.step));
        max = Math.min(this.options.maxYear, Math.max(max, min + this.options.step));
        
        this.range = [min, max];
        
        // Update UI
        this.updateHandles();
        this.updateDisplay();
        this.updateTicksActive();
        
        // Update ARIA values
        this.minHandle.setAttribute('aria-valuenow', min);
        this.maxHandle.setAttribute('aria-valuenow', max);
    }
}

/**
 * Ensure all project cards have year badges
 * This is a helper function to make sure all cards have badges
 */
function ensureProjectYearBadges() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const projectYear = card.getAttribute('data-year');
        if (projectYear && !card.querySelector('.project-year-badge')) {
            const badge = document.createElement('div');
            badge.className = 'project-year-badge';
            badge.textContent = projectYear;
            
            const imageContainer = card.querySelector('.project-image');
            if (imageContainer) {
                imageContainer.appendChild(badge);
            }
        }
    });
}

// Initialize timeline filter when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ensure all project cards have year badges
    ensureProjectYearBadges();
    
    // Check if timeline container exists
    const timelineContainer = document.getElementById('projects-timeline');
    if (!timelineContainer) return;
    
    // Create instance of enhanced timeline filter
    const timelineFilter = new EnhancedTimelineFilter('projects-timeline', {
        minYear: 2018,
        maxYear: 2025,
        initialRange: [2020, 2023],
        onChange: function(range) {
            // Filter projects based on year
            filterProjectsByYear(range[0], range[1]);
            
            // Update URL with filter parameters
            updateURLParams(range);
        },
        onInit: function(range) {
            // Check URL for filter parameters
            const params = new URLSearchParams(window.location.search);
            const minYear = params.get('minYear');
            const maxYear = params.get('maxYear');
            
            if (minYear && maxYear) {
                timelineFilter.setRange(parseInt(minYear), parseInt(maxYear));
                filterProjectsByYear(parseInt(minYear), parseInt(maxYear));
            } else {
                filterProjectsByYear(range[0], range[1]);
            }
            
            // Add project year badges if they don't exist
            addProjectYearBadges();
        }
    });
    
    // Add year badges to project cards
    function addProjectYearBadges() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const year = card.getAttribute('data-year');
            if (year && !card.querySelector('.project-year-badge')) {
                const badge = document.createElement('div');
                badge.className = 'project-year-badge';
                badge.textContent = year;
                card.querySelector('.project-image').appendChild(badge);
            }
        });
    }
    
    // Filter projects by year
    function filterProjectsByYear(minYear, maxYear) {
        const projectCards = document.querySelectorAll('.project-card');
        const projectsGrid = document.querySelector('.projects-grid');
        
        if (projectsGrid) {
            projectsGrid.classList.add('filtering');
        }
        
        setTimeout(() => {
            projectCards.forEach(card => {
                const projectYear = parseInt(card.getAttribute('data-year'));
                
                if (projectYear >= minYear && projectYear <= maxYear) {
                    card.classList.remove('filtered-out');
                    card.classList.add('filtered-in');
                    card.style.display = '';
                } else {
                    card.classList.remove('filtered-in');
                    card.classList.add('filtered-out');
                    setTimeout(() => {
                        if (card.classList.contains('filtered-out')) {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            });
            
            if (projectsGrid) {
                setTimeout(() => {
                    projectsGrid.classList.remove('filtering');
                }, 100);
            }
        }, 50);
    }
    
    // Update URL parameters
    function updateURLParams(range) {
        const url = new URL(window.location);
        url.searchParams.set('minYear', range[0]);
        url.searchParams.set('maxYear', range[1]);
        window.history.replaceState({}, '', url);
    }
});
