/**
 * Advanced Terminal Visual Enhancements v2.0
 * Additional visual effects and animations for the EnhancedContactTerminal
 * 
 * Adds: 
 * - Enhanced simulated typing with natural rhythm and sound effects
 * - Advanced cursor animations with multiple styles and effects
 * - Improved CRT/scanline effects with flickering and distortion
 * - Advanced command feedback with recognition and processing indicators
 * - Enhanced success/error styling with animations
 * - Improved SystemLog integration with visual indicators
 */

class AdvancedTextEffects {
    constructor(terminal) {
        this.terminal = terminal;
        this.typingSpeeds = {
            slow: { base: 60, variance: 20 },
            normal: { base: 30, variance: 15 },
            fast: { base: 15, variance: 8 }
        };
        
        // Characters that typically slow down typing
        this.slowCharacters = ['.', '!', '?', ',', ';', ':'];
        
        // Characters that are typically typed faster
        this.fastPairs = [
            ['t', 'h'], ['i', 'n'], ['a', 'n'], ['o', 'n'],
            ['i', 'n'], ['e', 'r'], ['r', 'e'], ['s', 't'],
            ['t', 'e'], ['e', 'n']
        ];
    }
    
    /**
     * Type text with a realistic rhythm, considering natural typing patterns
     * @param {Element} element - The element to append the text to
     * @param {string} text - The text to type
     * @param {Object} options - Typing options
     */
    typeTextWithRhythm(element, text, options = {}) {
        const defaults = {
            speed: 'normal',
            customSpeed: null,
            className: '',
            onComplete: null,
            glitch: false,
            playSound: true
        };
        
        const settings = Object.assign({}, defaults, options);
        const speed = settings.customSpeed || this.typingSpeeds[settings.speed] || this.typingSpeeds.normal;
        
        // Create element for text
        const typingElement = document.createElement('div');
        typingElement.className = `output-line typing-effect ${settings.className}`;
        element.appendChild(typingElement);
        
        // Track sound interval to avoid too many sound effects
        let lastSoundTime = 0;
        const soundInterval = 120; // ms between sounds
        
        // Process the text with natural typing rhythm
        let index = 0;
        let lastTypedChar = '';
        
        const typeNextCharacter = () => {
            if (index < text.length) {
                const currentChar = text[index];
                
                // Add the character
                typingElement.textContent += currentChar;
                
                // Play typing sound occasionally
                const now = Date.now();
                if (settings.playSound && this.terminal.config.soundEnabled && 
                    now - lastSoundTime > soundInterval && Math.random() > 0.6) {
                    this.terminal.playSound('typing');
                    lastSoundTime = now;
                }
                
                // Determine the delay for the next character
                const nextChar = index + 1 < text.length ? text[index + 1] : '';
                const delay = this.calculateTypingDelay(lastTypedChar, currentChar, nextChar, speed);
                
                // Store this character for next iteration
                lastTypedChar = currentChar;
                index++;
                
                // Scroll as typing progresses
                if (this.terminal.scrollToBottom) {
                    this.terminal.scrollToBottom();
                }
                
                // Schedule next character
                setTimeout(typeNextCharacter, delay);
            } else {
                // Typing complete
                typingElement.classList.add('typing-complete');
                
                if (settings.onComplete) {
                    settings.onComplete(typingElement);
                }
            }
        };
        
        if (settings.glitch) {
            // Start with a glitch effect before typing
            this.glitchText(typingElement, text.substring(0, Math.min(10, text.length)), {
                duration: 800,
                intensity: 0.7,
                onComplete: () => {
                    typingElement.textContent = '';
                    typeNextCharacter();
                }
            });
        } else {
            // Start typing immediately
            typeNextCharacter();
        }
        
        return typingElement;
    }
    
