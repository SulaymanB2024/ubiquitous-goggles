/**
 * System Log Panel
 * Real-time log entries streaming in the bottom right corner
 */

class SystemLog {
    constructor(options = {}) {
        this.options = {
            maxEntries: 50,
            initialState: 'collapsed', // 'collapsed', 'expanded', 'hidden'
            filters: ['info', 'warn', 'error', 'success', 'cmd', 'system', 'network'],
            rememberState: true,
            ...options
        };
        
        this.entries = [];
        this.activeFilters = [...this.options.filters];
        this.state = this.options.initialState;
        
        if (this.options.rememberState) {
            const savedState = localStorage.getItem('sb-system-log-state');
            if (savedState) {
                this.state = savedState;
            }
        }
        
        this.init();
    }
    
    /**
     * Initialize the system log
     */
    init() {
        this.createLogPanel();
        this.setupEventListeners();
        this.loadSystemEvents();
    }
    
    /**
     * Create the log panel
     */
    createLogPanel() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'system-log-container ' + this.state;
        
        // Create header
        this.header = document.createElement('div');
        this.header.className = 'system-log-header';
        
        const title = document.createElement('div');
        title.className = 'system-log-title';
        title.innerHTML = `
            <span class="system-log-status"></span>
            <i class="fas fa-terminal"></i>
            System Log
        `;
        
        const controls = document.createElement('div');
        controls.className = 'system-log-controls';
        
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'system-log-control';
        this.toggleButton.innerHTML = this.state === 'expanded' ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
        this.toggleButton.setAttribute('aria-label', 'Toggle system log');
        
        const clearButton = document.createElement('button');
        clearButton.className = 'system-log-control';
        clearButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        clearButton.setAttribute('aria-label', 'Clear log');
        
        controls.appendChild(this.toggleButton);
        controls.appendChild(clearButton);
        
        this.header.appendChild(title);
        this.header.appendChild(controls);
        
        // Create filters
        this.filtersElement = document.createElement('div');
        this.filtersElement.className = 'system-log-filters';
        
        const allFilter = document.createElement('div');
        allFilter.className = 'system-log-filter active';
        allFilter.textContent = 'ALL';
        allFilter.dataset.filter = 'all';
        this.filtersElement.appendChild(allFilter);
        
        this.options.filters.forEach(filter => {
            const filterElement = document.createElement('div');
            filterElement.className = 'system-log-filter active';
            filterElement.textContent = filter.toUpperCase();
            filterElement.dataset.filter = filter;
            this.filtersElement.appendChild(filterElement);
        });
        
        // Create content
        this.content = document.createElement('div');
        this.content.className = 'system-log-content';
        
        // Assemble the log panel
        this.container.appendChild(this.header);
        this.container.appendChild(this.filtersElement);
        this.container.appendChild(this.content);
        
        // Add to document
        document.body.appendChild(this.container);
        
