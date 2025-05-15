/**
 * Cleanup script for fixing common issues
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix timeline year displays if they're empty
    setTimeout(() => {
        const minYearDisplay = document.querySelector('.timeline-min-year');
        const maxYearDisplay = document.querySelector('.timeline-max-year');
        
        if (minYearDisplay && !minYearDisplay.textContent) {
            minYearDisplay.textContent = '2020';
            console.log('Fixed empty min year display');
        }
        
        if (maxYearDisplay && !maxYearDisplay.textContent) {
            maxYearDisplay.textContent = '2025';
            console.log('Fixed empty max year display');
        }
        
        // Make sure view details buttons are properly styled and clickable
        const projectButtons = document.querySelectorAll('.btn-project');
        projectButtons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.position = 'relative';
            btn.style.zIndex = '5';
        });
        
        // Fix issue where modals close too quickly
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        modalOverlays.forEach(overlay => {
            const originalOnClick = overlay.onclick;
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    e.preventDefault();
                    e.stopPropagation();
                    const modalContainer = overlay.parentElement;
                    if (modalContainer && modalContainer.classList.contains('modal-container')) {
                        modalContainer.classList.remove('active');
                        document.body.style.overflow = ''; // Enable scrolling
                        console.log('Modal closed via overlay click');
                    }
                }
            };
        });
        
        console.log('Cleanup script executed successfully');
    }, 1000);
});
