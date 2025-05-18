/**
 * Terminal Visual Enhancements Integration
 * This script applies the visual enhancements to the enhanced-contact-terminal.js component
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for the terminal to initialize
    setTimeout(() => {
        if (window.contactTerminal) {
            integrateVisualEnhancements(window.contactTerminal);
        }
    }, 500);
});

/**
 * Integrates all visual enhancements with the terminal
 * @param {EnhancedContactTerminal} terminal - The terminal instance
 */
function integrateVisualEnhancements(terminal) {
    // Apply CRT overlay effect
    const crtEffect = new window.TerminalEnhancements.CRTOverlayEffect(terminal.container);
    
    // Apply enhanced cursor
    const cursorAnimation = new window.TerminalEnhancements.EnhancedCursorAnimation(
        terminal.cursorElement,
        {
            style: 'block',
            blinkRate: 600,
            pulseEffect: true
        }
    );
    
    // Create command feedback effects
    const commandFeedback = new window.TerminalEnhancements.CommandFeedbackEffects(terminal);
    
    // Create enhanced text effects
    const textEffects = new window.TerminalEnhancements.EnhancedTextEffects(terminal);
    
    // Override the typeMessage method with the enhanced version
    const originalTypeMessage = terminal.typeMessage;
    terminal.typeMessage = function(message, className = '') {
        return textEffects.typeText(this.outputElement, message, {
            className: className,
            speed: this.config.typingSpeed,
            variance: 10
        });
    };
    
    // Enhance printSystemMessage with typing effect
    const originalPrintSystemMessage = terminal.printSystemMessage;
    terminal.printSystemMessage = function(message, className = '') {
        // If animations are disabled, use the original method
        if (!this.config.animationsEnabled) {
            return originalPrintSystemMessage.call(this, message, className);
        }
        
        // Use enhanced typing effect
        return textEffects.typeText(this.outputElement, message, {
            className: `system-line ${className}`,
            speed: this.config.typingSpeed,
            variance: 10
        });
    };
    
    // Enhance printSuccessMessage with improved styling
    const originalPrintSuccessMessage = terminal.printSuccessMessage;
    terminal.printSuccessMessage = function(message) {
        // If animations are disabled, use the original method
        if (!this.config.animationsEnabled) {
            return originalPrintSuccessMessage.call(this, message);
        }
        
        const successLine = document.createElement('div');
        successLine.className = 'output-line success-line';
        successLine.innerHTML = `<i class="fas fa-check-circle"></i> <span class="success-message"></span>`;
        this.outputElement.appendChild(successLine);
        
        // Use typing effect for the message
        textEffects.typeText(successLine.querySelector('.success-message'), this.escapeHtml(message), {
            speed: this.config.typingSpeed,
            variance: 5
        });
        
        this.scrollToBottom();
        this.playSound('success');
        this.terminalLog.push({ type: 'success', content: message });
    };
    
    // Enhance printErrorMessage with improved styling
    const originalPrintErrorMessage = terminal.printErrorMessage;
    terminal.printErrorMessage = function(message) {
        // If animations are disabled, use the original method
        if (!this.config.animationsEnabled) {
            return originalPrintErrorMessage.call(this, message);
        }
        
        const errorLine = document.createElement('div');
        errorLine.className = 'output-line error-line';
        errorLine.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span class="error-message"></span>`;
        this.outputElement.appendChild(errorLine);
        
        // Use typing effect for the message
        textEffects.typeText(errorLine.querySelector('.error-message'), this.escapeHtml(message), {
            speed: this.config.typingSpeed,
            variance: 5
        });
        
        this.scrollToBottom();
        this.playSound('error');
        this.terminalLog.push({ type: 'error', content: message });
    };
    
    // Enhance processCommand with visual feedback
    const originalProcessCommand = terminal.processCommand;
    terminal.processCommand = function() {
        const command = this.currentInputValue.trim();
        
        if (command !== '') {
            // Show command recognition feedback
            commandFeedback.showRecognition(this.inputElement);
        }
        
        // Call original method
        originalProcessCommand.call(this);
    };
    
    // Enhance executeCommand with visual feedback
    const originalExecuteCommand = terminal.executeCommand;
    terminal.executeCommand = function(command) {
        // Show processing indicator
        const processingIndicator = commandFeedback.showProcessing(
            this.outputElement.lastElementChild
        );
        
        // Show log indicator if SystemLog is available
        if (window.SystemLog) {
            commandFeedback.showLogIndicator();
        }
        
        // Call original method
        originalExecuteCommand.call(this, command);
        
        // Stop processing indicator after a delay
        setTimeout(() => {
            processingIndicator.stop();
        }, 800);
    };
    
    // Enhance form steps visual feedback
    const originalStartContactForm = terminal.startContactForm;
    terminal.startContactForm = function() {
        originalStartContactForm.call(this);
        
        // Add click events to form steps for navigation
        setTimeout(() => {
            const formSteps = document.querySelectorAll('.form-steps .step');
            if (formSteps.length) {
                formSteps.forEach((step, index) => {
                    step.addEventListener('click', () => {
                        // Clicking on steps doesn't allow skipping in this implementation
                        // But we can provide visual feedback
                        if (!step.classList.contains('active')) {
                            terminal.animateElement(step, 'shake');
                            terminal.playSound('error');
                        }
                    });
                });
            }
        }, 100);
    };
    
    // Enhance processFormField to update form steps visual indicators
    const originalProcessFormField = terminal.processFormField;
    terminal.processFormField = function(value) {
        const currentField = this.currentField;
        
        // Call original method
        originalProcessFormField.call(this, value);
        
        // Update form steps based on current field
        setTimeout(() => {
            const formSteps = document.querySelectorAll('.form-steps .step');
            if (formSteps.length) {
                // Map field names to step indices
                const fieldIndices = {
                    'name': 0,
                    'email': 1,
                    'subject': 2,
                    'message': 3
                };
                
                // Mark previous steps as completed
                if (currentField in fieldIndices) {
                    const currentIndex = fieldIndices[currentField];
                    
                    // Mark current step as completed
                    if (formSteps[currentIndex]) {
                        formSteps[currentIndex].classList.add('completed');
                    }
                    
                    // Mark next step as active if it exists
                    if (this.currentField && this.currentField in fieldIndices) {
                        const nextIndex = fieldIndices[this.currentField];
                        
                        // Remove active class from all steps
                        formSteps.forEach(step => step.classList.remove('active'));
                        
                        // Add active class to next step
                        if (formSteps[nextIndex]) {
                            formSteps[nextIndex].classList.add('active');
                        }
                    }
                }
            }
        }, 100);
    };
    
    // Enhance submitForm to update form steps
    const originalSubmitForm = terminal.submitForm;
    terminal.submitForm = function() {
        // Update the form steps before calling the original method
        const formSteps = document.querySelectorAll('.form-steps .step');
        if (formSteps.length) {
            // Mark message step as completed
            if (formSteps[3]) {
                formSteps[3].classList.add('completed');
            }
            
            // Add active class to submit step
            formSteps.forEach(step => step.classList.remove('active'));
            if (formSteps[4]) {
                formSteps[4].classList.add('active');
            }
        }
        
        // Show log indicator if SystemLog is available
        if (window.SystemLog) {
            commandFeedback.showLogIndicator();
        }
        
        // Call original method
        originalSubmitForm.call(this);
    };
    
    console.log("Terminal visual enhancements successfully applied");
}
