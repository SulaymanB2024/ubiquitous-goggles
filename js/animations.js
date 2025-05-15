/**
 * Scroll reveal animations
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Scroll reveal animation
    const revealElements = document.querySelectorAll('.revealable');
    
    function checkReveal() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        revealElements.forEach(element => {
            const revealTop = element.getBoundingClientRect().top;
            
            if (revealTop < windowHeight - revealPoint) {
                // Add delay if specified
                const delay = element.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    element.classList.add('active');
                }, delay * 1000);
            }
        });
    }
    
    // Animate skill bars when in viewport
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress-bar');
        if (skillBars.length === 0) return;
        
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        skillBars.forEach(bar => {
            const barTop = bar.getBoundingClientRect().top;
            const width = bar.parentElement.parentElement.querySelector('.skill-percentage').textContent;
            
            if (barTop < windowHeight - revealPoint) {
                bar.style.width = width;
            } else {
                bar.style.width = '0';
            }
        });
    }
    
    window.addEventListener('scroll', checkReveal);
    window.addEventListener('scroll', animateSkillBars);
    window.addEventListener('load', checkReveal);
    window.addEventListener('load', animateSkillBars);
    checkReveal(); // Initial check
    animateSkillBars(); // Initial check
});
