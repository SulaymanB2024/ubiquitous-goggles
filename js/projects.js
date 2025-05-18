/**
 * Project filtering and modal functionality with timeline integration
 */
document.addEventListener('DOMContentLoaded', function() {
    // Current filter state
    const filterState = {
        category: 'all',
        timeRange: [2020, 2025]
    };
    
    // Elements
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const timelineContainer = document.getElementById('projects-timeline');
    const minYearDisplay = document.querySelector('.timeline-min-year');
    const maxYearDisplay = document.querySelector('.timeline-max-year');
    const modalContainers = document.querySelectorAll('.modal-container');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const relatedProjectItems = document.querySelectorAll('.related-project-item');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Initialize main system log
    console.log('Projects module initialized');
    
    /**
     * Update project cards based on current filter state
     */
    function updateProjectCards() {
        let visibleCount = 0;
        
        projectCards.forEach(card => {
            const categories = card.getAttribute('data-category')?.split(' ') || [];
            const year = parseInt(card.getAttribute('data-year') || 0);
            
            // Check if card matches category filter
            const matchesCategory = filterState.category === 'all' || categories.includes(filterState.category);
            
            // Check if card matches timeline filter
            const matchesTimeline = year >= filterState.timeRange[0] && year <= filterState.timeRange[1];
            
            // Show/hide card based on filter matches
            if (matchesCategory && matchesTimeline) {
                card.classList.remove('filtered-out');
                card.classList.add('filtered-in');
                setTimeout(() => card.style.display = 'block', 10);
                visibleCount++;
            } else {
                card.classList.remove('filtered-in');
                card.classList.add('filtered-out');
                setTimeout(() => card.style.display = 'none', 500);
            }
        });
        
        // Log the number of visible projects
        console.log(`Showing ${visibleCount} projects after filtering`);
        return visibleCount;
    }
    
    /**
     * Handle timeline filter change
     */
    function handleTimelineChange(range) {
        filterState.timeRange = range;
        
        // Update display
        if (minYearDisplay && maxYearDisplay) {
            minYearDisplay.textContent = range[0];
            maxYearDisplay.textContent = range[1];
        }
        
        // Update project cards
        updateProjectCards();
    }
    
    // Initialize timeline filter
    if (timelineContainer) {
        try {
            // Make the timelineFilter accessible globally
            window.timelineFilter = new TimelineFilter('projects-timeline', {
                minYear: 2020,
                maxYear: 2025,
                initialRange: [2020, 2023],
                onChange: handleTimelineChange
            });
            
            // Add event listener for reset button
            const resetButton = document.getElementById('reset-timeline');
            if (resetButton) {
                resetButton.addEventListener('click', function() {
                    window.timelineFilter.reset();
                    console.log('Timeline reset triggered');
                });
            }
            
            console.log('Timeline filter initialized with range:', filterState.timeRange);
        } catch (error) {
            console.error('Failed to initialize timeline filter:', error);
        }
    } else {
        console.warn('Timeline container not found in the DOM');
    }
    
    /**
     * Handle category filter button click
     */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to current button
            this.classList.add('active');
            
            // Update filter state
            filterState.category = this.getAttribute('data-filter');
            
            // Update project cards
            const visibleCount = updateProjectCards();
            
            // Log to system log if available
            if (window.systemLog) {
                window.systemLog.addEntry('info', `Filter applied: ${filterState.category}. Showing ${visibleCount} projects.`);
            }
        });
    });
    
    /**
     * Create and manage image preview functionality
     */
    function initializeGallery() {
        const imagePreviewContainer = document.createElement('div');
        imagePreviewContainer.className = 'image-preview-container';
        imagePreviewContainer.style.display = 'none';
        document.body.appendChild(imagePreviewContainer);
        
        function closeImagePreview() {
            imagePreviewContainer.style.display = 'none';
        }
        
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (!img) return;
                
                const imgSrc = img.src;
                const imgAlt = img.alt || 'Project image';
                
                // Create fullscreen image preview
                imagePreviewContainer.innerHTML = `
                    <div class="preview-overlay"></div>
                    <div class="preview-content">
                        <img src="${imgSrc}" alt="${imgAlt}">
                        <div class="preview-caption">${imgAlt}</div>
                        <button class="preview-close">&times;</button>
                    </div>
                `;
                imagePreviewContainer.style.display = 'flex';
                
                // Add close functionality
                const closeBtn = imagePreviewContainer.querySelector('.preview-close');
                const overlay = imagePreviewContainer.querySelector('.preview-overlay');
                
                if (closeBtn) closeBtn.addEventListener('click', closeImagePreview);
                if (overlay) overlay.addEventListener('click', closeImagePreview);
                
                // Log to system log if available
                if (window.systemLog) {
                    window.systemLog.addEntry('info', `Viewed image: ${imgAlt}`, { 
                        styleOverrides: {
                            timestamp: 'color: var(--theme-accent-secondary); font-style: italic;'
                        }
                    });
                }
            });
        });
        
        return { closeImagePreview };
    }
    
    // Initialize gallery functionality
    const gallery = initializeGallery();
    
    /**
     * Modal functionality
     */
    function initializeModals() {
        function closeModals() {
            modalContainers.forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = ''; // Enable scrolling
        }
        
        function openModal(id) {
            const modal = document.getElementById(id);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Disable scrolling
            }
        }
        
        // Close on X button click
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', closeModals);
        });
        
        // Close on overlay click
        modalOverlays.forEach(overlay => {
            overlay.addEventListener('click', closeModals);
        });
        
        // Connect related project items to modal system
        relatedProjectItems.forEach(item => {
            item.addEventListener('click', function() {
                const projectId = this.getAttribute('data-project');
                if (projectId) {
                    // Use the modal system if available
                    if (window.modalSystem) {
                        window.modalSystem.openModal(`modal-project-${projectId}`);
                    } else {
                        openModal(`modal-project-${projectId}`);
                    }
                }
            });
        });
        
        return { closeModals, openModal };
    }
    
    // Initialize modal functionality
    const modals = initializeModals();
    
    // Close modals and image preview on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.closeModals();
            gallery.closeImagePreview();
        }
    });
    
    // Initial display update
    updateProjectCards();
    console.log('Project card initialization complete.');
});
