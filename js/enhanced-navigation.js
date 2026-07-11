/**
 * Enhanced Navigation
 * Collapsible sidebar and interactive navigation components
 */

class EnhancedNavigation {
    constructor() {
        this.sidebarState = localStorage.getItem('sb-sidebar-state') || 'collapsed';
        this.mobileNavActive = false;
        this.currentSection = '';
        
        this.init();
    }
    
    /**
     * Initialize enhanced navigation
     */
    init() {
        this.createSidebar();
        this.setupNavigationListeners();
        this.enhanceMainNav();
        this.applySidebarState();
        this.setupScrollSpy();
    }
    
    /**
     * Create the sidebar element
     */
    createSidebar() {
        // Create sidebar container
        this.sidebar = document.createElement('aside');
        this.sidebar.className = 'sidebar';
        this.sidebar.id = 'sidebar';
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
        toggleBtn.innerHTML = '<i class="fas fa-angle-right"></i>';
        
        // Create sidebar items container
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'sidebar-items';
        
        // Define sidebar items
        const items = [
            { 
                id: 'about',
                label: 'System Architecture',
                icon: 'fa-microchip',
                href: '#about'
            },
            {
                id: 'projects',
                label: 'Applications Directory',
                icon: 'fa-code',
                href: '#projects'
            },
            {
                id: 'network',
                label: 'Network Map',
                icon: 'fa-project-diagram',
                href: '#network'
            },
            {
                id: 'skills',
                label: 'Core Libraries',
                icon: 'fa-tools',
                href: '#skills'
            },
            {
                id: 'leadership',
                label: 'Governance Protocol',
                icon: 'fa-users',
                href: '#leadership'
            },
            {
                id: 'contact',
                label: 'Establish Connection',
                icon: 'fa-terminal',
                href: '#contact'
            }
        ];
        
        // Create each sidebar item
        items.forEach(item => {
            const sidebarItem = document.createElement('a');
            sidebarItem.className = 'sidebar-item';
            sidebarItem.href = item.href;
            sidebarItem.dataset.section = item.id;
            sidebarItem.dataset.tooltip = item.label;
            sidebarItem.setAttribute('aria-label', `Navigate to ${item.label}`);
            sidebarItem.setAttribute('title', item.label);
            
            sidebarItem.innerHTML = `
                <div class="sidebar-item-icon" aria-hidden="true">
                    <i class="fas ${item.icon}"></i>
                </div>
                <span class="sidebar-item-label">${item.label}</span>
            `;
            
            itemsContainer.appendChild(sidebarItem);
        });
        
        // Add a divider
        const divider = document.createElement('div');
        divider.className = 'sidebar-divider';
        
        // Add system controls
        const systemControls = document.createElement('a');
        systemControls.className = 'sidebar-item';
        systemControls.href = '#';
        systemControls.innerHTML = `
            <div class="sidebar-item-icon">
                <i class="fas fa-cog"></i>
            </div>
            <span class="sidebar-item-label">System Controls</span>
        `;
        systemControls.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.commandPalette) {
                window.commandPalette.togglePalette();
            }
        });
        
        // Add system log
        const systemLogBtn = document.createElement('a');
        systemLogBtn.className = 'sidebar-item';
        systemLogBtn.href = '#';
        systemLogBtn.innerHTML = `
            <div class="sidebar-item-icon">
                <i class="fas fa-terminal"></i>
            </div>
            <span class="sidebar-item-label">System Log</span>
        `;
        systemLogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.systemLog) {
                window.systemLog.toggleState();
            }
        });
        
        // Add system info
        const systemInfo = document.createElement('div');
        systemInfo.className = 'sidebar-info';
        systemInfo.innerHTML = `SULAYMAN_BOWLES_OS v1.0.0`;
        
        // Assemble the sidebar
        this.sidebar.appendChild(toggleBtn);
        this.sidebar.appendChild(itemsContainer);
        this.sidebar.appendChild(divider);
        this.sidebar.appendChild(systemControls);
        this.sidebar.appendChild(systemLogBtn);
        this.sidebar.appendChild(systemInfo);
        
        // Add to document
        document.body.appendChild(this.sidebar);
        
        // Add toggle functionality
        toggleBtn.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }
    
    /**
     * Setup navigation event listeners
     */
    setupNavigationListeners() {
        // Sidebar navigation items
        document.querySelectorAll('.sidebar-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Main navigation items
        document.querySelectorAll('.nav-link[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileNav();
            });
        }
    }
    
    /**
     * Enhance the main navigation bar
     */
    enhanceMainNav() {
        // Add data-section attributes to nav links if they don't exist
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && !link.dataset.section) {
                link.dataset.section = href.substring(1);
            }
        });
        
        // Add system status indicator
        const navbarContent = document.querySelector('.navbar-content');
        if (navbarContent) {
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'system-status';
            statusIndicator.innerHTML = `
                <div class="status-indicator"></div>
                <div class="status-text">SYSTEM ONLINE</div>
            `;
            
            navbarContent.insertBefore(statusIndicator, navbarContent.firstChild);
        }
        
        // Add keyboard shortcut indicator to contact button
        const contactBtn = document.querySelector('.btn-nav[href="#contact"]');
        if (contactBtn) {
            const shortcutIndicator = document.createElement('span');
            shortcutIndicator.className = 'keyboard-shortcut';
            shortcutIndicator.textContent = 'Ctrl+K';
            contactBtn.appendChild(shortcutIndicator);
        }
    }
    
    /**
     * Apply the current sidebar state
     */
    applySidebarState() {
        if (this.sidebarState === 'collapsed') {
            this.sidebar.classList.add('collapsed');
            this.sidebar.classList.remove('expanded');
            document.body.classList.add('sidebar-collapsed');
            document.body.classList.remove('sidebar-expanded');
        } else {
            this.sidebar.classList.add('expanded');
            this.sidebar.classList.remove('collapsed');
            document.body.classList.add('sidebar-expanded');
            document.body.classList.remove('sidebar-collapsed');
        }
    }
    
    /**
     * Toggle sidebar state
     */
    toggleSidebar() {
        if (this.sidebarState === 'collapsed') {
            this.sidebarState = 'expanded';
        } else {
            this.sidebarState = 'collapsed';
        }
        
        // Save state in localStorage
        localStorage.setItem('sb-sidebar-state', this.sidebarState);
        
        // Apply the new state
        this.applySidebarState();
        
        // Log event
        this.logEvent(`Sidebar ${this.sidebarState}`);
    }
    
    /**
     * Toggle mobile navigation
     */
    toggleMobileNav() {
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) {
            this.mobileNavActive = !this.mobileNavActive;
            
            if (this.mobileNavActive) {
                mobileNav.classList.add('active');
            } else {
                mobileNav.classList.remove('active');
            }
            
            // Log event
            this.logEvent(`Mobile navigation ${this.mobileNavActive ? 'opened' : 'closed'}`);
        }
    }
    
    /**
     * Navigate to a section
     */
    navigateToSection(section) {
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            
            // Update active section
            this.setActiveSection(section);
            
            // Close mobile nav if open
            if (this.mobileNavActive) {
                this.toggleMobileNav();
            }
            
            // Log event
            this.logEvent(`Navigated to ${section} section`);
        }
    }
    
    /**
     * Set up scroll spy to track current section
     */
    setupScrollSpy() {
        window.addEventListener('scroll', () => {
            this.checkActiveSection();
        });
        
        // Initial check
        this.checkActiveSection();
    }
    
    /**
     * Check which section is currently active based on scroll position
     */
    checkActiveSection() {
        const sections = ['about', 'projects', 'network', 'skills', 'leadership', 'contact'];
        const scrollPosition = window.scrollY + window.innerHeight / 3;
        
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (!section) continue;
            
            if (scrollPosition >= section.offsetTop) {
                if (this.currentSection !== sections[i]) {
                    this.setActiveSection(sections[i]);
                }
                break;
            }
        }
    }
    
    /**
     * Set the active section and update UI
     */
    setActiveSection(section) {
        this.currentSection = section;
        
        // Update sidebar items
        document.querySelectorAll('.sidebar-item[data-section]').forEach(item => {
            if (item.dataset.section === section) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update main nav items
        document.querySelectorAll('.nav-link[data-section]').forEach(item => {
            if (item.dataset.section === section) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    /**
     * Log an event to the system log
     */
    logEvent(message) {
        if (window.systemLog) {
            window.systemLog.addEntry('system', message);
        }
    }
}

// Initialize enhanced navigation when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedNavigation = new EnhancedNavigation();
});