    /**
     * Calculate a realistic delay for typing a character based on context
     */
    calculateTypingDelay(prevChar, currentChar, nextChar, speed) {
        // Base typing speed with some randomness
        let delay = speed.base + (Math.random() * speed.variance * 2 - speed.variance);
        
        // Slow down after punctuation
        if (this.slowCharacters.includes(prevChar)) {
            delay *= prevChar === '.' || prevChar === '!' || prevChar === '?' ? 3 : 1.5;
        }
        
        // Speed up for common character pairs
        const isPair = this.fastPairs.some(pair => 
            pair[0] === currentChar && pair[1] === nextChar);
        if (isPair) {
            delay *= 0.7;
        }
        
        // Space after a word has varied timing
        if (currentChar === ' ') {
            delay *= 1.2;
        }
        
        // Add slight randomness
        const randomFactor = 1 + (Math.random() * 0.3 - 0.15);
        
        return Math.floor(delay * randomFactor);
    }
    
    /**
     * Enhanced glitch text effect with multiple layers
     */
    glitchText(element, text, options = {}) {
        const defaults = {
            duration: 1500,
            intensity: 0.5,
            onComplete: null
        };
        
        const settings = Object.assign({}, defaults, options);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]|;:,.<>?/\\';
        
        // Set data attribute for CSS effects
        element.setAttribute('data-text', text);
        element.classList.add('glitching-text');
        
        let iterations = 0;
        const maxIterations = Math.floor(settings.duration / 80);
        
        // Create layers for glitch effect
        const beforeLayer = document.createElement('span');
        beforeLayer.className = 'glitch-layer glitch-before';
        element.appendChild(beforeLayer);
        
        const afterLayer = document.createElement('span');
        afterLayer.className = 'glitch-layer glitch-after';
        element.appendChild(afterLayer);
        
