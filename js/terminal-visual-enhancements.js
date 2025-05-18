/* 
 * Terminal Visual Enhancements
 * Adds visual flair to the enhanced contact terminal component
 */

/**
 * CRT Overlay effect for terminal
 * Creates a subtle scanline and noise effect to enhance the retro tech vibe
 */
class CRTOverlayEffect {
    constructor(container) {
        this.container = container;
        this.createOverlay();
    }
    
    createOverlay() {
        // Create scanline overlay
        this.scanlineOverlay = document.createElement('div');
        this.scanlineOverlay.className = 'terminal-scanline-overlay';
        
        // Create noise overlay
        this.noiseOverlay = document.createElement('div');
        this.noiseOverlay.className = 'terminal-noise-overlay';
        
        // Create flicker effect
        this.flickerOverlay = document.createElement('div');
        this.flickerOverlay.className = 'terminal-flicker-overlay';
        
        // Append overlays to container
        this.container.appendChild(this.scanlineOverlay);
        this.container.appendChild(this.noiseOverlay);
        this.container.appendChild(this.flickerOverlay);
        
        // Add CRT class to container
        this.container.classList.add('crt-effect');
        
        // Start the flicker animation
        this.startFlickerAnimation();
    }
    
    startFlickerAnimation() {
        setInterval(() => {
            if (Math.random() > 0.98) {
                this.flickerOverlay.classList.add('active');
                setTimeout(() => {
                    this.flickerOverlay.classList.remove('active');
                }, 100 + Math.random() * 100);
            }
        }, 500);
    }
}

/**
 * Enhanced Cursor Animation
 * Provides more stylized animated cursors for the terminal
 */
class EnhancedCursorAnimation {
    constructor(cursorElement, options = {}) {
        this.cursorElement = cursorElement;
        this.options = Object.assign({
            style: 'block', // block, underscore, pipe, or custom
            blinkRate: 600, // ms
            color: null, // Uses CSS variable by default
            pulseEffect: true
        }, options);
        
        this.interval = null;
        this.applying = false;
        
        this.init();
    }
    
    init() {
        // Set base styles
        this.cursorElement.classList.add('enhanced-cursor');
        
        // Apply specific cursor style
        this.applyCursorStyle();
        
        // Start the animation
        this.startAnimation();
    }
    
    applyCursorStyle() {
        // Remove existing style classes
        this.cursorElement.classList.remove('cursor-block', 'cursor-underscore', 'cursor-pipe', 'cursor-custom');
        
        // Add selected style class
        this.cursorElement.classList.add(`cursor-${this.options.style}`);
        
        // Apply color if specified
        if (this.options.color) {
            this.cursorElement.style.backgroundColor = this.options.color;
            this.cursorElement.style.borderColor = this.options.color;
        }
        
        // Apply pulse effect if enabled
        if (this.options.pulseEffect) {
            this.cursorElement.classList.add('cursor-pulse');
        } else {
            this.cursorElement.classList.remove('cursor-pulse');
        }
    }
    
    startAnimation() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        
        this.interval = setInterval(() => {
            this.cursorElement.classList.toggle('active');
        }, this.options.blinkRate);
    }
    
    stopAnimation() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.cursorElement.classList.remove('active');
        }
    }
    
    updateOptions(options) {
        this.options = Object.assign(this.options, options);
        this.applyCursorStyle();
        this.stopAnimation();
        this.startAnimation();
    }
}

/**
 * Command Feedback Effects
 * Provides visual feedback for command recognition and processing
 */
class CommandFeedbackEffects {
    constructor(terminal) {
        this.terminal = terminal;
        this.spinnerTemplate = `
            <div class="terminal-command-spinner">
                <div class="spinner-ring"></div>
            </div>
        `;
    }
    
    showRecognition(element) {
        element.classList.add('command-recognized');
        setTimeout(() => {
            element.classList.remove('command-recognized');
        }, 300);
    }
    
    showProcessing(element) {
        const spinner = document.createElement('div');
        spinner.className = 'terminal-processing-indicator';
        spinner.innerHTML = this.spinnerTemplate;
        
        // Add spinner after the prompt
        element.appendChild(spinner);
        
        return {
            stop: () => {
                if (spinner && spinner.parentNode) {
                    spinner.classList.add('fade-out');
                    setTimeout(() => {
                        if (spinner.parentNode) {
                            spinner.parentNode.removeChild(spinner);
                        }
                    }, 300);
                }
            }
        };
    }
    
    showLogIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'terminal-log-indicator';
        indicator.innerHTML = '<i class="fas fa-database"></i>';
        
        this.terminal.container.appendChild(indicator);
        
        // Animate and remove
        setTimeout(() => {
            indicator.classList.add('active');
            
            setTimeout(() => {
                indicator.classList.add('fade-out');
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 500);
            }, 1000);
        }, 50);
    }
}

