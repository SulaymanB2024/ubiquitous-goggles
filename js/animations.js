/**
 * Palantir-style advanced animations and visual effects
 * Enhanced scroll reveal, parallax, staggered animations, and interactive effects
 * @version 1.3.0
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Enhanced animation configuration
    const animationConfig = {
        // Text animation settings
        text: {
            charDelay: 30,          // Delay between characters in ms
            wordDelay: 80,          // Delay between words in ms
            lineDelay: 150,         // Delay between lines in ms
            sentenceDelay: 300,     // Delay between sentences in ms
            useAdvancedEffects: true, // Enable advanced text effects
            glitchProbability: 0.2, // Probability of glitch effect on text
            highlightDelay: 800,    // Delay before highlighting keywords
            glossaryTerms: ['algorithm', 'strategic', 'leadership', 'innovation', 'protocol'],
            glossaryClass: 'glossary-term'
        },
        
        // Transition settings
        transitions: {
            defaultDuration: 800,    // Default transition duration in ms
            defaultEasing: 'cubic-bezier(0.16, 1, 0.3, 1)', // Default easing function
            staggerDelay: 50,        // Delay between staggered elements
            pageTransitionDuration: 600, // Page transition duration
            useAdvancedTransitions: true, // Enable advanced transitions
            transitionDistance: 30,  // Default distance for transitions in px
        },
        
        // Performance settings
        performance: {
            adaptiveEffects: true,  // Reduce effects on low-end devices
            fpsThreshold: 40,       // FPS threshold for reducing effects
            maxParticlesPerElement: 15, // Max particle count per element
            debounceScrollDelay: 16, // Scroll debounce delay in ms
            useRequestAnimationFrame: true // Use requestAnimationFrame for animations
        }
    };
    
    // Initialize all animation systems with enhanced configuration
    initScrollRevealSystem(animationConfig);
    initParallaxSystem(animationConfig);
    initStaggeredTextAnimations(animationConfig);
    initInteractiveElements(animationConfig);
    initAdvancedTextEffects(animationConfig);
    initEnhancedPageTransitions(animationConfig);
    
    // Performance measurement
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    
    // Debounced scroll handler for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        // Clear the timeout if it has been set
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        // Set a timeout to run after scrolling ends
        scrollTimeout = window.requestAnimationFrame(() => {
            // Measure FPS
            const now = performance.now();
            const delta = now - lastFrameTime;
            if (delta > 1000) { // Update FPS every second
                fps = frameCount * 1000 / delta;
                frameCount = 0;
                lastFrameTime = now;
                
                // Adapt effects based on performance
                if (animationConfig.performance.adaptiveEffects) {
                    adjustEffectsForPerformance(fps, animationConfig);
                }
                
                // Log FPS if it drops below threshold
                if (fps < animationConfig.performance.fpsThreshold && window.SystemLog) {
                    window.SystemLog.addEntry({
                        type: 'performance',
                        message: `Low animation performance: ${fps.toFixed(1)} FPS`,
                        timestamp: new Date()
                    });
                    
                    // Publish event for other components to reduce their effects
                    if (window.EventBus) {
                        window.EventBus.publish('performance:low', { fps: fps });
                    }
                }
            }
            frameCount++;
            
            // Run animation checks
            checkReveal();
            animateSkillBars();
            updateParallaxElements();
        });
    });
    
    // Run initial animations
    window.addEventListener('load', () => {
        checkReveal();
        animateSkillBars();
        updateParallaxElements();
        runHeadingAnimations();
    });
    
    // Run animations on initial load without waiting for load event
    checkReveal();
    animateSkillBars();
    updateParallaxElements();
});

/**
 * Initialize scroll reveal animation system
 */