        // Set up event listeners for controls
        this.toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleState();
        });
        
        clearButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearEntries();
        });
        
        this.header.addEventListener('click', () => {
            this.toggleState();
        });
        
        // Set up event listeners for filters
        const filterElements = this.filtersElement.querySelectorAll('.system-log-filter');
        filterElements.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterType = filter.dataset.filter;
                
                if (filterType === 'all') {
                    if (this.activeFilters.length === this.options.filters.length) {
                        // Deactivate all
                        this.activeFilters = [];
                        filterElements.forEach(f => f.classList.remove('active'));
                    } else {
                        // Activate all
                        this.activeFilters = [...this.options.filters];
                        filterElements.forEach(f => f.classList.add('active'));
                    }
                } else {
                    if (this.activeFilters.includes(filterType)) {
                        // Remove from active filters
                        this.activeFilters = this.activeFilters.filter(f => f !== filterType);
                        filter.classList.remove('active');
                    } else {
                        // Add to active filters
                        this.activeFilters.push(filterType);
                        filter.classList.add('active');
                    }
                    
                    // Update ALL filter state
                    const allFilterEl = this.filtersElement.querySelector('[data-filter="all"]');
                    if (this.activeFilters.length === this.options.filters.length) {
                        allFilterEl.classList.add('active');
                    } else {
                        allFilterEl.classList.remove('active');
                    }
                }
                
                // Update displayed entries
                this.renderEntries();
            });
        });
    }
    
    /**
     * Set up event listeners for system events
     */
    setupEventListeners() {
        // Listen for page navigation
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                const target = link.getAttribute('href').slice(1);
                if (target) {
                    this.addEntry('info', `Navigated to ${target} section`);
                }
            });
        });
        
        // Listen for form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addEntry('system', `Form submitted: ${form.id || 'contact form'}`);
                
                // Additional form handling would go here
            });
        });
        
        // Listen for theme changes
        document.addEventListener('themechange', (e) => {
            this.addEntry('system', `Theme changed to ${e.detail.theme} mode`);
        });
    }
    
    /**
     * Load initial system events
     */
    loadSystemEvents() {
        const currentTime = new Date();
        const bootTime = new Date(currentTime - 2000); // 2 seconds ago
        
        this.entries = [
            {
                time: new Date(bootTime - 1000),
                type: 'system',
                message: 'System boot sequence initiated'
            },
            {
                time: new Date(bootTime - 500),
                type: 'system',
                message: 'Loading core components'
            },
            {
                time: bootTime,
                type: 'success',
                message: 'S.BOWLES_OS online'
            },
            {
                time: new Date(bootTime + 500),
                type: 'info',
                message: 'Interface ready'
            },
            {
                time: currentTime,
                type: 'system',
                message: 'System log initialized'
            }
        ];
        
        this.renderEntries();
    }
    
    /**
     * Add a new entry to the log
     * @param {string} type - Entry type (info, warn, error, success, cmd, system)
     * @param {string} message - Log message
     * @param {Object} options - Additional options for entry rendering
     * @param {Object} options.styleOverrides - Custom styles to apply to entry elements
     */
    addEntry(type, message, options = {}) {
        const entry = {
            time: new Date(),
            type: type || 'info',
            message: message,
            styleOverrides: options.styleOverrides || {}
        };
        
        // Add to entries array
        this.entries.unshift(entry);
        
        // Limit to max entries
        if (this.entries.length > this.options.maxEntries) {
            this.entries.pop();
        }
        
        // Update display
        this.renderEntries();
        
        // Return for chaining
        return this;
    }
    
    /**
     * Render log entries
     */
    renderEntries() {
        this.content.innerHTML = '';
        
        const filteredEntries = this.entries.filter(entry => 
            this.activeFilters.includes(entry.type)
        );
        
        if (filteredEntries.length === 0) {
            this.content.innerHTML = '<div class="system-log-empty">No log entries match the current filters</div>';
            return;
        }
        
        filteredEntries.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = `system-log-entry type-${entry.type}`;
            entryElement.style.animationDelay = `${index * 0.05}s`;
            
            const time = this.formatTime(entry.time);
            
            // Create elements to apply custom styles
            const timeSpan = document.createElement('span');
            timeSpan.className = 'system-log-entry-time';
            timeSpan.textContent = time;
            
            const typeSpan = document.createElement('span');
            typeSpan.className = 'system-log-entry-type';
            typeSpan.textContent = `[${entry.type}]`;
            
            const messageSpan = document.createElement('span');
            messageSpan.className = 'system-log-entry-message';
            messageSpan.textContent = entry.message;
            
            // Apply any custom style overrides
            if (entry.styleOverrides) {
                if (entry.styleOverrides.timestamp) {
                    timeSpan.style.cssText += entry.styleOverrides.timestamp;
                }
                if (entry.styleOverrides.type) {
                    typeSpan.style.cssText += entry.styleOverrides.type;
                }
                if (entry.styleOverrides.message) {
                    messageSpan.style.cssText += entry.styleOverrides.message;
                }
            }
            
            // Add elements to entry
            entryElement.appendChild(timeSpan);
            entryElement.appendChild(document.createTextNode(' '));
            entryElement.appendChild(typeSpan);
            entryElement.appendChild(document.createTextNode(' '));
            entryElement.appendChild(messageSpan);
            
            this.content.appendChild(entryElement);
        });
        
        // Scroll to bottom
        this.content.scrollTop = 0;
    }
    
    /**
     * Format time for display
     * @param {Date} time - Time to format
     * @returns {string} Formatted time
     */
    formatTime(time) {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const seconds = time.getSeconds().toString().padStart(2, '0');
        
        return `${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * Clear all entries
     */
    clearEntries() {
        this.entries = [];
        this.renderEntries();
        this.addEntry('system', 'Log cleared');
    }
    
    /**
     * Toggle the panel state (expanded/collapsed)
     */
    toggleState() {
        if (this.state === 'expanded') {
            this.state = 'collapsed';
            this.container.classList.remove('expanded');
            this.container.classList.add('collapsed');
            this.toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            this.state = 'expanded';
            this.container.classList.remove('collapsed');
            this.container.classList.add('expanded');
            this.toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
        
        // Save state if enabled
        if (this.options.rememberState) {
            localStorage.setItem('sb-system-log-state', this.state);
        }
    }
    
    /**
     * Convenience methods for different log types
     */
    info(message) { return this.addEntry('info', message); }
    warn(message) { return this.addEntry('warn', message); }
    error(message) { return this.addEntry('error', message); }
    success(message) { return this.addEntry('success', message); }
    system(message) { return this.addEntry('system', message); }
    network(message) { return this.addEntry('network', message); }
    command(message) { return this.addEntry('cmd', message); }
}

// Initialize system log when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.systemLog = new SystemLog();
});