/**
 * Enhanced Text Effects
 * Provides improved text animations like typewriter effect
 */
class EnhancedTextEffects {
    constructor(terminal) {
        this.terminal = terminal;
    }
    
    /**
     * Enhanced typewriter effect with natural typing rhythm
     */
    typeText(element, text, options = {}) {
        const defaults = {
            speed: this.terminal.config.typingSpeed || 30,
            variance: 10, // Random speed variance for more natural typing
            className: '',
            onComplete: null
        };
        
        const settings = Object.assign({}, defaults, options);
        
        const messageLine = document.createElement('div');
        messageLine.className = `output-line typing-line ${settings.className}`;
        element.appendChild(messageLine);
        
        let charIndex = 0;
        const textLength = text.length;
        
        const typeNextChar = () => {
            if (charIndex < textLength) {
                // Add character to the text
                messageLine.textContent += text[charIndex];
                charIndex++;
                
                // Calculate next delay with natural variance
                const varianceFactor = Math.random() * 2 - 1; // Between -1 and 1
                const speedVariance = varianceFactor * settings.variance;
                const nextDelay = settings.speed + speedVariance;
                
                // Add slight pause after punctuation
                if (['.', '!', '?', ',', ';', ':'].includes(text[charIndex - 1])) {
                    // Longer pause after sentence-ending punctuation
                    if (['.', '!', '?'].includes(text[charIndex - 1])) {
                        setTimeout(typeNextChar, nextDelay * 3);
                    } else {
                        setTimeout(typeNextChar, nextDelay * 1.5);
                    }
                } else {
                    setTimeout(typeNextChar, nextDelay);
                }
                
                // Scroll as typing progresses
                this.terminal.scrollToBottom();
                
                // Occasionally play typing sound
                if (Math.random() > 0.7) {
                    this.terminal.playSound('typing');
                }
            } else {
                // Typing complete
                messageLine.classList.add('typing-complete');
                if (typeof settings.onComplete === 'function') {
                    settings.onComplete();
                }
            }
        };
        
        // Start typing
        typeNextChar();
        
        return messageLine;
    }
    
    /**
     * Create a glitch text effect
     */
    glitchText(element, finalText, options = {}) {
        const defaults = {
            duration: 1000,
            intensity: 0.3,
            onComplete: null
        };
        
        const settings = Object.assign({}, defaults, options);
        
        const glitchElement = document.createElement('div');
        glitchElement.className = 'glitch-text';
        element.appendChild(glitchElement);
        
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/';
        let currentText = '';
        const finalLength = finalText.length;
        
        // Create random string of same length
        for (let i = 0; i < finalLength; i++) {
            currentText += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        glitchElement.textContent = currentText;
        
        const startTime = Date.now();
        const endTime = startTime + settings.duration;
        
        const updateGlitch = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / settings.duration, 1);
            
            let newText = '';
            
            for (let i = 0; i < finalLength; i++) {
                // Progressively reveal more of the final text
                if (Math.random() > settings.intensity || Math.random() < progress) {
                    newText += finalText[i];
                } else {
                    newText += characters.charAt(Math.floor(Math.random() * characters.length));
                }
            }
            
            glitchElement.textContent = newText;
            
            if (now < endTime) {
                requestAnimationFrame(updateGlitch);
            } else {
                glitchElement.textContent = finalText;
                glitchElement.classList.add('glitch-complete');
                
                if (typeof settings.onComplete === 'function') {
                    settings.onComplete();
                }
            }
        };
        
        requestAnimationFrame(updateGlitch);
        
        return glitchElement;
    }
}

// Export the enhancements
window.TerminalEnhancements = {
    CRTOverlayEffect,
    EnhancedCursorAnimation,
    CommandFeedbackEffects,
    EnhancedTextEffects
};

/**
 * Terminal Visual Integration - Advanced Features
 * Integrates the visual enhancements with the contact terminal
 */
document.addEventListener('DOMContentLoaded', () => {
    // Wait for terminal initialization
    setTimeout(() => {
        if (window.contactTerminal) {
            enhanceTerminalVisuals();
        }
    }, 500);
});

/**
 * Enhances the terminal with advanced visual features
 */
function enhanceTerminalVisuals() {
    const terminal = document.querySelector('.contact-terminal-container');
    if (!terminal) return;
    
    // Add visual enhancements
    new CRTOverlayEffect(terminal);
    new EnhancedCursorAnimation(document.querySelector('.cursor-blink'));
    new CommandFeedbackEffects(window.contactTerminal);
    
    // Enhance system messages with realistic typing
    enhanceTerminalMessages();
    
    // Add system log visualization
    addSystemLogVisualization();
    
    console.log('Advanced terminal visual enhancements applied');
}

/**
 * Enhances terminal messages with more realistic typing and visual feedback
 */