function initScrollRevealSystem(animationConfig) {
    // Global variables
    window.animationElements = {
        revealable: document.querySelectorAll('.revealable'),
        skillBars: document.querySelectorAll('.skill-progress-bar'),
        parallaxLayers: document.querySelectorAll('[data-parallax]'),
        headings: document.querySelectorAll('.animate-heading')
    };
    
    // Enhanced reveal checks
    window.checkReveal = function() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        window.animationElements.revealable.forEach(element => {
            const revealTop = element.getBoundingClientRect().top;
            
            if (revealTop < windowHeight - revealPoint) {
                // Get animation style if specified
                const animationType = element.getAttribute('data-animation') || 'fade-up';
                const delay = parseFloat(element.getAttribute('data-delay') || 0);
                const duration = parseFloat(element.getAttribute('data-duration') || 0.7);
                
                // Apply appropriate animation class with delay
                setTimeout(() => {
                    element.classList.add('active');
                    element.classList.add(animationType);
                    element.style.animationDuration = `${duration}s`;
                    
                    // Add pulse/glow effect for elements with data-glow attribute
                    if (element.hasAttribute('data-glow')) {
                        element.classList.add('glow-effect');
                    }
                }, delay * 1000);
            }
        });
    };
    
    // Animate skill bars when in viewport
    window.animateSkillBars = function() {
        const skillBars = window.animationElements.skillBars;
        if (skillBars.length === 0) return;
        
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        skillBars.forEach(bar => {
            const barTop = bar.getBoundingClientRect().top;
            const width = bar.parentElement.parentElement.querySelector('.skill-percentage').textContent;
            
            if (barTop < windowHeight - revealPoint) {
                // Add the width with an animated striped effect
                bar.style.width = width;
                bar.classList.add('animate-progress');
                
                // Add pulsing glow effect
                bar.parentElement.classList.add('pulse-glow');
            } else {
                bar.style.width = '0';
                bar.classList.remove('animate-progress');
                bar.parentElement.classList.remove('pulse-glow');
            }
        });
    };
}

/**
 * Initialize parallax scroll effect system
 */
function initParallaxSystem(animationConfig) {
    // Update parallax elements on scroll
    window.updateParallaxElements = function() {
        const parallaxLayers = window.animationElements.parallaxLayers;
        if (parallaxLayers.length === 0) return;
        
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-parallax') || 0.2);
            const offset = window.pageYOffset * speed;
            
            // Apply transform based on layer's data-parallax-direction
            const direction = layer.getAttribute('data-parallax-direction') || 'y';
            
            if (direction === 'y') {
                layer.style.transform = `translateY(${offset}px)`;
            } else if (direction === 'x') {
                layer.style.transform = `translateX(${offset}px)`;
            } else if (direction === 'scale') {
                const scale = 1 + (offset * 0.001);
                layer.style.transform = `scale(${scale})`;
            }
        });
    };
}

/**
 * Initialize staggered text animations for headings
 */
function initStaggeredTextAnimations(animationConfig) {
    // Setup heading animations - splits text into letters for staggered animation
    const headings = window.animationElements.headings;
    
    headings.forEach(heading => {
        const text = heading.textContent;
        heading.textContent = ''; // Clear text
        
        // Create spans for each letter with staggered delays
        [...text].forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space for spaces
            span.style.animationDelay = `${index * 0.03}s`; // 30ms between letters
            span.className = 'animate-letter';
            heading.appendChild(span);
        });
    });
    
    // Function to trigger heading animations when in viewport
    window.runHeadingAnimations = function() {
        const windowHeight = window.innerHeight;
        
        headings.forEach(heading => {
            const headingTop = heading.getBoundingClientRect().top;
            
            if (headingTop < windowHeight - 100) {
                heading.classList.add('animate-heading-active');
            }
        });
    };
    
    // Add scroll listener specifically for heading animations
    window.addEventListener('scroll', window.runHeadingAnimations);
}

/**
 * Initialize interactive element effects (hover glows, click particles)
 */
