/**
 * Enhanced System Log Console
 * Real-time log display with filtering capabilities and interactive UI
 * Optimized for high-performance and minimal memory footprint
 */

class EnhancedSystemLog {
    constructor(options = {}) {
        // Default config options
        this.options = Object.assign({
            maxEntries: 100, // Limited for better performance
            initiallyExpanded: false,
            autoCollapse: true,
            autoCollapseDelay: 8000,
            animationSpeed: 300,
            showTimeStamps: true,
            showCategories: true,
            allowFiltering: true,
            allowSearch: true,
            containerSelector: '#system-log',
            notificationsEnabled: true,
            batchUpdates: true, // Group UI updates for better performance
            updateInterval: 500, // Update UI every 500ms by default when batching
            memoryEfficientMode: true // More memory-efficient rendering for large logs
        }, options);
        
        // Log storage
        this.logs = [];
        this.pendingLogs = []; // For batch updates
        this.filteredLogs = [];
        this.activeFilters = new Set();
        this.searchQuery = '';
        this.totalErrorCount = 0;
        this.totalWarningCount = 0;
        this.categories = new Set(); // Track unique categories
        
        // UI State
        this.isExpanded = this.options.initiallyExpanded;
        this.autoCollapseTimeout = null;
        this.newLogsCount = 0;
        this.newLogsSinceCollapse = false;
        this.updateTimeout = null;
        this.isUpdating = false;
        
        // Performance tracking
        this.performanceMetrics = {
            lastUpdateTime: 0,
            updateCount: 0,
            avgUpdateTime: 0
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the System Log
     */
    init() {
        // Create or find the container element
        this.createLogContainer();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Start with an initial log entry
        this.log('System log initialized', 'system');
        
        // Auto-collapse after delay if specified
        if (this.options.autoCollapse && this.isExpanded) {
            this.scheduleAutoCollapse();
        }
    }
    
    /**
     * Create or find the log container in the DOM
     */
    createLogContainer() {
        // Check if container exists
        this.container = document.querySelector(this.options.containerSelector);
        
        // Create the container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.options.containerSelector.replace('#', '');
            this.container.className = 'system-log-container';
            document.body.appendChild(this.container);
        }
        
        // Build the log UI structure
        this.buildLogInterface();
        
        // Set initial state
        if (this.isExpanded) {
            this.container.classList.add('expanded');
        } else {
            this.container.classList.add('collapsed');
        }
    }
    
    /**
     * Build the log interface HTML structure
     */
    buildLogInterface() {
        this.container.innerHTML = `
            <div class="system-log-header">
                <div class="system-log-title">
                    <span class="system-log-icon">
                        <i class="fas fa-terminal"></i>
                    </span>
                    SYSTEM LOG
                    <span class="system-log-status"></span>
                </div>
                <div class="system-log-controls">
                    <button class="system-log-control" data-action="clear" title="Clear Logs">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="system-log-control" data-action="toggle" title="Toggle Console">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
            </div>
            
            <div class="system-log-filters">
                <button class="log-filter-btn" data-filter="all">All</button>
                <button class="log-filter-btn" data-filter="info">Info</button>
                <button class="log-filter-btn" data-filter="success">Success</button>
                <button class="log-filter-btn" data-filter="warn">Warning</button>
                <button class="log-filter-btn" data-filter="error">Error</button>
                <button class="log-filter-btn" data-filter="system">System</button>
                <button class="log-filter-btn" data-filter="network">Network</button>
                
                <div class="filter-search">
                    <span class="filter-search-icon">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="filter-search-input" placeholder="Search logs...">
                </div>
            </div>
            
            <div class="system-log-content"></div>
            
            <div class="new-logs-indicator">New logs available</div>
            
            <div class="system-log-status-bar">
                <div class="log-stats">
                    <div class="stats-item">
                        <span>Entries:</span>
                        <span class="stats-value log-count">0</span>
                    </div>
                    <div class="stats-item">
                        <span>Errors:</span>
                        <span class="stats-value error-count">0</span>
                    </div>
                </div>
                <div class="log-actions">
                    <button class="log-action-btn" data-action="download" title="Download Logs">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="log-action-btn" data-action="expand" title="Expand All">
                        <i class="fas fa-expand-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Store references to important elements
        this.logContent = this.container.querySelector('.system-log-content');
        this.filterContainer = this.container.querySelector('.system-log-filters');
        this.searchInput = this.container.querySelector('.filter-search-input');
        this.logCountEl = this.container.querySelector('.log-count');
        this.errorCountEl = this.container.querySelector('.error-count');
        this.newLogsIndicator = this.container.querySelector('.new-logs-indicator');
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Header toggle click
        const header = this.container.querySelector('.system-log-header');
        header.addEventListener('click', (e) => {
            if (!e.target.closest('.system-log-control')) {
                this.toggleConsole();
            }
        });
        
        // Control buttons
        const controls = this.container.querySelectorAll('.system-log-control');
        controls.forEach(control => {
            control.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = control.getAttribute('data-action');
                
                if (action === 'toggle') {
                    this.toggleConsole();
                } else if (action === 'clear') {
                    this.clearLogs();
                }
            });
        });
        
        // Filter buttons
        const filterButtons = this.container.querySelectorAll('.log-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                if (filter === 'all') {
                    this.clearFilters();
                } else {
                    this.toggleFilter(filter);
                }
                
                this.updateFilterButtonStates();
                this.applyFilters();
            });
        });
        
        // Search input
        if (this.options.allowSearch && this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.searchQuery = this.searchInput.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        // Action buttons in status bar
        const actionButtons = this.container.querySelectorAll('.log-action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                
                if (action === 'download') {
                    this.downloadLogs();
                } else if (action === 'expand') {
                    this.toggleExpandAll();
                }
            });
        });
        
        // New logs indicator
        this.newLogsIndicator.addEventListener('click', () => {
            if (!this.isExpanded) {
                this.toggleConsole();
            }
            this.scrollToBottom();
            this.hideNewLogsIndicator();
        });
    }
    
    /**
     * Add a log entry with optimized batching for better performance
     */
    log(message, category = 'info', options = {}) {
        // Create log entry object
        const entry = {
            id: this.generateLogId(),
            timestamp: new Date(),
            message: message,
            category: category.toLowerCase(),
            options: Object.assign({
                important: false,
                details: null,
                html: false
            }, options)
        };
        
        // Keep track of categories for filtering UI
        this.categories.add(entry.category);
        
        // Add to logs array
        this.logs.unshift(entry);
        
        // Keep logs under maximum length
        if (this.logs.length > this.options.maxEntries) {
            // Remove excess logs to maintain performance
            this.logs = this.logs.slice(0, this.options.maxEntries);
        }
        
        // Update counters
        if (entry.category === 'error') {
            this.totalErrorCount++;
        } else if (entry.category === 'warn') {
            this.totalWarningCount++;
        }
        
        // If batching is enabled, add to pending and schedule update
        if (this.options.batchUpdates) {
            this.pendingLogs.push(entry);
            
            // Schedule UI update if not already scheduled
            if (!this.updateTimeout) {
                this.updateTimeout = setTimeout(() => {
                    this.processBatchUpdate();
                }, this.options.updateInterval);
            }
        } else {
            // Immediate update for non-batched mode
            this.updateCounters();
            
            // Add to DOM if it passes current filters
            if (this.passesFilters(entry)) {
                this.addLogToDOM(entry, true);
            }
        }
        
        // Handle collapsed state notifications
        if (!this.isExpanded) {
            this.newLogsCount++;
            this.newLogsSinceCollapse = true;
            this.showNewLogsIndicator();
        }
        
        // Publish to EventBus if available
        if (window.EventBus) {
            window.EventBus.publish('systemLog:entry', { entry });
        }
        
        return entry.id;
    }
    
    /**
     * Process batched log updates efficiently
     */
    processBatchUpdate() {
        // Clear the timeout
        this.updateTimeout = null;
        
        // Skip if no pending logs or already updating
        if (this.pendingLogs.length === 0 || this.isUpdating) return;
        
        // Set updating flag
        this.isUpdating = true;
        
        // Performance tracking
        const startTime = performance.now();
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        let countAdded = 0;
        
        // Process pending logs
        this.pendingLogs.forEach(entry => {
            if (this.passesFilters(entry)) {
                const logElement = this.createLogElement(entry, true);
                fragment.appendChild(logElement);
                countAdded++;
            }
        });
        
        // Only update DOM if there are elements to add
        if (countAdded > 0) {
            // Append all at once
            this.logContainer.insertBefore(fragment, this.logContainer.firstChild);
            
            // Update counters once for all logs
            this.updateCounters();
        }
        
        // Clear pending logs
        this.pendingLogs = [];
        
        // Track performance
        const endTime = performance.now();
        this.performanceMetrics.updateCount++;
        this.performanceMetrics.lastUpdateTime = endTime - startTime;
        this.performanceMetrics.avgUpdateTime = 
            (this.performanceMetrics.avgUpdateTime * (this.performanceMetrics.updateCount - 1) + 
             this.performanceMetrics.lastUpdateTime) / this.performanceMetrics.updateCount;
        
        // Clear updating flag
        this.isUpdating = false;
    }
    
    /**
     * Convenience methods for different log types
     */
    info(message, options = {}) {
        return this.log(message, 'info', options);
    }
    
    success(message, options = {}) {
        return this.log(message, 'success', options);
    }
    
    warn(message, options = {}) {
        return this.log(message, 'warn', options);
    }
    
    error(message, options = {}) {
        return this.log(message, 'error', options);
    }
    
    system(message, options = {}) {
        return this.log(message, 'system', options);
    }
    
    network(message, options = {}) {
        return this.log(message, 'network', options);
    }
    
    /**
     * Generate a unique log entry ID
     */
    generateLogId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * Create and add a log entry to the DOM
     */
    addLogToDOM(entry, isNew = false) {
        const logElement = document.createElement('div');
        logElement.className = 'log-entry';
        logElement.dataset.id = entry.id;
        logElement.dataset.category = entry.category;
        
        if (isNew) {
            logElement.classList.add('highlight');
        }
        
        let content = '';
        
        // Add timestamp if enabled
        if (this.options.showTimeStamps) {
            content += `<span class="log-timestamp">${this.formatTime(entry.timestamp)}</span>`;
        }
        
        // Add category badge if enabled
        if (this.options.showCategories) {
            content += `<span class="log-category"><span class="log-badge badge-${entry.category}">${entry.category}</span></span>`;
        }
        
        // Add message
        if (entry.options.html) {
            content += `<div class="log-message">${entry.message}</div>`;
        } else {
            content += `<div class="log-message">${this.escapeHtml(entry.message)}</div>`;
        }
        
        logElement.innerHTML = content;
        
        // Add details if present
        if (entry.options.details) {
            const detailsEl = document.createElement('div');
            detailsEl.className = 'log-details';
            detailsEl.style.display = 'none';
            
            if (typeof entry.options.details === 'object') {
                detailsEl.textContent = JSON.stringify(entry.options.details, null, 2);
            } else {
                detailsEl.textContent = entry.options.details;
            }
            
            logElement.appendChild(detailsEl);
            logElement.classList.add('has-details');
            
            // Add toggle functionality
            logElement.addEventListener('click', () => {
                const isVisible = detailsEl.style.display !== 'none';
                detailsEl.style.display = isVisible ? 'none' : 'block';
                logElement.classList.toggle('expanded', !isVisible);
            });
        }
        
        // Add to DOM at the beginning (newest first)
        if (this.logContent.firstChild) {
            this.logContent.insertBefore(logElement, this.logContent.firstChild);
        } else {
            this.logContent.appendChild(logElement);
        }
        
        // Cleanup if over limit
        const entries = this.logContent.querySelectorAll('.log-entry');
        if (entries.length > this.options.maxEntries) {
            for (let i = this.options.maxEntries; i < entries.length; i++) {
                entries[i].remove();
            }
        }
    }
    
    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        this.filteredLogs = [];
        this.logContent.innerHTML = '';
        this.totalErrorCount = 0;
        this.totalWarningCount = 0;
        this.updateCounters();
        this.system('Logs cleared');
    }
    
    /**
     * Check if a log entry passes the current filters
     */
    passesFilters(entry) {
        // Check category filters
        if (this.activeFilters.size > 0 && !this.activeFilters.has(entry.category)) {
            return false;
        }
        
        // Check search query
        if (this.searchQuery) {
            const message = entry.message.toLowerCase();
            return message.includes(this.searchQuery);
        }
        
        return true;
    }
    
    /**
     * Apply filters to the log entries
     */
    applyFilters() {
        // Hide all log entries first
        const allEntries = this.logContent.querySelectorAll('.log-entry');
        allEntries.forEach(entry => {
            entry.style.display = 'none';
        });
        
        // Find matching entries
        let hasResults = false;
        this.logs.forEach(log => {
            if (this.passesFilters(log)) {
                const el = this.logContent.querySelector(`.log-entry[data-id="${log.id}"]`);
                if (el) {
                    el.style.display = 'flex';
                    hasResults = true;
                } else {
                    // Entry exists in data but not in DOM, so add it
                    this.addLogToDOM(log);
                    hasResults = true;
                }
            }
        });
        
        // Show empty state if no results
        if (!hasResults) {
            if (!this.logContent.querySelector('.log-empty-state')) {
                const emptyState = document.createElement('div');
                emptyState.className = 'log-empty-state';
                emptyState.innerHTML = `
                    <div class="empty-state-icon"><i class="fas fa-search"></i></div>
                    <div class="empty-state-text">No log entries match your current filters</div>
                `;
                this.logContent.appendChild(emptyState);
            }
        } else {
            // Remove empty state if it exists
            const emptyState = this.logContent.querySelector('.log-empty-state');
            if (emptyState) {
                emptyState.remove();
            }
        }
    }
    
    /**
     * Toggle a category filter
     */
    toggleFilter(category) {
        if (this.activeFilters.has(category)) {
            this.activeFilters.delete(category);
        } else {
            this.activeFilters.add(category);
        }
    }
    
    /**
     * Clear all filters
     */
    clearFilters() {
        this.activeFilters.clear();
        this.searchInput.value = '';
        this.searchQuery = '';
    }
    
    /**
     * Update the visual state of filter buttons
     */
    updateFilterButtonStates() {
        const buttons = this.container.querySelectorAll('.log-filter-btn');
        buttons.forEach(btn => {
            const filter = btn.getAttribute('data-filter');
            
            if (filter === 'all') {
                btn.classList.toggle('active', this.activeFilters.size === 0);
            } else {
                btn.classList.toggle('active', this.activeFilters.has(filter));
            }
        });
    }
    
    /**
     * Toggle console expanded/collapsed state
     */
    toggleConsole() {
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.container.classList.remove('collapsed');
            this.container.classList.add('expanded');
            this.container.querySelector('.system-log-control[data-action="toggle"] i').className = 'fas fa-chevron-down';
            
            // Reset new logs indicator
            this.newLogsCount = 0;
            this.newLogsSinceCollapse = false;
            this.hideNewLogsIndicator();
            
            // Schedule auto-collapse if enabled
            if (this.options.autoCollapse) {
                this.scheduleAutoCollapse();
            }
        } else {
            this.container.classList.remove('expanded');
            this.container.classList.add('collapsed');
            this.container.querySelector('.system-log-control[data-action="toggle"] i').className = 'fas fa-chevron-up';
            
            // Clear auto-collapse timeout
            if (this.autoCollapseTimeout) {
                clearTimeout(this.autoCollapseTimeout);
            }
        }
    }
    
    /**
     * Schedule auto-collapse of the console
     */
    scheduleAutoCollapse() {
        if (this.autoCollapseTimeout) {
            clearTimeout(this.autoCollapseTimeout);
        }
        
        this.autoCollapseTimeout = setTimeout(() => {
            if (this.isExpanded) {
                this.toggleConsole();
            }
        }, this.options.autoCollapseDelay);
    }
    
    /**
     * Show the new logs indicator
     */
    showNewLogsIndicator() {
        if (this.newLogsCount > 0 && !this.isExpanded) {
            this.newLogsIndicator.textContent = `${this.newLogsCount} new log${this.newLogsCount !== 1 ? 's' : ''}`;
            this.newLogsIndicator.classList.add('active');
        }
    }
    
    /**
     * Hide the new logs indicator
     */
    hideNewLogsIndicator() {
        this.newLogsIndicator.classList.remove('active');
    }
    
    /**
     * Update the counter displays
     */
    updateCounters() {
        this.logCountEl.textContent = this.logs.length;
        this.errorCountEl.textContent = this.totalErrorCount;
    }
    
    /**
     * Format timestamp for display
     */
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * Scroll log content to bottom
     */
    scrollToBottom() {
        this.logContent.scrollTop = 0; // We're displaying newest first
    }
    
    /**
     * Toggle expanded state of all detailed log entries
     */
    toggleExpandAll() {
        const hasExpanded = !!this.logContent.querySelector('.log-entry.has-details.expanded');
        
        // If any are expanded, collapse all, otherwise expand all
        const detailEntries = this.logContent.querySelectorAll('.log-entry.has-details');
        detailEntries.forEach(entry => {
            const detailsEl = entry.querySelector('.log-details');
            
            if (hasExpanded) {
                // Collapse all
                detailsEl.style.display = 'none';
                entry.classList.remove('expanded');
            } else {
                // Expand all
                detailsEl.style.display = 'block';
                entry.classList.add('expanded');
            }
        });
    }
    
    /**
     * Download logs as JSON file
     */
    downloadLogs() {
        // Create log export object
        const exportData = {
            timestamp: new Date().toISOString(),
            totalEntries: this.logs.length,
            entries: this.logs.map(log => ({
                timestamp: log.timestamp.toISOString(),
                category: log.category,
                message: log.message,
                details: log.options.details
            }))
        };
        
        // Convert to pretty JSON string
        const dataStr = JSON.stringify(exportData, null, 2);
        
        // Create download link
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `system-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Log action
        this.system('Logs exported to JSON file');
    }
    
    /**
     * Escape HTML special characters
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the system log container exists
    const systemLogEl = document.getElementById('system-log');
    
    // Create global instance
    window.SystemLog = new EnhancedSystemLog({
        containerSelector: '#system-log',
        initiallyExpanded: false,
        autoCollapse: true,
        autoCollapseDelay: 10000
    });
    
    // Simulate some initial logs for demonstration
    setTimeout(() => {
        window.SystemLog.info('Interface components loaded successfully');
        window.SystemLog.network('Connection established', { details: { latency: '38ms', protocol: 'HTTPS' } });
    }, 1000);
    
    setTimeout(() => {
        window.SystemLog.system('System monitoring active');
    }, 2000);
});
