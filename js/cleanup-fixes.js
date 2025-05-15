/**
 * Cleanup script for fixing common issues and enhancing UI
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
        
        // Enhance project grid with improved interactive elements
        enhanceProjectGrid();
        
        // Make sure view details buttons are properly styled and clickable
        const projectButtons = document.querySelectorAll('.btn-project');
        projectButtons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.position = 'relative';
            btn.style.zIndex = '5';
        });
        
        // Use the modal system if available, otherwise apply overlay click fix
        if (window.modalSystem) {
            console.log('Modal system detected, skipping legacy modal fixes');
        } else {
            console.log('Modal system not detected, applying legacy modal fixes');
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
        }
        
        // Enhance the sidebar with improved accessibility features and active state detection
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            // Add keyboard accessibility for sidebar items
            const sidebarItems = sidebar.querySelectorAll('.sidebar-item');
            
            // Get current section from URL hash or default to first section
            const currentHash = window.location.hash || '#about';
            const currentSection = currentHash.substring(1);
            
            sidebarItems.forEach(item => {
                // Ensure proper focus styling
                if (!item.getAttribute('tabindex')) {
                    item.setAttribute('tabindex', '0');
                }
                
                // Add keyboard event listener for enter key
                item.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.click();
                    }
                });
                
                // Set active state based on current section
                const itemSection = item.getAttribute('data-section');
                if (itemSection === currentSection) {
                    item.classList.add('active');
                }
                
                // Add ARIA attributes for accessibility
                item.setAttribute('role', 'menuitem');
                item.setAttribute('aria-label', `Navigate to ${item.querySelector('.sidebar-item-label').textContent} section`);
            });
            
            // Standardize icon sizes and alignment
            const icons = sidebar.querySelectorAll('.sidebar-item-icon i');
            icons.forEach(icon => {
                // Set fixed width for consistent alignment
                icon.classList.add('fa-fw');
            });
            
            // Add scroll spy for active state updates
            window.addEventListener('scroll', () => {
                const sections = document.querySelectorAll('section[id]');
                let currentSectionId = '';
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 100;
                    const sectionHeight = section.offsetHeight;
                    if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                        currentSectionId = section.getAttribute('id');
                    }
                });
                
                if (currentSectionId) {
                    sidebarItems.forEach(item => {
                        const itemSection = item.getAttribute('data-section');
                        if (itemSection === currentSectionId) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            });
            
            console.log('Enhanced sidebar with accessibility and active state detection');
        }
        
        // Improve info panel functionality
        const infoPanel = document.querySelector('.info-panel');
        if (infoPanel) {
            // Add smooth transition for info panel
            infoPanel.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            
            // Add keyboard support for info panel close button
            const closeButton = infoPanel.querySelector('.info-panel-close');
            if (closeButton) {
                closeButton.setAttribute('tabindex', '0');
                closeButton.setAttribute('aria-label', 'Close information panel');
                
                // Add proper focus when panel opens
                document.addEventListener('infoPanelOpened', function() {
                    setTimeout(() => closeButton.focus(), 100);
                });
            }
            
            console.log('Enhanced info panel functionality');
        }
        
        // Improve command palette accessibility
        const commandPalette = document.querySelector('.command-palette-overlay');
        if (commandPalette) {
            // Ensure proper focus management
            const inputField = commandPalette.querySelector('input');
            if (inputField) {
                document.addEventListener('commandPaletteOpened', function() {
                    setTimeout(() => inputField.focus(), 100);
                });
            }
            
            console.log('Enhanced command palette accessibility');
        }
        
        // Enhance section titles with texture layer and reveal animations
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            // Add texture layer for enhanced visual depth
            const textureLayer = document.createElement('span');
            textureLayer.className = 'texture-layer';
            title.appendChild(textureLayer);
            
            // Enhance reveal animation
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        title.classList.add('reveal-active');
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(title);
        });
        
        console.log('Section titles enhanced with texture and animations');
        
        // Add navbar scroll opacity adjustment
        const navbar = document.getElementById('navbar');
        if (navbar) {
            // Initial transparency for navbar
            const updateNavbarOpacity = () => {
                const scrollPosition = window.scrollY;
                const heroHeight = document.getElementById('hero')?.offsetHeight || 800;
                
                // Calculate opacity based on scroll position
                // More transparent at top, more opaque as user scrolls down
                let opacity = 0.8 + (scrollPosition / heroHeight) * 0.2;
                opacity = Math.min(Math.max(opacity, 0.8), 0.98); // Clamp between 0.8 and 0.98
                
                // Calculate blur based on scroll position
                let blur = 16 + (scrollPosition / heroHeight) * 10;
                blur = Math.min(Math.max(blur, 16), 25); // Clamp between 16px and 25px
                
                // Apply the new styles
                navbar.style.backgroundColor = `rgba(var(--theme-dark-bg-rgb), ${opacity})`;
                navbar.style.backdropFilter = `blur(${blur}px)`;
                navbar.style.webkitBackdropFilter = `blur(${blur}px)`;
                
                // Add shadow as user scrolls down
                if (scrollPosition > 50) {
                    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
                } else {
                    navbar.style.boxShadow = 'none';
                }
            };
            
            // Update on scroll
            window.addEventListener('scroll', updateNavbarOpacity);
            
            // Initial call
            updateNavbarOpacity();
            
            console.log('Navbar scroll opacity adjustment enabled');
        }
        
        console.log('Cleanup script executed successfully');
    }, 1000);
});

/**
 * Enhances the project grid with better filtering, animations, and interactions
 */
