/**
 * Enhanced Contact Terminal
 * Interactive terminal-style contact form with typing animations and command response
 */

class EnhancedContactTerminal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        
        this.terminalLog = [];
        this.currentInputValue = '';
        this.commandHistory = [];
        this.historyPosition = -1;
        this.fieldValues = {
            name: '',
            email: '',
            subject: '',
            message: ''
        };
        this.currentField = null;
        this.isProcessing = false;
        this.cursorBlinkInterval = null;
        this.typingSpeed = 30; // ms per character
        
        // Initialize the terminal
        this.init();
    }
    
    /**
     * Initialize the terminal interface
     */
    init() {
        // Create terminal HTML structure
        this.createTerminalInterface();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start the welcome sequence
        this.startWelcomeSequence();
    }
    
    /**
     * Create the terminal interface HTML structure
     */
    createTerminalInterface() {
        this.container.innerHTML = `
            <div class="terminal-header">
                <div class="terminal-title">
                    <i class="fas fa-terminal terminal-icon"></i>
                    <span class="terminal-name">contact_terminal</span>
                </div>
                <div class="terminal-controls">
                    <button class="terminal-btn terminal-btn-minimize" aria-label="Minimize"></button>
                    <button class="terminal-btn terminal-btn-expand" aria-label="Expand"></button>
                    <button class="terminal-btn terminal-btn-close" aria-label="Close"></button>
                </div>
            </div>
            
            <div class="terminal-content">
                <div class="terminal-output"></div>
                
                <div class="command-input-container">
                    <span class="prompt-symbol">~$</span>
                    <input type="text" class="command-input" autocomplete="off" aria-label="Terminal command input">
                    <span class="cursor-blink"></span>
                </div>
            </div>
            
            <div class="terminal-status">
                <div class="status-indicator">
                    <span class="status-dot"></span>
                    <span class="status-message">System Ready</span>
                </div>
                <div class="terminal-timestamp">Last Update: ${this.getCurrentTimestamp()}</div>
            </div>
        `;
        
        // Cache DOM elements
        this.outputElement = this.container.querySelector('.terminal-output');
        this.inputElement = this.container.querySelector('.command-input');
        this.promptElement = this.container.querySelector('.prompt-symbol');
        this.cursorElement = this.container.querySelector('.cursor-blink');
        this.statusMessage = this.container.querySelector('.status-message');
    }
    
    /**
     * Set up event listeners for the terminal
     */
    setupEventListeners() {
        // Input field events
        this.inputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.inputElement.addEventListener('input', this.handleInput.bind(this));
        
        // Click on terminal to focus input
        this.container.addEventListener('click', () => {
            this.inputElement.focus();
        });
        
        // Terminal control buttons
        const minimizeBtn = this.container.querySelector('.terminal-btn-minimize');
        const expandBtn = this.container.querySelector('.terminal-btn-expand');
        const closeBtn = this.container.querySelector('.terminal-btn-close');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.container.classList.toggle('minimized');
            });
        }
        
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.container.classList.toggle('expanded');
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.container.classList.add('hidden');
            });
        }
        
        // Start cursor blink
        this.startCursorBlink();
    }
    
    /**
     * Handle keydown events in the command input
     */
    handleKeyDown(e) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                this.processCommand();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
                
            case 'Tab':
                e.preventDefault();
                this.autoComplete();
                break;
                
            case 'Escape':
                e.preventDefault();
                this.clearInput();
                break;
        }
    }
    
    /**
     * Handle input events
     */
    handleInput(e) {
        this.currentInputValue = e.target.value;
    }
    
    /**
     * Process the current command
     */
    processCommand() {
        const command = this.currentInputValue.trim();
        
        if (command === '') {
            this.printNewLine();
            return;
        }
        
        // Add to history and reset position
        this.addToHistory(command);
        this.historyPosition = -1;
        
        // Display the command
        this.printCommand(command);
        
        // Reset input
        this.clearInput();
        
        // Process the command
        if (this.currentField) {
            // We're in the middle of filling out the contact form
            this.processFormField(command);
        } else {
            // Process as a regular command
            this.executeCommand(command);
        }
    }
    
    /**
     * Process form field input
     */
    processFormField(value) {
        if (this.currentField) {
            // Store the value
            this.fieldValues[this.currentField] = value;
            
            // Move to the next field
            switch (this.currentField) {
                case 'name':
                    this.printSystemMessage(`Name saved: ${value}`);
                    this.printSystemMessage('Please enter your email address:');
                    this.currentField = 'email';
                    break;
                    
                case 'email':
                    if (this.validateEmail(value)) {
                        this.printSystemMessage(`Email saved: ${value}`);
                        this.printSystemMessage('Please enter a subject:');
                        this.currentField = 'subject';
                    } else {
                        this.printErrorMessage('Invalid email format. Please try again:');
                    }
                    break;
                    
                case 'subject':
                    this.printSystemMessage(`Subject saved: ${value}`);
                    this.printSystemMessage('Please enter your message:');
                    this.currentField = 'message';
                    break;
                    
                case 'message':
                    this.printSystemMessage('Message received. Processing submission...');
                    this.currentField = null;
                    this.submitForm();
                    break;
            }
        }
    }
    
    /**
     * Execute a terminal command
     */
    executeCommand(command) {
        const lcCommand = command.toLowerCase();
        
        if (lcCommand === 'help') {
            this.showHelp();
        } else if (lcCommand === 'clear') {
            this.clearTerminal();
        } else if (lcCommand === 'contact') {
            this.startContactForm();
        } else if (lcCommand.startsWith('echo ')) {
            const message = command.substring(5);
            this.printSystemMessage(message);
        } else if (lcCommand === 'about') {
            this.showAbout();
        } else if (lcCommand === 'ls' || lcCommand === 'dir') {
            this.listCommands();
        } else if (lcCommand === 'projects') {
            this.printSystemMessage('Redirecting to projects section...');
            setTimeout(() => {
                window.location.href = '#projects';
            }, 1000);
        } else if (lcCommand === 'skills') {
            this.printSystemMessage('Redirecting to skills section...');
            setTimeout(() => {
                window.location.href = '#skills';
            }, 1000);
        } else if (lcCommand === 'version') {
            this.printSystemMessage('SULAYMAN BOWLES OS v2.0');
            this.printSystemMessage('Strategic Insight Engine');
            this.printSystemMessage('Build date: 2025-05-15');
        } else {
            this.printErrorMessage(`Command not found: ${command}`);
            this.printSystemMessage('Type "help" to see available commands.');
        }
    }
    
    /**
     * Show help text
     */
    showHelp() {
        const commands = [
            { cmd: 'help', desc: 'Show this help message' },
            { cmd: 'clear', desc: 'Clear terminal output' },
            { cmd: 'contact', desc: 'Start contact form' },
            { cmd: 'about', desc: 'Show information about Sulayman Bowles' },
            { cmd: 'projects', desc: 'Navigate to projects section' },
            { cmd: 'skills', desc: 'Navigate to skills section' },
            { cmd: 'ls / dir', desc: 'List available commands' },
            { cmd: 'echo [text]', desc: 'Print text to terminal' },
            { cmd: 'version', desc: 'Show system version' }
        ];
        
        this.printSystemMessage('Available Commands:');
        commands.forEach(cmd => {
            this.printFormattedOutput(`  <span style="color: var(--theme-accent-primary);">${cmd.cmd}</span>  -  ${cmd.desc}`);
        });
    }
    
    /**
     * List available commands
     */
    listCommands() {
        const commands = ['help', 'clear', 'contact', 'about', 'projects', 'skills', 'echo', 'version'];
        
        this.printSystemMessage('Available commands:');
        this.printFormattedOutput(`<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            ${commands.map(cmd => `<span style="color: var(--theme-accent-primary);">${cmd}</span>`).join('')}
        </div>`);
    }
    
    /**
     * Show about information
     */
    showAbout() {
        this.printSystemMessage('Sulayman Bowles');
        this.printSystemMessage('Strategic Insight Engine');
        this.printSystemMessage('---------------------------');
        setTimeout(() => {
            this.typeMessage('Specialized in transforming complex data into actionable intelligence. Leveraging advanced analytics and strategic framework development to enhance decision-making capabilities across finance, technology and creative domains.');
        }, 100);
    }
    
    /**
     * Start the contact form sequence
     */
    startContactForm() {
        this.printSystemMessage('Initializing contact form...');
        setTimeout(() => {
            this.printSystemMessage('Please provide the following information:');
            this.printSystemMessage('What is your name?');
            this.currentField = 'name';
        }, 500);
    }
    
    /**
     * Clear the terminal output
     */
    clearTerminal() {
        this.outputElement.innerHTML = '';
        this.terminalLog = [];
    }
    
    /**
     * Submit the contact form
     */
    submitForm() {
        this.isProcessing = true;
        this.updateStatus('Processing', 'Submitting contact form...');
        
        // Simulate form submission with loading animation
        this.printFormattedOutput('<span class="terminal-loading"></span> Establishing connection...');
        
        setTimeout(() => {
            this.printFormattedOutput('<span class="terminal-loading"></span> Validating data...');
            
            setTimeout(() => {
                this.printFormattedOutput('<span class="terminal-loading"></span> Transmitting message...');
                
                setTimeout(() => {
                    // Contact form successfully submitted
                    this.printSuccessMessage('Contact form submitted successfully!');
                    this.printSystemMessage('Thank you for your message. I will respond as soon as possible.');
                    this.printSystemMessage('');
                    this.printSystemMessage('Summary of your submission:');
                    this.printFormattedOutput(`<div class="output-line"><span style="color: var(--theme-accent-secondary);">Name:</span> ${this.fieldValues.name}</div>`);
                    this.printFormattedOutput(`<div class="output-line"><span style="color: var(--theme-accent-secondary);">Email:</span> ${this.fieldValues.email}</div>`);
                    this.printFormattedOutput(`<div class="output-line"><span style="color: var(--theme-accent-secondary);">Subject:</span> ${this.fieldValues.subject}</div>`);
                    this.printFormattedOutput(`<div class="output-line"><span style="color: var(--theme-accent-secondary);">Message:</span> ${this.fieldValues.message}</div>`);
                    
                    // Reset state
                    this.isProcessing = false;
                    this.updateStatus('Ready', 'Form submitted');
                    this.currentField = null;
                    
                    // Actually submit the data (would be implemented in production)
                    // this.sendContactData(this.fieldValues);
                }, 1200);
            }, 1000);
        }, 800);
    }
    
    /**
     * Send contact data to server (placeholder)
     */
    sendContactData(data) {
        // In a real implementation, this would send the data to a server
        console.log('Contact form data:', data);
        
        // Example fetch implementation:
        /*
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
            this.printErrorMessage('Failed to submit form. Please try again later.');
        });
        */
    }
    
    /**
     * Start the welcome sequence
     */
    startWelcomeSequence() {
        setTimeout(() => {
            this.typeMessage('Welcome to the Strategic Insight Engine Terminal', 'system-line');
            
            setTimeout(() => {
                this.typeMessage('Initializing communication protocols...', 'system-line');
                
                setTimeout(() => {
                    this.typeMessage('Connection established.', 'success-line');
                    
                    setTimeout(() => {
                        this.printSystemMessage('Type "help" to see available commands, or "contact" to get in touch.');
                    }, 500);
                }, 1000);
            }, 700);
        }, 300);
    }
    
    /**
     * Print a command to the terminal
     */
    printCommand(command) {
        const commandLine = document.createElement('div');
        commandLine.className = 'output-line';
        commandLine.innerHTML = `<span class="prompt-symbol">~$</span> ${this.escapeHtml(command)}`;
        this.outputElement.appendChild(commandLine);
        this.scrollToBottom();
        
        this.terminalLog.push({ type: 'command', content: command });
    }
    
    /**
     * Print a system message
     */
    printSystemMessage(message) {
        const messageLine = document.createElement('div');
        messageLine.className = 'output-line system-line';
        messageLine.textContent = message;
        this.outputElement.appendChild(messageLine);
        this.scrollToBottom();
        
        this.terminalLog.push({ type: 'system', content: message });
    }
    
    /**
     * Print an error message
     */
    printErrorMessage(message) {
        const errorLine = document.createElement('div');
        errorLine.className = 'output-line error-line';
        errorLine.textContent = message;
        this.outputElement.appendChild(errorLine);
        this.scrollToBottom();
        
        this.terminalLog.push({ type: 'error', content: message });
    }
    
    /**
     * Print a success message
     */
    printSuccessMessage(message) {
        const successLine = document.createElement('div');
        successLine.className = 'output-line success-line';
        successLine.textContent = message;
        this.outputElement.appendChild(successLine);
        this.scrollToBottom();
        
        this.terminalLog.push({ type: 'success', content: message });
    }
    
    /**
     * Print formatted HTML output
     */
    printFormattedOutput(html) {
        const outputLine = document.createElement('div');
        outputLine.className = 'output-line';
        outputLine.innerHTML = html;
        this.outputElement.appendChild(outputLine);
        this.scrollToBottom();
        
        this.terminalLog.push({ type: 'formatted', content: html });
    }
    
    /**
     * Print a new line
     */
    printNewLine() {
        this.printCommand('');
    }
    
    /**
     * Type a message character by character
     */
    typeMessage(message, className = '') {
        const messageLine = document.createElement('div');
        messageLine.className = `output-line ${className} typing-response`;
        this.outputElement.appendChild(messageLine);
        
        let charIndex = 0;
        const messageLength = message.length;
        
        const typeNextChar = () => {
            if (charIndex < messageLength) {
                messageLine.textContent += message[charIndex];
                charIndex++;
                this.scrollToBottom();
                setTimeout(typeNextChar, this.typingSpeed);
            }
        };
        
        typeNextChar();
        this.terminalLog.push({ type: 'typed', content: message });
    }
    
    /**
     * Clear the input field
     */
    clearInput() {
        this.inputElement.value = '';
        this.currentInputValue = '';
    }
    
    /**
     * Add a command to the history
     */
    addToHistory(command) {
        // Don't add duplicates consecutively
        if (this.commandHistory.length === 0 || this.commandHistory[this.commandHistory.length - 1] !== command) {
            this.commandHistory.push(command);
            
            // Limit history size
            if (this.commandHistory.length > 50) {
                this.commandHistory.shift();
            }
        }
    }
    
    /**
     * Navigate through command history
     */
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        // Save current input if we're at the bottom of history
        if (this.historyPosition === -1 && direction < 0) {
            this.currentBuffer = this.currentInputValue;
        }
        
        this.historyPosition += direction;
        
        // Bounds checking
        if (this.historyPosition >= this.commandHistory.length) {
            this.historyPosition = this.commandHistory.length - 1;
        } else if (this.historyPosition < -1) {
            this.historyPosition = -1;
        }
        
        // Set input value from history or restore buffer
        if (this.historyPosition === -1) {
            this.inputElement.value = this.currentBuffer || '';
        } else {
            this.inputElement.value = this.commandHistory[this.commandHistory.length - 1 - this.historyPosition];
        }
        
        // Move cursor to end
        setTimeout(() => {
            this.inputElement.selectionStart = this.inputElement.value.length;
            this.inputElement.selectionEnd = this.inputElement.value.length;
        }, 0);
        
        // Update current input value
        this.currentInputValue = this.inputElement.value;
    }
    
    /**
     * Auto-complete command
     */
    autoComplete() {
        const commands = ['help', 'clear', 'contact', 'about', 'projects', 'skills', 'echo', 'version', 'ls', 'dir'];
        const input = this.currentInputValue.toLowerCase();
        
        if (input) {
            const match = commands.find(cmd => cmd.startsWith(input));
            if (match) {
                this.inputElement.value = match;
                this.currentInputValue = match;
            }
        }
    }
    
    /**
     * Start cursor blinking
     */
    startCursorBlink() {
        // Clear existing interval if any
        if (this.cursorBlinkInterval) {
            clearInterval(this.cursorBlinkInterval);
        }
        
        this.cursorBlinkInterval = setInterval(() => {
            this.cursorElement.classList.toggle('active');
        }, 600);
    }
    
    /**
     * Scroll terminal output to bottom
     */
    scrollToBottom() {
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
    
    /**
     * Update the status bar
     */
    updateStatus(status, message) {
        const statusDot = this.container.querySelector('.status-dot');
        
        if (status === 'Ready') {
            statusDot.style.backgroundColor = '#28C840';
        } else if (status === 'Processing') {
            statusDot.style.backgroundColor = '#FFBD2E';
        } else if (status === 'Error') {
            statusDot.style.backgroundColor = '#FF5F57';
        }
        
        this.statusMessage.textContent = message || status;
        this.container.querySelector('.terminal-timestamp').textContent = `Last Update: ${this.getCurrentTimestamp()}`;
    }
    
    /**
     * Get current timestamp
     */
    getCurrentTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString();
    }
    
    /**
     * Validate email format
     */
    validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the contact terminal container exists
    const terminalContainer = document.getElementById('contact-terminal');
    if (terminalContainer) {
        new EnhancedContactTerminal('contact-terminal');
    }
});
