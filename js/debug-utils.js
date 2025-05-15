/**
 * Debug Utilities for troubleshooting interactive elements
 */

const DebugUtils = {
    /**
     * Initialize debug logging
     */
    init() {
        console.log('Debug utilities initialized');
        this.initModalDebugging();
        this.initTimelineDebugging();
    },

    /**
     * Add debugging for modals
     */
    initModalDebugging() {
        // Debug modal buttons
        const projectBtns = document.querySelectorAll('.btn-project');
        projectBtns.forEach(btn => {
            const projectId = btn.getAttribute('data-project');
            btn.addEventListener('click', () => {
                console.group('Modal Debugging');
                console.log(`Button clicked for project: ${projectId}`);
                const modalElement = document.getElementById(`modal-${projectId}`);
                console.log('Modal element:', modalElement);
                if (!modalElement) {
                    console.error(`Modal not found with ID: modal-${projectId}`);
                    console.log('Available modals:');
                    document.querySelectorAll('.modal-container').forEach(modal => {
                        console.log(` - ${modal.id}`);
                    });
                }
                console.groupEnd();
            });
        });
    },

    /**
     * Add debugging for timeline
     */
    initTimelineDebugging() {
        // Monitor timeline handles in the DOM
        if (window.timelineFilter) {
            console.log('Timeline filter found:', window.timelineFilter);
            
            // Log when timeline range changes
            const originalOnChange = window.timelineFilter.options.onChange;
            if (originalOnChange) {
                window.timelineFilter.options.onChange = function(range) {
                    console.group('Timeline Range Change');
                    console.log(`New range: ${range[0]} - ${range[1]}`);
                    
                    // Log handle positions
                    const minPos = window.timelineFilter.getHandlePosition('min');
                    const maxPos = window.timelineFilter.getHandlePosition('max');
                    console.log(`Handle positions - Min: ${minPos.toFixed(2)}%, Max: ${maxPos.toFixed(2)}%`);
                    
                    console.groupEnd();
                    originalOnChange(range);
                };
            }
        } else {
            console.warn('Timeline filter not found in window object');
            // Try to find the timeline element
            const timelineElement = document.getElementById('projects-timeline');
            if (timelineElement) {
                console.log('Timeline element found, but no filter instance');
            } else {
                console.error('Timeline element not found in the DOM');
            }
        }
    }
};

// Initialize debugging after DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        DebugUtils.init();
    }, 1000); // Delay to ensure other scripts have initialized
});
