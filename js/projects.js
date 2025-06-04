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
    
    // Initialize main system log
    console.log('Projects module initialized');
    
    // Initialize timeline filter
    if (timelineContainer) {
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
    } else {
        console.error('Timeline container not found in the DOM');
    }
    
    /**
     * Update project cards based on current filter state
     */
    function updateProjectCards() {
        projectCards.forEach(card => {
            const categories = card.getAttribute('data-category').split(' ');
            const year = parseInt(card.getAttribute('data-year'));
            
            // Check if card matches category filter
            const matchesCategory = filterState.category === 'all' || categories.includes(filterState.category);
            
            // Check if card matches timeline filter
            const matchesTimeline = year >= filterState.timeRange[0] && year <= filterState.timeRange[1];
            
            // Show/hide card based on filter matches
            if (matchesCategory && matchesTimeline) {
                card.classList.remove('filtered-out');
                card.classList.add('filtered-in');
                setTimeout(() => card.style.display = 'block', 10);
            } else {
                card.classList.remove('filtered-in');
                card.classList.add('filtered-out');
                setTimeout(() => card.style.display = 'none', 500);
            }
        });
    }
    
    /**
     * Handle category filter button click
     */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to current button
            this.classList.add('active');
            
            // Update filter state
            filterState.category = this.getAttribute('data-filter');
            
            // Update project cards
            updateProjectCards();
        });
    });
    
    /**
     * Handle timeline filter change
     */
    function handleTimelineChange(range) {
        filterState.timeRange = range;
        
        // Update display
        minYearDisplay.textContent = range[0];
        maxYearDisplay.textContent = range[1];
        
        // Update project cards
        updateProjectCards();
    }
    
    // Project modal functionality is now handled by modal.js
    console.log('Project card initialization complete.');

    // Initialize related projects functionality
    const relatedProjectItems = document.querySelectorAll('.related-project-item');

    // Connect related project items to modal system
    relatedProjectItems.forEach(item => {
        item.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');

            // Use the modal system if available
            if (window.modalSystem) {
                window.modalSystem.openModal(`modal-project-${projectId}`);
            }
        });
    });

    // Gallery item interactions are handled by image-gallery.js
});
