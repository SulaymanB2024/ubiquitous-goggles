/**
 * Command Palette
 * Global search and navigation interface triggered by Ctrl+K
 */

class CommandPalette {
    constructor() {
        // Initialize properties
        this.isActive = false;
        this.selectedIndex = 0;
        this.filteredCommands = [];
        this.commands = [
            // Navigation commands
            { 
                title: 'Go to About',
                description: 'View system architecture and core modules',
                category: 'navigation',
                icon: 'fa-info-circle',
                shortcut: ['G', 'A'],
                action: () => this.navigateTo('#about')
            },
            { 
                title: 'Go to Projects',
                description: 'Browse applications directory',
                category: 'navigation',
                icon: 'fa-code',
                shortcut: ['G', 'P'],
                action: () => this.navigateTo('#projects')
            },
            { 
                title: 'Go to Network',
                description: 'View system connections map',
                category: 'navigation',
                icon: 'fa-project-diagram',
                shortcut: ['G', 'N'],
                action: () => this.navigateTo('#network')
            },
            { 
                title: 'Go to Skills',
                description: 'Explore core libraries and toolkit',
                category: 'navigation',
                icon: 'fa-tools',
                shortcut: ['G', 'S'],
                action: () => this.navigateTo('#skills')
            },
            { 
                title: 'Go to Leadership',
                description: 'View network protocols and governance',
                category: 'navigation',
                icon: 'fa-users',
                shortcut: ['G', 'L'],
                action: () => this.navigateTo('#leadership')
            },
            { 
                title: 'Go to Contact',
                description: 'Establish connection interface',
                category: 'navigation',
                icon: 'fa-envelope',
                shortcut: ['G', 'C'],
                action: () => this.navigateTo('#contact')
            },
            
            // Action commands
            {
                title: 'Toggle Dark/Light Mode',
                description: 'Switch system appearance',
                category: 'actions',
                icon: 'fa-adjust',
                shortcut: ['T', 'M'],
                action: () => this.toggleTheme()
            },
            {
                title: 'View Resume',
                description: 'Open resume PDF in new tab',
                category: 'actions',
                icon: 'fa-file-pdf',
                shortcut: ['V', 'R'],
                action: () => this.openResume()
            },
            {
                title: 'Toggle Network Physics',
                description: 'Enable/disable force simulation',
                category: 'actions',
                icon: 'fa-atom',
                shortcut: ['T', 'P'],
                action: () => this.toggleNetworkPhysics()
            },
            {
                title: 'Reset Network View',
                description: 'Return network to default state',
                category: 'actions',
                icon: 'fa-redo',
                shortcut: ['R', 'N'],
                action: () => this.resetNetworkView()
            }
        ];
        
        this.init();
        this.focusableElements = [];
    }
    
    /**
     * Initialize the command palette
     */
    init() {
        this.createPalette();
        this.setupEventListeners();
    }
    
    /**
     * Create the command palette elements
     */
    createPalette() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'command-palette-overlay';
        
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'command-palette-container';
        
        // Create header with search
        const header = document.createElement('div');
        header.className = 'command-palette-header';
        
        const icon = document.createElement('div');
        icon.className = 'command-palette-icon';
        icon.innerHTML = '<i class="fas fa-search"></i>';
        
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.className = 'command-palette-search';
        this.searchInput.placeholder = 'Type a command or search...';
        this.searchInput.autocomplete = 'off';
        this.searchInput.spellcheck = false;
        this.searchInput.setAttribute('aria-label', 'Search commands');
        
        // Create keyboard shortcut indicator
        const headerShortcut = document.createElement('div');
        headerShortcut.className = 'command-palette-header-shortcut';
        
        // ESC key
        const escKey = document.createElement('span');
        escKey.className = 'command-palette-header-shortcut-key';
        escKey.textContent = 'ESC';
        
        // Arrow separator
        const separator = document.createElement('span');
        separator.className = 'command-palette-header-shortcut-separator';
        separator.textContent = '•';
        
        // Enter key
        const enterKey = document.createElement('span');
        enterKey.className = 'command-palette-header-shortcut-key';
        enterKey.textContent = 'ENTER';

        // Add close button for accessibility
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'command-palette-close';
        this.closeButton.innerHTML = '<i class="fas fa-times"></i>';
        this.closeButton.setAttribute('aria-label', 'Close command palette');
        
        // Assemble keyboard shortcuts
        headerShortcut.appendChild(escKey);
        headerShortcut.appendChild(separator);
        headerShortcut.appendChild(enterKey);
        
        header.appendChild(icon);
        header.appendChild(this.searchInput);
        header.appendChild(headerShortcut);
        header.appendChild(this.closeButton);
        
        // Create results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'command-palette-results';
        
        // Add log indicator
        const log = document.createElement('div');
        log.className = 'command-palette-log';
        log.textContent = 'COMMAND_PALETTE_v2.0 | READY';
        
        // Assemble the palette
        this.container.appendChild(header);
        this.container.appendChild(this.resultsContainer);
        this.overlay.appendChild(this.container);
        this.overlay.appendChild(log);
        