function initInteractiveElements(animationConfig) {
    // Add interactive effects to buttons and cards
    const interactiveElements = document.querySelectorAll('.btn, .card, .interactive-element');
    
    interactiveElements.forEach(element => {
        // Add hover glow effect
        element.addEventListener('mouseenter', () => {
            element.classList.add('hover-glow');
        });
        
        element.addEventListener('mouseleave', () => {
            element.classList.remove('hover-glow');
        });
        
        // Add click particle effect
        element.addEventListener('click', (e) => {
            createClickParticles(e.clientX, e.clientY, element);
        });
    });
}

/**
 * Create particle effects on click
 */
function createClickParticles(x, y, sourceElement) {
    // Create particle container if it doesn't exist
    let particleContainer = document.querySelector('.particle-container');
    if (!particleContainer) {
        particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        document.body.appendChild(particleContainer);
    }
    
    // Get accent color from the source element or use default
    const computedStyle = window.getComputedStyle(sourceElement);
    const elementColor = computedStyle.getPropertyValue('--theme-accent-primary') || '#04A3FF';
    
    // Create multiple particles
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        
        // Random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        
        // Calculate end position
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        // Set particle properties
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = elementColor;
        particle.style.setProperty('--end-x', `${endX}px`);
        particle.style.setProperty('--end-y', `${endY}px`);
        
        // Add to container and start animation
        particleContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

/**
 * Initialize advanced text effects for headings and important content
 * @param {Object} config - Animation configuration
 */
function initAdvancedTextEffects(config) {
    // Find headings and important text elements to apply effects
    const headings = document.querySelectorAll('h1, h2, h3, .hero-title, .section-title, .highlight-text');
    const paragraphs = document.querySelectorAll('.important-text, .hero-subtitle, .section-description');
    
    // Apply different effects based on element type
    headings.forEach(heading => {
        const effect = determineTextEffect(heading);
        applyTextEffect(heading, effect, config);
    });
    
    paragraphs.forEach(paragraph => {
        // Process glossary terms
        processGlossaryTerms(paragraph, config);
        
        // For important paragraphs, apply subtle effects
        if (paragraph.classList.contains('important-text') || 
            paragraph.classList.contains('hero-subtitle')) {
            applyTextEffect(paragraph, 'subtle-highlight', config);
        }
    });
    
    // Setup observers for elements that need dynamic text effects
    setupDynamicTextEffectObservers(config);
}

/**
 * Determine which text effect to apply based on element characteristics
 * @param {Element} element - The text element
 * @return {string} - The effect name to apply
 */
function determineTextEffect(element) {
    // Hero titles and major headings get the most dramatic effects
    if (element.classList.contains('hero-title') || 
        element.tagName === 'H1') {
        return Math.random() < 0.5 ? 'character-reveal' : 'split-line';
    }
    
    // Section titles get medium effects
    if (element.classList.contains('section-title') || 
        element.tagName === 'H2') {
        return Math.random() < 0.3 ? 'glitch' : 'fade-up-stagger';
    }
    
    // Other headings get subtler effects
    if (element.classList.contains('highlight-text') || 
        element.tagName === 'H3') {
        return 'highlight-sweep';
    }
    
    // Default effect
    return 'fade-in';
}

/**
 * Apply a specific text effect to an element
 * @param {Element} element - The element to apply the effect to
 * @param {string} effectName - The name of the effect to apply
 * @param {Object} config - Animation configuration
 */
function applyTextEffect(element, effectName, config) {
    // Skip if element already has an effect applied
    if (element.hasAttribute('data-effect-applied')) return;
    
    // Mark element as having an effect applied
    element.setAttribute('data-effect-applied', effectName);
    
    // Apply different effects based on name
    switch (effectName) {
        case 'character-reveal':
            applyCharacterRevealEffect(element, config);
            break;
        case 'split-line':
            applySplitLineEffect(element, config);
            break;
        case 'glitch':
            applyGlitchEffect(element, config);
            break;
        case 'fade-up-stagger':
            applyFadeUpStaggerEffect(element, config);
            break;
        case 'highlight-sweep':
            applyHighlightSweepEffect(element, config);
            break;
        case 'subtle-highlight':
            applySubtleHighlightEffect(element, config);
            break;
        default:
            // Simple fade-in effect
            element.style.opacity = '0';
            element.style.transition = `opacity ${config.transitions.defaultDuration}ms ${config.transitions.defaultEasing}`;
            
            setTimeout(() => {
                element.style.opacity = '1';
            }, 100);
    }
}

/**
 * Apply character-by-character reveal animation
 * @param {Element} element - The element to animate
 * @param {Object} config - Animation configuration
 */
function applyCharacterRevealEffect(element, config) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    // Create wrapper for the animation
    const wrapper = document.createElement('span');
    wrapper.className = 'char-reveal-wrapper';
    element.appendChild(wrapper);
    
    // Add each character with staggered delay
    [...text].forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'animated-char';
        charSpan.textContent = char === ' ' ? '\u00A0' : char;
        charSpan.style.animationDelay = `${index * config.text.charDelay}ms`;
        wrapper.appendChild(charSpan);
    });
    
    // Add a random glitch effect to some characters if enabled
    if (config.text.useAdvancedEffects) {
        const chars = wrapper.querySelectorAll('.animated-char');
        chars.forEach(char => {
            if (Math.random() < config.text.glitchProbability && char.textContent.trim() !== '') {
                char.classList.add('char-glitch');
            }
        });
    }
}

