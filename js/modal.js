/**
 * Enhanced Modal System
 * A centralized system for managing modals with improved accessibility and animations
 */

class ModalSystem {
    constructor() {
        this.activeModal = null;
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.modalContainers = document.querySelectorAll('.modal-container');
        this.originalFocus = null;
        
        this.init();
    }
    
    /**
     * Initialize the modal system
     */
    init() {
        this.setupEventListeners();
        console.log('Modal system initialized');
    }
    
    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Setup open buttons
        const openButtons = document.querySelectorAll('[data-modal-open]');
        openButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = button.getAttribute('data-modal-open');
                this.openModal(modalId);
            });
        });
        
        // Add click handlers to all existing project buttons
        const projectButtons = document.querySelectorAll('.btn-project');
        projectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = btn.getAttribute('data-project');
                this.openModal(`modal-${projectId}`);
            });
        });
        
        // Setup close buttons
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeActiveModal();
            });
        });
        
        // Setup overlay clicks
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeActiveModal();
                }
            });
        });
        
        // Global escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActiveModal();
            }
            if (e.key === 'Tab' && this.activeModal) {
                this.handleTabKey(e);
            }
        });
    }
    
    /**
     * Open a specific modal by ID
     * @param {string} modalId - The ID of the modal to open
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        
        if (!modal) {
            console.error(`Modal with ID "${modalId}" not found`);
            return;
        }
        
        // Store the element that had focus before opening the modal
        this.originalFocus = document.activeElement;
        
        // Set this as the active modal
        this.activeModal = modal;
        
        // Show the modal
        modal.classList.add('active');
        
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
        
        // Find all focusable elements
        const focusableElements = modal.querySelectorAll(this.focusableElements);
        if (focusableElements.length) {
            // Focus the first element (usually the close button)
            setTimeout(() => {
                focusableElements[0].focus();
            }, 100);
        }
        
        // Log to system log if available
        if (window.systemLog) {
            const projectId = modalId.replace('modal-', '');
            window.systemLog.addEntry('cmd', `Action: VIEW_DETAILS for ${projectId}`, { 
                styleOverrides: {
                    timestamp: 'color: var(--theme-accent-primary); font-weight: bold;'
                }
            });
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('modalOpened', { detail: { modalId } }));
    }
    
    /**
     * Close the currently active modal
     */
    closeActiveModal() {
        if (!this.activeModal) return;
        
        this.activeModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to the element that had it before the modal was opened
        if (this.originalFocus) {
            setTimeout(() => {
                this.originalFocus.focus();
            }, 100);
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('modalClosed', { 
            detail: { modalId: this.activeModal.id } 
        }));
        
        this.activeModal = null;
    }
    
    /**
     * Handle tab key press to trap focus within the modal
     * @param {Event} e - Keyboard event
     */
    handleTabKey(e) {
        if (!this.activeModal) return;
        
        const focusableElements = this.activeModal.querySelectorAll(this.focusableElements);
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If shift+tab and first element is focused, wrap to last element
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } 
        // If tab and last element is focused, wrap to first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
}

// Initialize the modal system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modalSystem = new ModalSystem();
});