function enhanceTerminalMessages() {
    if (!window.contactTerminal) return;
    
    // Store original methods
    const originalPrintSystemMessage = window.contactTerminal.printSystemMessage;
    const originalPrintErrorMessage = window.contactTerminal.printErrorMessage;
    const originalPrintSuccessMessage = window.contactTerminal.printSuccessMessage;
    const originalExecuteCommand = window.contactTerminal.executeCommand;
    
    // Enhance system message printing with more realistic typing
    window.contactTerminal.printSystemMessage = function(message, className = '') {
        // For short messages, use typing animation
        if (message.length < 80 && this.config.animationsEnabled) {
            const textEffect = new EnhancedTextEffects().createTypingEffect(message, {
                elementClass: `output-line system-line ${className}`,
                container: this.outputElement,
                speed: this.config.typingSpeed,
                variance: 20,
                onComplete: () => this.scrollToBottom()
            });
            
            this.terminalLog.push({ type: 'system', content: message });
            return;
        }
        
        // For longer messages, use the original method
        originalPrintSystemMessage.call(this, message, className);
    };
    
    // Enhance error message display
    window.contactTerminal.printErrorMessage = function(message) {
        const errorLine = document.createElement('div');
        errorLine.className = 'output-line error-line enhanced-error';
        
        // Add error icon with pulsing animation
        errorLine.innerHTML = `<i class="fas fa-exclamation-circle error-icon"></i>`;
        
        // Add glitch effect to error message
        const messageSpan = document.createElement('span');
        messageSpan.className = 'error-message-text';
        errorLine.appendChild(messageSpan);
        
        this.outputElement.appendChild(errorLine);
        
        // Create glitch text effect for errors
        new EnhancedTextEffects().createGlitchEffect(message, {
            element: messageSpan,
            duration: 800,
            intensity: 0.7
        });
        
        this.scrollToBottom();
        this.playSound('error');
        this.terminalLog.push({ type: 'error', content: message });
        
        // Shake the terminal container for errors
        if (this.config.animationsEnabled) {
            this.animateElement(this.container, 'terminal-error-shake');
        }
    };
    
    // Enhance success message display
    window.contactTerminal.printSuccessMessage = function(message) {
        const successLine = document.createElement('div');
        successLine.className = 'output-line success-line enhanced-success';
        
        // Add success icon with animation
        successLine.innerHTML = `<i class="fas fa-check-circle success-icon"></i>`;
        
        // Create a span for the message text
        const messageSpan = document.createElement('span');
        messageSpan.className = 'success-message-text';
        successLine.appendChild(messageSpan);
        
        this.outputElement.appendChild(successLine);
        
        // Create typing effect for success messages
        new EnhancedTextEffects().createTypingEffect(message, {
            element: messageSpan,
            speed: 15, // Faster than normal
            variance: 5,
            onComplete: () => {
                // Add success particles
                if (this.config.animationsEnabled) {
                    createSuccessParticles(successLine);
                }
            }
        });
        
        this.scrollToBottom();
        this.playSound('success');
        this.terminalLog.push({ type: 'success', content: message });
    };
}

/**
 * Creates success particles animation
 */
function createSuccessParticles(element) {
    const particleCount = 15;
    const colors = ['#28C840', '#5EE072', '#A0E8AB'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'success-particle';
        
        // Randomize particle properties
        const size = 3 + Math.random() * 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = 10 + Math.random() * 30;
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = color;
        particle.style.left = left + 'px';
        
        element.appendChild(particle);
        
        // Animate particle
        const startTime = Date.now();
        const duration = 700 + Math.random() * 500;
        
        const animateParticle = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const x = left + Math.cos(angle) * velocity * progress * 40;
            const y = Math.sin(angle) * velocity * progress * 40 - Math.pow(progress, 2) * 20;
            const opacity = 1 - progress;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animateParticle);
            } else {
                element.removeChild(particle);
            }
        };
        
        requestAnimationFrame(animateParticle);
    }
}

/**
 * Adds visual indicator when SystemLog entries are created
 */
function addSystemLogVisualization() {
    // Create a log activity indicator if it doesn't exist
    if (!document.querySelector('.log-activity-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'log-activity-indicator';
        indicator.innerHTML = '<i class="fas fa-database"></i>';
        document.body.appendChild(indicator);
        
        // Hook into SystemLog if available
        if (window.SystemLog && window.SystemLog.addEntry) {
            const originalAddEntry = window.SystemLog.addEntry;
            
            window.SystemLog.addEntry = function(entry) {
                // Call original method
                originalAddEntry.call(this, entry);
                
                // Show visual indicator
                showSystemLogActivity();
            };
        }
    }
}

/**
 * Display a brief visual indication of system log activity
 */
function showSystemLogActivity() {
    const indicator = document.querySelector('.log-activity-indicator');
    if (!indicator) return;
    
    // Show the indicator
    indicator.classList.add('active');
    
    // Hide after animation completes
    setTimeout(() => {
        indicator.classList.remove('active');
    }, 1500);
}
