/**
 * Theme System
 * Manages dark/light theme switching and persistence
 */

class ThemeSystem {
    constructor() {
        this.themeKey = 'sb-portfolio-theme';
        this.currentTheme = 'dark'; // Default theme
        this.init();
    }
    
    /**
     * Initialize the theme system
     */
    init() {
        this.createThemeSwitcher();
        this.loadSavedTheme();
        this.setupEventListeners();
    }
    
    /**
     * Create the theme switcher button
     */
    createThemeSwitcher() {
        const switcherContainer = document.createElement('div');
        switcherContainer.className = 'theme-switch-container';
        
        switcherContainer.innerHTML = `
            <button class="theme-switch-btn" id="theme-switch-btn" aria-label="Switch theme">
                <span class="theme-icon sun-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                </span>
                <span class="theme-icon moon-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                </span>
            </button>
        `;
        
        document.body.appendChild(switcherContainer);
    }
    
    /**
     * Load the saved theme from localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.themeKey);
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        } else {
            // Check for system preference if no saved theme
            this.checkSystemPreference();
        }
    }
    
    /**
     * Check system color scheme preference
     */
    checkSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            this.currentTheme = 'light';
            this.applyTheme('light');
        }
        
        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
            const newTheme = e.matches ? 'light' : 'dark';
            this.currentTheme = newTheme;
            this.applyTheme(newTheme);
            localStorage.setItem(this.themeKey, newTheme);
        });
    }
    
    /**
     * Apply the theme to the document
     * @param {string} theme - Theme name ('dark' or 'light')
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Trigger a custom event for other components to respond to theme change
        const event = new CustomEvent('themechange', { detail: { theme } });
        document.dispatchEvent(event);
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const switchButton = document.getElementById('theme-switch-btn');
        
        // Add animation class
        switchButton.classList.add('switching');
        
        // Toggle the theme
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Save to localStorage
        localStorage.setItem(this.themeKey, newTheme);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            switchButton.classList.remove('switching');
        }, 500);
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const switchButton = document.getElementById('theme-switch-btn');
        switchButton.addEventListener('click', () => this.toggleTheme());
        
        // Add keyboard accessibility
        switchButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
}

// Initialize the theme system when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeSystem = new ThemeSystem();
});
