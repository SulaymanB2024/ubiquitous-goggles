/**
 * Image Gallery System
 * Fullscreen gallery viewer for project images
 */

class ImageGallery {
    constructor() {
        this.active = false;
        this.images = [];
        this.currentIndex = 0;
        this.overlay = null;
        this.mainImage = null;
        this.thumbsContainer = null;
        
        this.init();
    }
    
    /**
     * Initialize gallery system
     */
    init() {
        this.createGalleryStructure();
        this.bindEvents();
        
        // Add keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNav.bind(this));
        
        console.log('Image gallery system initialized');
    }
    
    /**
     * Create the gallery HTML structure
     */
    createGalleryStructure() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'gallery-viewer-overlay';
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'gallery-viewer-content';
        
        // Create main image container
        const mainContainer = document.createElement('div');
        mainContainer.className = 'gallery-viewer-main';
        
        // Create main image
        this.mainImage = document.createElement('img');
        this.mainImage.className = 'gallery-viewer-image';
        this.mainImage.alt = 'Gallery image';
        mainContainer.appendChild(this.mainImage);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'gallery-controls';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'gallery-btn gallery-prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Previous image');
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'gallery-btn gallery-next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Next image');
        
        controls.appendChild(prevBtn);
        controls.appendChild(nextBtn);
        
        // Create thumbnails container
        this.thumbsContainer = document.createElement('div');
        this.thumbsContainer.className = 'gallery-thumbs';
        
        // Create counter
        this.counter = document.createElement('div');
        this.counter.className = 'gallery-counter';
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'gallery-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.setAttribute('aria-label', 'Close gallery');
        
        // Add elements to DOM
        mainContainer.appendChild(controls);
        mainContainer.appendChild(this.counter);
        mainContainer.appendChild(closeBtn);
        content.appendChild(mainContainer);
        content.appendChild(this.thumbsContainer);
        this.overlay.appendChild(content);
        document.body.appendChild(this.overlay);
        
        // Set up event listeners
        prevBtn.addEventListener('click', () => this.showPrevImage());
        nextBtn.addEventListener('click', () => this.showNextImage());
        closeBtn.addEventListener('click', () => this.closeGallery());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeGallery();
            }
        });
    }
    
    /**
     * Bind events to gallery items
     */
    bindEvents() {
        // Find all gallery items in project modals
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const modalContainer = item.closest('.modal-container');
                if (modalContainer) {
                    // Get all gallery items in this modal
                    const items = modalContainer.querySelectorAll('.gallery-item');
                    const images = Array.from(items).map(item => ({
                        src: item.querySelector('img').src,
                        alt: item.querySelector('img').alt || 'Gallery image'
                    }));
                    
                    // Find the clicked index
                    const clickedIndex = Array.from(items).indexOf(item);
                    
                    // Open gallery with these images
                    this.openGallery(images, clickedIndex);
                }
            });
        });
    }
    
    /**
     * Open the gallery with specified images
     * @param {Array} images - Array of image objects with src and alt
     * @param {number} startIndex - Index to start from
     */
    openGallery(images, startIndex = 0) {
        if (!images || images.length === 0) return;
        
        this.images = images;
        this.currentIndex = startIndex;
        
        // Clear existing thumbnails
        this.thumbsContainer.innerHTML = '';
        
        // Create thumbnails
        this.images.forEach((image, idx) => {
            const thumb = document.createElement('img');
            thumb.className = 'gallery-thumb';
            thumb.src = image.src;
            thumb.alt = `Thumbnail ${idx + 1}`;
            
            if (idx === this.currentIndex) {
                thumb.classList.add('active');
            }
            
            thumb.addEventListener('click', () => {
                this.showImage(idx);
            });
            
            this.thumbsContainer.appendChild(thumb);
        });
        
        // Show the current image
        this.showImage(this.currentIndex);
        
        // Add active class to show the overlay
        this.overlay.classList.add('active');
        this.active = true;
        
        // Log to system log if available
        if (window.systemLog) {
            window.systemLog.addEntry('cmd', 'Action: OPEN_IMAGE_GALLERY', { 
                styleOverrides: {
                    timestamp: 'color: var(--theme-accent-primary); font-weight: bold;'
                }
            });
        }
        
        // Create and dispatch a custom event
        window.dispatchEvent(new CustomEvent('galleryOpened'));
        
        // Prevent body scrolling while gallery is open
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close the gallery
     */
    closeGallery() {
        this.overlay.classList.remove('active');
        this.active = false;
        
        // Allow body scrolling again
        document.body.style.overflow = '';
        
        // Create and dispatch a custom event
        window.dispatchEvent(new CustomEvent('galleryClosed'));
    }
    
    /**
     * Show a specific image by index
     * @param {number} index - Index of the image to show
     */
    showImage(index) {
        if (index < 0 || index >= this.images.length) return;
        
        this.currentIndex = index;
        
        // Add fade out class
        this.mainImage.classList.add('fade-out');
        
        // Change image after animation
        setTimeout(() => {
            // Update main image
            this.mainImage.src = this.images[index].src;
            this.mainImage.alt = this.images[index].alt;
            
            // Update thumbnails
            const thumbs = this.thumbsContainer.querySelectorAll('.gallery-thumb');
            thumbs.forEach((thumb, idx) => {
                if (idx === index) {
                    thumb.classList.add('active');
                } else {
                    thumb.classList.remove('active');
                }
            });
            
            // Update counter
            this.counter.textContent = `${index + 1} / ${this.images.length}`;
            
            // Remove fade out and add fade in
            this.mainImage.classList.remove('fade-out');
            this.mainImage.classList.add('fade-in');
            
            // Remove fade-in class after animation completes
            setTimeout(() => {
                this.mainImage.classList.remove('fade-in');
            }, 300);
        }, 300);
    }
    
    /**
     * Show the next image
     */
    showNextImage() {
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.images.length) {
            nextIndex = 0; // Loop back to the first image
        }
        this.showImage(nextIndex);
    }
    
    /**
     * Show the previous image
     */
    showPrevImage() {
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.images.length - 1; // Loop to the last image
        }
        this.showImage(prevIndex);
    }
    
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardNav(e) {
        if (!this.active) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                this.showPrevImage();
                break;
            case 'ArrowRight':
                this.showNextImage();
                break;
            case 'Escape':
                this.closeGallery();
                break;
        }
    }
}

// Initialize the gallery system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageGallery = new ImageGallery();
});