/**
 * Apply split line animation effect
 * @param {Element} element - The element to animate
 * @param {Object} config - Animation configuration
 */
function applySplitLineEffect(element, config) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    // Split text into lines
    const lines = text.split('\n');
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'split-line-wrapper';
    element.appendChild(wrapper);
    
    // Add each line with animation
    lines.forEach((line, lineIndex) => {
        const lineWrapper = document.createElement('div');
        lineWrapper.className = 'split-line';
        lineWrapper.style.animationDelay = `${lineIndex * config.text.lineDelay}ms`;
        
        const lineSpan = document.createElement('span');
        lineSpan.textContent = line;
        lineWrapper.appendChild(lineSpan);
        
        wrapper.appendChild(lineWrapper);
    });
}

/**
 * Apply glitch text effect
 * @param {Element} element - The element to animate
 * @param {Object} config - Animation configuration
 */
function applyGlitchEffect(element, config) {
    const text = element.textContent;
    element.innerHTML = `
        <span class="glitch-text" data-text="${text}">${text}</span>
    `;
    
    // Add random glitch animation trigger
    if (config.text.useAdvancedEffects) {
        const glitchElement = element.querySelector('.glitch-text');
        
        // Random glitch effect occasionally
        setInterval(() => {
            if (Math.random() < 0.3 && isElementInViewport(element)) {
                glitchElement.classList.add('active');
                setTimeout(() => {
                    glitchElement.classList.remove('active');
                }, 500 + Math.random() * 500);
            }
        }, 5000);
        
        // Glitch on hover
        element.addEventListener('mouseenter', () => {
            glitchElement.classList.add('active');
        });
        
        element.addEventListener('mouseleave', () => {
            setTimeout(() => {
                glitchElement.classList.remove('active');
            }, 200);
        });
    }
}

/**
 * Apply fade-up with staggered word animation
 * @param {Element} element - The element to animate
 * @param {Object} config - Animation configuration
 */
function applyFadeUpStaggerEffect(element, config) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    // Split text into words
    const words = text.split(' ');
    
    // Create wrapper
    const wrapper = document.createElement('span');
    wrapper.className = 'fade-up-stagger-wrapper';
    element.appendChild(wrapper);
    
    // Add each word with staggered animation
    words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'animated-word';
        wordSpan.textContent = word;
        wordSpan.style.animationDelay = `${index * config.text.wordDelay}ms`;
        
        // Add space after each word except the last
        if (index < words.length - 1) {
            wordSpan.textContent += ' ';
        }
        
        wrapper.appendChild(wordSpan);
    });
}