        // Update function for animation
        const updateGlitch = () => {
            iterations++;
            const progress = iterations / maxIterations;
            
            // Generate scrambled text
            let mainText = '';
            let beforeText = '';
            let afterText = '';
            
            for (let i = 0; i < text.length; i++) {
                // The further we are in iterations, the more characters are revealed
                const revealThreshold = progress * text.length;
                
                if (i < revealThreshold - 3) {
                    // Character has settled to final
                    mainText += text[i];
                    beforeText += text[i];
                    afterText += text[i];
                } else if (i < revealThreshold) {
                    // Character is being scrambled but close to final
                    const isGlitched = Math.random() < settings.intensity;
                    mainText += isGlitched ? chars[Math.floor(Math.random() * chars.length)] : text[i];
                    beforeText += isGlitched ? chars[Math.floor(Math.random() * chars.length)] : text[i];
                    afterText += isGlitched ? chars[Math.floor(Math.random() * chars.length)] : text[i];
                } else {
                    // Pure random character
                    mainText += chars[Math.floor(Math.random() * chars.length)];
                    beforeText += chars[Math.floor(Math.random() * chars.length)];
                    afterText += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            
            // Update the text
            element.textContent = mainText;
            beforeLayer.textContent = beforeText;
            afterLayer.textContent = afterText;
            
            // Occasional offset for glitch layers
            if (Math.random() < 0.3) {
                const offsetX = Math.random() * 5 - 2.5;
                const offsetY = Math.random() * 3 - 1.5;
                beforeLayer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                afterLayer.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
            } else {
                beforeLayer.style.transform = '';
                afterLayer.style.transform = '';
            }
            
            if (iterations < maxIterations) {
                setTimeout(updateGlitch, 80);
            } else {
                // Ensure final text is exactly correct
                element.textContent = text;
                beforeLayer.textContent = '';
                afterLayer.textContent = '';
                
                element.classList.remove('glitching-text');
                
                // Remove layers
                if (beforeLayer.parentNode) beforeLayer.parentNode.removeChild(beforeLayer);
                if (afterLayer.parentNode) afterLayer.parentNode.removeChild(afterLayer);
                
                if (settings.onComplete) {
                    settings.onComplete();
                }
            }
        };
        
        // Start the effect
        updateGlitch();
        return element;
    }
    
    /**
     * Animated code display with syntax highlighting
     */
    typeCode(element, code, language = 'javascript', options = {}) {
        const defaults = {
            speed: 'normal',
            onComplete: null,
            highlightSyntax: true
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // Create code container
        const codeContainer = document.createElement('div');
        codeContainer.className = 'code-block-container';
        
        const codeBlock = document.createElement('pre');
        codeBlock.className = `code-block language-${language}`;
        codeContainer.appendChild(codeBlock);
        
        element.appendChild(codeContainer);
        
        // Type the code with appropriate rhythm
        this.typeTextWithRhythm(codeBlock, code, {
            speed: settings.speed,
            className: `code-content ${language}`,
            onComplete: () => {
                // Apply syntax highlighting if enabled
                if (settings.highlightSyntax && window.Prism) {
                    Prism.highlightElement(codeBlock);
                }
                
                if (settings.onComplete) {
                    settings.onComplete();
                }
            }
        });
        
        return codeContainer;
    }
}

class AdvancedCursorEffects {
    constructor(cursorElement) {
        this.cursor = cursorElement;
        this.blinkInterval = null;
        this.currentStyle = 'block';
        this.currentState = 'idle'; // idle, active, waiting
        this.styles = ['block', 'underscore', 'pipe', 'dot'];
        
        // Initialize
        this.initCursor();
    }
    
    initCursor() {
        // Add base classes
        this.cursor.classList.add('advanced-cursor');
        this.applyCursorStyle(this.currentStyle);
        this.startBlink();
    }
    
    applyCursorStyle(style) {
        // Remove all style classes
        this.styles.forEach(s => {
            this.cursor.classList.remove(`cursor-${s}`);
        });
        
        // Add new style class
        this.cursor.classList.add(`cursor-${style}`);
        this.currentStyle = style;
    }
    
    startBlink() {
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
        }
        
        // Show cursor initially
        this.cursor.style.opacity = '1';
        
        this.blinkInterval = setInterval(() => {
            if (this.currentState === 'idle') {
                // Normal blink when idle
                this.cursor.style.opacity = this.cursor.style.opacity === '1' ? '0' : '1';
            } else if (this.currentState === 'active') {
                // Always visible when active
                this.cursor.style.opacity = '1';
            } else if (this.currentState === 'waiting') {
                // Pulse effect when waiting
                this.cursor.classList.add('cursor-pulse');
            }
        }, 530);
    }
    
    stopBlink() {
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
            this.blinkInterval = null;
        }
        this.cursor.style.opacity = '0';
    }
    
    setState(state) {
        // Update cursor state and appearance
        this.currentState = state;
        
        if (state === 'idle') {
            this.cursor.classList.remove('cursor-pulse', 'cursor-active');
        } else if (state === 'active') {
            this.cursor.classList.add('cursor-active');
            this.cursor.classList.remove('cursor-pulse');
            this.cursor.style.opacity = '1';
        } else if (state === 'waiting') {
            this.cursor.classList.add('cursor-pulse');
            this.cursor.classList.remove('cursor-active');
            this.cursor.style.opacity = '1';
        }
    }
    
    pulseOnce() {
        // Quick pulse animation
        const originalState = this.currentState;
        
        // Save current state and switch to pulse
        this.setState('waiting');
        
        // Return to original state after pulse
        setTimeout(() => {
            this.setState(originalState);
        }, 1000);
    }
    
    // Change cursor style when doing different operations
    setProcessingStyle() {
        this.applyCursorStyle('dot');
        this.setState('waiting');
    }
    
    setInputStyle() {
        this.applyCursorStyle('block');
        this.setState('active');
    }
    
    setWaitingStyle() {
        this.applyCursorStyle('underscore');
        this.setState('waiting');
    }
    