function enhanceProjectGrid() {
    const projectCards = document.querySelectorAll('.project-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Add year badges to project cards if they don't exist
    projectCards.forEach(card => {
        const year = card.getAttribute('data-year');
        if (year && !card.querySelector('.project-year-badge')) {
            const badge = document.createElement('div');
            badge.className = 'project-year-badge';
            badge.textContent = year;
            const imageContainer = card.querySelector('.project-image');
            if (imageContainer) {
                imageContainer.appendChild(badge);
            }
            console.log(`Added year badge to project: ${year}`);
        }
    });
    
    // Improve filter button interactions
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            // Add ripple effect
            btn.classList.add('with-ripple');
            
            // Add keyboard support
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
            
            // Add click handler with improved animations
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-filter');
                
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Animate project grid
                const projectsGrid = document.querySelector('.projects-grid');
                if (projectsGrid) {
                    projectsGrid.classList.add('filtering');
                }
                
                // Filter projects with staggered animations
                setTimeout(() => {
                    let visibleCount = 0;
                    
                    projectCards.forEach((card, index) => {
                        const cardCategories = card.getAttribute('data-category').split(' ');
                        const shouldShow = category === 'all' || cardCategories.includes(category);
                        
                        // Remove previous animation classes
                        card.classList.remove('filtered-in', 'filtered-out');
                        
                        if (shouldShow) {
                            // Calculate staggered delay
                            const staggerDelay = 50 * visibleCount;
                            card.style.transitionDelay = staggerDelay + 'ms';
                            card.classList.add('filtered-in');
                            card.style.display = '';
                            visibleCount++;
                        } else {
                            card.classList.add('filtered-out');
                            setTimeout(() => {
                                if (card.classList.contains('filtered-out')) {
                                    card.style.display = 'none';
                                }
                            }, 300);
                        }
                    });
                    
                    // Remove transition delays after animation completes
                    setTimeout(() => {
                        projectCards.forEach(card => {
                            card.style.transitionDelay = '';
                        });
                        
                        if (projectsGrid) {
                            projectsGrid.classList.remove('filtering');
                        }
                    }, 500);
                }, 100);
            });
        });
        
        console.log('Enhanced project filter buttons with improved interactions');
    }
    
    // Make project cards more interactive
    projectCards.forEach(card => {
        // Add focus state for keyboard navigation
        card.setAttribute('tabindex', '0');
        
        // Add keyboard support for viewing project
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const button = card.querySelector('.btn-project');
                if (button) {
                    button.click();
                }
            }
        });
    });
    
    console.log('Project grid enhancement complete');
}