/**
 * Apply highlight sweep effect for section headers
 * @param {Element} element - The element to animate
 * @param {Object} config - Animation configuration
 */
function applyHighlightSweepEffect(element, config) {
    // Add highlight class to enable the sweep effect
    element.classList.add('highlight-sweep');
    
    // Create the highlight element
    const highlight = document.createElement('span');
    highlight.className = 'highlight-sweep-effect';
    element.appendChild(highlight);
    
    // Set up intersection observer to trigger the effect when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(element);
}

/**
 * Apply subtle highlight effect for paragraphs
 * @param {Element} element - The element to apply effect to
 * @param {Object} config - Animation configuration
 */
function applySubtleHighlightEffect(element, config) {
    // Split text into words and add subtle highlight to important ones
    const text = element.textContent;
    element.textContent = '';
    
    // Split text into words
    const words = text.split(' ');
    
    // List of important words that should be highlighted
    const importantWordPatterns = [
        /strateg/i, /lead/i, /innovat/i, /technolog/i, /solution/i, 
        /expert/i, /vision/i, /mission/i, /impact/i, /transform/i
    ];
    
    // Add each word, highlighting important ones
    words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        
        // Check if this word should be highlighted
        const isImportant = importantWordPatterns.some(pattern => pattern.test(word));
        
        if (isImportant && config.text.useAdvancedEffects) {
            wordSpan.className = 'highlighted-word';
            wordSpan.style.animationDelay = `${config.text.highlightDelay + index * 100}ms`;
        }
        
        wordSpan.textContent = word;
        
        // Add space after each word except the last
        if (index < words.length - 1) {
            wordSpan.textContent += ' ';
        }
        
        element.appendChild(wordSpan);
    });
    
    // Add entrance animation to the whole element
    element.style.opacity = '0';
    element.style.transform = `translateY(${config.transitions.transitionDistance}px)`;
    element.style.transition = `
        opacity ${config.transitions.defaultDuration}ms ${config.transitions.defaultEasing},
        transform ${config.transitions.defaultDuration}ms ${config.transitions.defaultEasing}
    `;
    
    // Set up intersection observer to trigger animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(element);
}

/**
 * Process glossary terms in text content
 * @param {Element} element - The element to process
 * @param {Object} config - Animation configuration
 */
function processGlossaryTerms(element, config) {
    if (!config.text.useAdvancedEffects) return;
    
    // Create a regex pattern for all glossary terms
    const glossaryPattern = new RegExp(`\\b(${config.text.glossaryTerms.join('|')})\\b`, 'gi');
    
    // Replace content with highlighted terms
    element.innerHTML = element.innerHTML.replace(glossaryPattern, (match) => {
        return `<span class="${config.text.glossaryClass}" title="Click for definition">${match}</span>`;
    });
    
    // Add click handler for glossary terms
    element.querySelectorAll(`.${config.text.glossaryClass}`).forEach(term => {
        term.addEventListener('click', (e) => {
            showTermDefinition(e.target.textContent.toLowerCase(), e.target, config);
        });
    });
}

/**
 * Show definition popup for a glossary term
 * @param {string} term - The term to show definition for
 * @param {Element} targetElement - The element that was clicked
 * @param {Object} config - Animation configuration
 */