    // Reset to default style
    resetStyle() {
        this.applyCursorStyle('block');
        this.setState('idle');
    }
}

class AdvancedCRTEffect {
    constructor(container) {
        this.container = container;
        this.overlay = null;
        
        // Default configuration
        this.config = {
            scanlineOpacity: 0.15,
            scanlineSize: 4,
            noiseOpacity: 0.08,
            flickerProbability: 0.003,
            glitchProbability: 0.001,
            distortionAmount: 0.02
        };
        
        this.initialize();
    }
    
    initialize() {
        // Create CRT container if not already present
        let existingCRT = this.container.querySelector('.crt-effect-container');
        
        if (!existingCRT) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'crt-effect-container';
            
            // Create scanlines
            const scanlines = document.createElement('div');
            scanlines.className = 'crt-scanlines';
            
            // Create noise texture
            const noise = document.createElement('div');
            noise.className = 'crt-noise';
            
            // Create flicker overlay
            const flicker = document.createElement('div');
            flicker.className = 'crt-flicker';
            
            // Create glitch elements
            const horizontalGlitch = document.createElement('div');
            horizontalGlitch.className = 'crt-h-glitch';
            
            const colorGlitch = document.createElement('div');
            colorGlitch.className = 'crt-color-shift';
            
            // Assemble the overlay structure
            this.overlay.appendChild(scanlines);
            this.overlay.appendChild(noise);
            this.overlay.appendChild(flicker);
            this.overlay.appendChild(horizontalGlitch);
            this.overlay.appendChild(colorGlitch);
            
            // Add to container
            this.container.insertBefore(this.overlay, this.container.firstChild);
            
            // Set initial CSS variables
            this.updateEffectVariables();
            
            // Start effects
            this.startEffects();
        } else {
            this.overlay = existingCRT;
        }
    }
    
    updateEffectVariables() {
        // Set CSS variables for effect parameterization
        this.overlay.style.setProperty('--scanline-opacity', this.config.scanlineOpacity);
        this.overlay.style.setProperty('--scanline-size', `${this.config.scanlineSize}px`);
        this.overlay.style.setProperty('--noise-opacity', this.config.noiseOpacity);
        this.overlay.style.setProperty('--distortion-amount', this.config.distortionAmount);
    }
    
    startEffects() {
        // Start the flicker effect
        setInterval(() => {
            if (Math.random() < this.config.flickerProbability) {
                const flickerElement = this.overlay.querySelector('.crt-flicker');
                flickerElement.classList.add('active');
                
                setTimeout(() => {
                    flickerElement.classList.remove('active');
                }, 100 + Math.random() * 100);
            }
        }, 500);
        
        // Start the glitch effect
        setInterval(() => {
            if (Math.random() < this.config.glitchProbability) {
                this.triggerGlitchEffect();
            }
        }, 2000);
    }
    
    triggerGlitchEffect() {
        const horizontalGlitch = this.overlay.querySelector('.crt-h-glitch');
        const colorGlitch = this.overlay.querySelector('.crt-color-shift');
        
        // Random offset for horizontal glitch
        const hOffset = Math.random() * 10 - 5;
        horizontalGlitch.style.transform = `translateX(${hOffset}px)`;
        horizontalGlitch.style.height = `${Math.random() * 10 + 2}px`;
        horizontalGlitch.style.top = `${Math.random() * 100}%`;
        horizontalGlitch.classList.add('active');
        
        // Random RGB shift for color glitch
        const rShift = Math.random() * 8 - 4;
        const gShift = Math.random() * 8 - 4;
        const bShift = Math.random() * 8 - 4;
        colorGlitch.style.textShadow = `
            ${rShift}px 0 rgba(255,0,0,0.5),
            ${gShift}px 0 rgba(0,255,0,0.5),
            ${bShift}px 0 rgba(0,0,255,0.5)
        `;
        colorGlitch.classList.add('active');
        
        // Duration of the glitch effect
        const duration = 100 + Math.random() * 400;
        
        setTimeout(() => {
            horizontalGlitch.classList.remove('active');
            colorGlitch.classList.remove('active');
            horizontalGlitch.style.transform = '';
            colorGlitch.style.textShadow = '';
        }, duration);
    }
    
    // Intensity should be between 0 and 1
    setIntensity(intensity) {
        this.config.scanlineOpacity = 0.15 * intensity;
        this.config.noiseOpacity = 0.08 * intensity;
        this.config.flickerProbability = 0.003 * intensity;
        this.config.glitchProbability = 0.001 * intensity;
        this.config.distortionAmount = 0.02 * intensity;
        
        this.updateEffectVariables();
    }
    
    // Trigger effects for important events
    emphasizeEffect() {
        this.triggerGlitchEffect();
        
        // Temporarily increase effect intensity
        const originalIntensity = {
            scanlineOpacity: this.config.scanlineOpacity,
            noiseOpacity: this.config.noiseOpacity
        };
        
        // Increase intensity
        this.setIntensity(2.0);
        
        // Reset after a short time
        setTimeout(() => {
            this.config.scanlineOpacity = originalIntensity.scanlineOpacity;
            this.config.noiseOpacity = originalIntensity.noiseOpacity;
            this.updateEffectVariables();
        }, 500);
    }
}