        // Add to document
        document.body.appendChild(this.overlay);
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Global keyboard shortcut (Ctrl+K)
        document.addEventListener('keydown', (e) => {
            // Check for Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.togglePalette();
                
                // Log the command palette activation
                this.logEvent('Action: COMMAND_PALETTE_OPEN');
            }
            
            // Close on Escape
            if (e.key === 'Escape' && this.isActive) {
                e.preventDefault();
                this.hidePalette();
            }
        });
        
        // Search input events
        this.searchInput.addEventListener('input', () => {
            this.filterCommands();
            this.renderResults();
        });
        
        // Close button event
        this.closeButton.addEventListener('click', () => {
            this.hidePalette();
        });
        
        // Enhanced keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectNext();
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectPrevious();
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    this.executeSelected();
                    break;
                    
                case 'Tab':
                    e.preventDefault();
                    e.shiftKey ? this.selectPrevious() : this.selectNext();
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    if (this.filteredCommands.length > 0) {
                        this.selectedIndex = 0;
                        this.updateSelection();
                    }
                    break;
                    
                case 'End':
                    e.preventDefault();
                    if (this.filteredCommands.length > 0) {
                        this.selectedIndex = this.filteredCommands.length - 1;
                        this.updateSelection();
                    }
                    break;
            }
        });
        
        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hidePalette();
            }
        });
        
        // Focus trap and enhanced keyboard handling
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            // Handle Tab key for focus trapping
            if (e.key === 'Tab') {
                this.updateFocusableElements();
                const firstElement = this.focusableElements[0];
                const lastElement = this.focusableElements[this.focusableElements.length - 1];
                
                // Shift+Tab on first element should go to last element
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } 
                // Tab on last element should go to first element
                else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
            
            // Handle F6 to switch focus between main sections
            if (e.key === 'F6') {
                e.preventDefault();
                
                // Determine current focus area and move to next logical section
                if (document.activeElement === this.searchInput) {
                    // Move focus to the first result item
                    const firstItem = this.resultsContainer.querySelector('.command-palette-item');
                    if (firstItem) firstItem.focus();
                } else {
                    // Move focus back to search input
                    this.searchInput.focus();
                }
                
                // Announce focus change to screen readers
                this.announceForScreenReader('Focus moved to ' + 
                    (document.activeElement === this.searchInput ? 'search input' : 'results list'));
            }
        });
    }
    
    /**
     * Update list of focusable elements within the palette
     */
    updateFocusableElements() {
        this.focusableElements = Array.from(
            this.container.querySelectorAll(
                'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
        ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    }
    
    /**
     * Toggle the command palette visibility
     */
    togglePalette() {
        if (this.isActive) {
            this.hidePalette();
        } else {
            this.showPalette();
        }
    }
    
    /**
     * Show the command palette
     */
    showPalette() {
        // Don't show if already active
        if (this.isActive) return;
        
        this.isActive = true;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Create and dispatch custom event
        const openEvent = new CustomEvent('commandPaletteOpened', { 
            detail: { timestamp: new Date().toISOString() } 
        });
        window.dispatchEvent(openEvent);
        
        // Reset search value and filter results
        this.searchInput.value = '';
        this.filterCommands();
        this.renderResults();
        
        // Show the overlay with animation
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
            
            // Set initial focus and configure animations after DOM update
            setTimeout(() => {
                this.searchInput.focus();
                
                // Add staggered entrance animation to each item
                const items = this.resultsContainer.querySelectorAll('.command-palette-item');
                items.forEach((item, index) => {
                    item.style.animationDelay = `${0.03 * (index + 1)}s`;
                    item.style.opacity = '0';
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                    });
                });
                
                // Announce to screen readers
                this.announceForScreenReader('Command palette opened. Use arrow keys to navigate options.');
                
                // Update focusable elements for focus trapping
                this.updateFocusableElements();
            }, 50);
        });
        
        // Log event
        this.logEvent('Command palette opened');
    }
    
    /**
     * Hide the command palette
     */
    hidePalette() {
        if (!this.isActive) return;
        
        // Mark as inactive first to prevent duplicate calls
        this.isActive = false;
        
        // Create and dispatch custom event
        const closeEvent = new CustomEvent('commandPaletteClosed', { 
            detail: { timestamp: new Date().toISOString() } 
        });
        window.dispatchEvent(closeEvent);
        
        // Add closing animation classes
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(-10px) scale(0.98)';
        
        // Announce to screen readers
        this.announceForScreenReader('Command palette closed');
        
        // Wait for animation to complete before fully hiding
        setTimeout(() => {
            this.overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Reset styles after hiding
            requestAnimationFrame(() => {
                this.container.style.opacity = '';
                this.container.style.transform = '';
            });
        }, 250);
        
        // Log event
        this.logEvent('Command palette closed');
    }
    
    /**
     * Announce a message to screen readers
     * @param {string} message - Message to announce
     */
    announceForScreenReader(message) {
        // Create or reuse an aria-live region
        let announcer = document.getElementById('command-palette-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'command-palette-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.classList.add('sr-only'); // Screen reader only
            document.body.appendChild(announcer);
        }
        
        // Set the message
        announcer.textContent = message;
        
        // Clear after announcement (optional)
        setTimeout(() => {
            announcer.textContent = '';
        }, 3000);
    }
    
    /**
     * Filter commands based on search query
     */
    filterCommands() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (!query) {
            this.filteredCommands = [...this.commands];
            this.selectedIndex = 0;
            return;
        }
        
        this.filteredCommands = this.commands.filter(command => {
            return command.title.toLowerCase().includes(query) || 
                   command.description.toLowerCase().includes(query) || 
                   command.category.toLowerCase().includes(query);
        });
        
        this.selectedIndex = 0;
    }
    
    /**
     * Render filtered results
     */
    renderResults() {
        this.resultsContainer.innerHTML = '';
        
        if (this.filteredCommands.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="command-palette-empty">
                    No commands match your search
                </div>
            `;
            return;
        }
        
        // Group commands by category
        const groupedCommands = this.groupCommandsByCategory(this.filteredCommands);
        
        // Render each category
        let totalIndex = 0;
        
        for (const category in groupedCommands) {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'command-palette-section';
            
            // Category title
            const titleElement = document.createElement('div');
            titleElement.className = 'command-palette-section-title';
            titleElement.textContent = `// ${category.toUpperCase()}:`;
            sectionElement.appendChild(titleElement);
            
            // Commands in this category
            groupedCommands[category].forEach(command => {
                const itemElement = document.createElement('div');
                itemElement.className = 'command-palette-item';
                if (totalIndex === this.selectedIndex) {
                    itemElement.classList.add('selected');
                }
                
                // Item content
                itemElement.innerHTML = `
                    <div class="command-palette-item-info">
                        <div class="command-palette-item-icon">
                            <i class="fas ${command.icon}"></i>
                        </div>
                        <div>
                            <div class="command-palette-item-title">${command.title}</div>
                            <div class="command-palette-item-description">${command.description}</div>
                        </div>
                    </div>
                    <div class="command-palette-item-shortcut">
                        ${command.shortcut.map(key => `<span class="command-palette-key">${key}</span>`).join('')}
                    </div>
                `;
                
                // Add click handler
                itemElement.addEventListener('click', () => {
                    this.selectedIndex = totalIndex;
                    this.executeSelected();
                });
                
                sectionElement.appendChild(itemElement);
                totalIndex++;
            });
            
            this.resultsContainer.appendChild(sectionElement);
        }
    }
    
    /**
     * Group commands by category
     */
    groupCommandsByCategory(commands) {
        return commands.reduce((groups, command) => {
            const category = command.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(command);
            return groups;
        }, {});
    }
    
    /**
     * Select the next command in the list
     */
    selectNext() {
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
        this.updateSelection();
    }
    
    /**
     * Select the previous command in the list
     */
    selectPrevious() {
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
        this.updateSelection();
    }
    
    /**
     * Update the visual selection
     */
    updateSelection() {
        const items = this.resultsContainer.querySelectorAll('.command-palette-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                this.scrollItemIntoView(item);
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    /**
     * Scroll the selected item into view
     */
    scrollItemIntoView(item) {
        const container = this.resultsContainer;
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        
        if (itemRect.bottom > containerRect.bottom) {
            container.scrollTop += itemRect.bottom - containerRect.bottom;
        } else if (itemRect.top < containerRect.top) {
            container.scrollTop -= containerRect.top - itemRect.top;
        }
    }
    
    /**
     * Execute the selected command
     */
    executeSelected() {
        const command = this.filteredCommands[this.selectedIndex];
        if (command) {
            // Hide the palette
            this.hidePalette();
            
            // Execute the command after a short delay
            setTimeout(() => {
                command.action();
                
                // Log event with formatted action code
                this.logEvent(`Action: ${command.title.toUpperCase().replace(/\s+/g, '_')}`);
            }, 100);
        }
    }
    
    /**
     * Navigate to a section of the page
     */
    navigateTo(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * Toggle theme between dark and light
     */
    toggleTheme() {
        if (window.themeSystem) {
            window.themeSystem.toggleTheme();
        }
    }
    
    /**
     * Open resume PDF
     */
    openResume() {
        // This would normally open the actual resume PDF
        window.open('#', '_blank');
    }
    
    /**
     * Toggle network physics
     */
    toggleNetworkPhysics() {
        if (window.networkVisualization) {
            const toggleBtn = document.getElementById('toggle-physics');
            if (toggleBtn) {
                toggleBtn.click();
            }
        }
    }
    
    /**
     * Reset network view
     */
    resetNetworkView() {
        if (window.networkVisualization) {
            const resetBtn = document.getElementById('reset-network');
            if (resetBtn) {
                resetBtn.click();
            }
        }
    }
    
    /**
     * Log an event to the system log
     */
    logEvent(message) {
        if (window.systemLog) {
            // Use 'cmd' type with turquoise timestamp in system log
            window.systemLog.addEntry('cmd', message, { 
                styleOverrides: {
                    timestamp: 'color: var(--theme-accent-primary); font-weight: bold;'
                }
            });
        }
    }
}

// Initialize command palette when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.commandPalette = new CommandPalette();
});