function showTermDefinition(term, targetElement, config) {
    // Simple dictionary of terms and definitions
    const definitions = {
        'algorithm': 'A process or set of rules to be followed in calculations or other problem-solving operations.',
        'strategic': 'Relating to the identification of long-term or overall aims and interests and the means of achieving them.',
        'leadership': 'The action of leading a group of people or an organization, or the ability to do this.',
        'innovation': 'The action or process of innovating; a new method, idea, product, etc.',
        'protocol': 'A set of rules governing the exchange or transmission of data between devices.'
    };
    
    // Create or update definition popup
    let popup = document.querySelector('.term-definition-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.className = 'term-definition-popup';
        document.body.appendChild(popup);
    }
    
    // Get definition or default message
    const definition = definitions[term] || 'Definition not available.';
    
    // Update popup content
    popup.innerHTML = `
        <div class="term-header">
            <span class="term-label">${term}</span>
            <button class="term-close">&times;</button>
        </div>
        <div class="term-definition">${definition}</div>
    `;
    
    // Position popup near the target element
    const rect = targetElement.getBoundingClientRect();
    popup.style.top = `${window.scrollY + rect.bottom + 10}px`;
    popup.style.left = `${window.scrollX + rect.left}px`;
    
    // Show popup with animation
    popup.style.opacity = '0';
    popup.style.transform = 'translateY(10px)';
    popup.style.display = 'block';
    
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
    }, 10);
    
    // Add close button handler
    popup.querySelector('.term-close').addEventListener('click', () => {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    });
    
    // Close when clicking outside
    document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target) && e.target !== targetElement) {
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
            
            document.removeEventListener('click', closePopup);
        }
    });
}

/**
 * Initialize enhanced page transitions
 * @param {Object} config - Animation configuration
 */
function initEnhancedPageTransitions(config) {
    if (!config.transitions.useAdvancedTransitions) return;
    
    // Create page transition overlay
    let transitionOverlay = document.querySelector('.page-transition-overlay');
    if (!transitionOverlay) {
        transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'page-transition-overlay';
        document.body.appendChild(transitionOverlay);
    }
    
    // Intercept link clicks for internal navigation
    document.querySelectorAll('a').forEach(link => {
        // Only apply to internal links
        if (link.hostname === window.location.hostname && 
            !link.href.includes('#') && 
            !link.target && 
            !link.hasAttribute('data-no-transition')) {
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.href;
                
                // Animate overlay in
                transitionOverlay.style.transform = 'scaleX(0)';
                transitionOverlay.style.transformOrigin = 'left';
                transitionOverlay.style.display = 'block';
                
                setTimeout(() => {
                    transitionOverlay.style.transform = 'scaleX(1)';
                }, 10);
                
                // Navigate after animation completes
                setTimeout(() => {
                    window.location.href = target;
                }, config.transitions.pageTransitionDuration);
            });
        }
    });
    
    // Handle page load transition
    window.addEventListener('load', () => {
        // If overlay exists, animate it out
        if (transitionOverlay) {
            transitionOverlay.style.transform = 'scaleX(1)';
            transitionOverlay.style.transformOrigin = 'right';
            
            setTimeout(() => {
                transitionOverlay.style.transform = 'scaleX(0)';
            }, 100);
            
            setTimeout(() => {
                transitionOverlay.style.display = 'none';
            }, config.transitions.pageTransitionDuration + 100);
        }
    });
}

/**
 * Adjust animation effects based on device performance
 * @param {number} fps - Current frames per second
 * @param {Object} config - Animation configuration
 */
function adjustEffectsForPerformance(fps, config) {
    if (fps < config.performance.fpsThreshold) {
        // Reduce animation complexity for better performance
        config.text.useAdvancedEffects = false;
        config.transitions.useAdvancedTransitions = false;
        config.performance.maxParticlesPerElement = Math.max(3, config.performance.maxParticlesPerElement / 2);
        
        // Log adaptive changes if system log is available
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: 'system',
                message: 'Reducing animation effects for better performance',
                details: `FPS: ${fps.toFixed(1)}, Threshold: ${config.performance.fpsThreshold}`,
                timestamp: new Date()
            });
        }
    } else if (fps > config.performance.fpsThreshold + 10) {
        // Restore full effects if performance is good
        config.text.useAdvancedEffects = true;
        config.transitions.useAdvancedTransitions = true;
    }
}

/**
 * Check if an element is in the viewport
 * @param {Element} element - The element to check
 * @return {boolean} - True if the element is at least partially visible
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0 &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.right >= 0
    );
}