class AdvancedCommandFeedback {
    constructor(terminal) {
        this.terminal = terminal;
        
        // DOM elements
        this.outputElement = terminal.outputElement;
        this.promptElement = terminal.promptElement;
        this.inputElement = terminal.inputElement;
        
        // Animation templates
        this.processingTemplate = `
            <div class="command-processing-indicator">
                <div class="processing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
                <div class="processing-label">processing</div>
            </div>
        `;
    }
    
    commandRecognized() {
        // Quick highlight animation for recognized command
        this.promptElement.classList.add('command-recognized-flash');
        
        setTimeout(() => {
            this.promptElement.classList.remove('command-recognized-flash');
        }, 300);
    }
    
    commandFeedback(status) {
        // Status can be 'success', 'error', 'info', 'warning'
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `command-feedback ${status}-feedback`;
        
        // Add appropriate icon
        let icon = 'check-circle';
        if (status === 'error') icon = 'times-circle';
        if (status === 'info') icon = 'info-circle';
        if (status === 'warning') icon = 'exclamation-triangle';
        
        feedbackElement.innerHTML = `<i class="fas fa-${icon}"></i>`;
        
        // Add to input container
        this.terminal.inputElement.parentNode.appendChild(feedbackElement);
        
        // Animate in
        setTimeout(() => {
            feedbackElement.classList.add('active');
        }, 10);
        
        // Animate out after delay
        setTimeout(() => {
            feedbackElement.classList.remove('active');
            
            setTimeout(() => {
                if (feedbackElement.parentNode) {
                    feedbackElement.parentNode.removeChild(feedbackElement);
                }
            }, 300);
        }, 2000);
    }
    
    showProcessingIndicator(text = 'processing') {
        // Create processing indicator element
        const indicator = document.createElement('div');
        indicator.className = 'processing-indicator-container';
        indicator.innerHTML = this.processingTemplate;
        
        // Update label if provided
        if (text !== 'processing') {
            indicator.querySelector('.processing-label').textContent = text;
        }
        
        // Add to output
        this.outputElement.appendChild(indicator);
        
        // Auto-scroll
        if (this.terminal.scrollToBottom) {
            this.terminal.scrollToBottom();
        }
        
        // Return control object
        return {
            update: (newText) => {
                indicator.querySelector('.processing-label').textContent = newText;
            },
            stop: (status = 'success', message = null) => {
                // Add completion class
                indicator.classList.add(`${status}-complete`);
                
                // Update message if provided
                if (message) {
                    indicator.querySelector('.processing-label').textContent = message;
                }
                
                // Update icon
                const dots = indicator.querySelector('.processing-dots');
                dots.innerHTML = '';
                
                let icon = 'check-circle';
                if (status === 'error') icon = 'times-circle';
                if (status === 'info') icon = 'info-circle';
                if (status === 'warning') icon = 'exclamation-triangle';
                
                const iconElement = document.createElement('i');
                iconElement.className = `fas fa-${icon}`;
                dots.appendChild(iconElement);
                
                // Remove after delay
                setTimeout(() => {
                    indicator.classList.add('fade-out');
                    
                    setTimeout(() => {
                        if (indicator.parentNode) {
                            indicator.parentNode.removeChild(indicator);
                        }
                    }, 500);
                }, 1500);
            }
        };
    }
    
    systemLogNotification(action = 'update') {
        // Create visual notification for system log updates
        const notification = document.createElement('div');
        notification.className = 'system-log-notification';
        
        // Different icons for different actions
        let icon = 'database';
        let label = 'System Log Updated';
        
        if (action === 'write') {
            icon = 'save';
            label = 'Data Saved';
        } else if (action === 'read') {
            icon = 'file-import';
            label = 'Data Loaded';
        } else if (action === 'error') {
            icon = 'exclamation-triangle';
            label = 'Log Error';
        }
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span class="notification-label">${label}</span>
        `;
        
        // Add to terminal container
        this.terminal.container.appendChild(notification);
        
        // Animation sequence
        setTimeout(() => {
            notification.classList.add('active');
            
            setTimeout(() => {
                notification.classList.add('fade-out');
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }, 2000);
        }, 10);
    }
    
    showProgressVisualization(steps, currentStep = 0) {
        // Create or update progress visualization
        let progressElement = this.terminal.container.querySelector('.terminal-progress-visualization');
        
        if (!progressElement) {
            progressElement = document.createElement('div');
            progressElement.className = 'terminal-progress-visualization';
            this.terminal.container.appendChild(progressElement);
            
            // Add step indicators
            for (let i = 0; i < steps.length; i++) {
                const step = document.createElement('div');
                step.className = 'progress-step';
                
                const indicator = document.createElement('div');
                indicator.className = 'step-indicator';
                
                const label = document.createElement('div');
                label.className = 'step-label';
                label.textContent = steps[i];
                
                step.appendChild(indicator);
                step.appendChild(label);
                progressElement.appendChild(step);
            }
        }
        
        // Update active step
        const stepElements = progressElement.querySelectorAll('.progress-step');
        
        stepElements.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index < currentStep) {
                step.classList.add('completed');
            } else if (index === currentStep) {
                step.classList.add('active');
            }
        });
        
        // Ensure progress is visible
        progressElement.classList.add('visible');
        
        // Return control object for updates
        return {
            update: (step) => {
                stepElements.forEach((stepEl, index) => {
                    stepEl.classList.remove('active', 'completed');
                    
                    if (index < step) {
                        stepEl.classList.add('completed');
                    } else if (index === step) {
                        stepEl.classList.add('active');
                    }
                });
            },
            complete: () => {
                // Mark all steps as completed
                stepElements.forEach(step => {
                    step.classList.remove('active');
                    step.classList.add('completed');
                });
                
                // Fade out and remove after a delay
                setTimeout(() => {
                    progressElement.classList.add('fade-out');
                    
                    setTimeout(() => {
                        if (progressElement.parentNode) {
                            progressElement.parentNode.removeChild(progressElement);
                        }
                    }, 500);
                }, 1500);
            }
        };
    }
}

// Export the enhanced classes
window.AdvancedTerminalEffects = {
    TextEffects: AdvancedTextEffects,
    CursorEffects: AdvancedCursorEffects,
    CRTEffect: AdvancedCRTEffect,
    CommandFeedback: AdvancedCommandFeedback
};
