/**
 * Enhanced Contact Terminal v3.0
 * Advanced terminal-style contact form with interactive commands, animations, and accessibility features
 */

class EnhancedContactTerminal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        
        // Core state variables
        this.terminalLog = [];
        this.currentInputValue = '';
        this.commandHistory = this.loadHistory() || [];
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
        
        // Configuration
        this.config = {
            typingSpeed: 30,       // ms per character
            maxHistorySize: 50,    // maximum commands to store in history
            theme: 'dark',         // default theme
            animationsEnabled: true,
            soundEnabled: false,
            suggestionsEnabled: true
        };
        
        // Command aliases and available commands
        this.commandAliases = {
            'h': 'help',
            'cls': 'clear',
            'hi': 'hello',
            '?': 'help',
            'contacts': 'contact',
            'exit': 'close'
        };
        
        this.availableCommands = [
            { name: 'help', desc: 'Show available commands' },
            { name: 'clear', desc: 'Clear terminal output' },
            { name: 'contact', desc: 'Start contact form' },
            { name: 'about', desc: 'Show information' },
            { name: 'projects', desc: 'Navigate to projects section' },
            { name: 'skills', desc: 'Navigate to skills section' },
            { name: 'ls', desc: 'List available commands' },
            { name: 'echo', desc: 'Print text to terminal' },
            { name: 'version', desc: 'Show system version' },
            { name: 'theme', desc: 'Change terminal theme' },
            { name: 'settings', desc: 'Configure terminal preferences' },
            { name: 'history', desc: 'Show command history' },
            { name: 'upload', desc: 'Upload a file attachment' },
            { name: 'close', desc: 'Close the terminal' }
        ];
        
        // Initialize the terminal
        this.init();
    }
    
    /**
     * Initialize the terminal interface
     */
    init() {
        // Apply saved preferences if available
        this.loadPreferences();
        
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
                    <span class="terminal-badge">v3.0</span>
                </div>
                <div class="terminal-controls">
                    <button class="terminal-btn terminal-btn-minimize" aria-label="Minimize">
                        <span class="sr-only">Minimize</span>
                    </button>
                    <button class="terminal-btn terminal-btn-expand" aria-label="Expand">
                        <span class="sr-only">Expand</span>
                    </button>
                    <button class="terminal-btn terminal-btn-close" aria-label="Close">
                        <span class="sr-only">Close</span>
                    </button>
                </div>
            </div>
            
            <div class="terminal-content">
                <div class="terminal-output" role="log" aria-live="polite"></div>
                
                <div class="command-autocomplete" aria-hidden="true"></div>
                
                <div class="command-input-container" aria-hidden="false">
                    <span class="prompt-symbol">~$</span>
                    <input type="text" class="command-input" autocomplete="off" 
                           aria-label="Terminal command input" spellcheck="false">
                    <span class="cursor-blink" aria-hidden="true"></span>
                </div>
            </div>
            
            <div class="terminal-status">
                <div class="status-indicator">
                    <span class="status-dot" role="status"></span>
                    <span class="status-message">System Ready</span>
                </div>
                <div class="terminal-extras">
                    <span class="terminal-connection">SECURE</span>
                    <button class="btn-copy-output" aria-label="Copy terminal output">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-toggle-sound" aria-label="Toggle sound effects">
                        <i class="fas fa-volume-${this.config.soundEnabled ? 'up' : 'mute'}"></i>
                    </button>
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
        this.suggestionsElement = this.container.querySelector('.command-autocomplete');
        
        // Apply theme
        this.applyTheme(this.config.theme);
    }
    
    /**
     * Set up event listeners for the terminal
     */
    setupEventListeners() {
        // Store bound event handlers for proper cleanup
        this._boundKeyDown = this.handleKeyDown.bind(this);
        this._boundInput = this.handleInput.bind(this);
        this._boundClickOutside = this.handleClickOutside.bind(this);
        
        // Track timeouts for cleanup
        this._timeouts = [];
        
        // Input field events with bound handlers for proper cleanup
        this.inputElement.addEventListener('keydown', this._boundKeyDown);
        this.inputElement.addEventListener('input', this._boundInput);
        
        // Click on terminal to focus input
        this.container.addEventListener('click', this._boundClickOutside = (event) => {
            if (event.target.closest('.btn-copy-output, .terminal-btn, .clickable-output')) return;
            this.inputElement.focus();
        });
        
        // Terminal control buttons
        const minimizeBtn = this.container.querySelector('.terminal-btn-minimize');
        const expandBtn = this.container.querySelector('.terminal-btn-expand');
        const closeBtn = this.container.querySelector('.terminal-btn-close');
        const copyBtn = this.container.querySelector('.btn-copy-output');
        const soundBtn = this.container.querySelector('.btn-toggle-sound');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', this._boundMinimize = (event) => {
                event.stopPropagation();
                this.container.classList.toggle('minimized');
                this.playSound('click');
            });
        }
        
        if (expandBtn) {
            expandBtn.addEventListener('click', this._boundExpand = (event) => {
                event.stopPropagation();
                this.container.classList.toggle('expanded');
                this.playSound('click');
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', this._boundClose = (event) => {
                event.stopPropagation();
                this.animateElement(this.container, 'terminal-fade-out');
                const timeout = setTimeout(() => {
                    this.container.classList.add('hidden');
                }, 500);
                this._timeouts.push(timeout);
                this.playSound('close');
            });
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', this._boundCopy = (event) => {
                event.stopPropagation();
                this.copyOutputToClipboard();
            });
        }
        
        if (soundBtn) {
            soundBtn.addEventListener('click', this._boundToggleSound = (event) => {
                event.stopPropagation();
                this.config.soundEnabled = !this.config.soundEnabled;
                soundBtn.querySelector('i').className = `fas fa-volume-${this.config.soundEnabled ? 'up' : 'mute'}`;
                this.savePreferences();
                this.playSound('click');
                this.printSystemMessage(`Sound effects ${this.config.soundEnabled ? 'enabled' : 'disabled'}`);
            });
        }
        
        // Handle paste events
        this.inputElement.addEventListener('paste', this._boundPaste = () => {
            this.printSystemMessage('Content pasted from clipboard', 'quiet-line');
            this.playSound('typing');
        });
        
        // Start cursor blink
        this.startCursorBlink();
        
        // Add keyboard shortcut help
        document.addEventListener('keydown', this._boundShortcuts = (event) => {
            // Ctrl+/ shows keyboard shortcuts
            if (event.ctrlKey && event.key === '/') {
                event.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
        
        // Save session before unload
        window.addEventListener('beforeunload', this._boundUnload = () => {
            this.saveHistory();
            this.savePreferences();
        });
    }
    
    /**
     * Handles click events within the terminal
     * @param {Event} event - The click event
     * @private
     */
    handleClickOutside(event) {
        if (event.target.closest('.btn-copy-output, .terminal-btn, .clickable-output')) return;
        this.inputElement.focus();
    }
    
    /**
     * Handle keydown events in the command input
     */
    handleKeyDown(event) {
        switch(event.key) {
            case 'Enter':
                event.preventDefault();
                this.processCommand();
                this.playSound('enter');
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.navigateHistory(-1);
                this.playSound('navigate');
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                this.navigateHistory(1);
                this.playSound('navigate');
                break;
                
            case 'Tab':
                event.preventDefault();
                this.autoComplete();
                this.playSound('tab');
                break;
                
            case 'Escape':
                event.preventDefault();
                this.clearInput();
                this.playSound('cancel');
                break;
                
            case 'l':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.clearTerminal();
                    this.playSound('clear');
                }
                break;
                
            case 'c':
                if (event.ctrlKey && !window.getSelection().toString()) {
                    event.preventDefault();
                    if (this.isProcessing) {
                        this.cancelCurrentOperation();
                    }
                }
                break;
                
            case 'F1':
                event.preventDefault();
                this.showHelp();
                break;
        }
    }
    
    /**
     * Cancels the current operation/processing
     */
    cancelCurrentOperation() {
        if (!this.isProcessing) return;
        
        this.isProcessing = false;
        this.printSystemMessage('Operation canceled by user', 'quiet-line');
        this.playSound('cancel');
        
        // Log to system log if available
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: 'info',
                message: 'Contact terminal: Operation canceled by user'
            });
        }
        
        // Reset to default prompt if in the middle of a form
        if (this.currentField) {
            this.currentField = null;
            this.promptElement.textContent = '~$';
        }
        
        // Clear any in-progress visuals
        const processingElements = this.outputElement.querySelectorAll('.form-submission-process, .process-step, .terminal-loading');
        processingElements.forEach(el => {
            el.classList.add('canceled');
        });
        
        this.updateStatus('Ready', 'Operation canceled');
    }
    
    /**
     * Handle input events - support live autocomplete suggestions
     */
    handleInput(event) {
        this.currentInputValue = event.target.value;
        this.playSound('typing');
        
        // Show command suggestions if enabled
        if (this.config.suggestionsEnabled && !this.currentField) {
            this.showSuggestions();
        }
    }
    
    /**
     * Show command suggestions based on current input
     */
    showSuggestions() {
        const input = this.currentInputValue.toLowerCase().trim();
        
        if (input) {
            const matches = this.availableCommands
                .filter(cmd => cmd.name.startsWith(input))
                .slice(0, 5);
                
            if (matches.length > 0) {
                this.suggestionsElement.innerHTML = matches
                    .map(cmd => `<div class="suggestion" data-command="${cmd.name}">${cmd.name} <span class="suggestion-desc">${cmd.desc}</span></div>`)
                    .join('');
                this.suggestionsElement.style.display = 'block';
                
                // Make suggestions clickable
                document.querySelectorAll('.suggestion').forEach(el => {
                    el.addEventListener('click', (event) => {
                        const cmd = event.currentTarget.dataset.command;
                        this.inputElement.value = cmd;
                        this.currentInputValue = cmd;
                        this.inputElement.focus();
                        this.suggestionsElement.style.display = 'none';
                    });
                });
            } else {
                this.suggestionsElement.style.display = 'none';
            }
        } else {
            this.suggestionsElement.style.display = 'none';
        }
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
        
        // Hide suggestions
        this.suggestionsElement.style.display = 'none';
        
        // Add to history and reset position
        this.addToHistory(command);
        this.historyPosition = -1;
        
        // Display the command
        this.printCommand(command);
        
        // Log command to system log if available
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: 'cmd',
                message: `Terminal command: ${command}`
            });
        }
        
        // Reset input
        this.clearInput();
        
        // Process the command
        if (this.currentField) {
            // We're in the middle of filling out the contact form
            this.processFormField(command);
        } else {
            // Check for aliases first
            const resolvedCommand = this.resolveCommandAlias(command);
            
            // Process as a regular command
            this.executeCommand(resolvedCommand);
        }
    }
    
    /**
     * Resolve command aliases to their full command
     */
    resolveCommandAlias(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        
        if (this.commandAliases[cmd]) {
            parts[0] = this.commandAliases[cmd];
            return parts.join(' ');
        }
        
        return command;
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
                    this.promptElement.textContent = 'email:$';
                    break;
                    
                case 'email':
                    if (this.validateEmail(value)) {
                        this.printSystemMessage(`Email saved: ${value}`);
                        this.printSystemMessage('Please enter a subject:');
                        this.currentField = 'subject';
                        this.promptElement.textContent = 'subject:$';
                    } else {
                        this.printErrorMessage('Invalid email format. Please try again:');
                        this.playSound('error');
                        this.animateElement(this.inputElement, 'shake');
                    }
                    break;
                    
                case 'subject':
                    this.printSystemMessage(`Subject saved: ${value}`);
                    this.printSystemMessage('Please enter your message:');
                    this.currentField = 'message';
                    this.promptElement.textContent = 'message:$';
                    break;
                    
                case 'message':
                    this.printSystemMessage('Message received. Processing submission...');
                    this.currentField = null;
                    this.promptElement.textContent = '~$';
                    this.submitForm();
                    break;
            }
        }
    }
    
    /**
     * Execute a terminal command
     */
    executeCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // Play a command sound
        this.playSound('command');
        
        // Log to system log if available
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: 'info',
                message: `Terminal executing: ${cmd}`
            });
        }
        
        switch(cmd) {
            case 'help':
                this.showHelp();
                break;
                
            case 'clear':
                this.clearTerminal();
                break;
                
            case 'contact':
                this.startContactForm();
                break;
                
            case 'hello':
                this.printSystemMessage(`Hello! How can I help you today?`);
                break;
                
            case 'echo':
                this.printSystemMessage(args.join(' '));
                break;
                
            case 'about':
                this.showAbout();
                break;
                
            case 'ls':
            case 'dir':
                this.listCommands();
                break;
                
            case 'projects':
                this.printSystemMessage('Redirecting to projects section...', 'highlight-line');
                this.animateProgressBar(70, () => {
                    window.location.href = '#projects';
                });
                break;
                
            case 'skills':
                this.printSystemMessage('Redirecting to skills section...', 'highlight-line');
                this.animateProgressBar(70, () => {
                    window.location.href = '#skills';
                });
                break;
                
            case 'version':
                this.showVersion();
                break;
                
            case 'history':
                this.showCommandHistory();
                break;
                
            case 'theme':
                this.changeTheme(args[0]);
                break;
                
            case 'settings':
                this.showSettings();
                break;
                
            case 'upload':
                this.initiateFileUpload();
                break;
                
            case 'close':
                this.closeTerminal();
                break;
                
            default:
                this.printErrorMessage(`Command not found: ${cmd}`);
                this.printSystemMessage('Type "help" to see available commands.');
                this.playSound('error');
        }
    }
    
    /**
     * Show version information with fancy display
     */
    showVersion() {
        const versionInfo = [
            { label: 'System', value: 'SULAYMAN BOWLES OS v2.0' },
            { label: 'Engine', value: 'Strategic Insight Engine' },
            { label: 'Build', value: '2025-05-15 (Stable)' },
            { label: 'Terminal', value: 'EnhancedContactTerminal v2.0' },
            { label: 'Renderer', value: 'WebGL 2.0 Compatible' },
            { label: 'Framework', value: 'Custom Terminal Framework' }
        ];
        
        // Create fancy version display
        this.printFormattedOutput(`
            <div class="version-display">
                <div class="version-header">
                    <i class="fas fa-microchip"></i> SYSTEM INFORMATION
                </div>
                <div class="version-content">
                    ${versionInfo.map(info => 
                        `<div class="version-row">
                            <span class="version-label">${info.label}</span>
                            <span class="version-value">${info.value}</span>
                        </div>`
                    ).join('')}
                </div>
                <div class="version-footer">
                    <span class="version-copyright">© 2025 Sulayman Bowles</span>
                </div>
            </div>
        `);
    }
    
    /**
     * Show help text with better formatting
     */
    showHelp() {
        const categories = {
            'General': ['help', 'clear', 'about', 'version', 'echo'],
            'Navigation': ['projects', 'skills', 'ls', 'dir'],
            'Communication': ['contact', 'upload'],
            'Settings': ['theme', 'settings', 'close']
        };
        
        let helpOutput = `<div class="help-container">
            <div class="help-header">
                <i class="fas fa-question-circle"></i> AVAILABLE COMMANDS
                <span class="help-hint">Press F1 anytime to show this help</span>
            </div>`;
            
        for (const [category, commands] of Object.entries(categories)) {
            helpOutput += `
                <div class="help-category">
                    <div class="category-name">${category}</div>
                    <div class="command-list">`;
                    
            commands.forEach(cmdName => {
                const command = this.availableCommands.find(c => c.name === cmdName);
                if (command) {
                    helpOutput += `
                        <div class="help-command clickable-output" data-command="${command.name}">
                            <span class="command-name">${command.name}</span>
                            <span class="command-desc">${command.desc}</span>
                        </div>`;
                }
            });
            
            helpOutput += `
                    </div>
                </div>`;
        }
        
        helpOutput += `
            <div class="help-footer">
                Type a command and press Enter to execute, or click on a command to copy it.
            </div>
        </div>`;
        
        this.printFormattedOutput(helpOutput);
        
        // Make commands clickable
        document.querySelectorAll('.help-command').forEach(el => {
            el.addEventListener('click', () => {
                const cmd = el.dataset.command;
                this.inputElement.value = cmd;
                this.currentInputValue = cmd;
                this.playSound('click');
                this.inputElement.focus();
            });
        });
    }
    
    /**
     * Display keyboard shortcuts
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Enter', desc: 'Execute command' },
            { key: 'Tab', desc: 'Autocomplete command' },
            { key: '↑/↓', desc: 'Navigate command history' },
            { key: 'Esc', desc: 'Clear input line' },
            { key: 'Ctrl+L', desc: 'Clear terminal' },
            { key: 'Ctrl+C', desc: 'Cancel operation' },
            { key: 'F1', desc: 'Show help' },
            { key: 'Ctrl+/', desc: 'Show keyboard shortcuts' }
        ];
        
        let output = `<div class="shortcuts-container">
            <div class="shortcuts-title">Keyboard Shortcuts</div>
            <div class="shortcuts-list">`;
            
        shortcuts.forEach(shortcut => {
            output += `
                <div class="shortcut-item">
                    <span class="shortcut-key">${shortcut.key}</span>
                    <span class="shortcut-desc">${shortcut.desc}</span>
                </div>`;
        });
        
        output += `</div></div>`;
        
        this.printFormattedOutput(output);
    }
    
    /**
     * Show terminal settings
     */
    showSettings() {
        const settings = [
            { id: 'typing-speed', name: 'Typing Speed', value: this.config.typingSpeed, options: ['Slow', 'Medium', 'Fast'] },
            { id: 'enable-animations', name: 'Animations', value: this.config.animationsEnabled, type: 'toggle' },
            { id: 'enable-sound', name: 'Sound Effects', value: this.config.soundEnabled, type: 'toggle' },
            { id: 'enable-suggestions', name: 'Command Suggestions', value: this.config.suggestionsEnabled, type: 'toggle' }
        ];
        
        let settingsOutput = `<div class="settings-panel">
            <div class="settings-header">Terminal Settings</div>
            <div class="settings-list">`;
            
        settings.forEach(setting => {
            if (setting.type === 'toggle') {
                settingsOutput += `
                    <div class="setting-item" data-setting="${setting.id}">
                        <span class="setting-name">${setting.name}</span>
                        <label class="toggle-switch">
                            <input type="checkbox" ${setting.value ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>`;
            } else {
                // For typing speed, determine which option should be active
                let activeIndex = 1; // Default to Medium
                if (setting.id === 'typing-speed') {
                    if (setting.value >= 50) activeIndex = 0; // Slow
                    else if (setting.value <= 10) activeIndex = 2; // Fast
                }
                
                settingsOutput += `
                    <div class="setting-item" data-setting="${setting.id}">
                        <span class="setting-name">${setting.name}</span>
                        <div class="setting-control">
                            ${setting.options.map((option, i) => 
                                `<button class="setting-btn ${i === activeIndex ? 'active' : ''}" data-value="${i}">${option}</button>`
                            ).join('')}
                        </div>
                    </div>`;
            }
        });
            
        settingsOutput += `
            </div>
            <div class="settings-footer">
                <button class="settings-btn save-settings">Save</button>
                <button class="settings-btn reset-settings">Reset to defaults</button>
            </div>
        </div>`;
        
        this.printFormattedOutput(settingsOutput);
        
        // Set up event handlers for settings
        document.querySelectorAll('.toggle-switch input').forEach(input => {
            input.addEventListener('change', (e) => {
                const settingId = e.target.closest('.setting-item').dataset.setting;
                const isChecked = e.target.checked;
                
                switch(settingId) {
                    case 'enable-animations':
                        this.config.animationsEnabled = isChecked;
                        break;
                    case 'enable-sound':
                        this.config.soundEnabled = isChecked;
                        break;
                    case 'enable-suggestions':
                        this.config.suggestionsEnabled = isChecked;
                        break;
                }
                
                this.playSound('click');
                this.savePreferences();
            });
        });
        
        // Add handlers for typing speed buttons
        document.querySelectorAll('.setting-item[data-setting="typing-speed"] .setting-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons in this group
                const buttons = e.target.closest('.setting-control').querySelectorAll('.setting-btn');
                buttons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Set typing speed based on selection
                const value = parseInt(e.target.dataset.value);
                switch(value) {
                    case 0: // Slow
                        this.config.typingSpeed = 50;
                        break;
                    case 1: // Medium
                        this.config.typingSpeed = 30;
                        break;
                    case 2: // Fast
                        this.config.typingSpeed = 10;
                        break;
                }
                
                this.playSound('click');
                this.savePreferences();
            });
        });
        
        document.querySelector('.save-settings').addEventListener('click', () => {
            this.savePreferences();
            this.printSuccessMessage('Settings saved successfully!');
            this.playSound('success');
            this.clearOutput(); // Clear the settings panel after saving
        });
        
        document.querySelector('.reset-settings').addEventListener('click', () => {
            // Reset to default values
            this.config = {
                typingSpeed: 30,
                maxHistorySize: 50,
                theme: 'dark',
                animationsEnabled: true,
                soundEnabled: false,
                suggestionsEnabled: true
            };
            
            this.savePreferences();
            this.applyTheme(this.config.theme);
            this.printSuccessMessage('Settings reset to defaults');
            this.playSound('success');
            this.clearOutput(); // Clear the settings panel after resetting
            // Re-show settings with defaults
            setTimeout(() => this.showSettings(), 500);
        });
    }
    
    /**
     * Show about information with richer content
     */
    showAbout() {
        this.printFormattedOutput(`
            <div class="about-container">
                <div class="about-header">
                    <span class="about-name">Sulayman Bowles</span>
                    <span class="about-title">Strategic Insight Engine</span>
                </div>
                <div class="about-content">
                    <div class="about-description">
                        <p class="about-tagline">Transforming complex data into actionable intelligence.</p>
                        <p>Specialized in advanced analytics and strategic framework development to enhance decision-making capabilities across finance, technology and creative domains.</p>
                        <div class="about-links">
                            <a href="#portfolio" class="about-link clickable-output" data-command="projects">Portfolio</a>
                            <a href="#contact" class="about-link clickable-output" data-command="contact">Contact</a>
                            <a href="#skills" class="about-link clickable-output" data-command="skills">Skills</a>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Add click handlers for the interactive elements
        document.querySelectorAll('.clickable-output').forEach(el => {
            el.addEventListener('click', () => {
                const cmd = el.dataset.command;
                this.executeCommand(cmd);
                this.playSound('click');
            });
        });
    }
    
    /**
     * Show command history with interactive features
     */
    showCommandHistory() {
        if (this.commandHistory.length === 0) {
            this.printSystemMessage('No command history available.');
            return;
        }
        
        let historyOutput = `<div class="history-container">
            <div class="history-header">Command History</div>
            <div class="history-list">`;
            
        this.commandHistory.slice().reverse().forEach((cmd, index) => {
            historyOutput += `
                <div class="history-item clickable-output" data-command="${cmd}">
                    <span class="history-number">${this.commandHistory.length - index}</span>
                    <span class="history-command">${this.escapeHtml(cmd)}</span>
                    <span class="history-action">
                        <i class="fas fa-redo" title="Run this command again"></i>
                    </span>
                </div>`;
        });
        
        historyOutput += `</div>
            <div class="history-footer">
                Click on a command to reuse it
            </div>
        </div>`;
        
        this.printFormattedOutput(historyOutput);
        
        // Add click handlers
        document.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const cmd = el.dataset.command;
                this.inputElement.value = cmd;
                this.currentInputValue = cmd;
                this.playSound('click');
                this.inputElement.focus();
            });
        });
    }
    
    /**
     * Initiate file upload for attachments
     */
    initiateFileUpload() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.multiple = true;
        
        document.body.appendChild(fileInput);
        
        this.printSystemMessage('Select files to upload...');
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            
            if (files.length > 0) {
                this.printSystemMessage(`Selected ${files.length} file(s):`);
                
                files.forEach(file => {
                    this.printFormattedOutput(`
                        <div class="file-item">
                            <i class="fas fa-file"></i>
                            <span class="file-name">${file.name}</span>
                            <span class="file-size">${this.formatFileSize(file.size)}</span>
                        </div>
                    `);
                });
                
                // In a real implementation, you would upload these files
                this.printSystemMessage('Files ready for submission with your message.');
                this.printSystemMessage('Type "contact" to start the contact form.');
            } else {
                this.printSystemMessage('No files selected.');
            }
            
            document.body.removeChild(fileInput);
        });
        
        fileInput.click();
    }
    
    /**
     * Format file size in human-readable format
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * List available commands with better formatting
     */
    listCommands() {
        // Group commands by category for better organization
        const commandsByCategory = {
            'General': ['help', 'clear', 'about', 'version', 'echo'],
            'Navigation': ['projects', 'skills', 'ls', 'dir'],
            'Communication': ['contact', 'upload'],
            'Settings': ['theme', 'settings', 'history', 'close']
        };
        
        let output = `<div class="command-grid">`;
        
        for (const [category, commands] of Object.entries(commandsByCategory)) {
            output += `
                <div class="command-category">
                    <h4 class="category-title">${category}</h4>
                    <div class="category-commands">
                        ${commands.map(cmd => 
                            `<span class="command-item clickable-output" data-command="${cmd}">${cmd}</span>`
                        ).join('')}
                    </div>
                </div>`;
        }
        
        output += `</div>`;
        
        this.printFormattedOutput(output);
        
        // Make commands clickable
        document.querySelectorAll('.command-item').forEach(el => {
            el.addEventListener('click', () => {
                const cmd = el.dataset.command;
                this.inputElement.value = cmd;
                this.currentInputValue = cmd;
                this.playSound('click');
                this.inputElement.focus();
            });
        });
    }
    
    /**
     * Start the contact form sequence with better UX
     */
    startContactForm() {
        this.printFormattedOutput(`
            <div class="contact-form-header">
                <i class="fas fa-paper-plane"></i>
                <span>CONTACT FORM INITIALIZED</span>
            </div>
        `);
        
        this.printSystemMessage('Please provide the following information:');
        
        // Use a step indicator to show progress
        this.printFormattedOutput(`
            <div class="form-steps">
                <div class="step active">Name</div>
                <div class="step">Email</div>
                <div class="step">Subject</div>
                <div class="step">Message</div>
                <div class="step">Submit</div>
            </div>
        `);
        
        this.printSystemMessage('What is your name?');
        this.currentField = 'name';
        this.promptElement.textContent = 'name:$';
    }
    
    /**
     * Submit the contact form with enhanced user feedback
     */
    submitForm() {
        this.isProcessing = true;
        this.updateStatus('Processing', 'Submitting contact form...');
        
        // Log to system log if available
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: 'network',
                message: 'Contact form submission started',
                details: {
                    name: this.fieldValues.name,
                    email: this.fieldValues.email,
                    subject: this.fieldValues.subject
                }
            });
        }
        
        // Update step indicator
        document.querySelectorAll('.form-steps .step').forEach((step, index) => {
            if (index === 4) step.classList.add('active');
        });
        
        // Display a more advanced progress sequence
        this.printFormattedOutput(`<div class="form-submission-process"></div>`);
        const processElement = document.querySelector('.form-submission-process');
        
        const steps = [
            { message: 'Establishing secure connection...', time: 800 },
            { message: 'Validating form data...', time: 1000 },
            { message: 'Processing attachments...', time: 1200 },
            { message: 'Encrypting message content...', time: 1000 },
            { message: 'Transmitting to server...', time: 1500 }
        ];
        
        let currentStep = 0;
        
        const processNextStep = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                processElement.innerHTML += `
                    <div class="process-step">
                        <span class="terminal-loading"></span>
                        <span class="step-message">${step.message}</span>
                    </div>
                `;
                this.scrollToBottom();
                this.playSound('process');
                
                currentStep++;
                setTimeout(processNextStep, step.time);
            } else {
                // All steps completed
                this.finalizeFormSubmission();
            }
        };
        
        processNextStep();
    }
    
    /**
     * Finalize the form submission with success message and summary
     */
    finalizeFormSubmission() {
        this.playSound('success');
        
        // Log successful submission to system log
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: 'success',
                message: 'Contact form submitted successfully',
                details: {
                    name: this.fieldValues.name,
                    email: this.fieldValues.email,
                    subject: this.fieldValues.subject
                }
            });
        }
        
        // Success message
        this.printSuccessMessage('Contact form submitted successfully!');
        
        // Animate success indicator
        this.printFormattedOutput(`
            <div class="submission-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="success-message">
                    Thank you for your message. I will respond as soon as possible.
                </div>
            </div>
        `);
        
        // Show submission summary in a card format
        this.printFormattedOutput(`
            <div class="submission-summary">
                <div class="summary-title">Submission Summary</div>
                <div class="summary-content">
                    <div class="summary-row">
                        <div class="summary-label">Name:</div>
                        <div class="summary-value">${this.escapeHtml(this.fieldValues.name)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Email:</div>
                        <div class="summary-value">${this.escapeHtml(this.fieldValues.email)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Subject:</div>
                        <div class="summary-value">${this.escapeHtml(this.fieldValues.subject)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Message:</div>
                        <div class="summary-value message-content">${this.escapeHtml(this.fieldValues.message)}</div>
                    </div>
                </div>
                <div class="summary-footer">
                    <div class="reference-number">Reference: ${this.generateReferenceNumber()}</div>
                    <div class="summary-timestamp">${new Date().toLocaleString()}</div>
                </div>
            </div>
        `);
        
        // Reset state
        this.isProcessing = false;
        this.updateStatus('Ready', 'Form submitted');
        this.currentField = null;
        
        // Actually submit the data (would be implemented in production)
        // this.sendContactData(this.fieldValues);
    }
    
    /**
     * Generate a reference number for form submissions
     */
    generateReferenceNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `SB-${timestamp}-${random}`;
    }
    
    /**
     * Change terminal theme
     */
    changeTheme(themeName) {
        if (!themeName) {
            this.printSystemMessage('Available themes: dark, light, matrix, retro, blue');
            return;
        }
        
        const validThemes = ['dark', 'light', 'matrix', 'retro', 'blue'];
        
        if (validThemes.includes(themeName.toLowerCase())) {
            this.applyTheme(themeName.toLowerCase());
            this.config.theme = themeName.toLowerCase();
            this.savePreferences();
            this.printSuccessMessage(`Theme changed to: ${themeName}`);
        } else {
            this.printErrorMessage(`Invalid theme: ${themeName}`);
            this.printSystemMessage('Available themes: dark, light, matrix, retro, blue');
        }
    }
    
    /**
     * Apply a theme to the terminal
     */
    applyTheme(themeName) {
        // Remove any existing themes
        this.container.classList.remove('theme-dark', 'theme-light', 'theme-matrix', 'theme-retro', 'theme-blue');
        
        // Apply the new theme
        this.container.classList.add(`theme-${themeName}`);
    }
    
    /**
     * Close the terminal
     */
    closeTerminal() {
        this.printSystemMessage('Closing terminal...');
        this.playSound('close');
        
        setTimeout(() => {
            this.animateElement(this.container, 'terminal-fade-out');
            setTimeout(() => {
                this.container.classList.add('hidden');
            }, 500);
        }, 500);
    }
    
    /**
     * Print a command to the terminal with enhanced styling
     */
    printCommand(command) {
        const commandLine = document.createElement('div');
        commandLine.className = 'output-line command-line';
        commandLine.innerHTML = `<span class="prompt-symbol">~$</span> <span class="command-text">${this.escapeHtml(command)}</span>`;
        this.outputElement.appendChild(commandLine);
        this.scrollToBottom();
        
        this.terminalLog.push({ type: 'command', content: command });
    }
    
    /**
     * Print a system message with optional animation
     */
    printSystemMessage(message, className = '') {
        const messageLine = document.createElement('div');
        messageLine.className = `output-line system-line ${className}`;
        messageLine.textContent = message;
        
        if (this.config.animationsEnabled) {
            messageLine.style.opacity = '0';
            messageLine.style.transform = 'translateY(10px)';
        }
        
        this.outputElement.appendChild(messageLine);
        
        if (this.config.animationsEnabled) {
            setTimeout(() => {
                messageLine.style.transition = 'opacity 0.3s, transform 0.3s';
                messageLine.style.opacity = '1';
                messageLine.style.transform = 'translateY(0)';
            }, 10);
        }
        
        this.scrollToBottom();
        this.terminalLog.push({ type: 'system', content: message });
    }
    
    /**
     * Animate a progress bar
     */
    animateProgressBar(durationMs, callback) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">0%</div>
        `;
        
        this.outputElement.appendChild(progressContainer);
        this.scrollToBottom();
        
        const progressFill = progressContainer.querySelector('.progress-fill');
        const progressText = progressContainer.querySelector('.progress-text');
        
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            
            progressFill.style.width = `${progress * 100}%`;
            progressText.textContent = `${Math.round(progress * 100)}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(callback, 250);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Start the welcome sequence with enhanced animations
     */
    startWelcomeSequence() {
        setTimeout(() => {
            this.printFormattedOutput(`
                <div class="welcome-message">
                    <div class="welcome-logo">
                        <span class="logo-line logo-sb">SB</span>
                        <span class="logo-line">Strategic Insight Engine</span>
                    </div>
                </div>
            `);
            
            setTimeout(() => {
                this.typeMessage('Welcome to the Strategic Insight Engine Terminal', 'highlight-line');
                
                setTimeout(() => {
                    this.printFormattedOutput(`
                        <div class="terminal-init-sequence">
                            <div class="init-line"><span class="init-success">✓</span> Initializing system components</div>
                            <div class="init-line"><span class="init-success">✓</span> Loading communication protocols</div>
                            <div class="init-line"><span class="init-success">✓</span> Establishing secure connection</div>
                            <div class="init-line"><span class="init-success">✓</span> Connection established</div>
                        </div>
                    `);
                    
                    setTimeout(() => {
                        this.printSystemMessage('Type "help" to see available commands, or "contact" to get in touch.');
                    }, 500);
                }, 1000);
            }, 700);
        }, 300);
    }
    
    /**
     * Add animation to an element
     */
    animateElement(element, animationClass) {
        if (!this.config.animationsEnabled) return;
        
        element.classList.add(animationClass);
        element.addEventListener('animationend', () => {
            element.classList.remove(animationClass);
        }, { once: true });
    }
    
    /**
     * Play a sound effect if enabled
     */
    playSound(type) {
        if (!this.config.soundEnabled) return;
        
        // In a real implementation, you would play actual sound files
        // For now, we'll just do console output for demonstration
        // console.log(`Sound played: ${type}`);
        
        // Example implementation with AudioContext:
        /*
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        switch(type) {
            case 'click':
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.1;
                oscillator.type = 'sine';
                break;
            case 'error':
                oscillator.frequency.value = 150;
                gainNode.gain.value = 0.2;
                oscillator.type = 'sawtooth';
                break;
            // Add more sound types as needed
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(0);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
        */
    }
    
    /**
     * Copy terminal output to clipboard
     */
    copyOutputToClipboard() {
        // Create plain text version of terminal output
        const textOutput = this.terminalLog.map(entry => {
            if (entry.type === 'command') {
                return `$ ${entry.content}`;
            } else {
                return entry.content;
            }
        }).join('\n');
        
        navigator.clipboard.writeText(textOutput)
            .then(() => {
                this.printSystemMessage('Terminal output copied to clipboard', 'quiet-line');
                this.playSound('success');
            })
            .catch(err => {
                this.printErrorMessage('Failed to copy output: ' + err);
            });
    }
    
    /**
     * Save command history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('terminal_history', JSON.stringify(this.commandHistory.slice(-30)));
        } catch (e) {
            console.error('Failed to save command history', e);
        }
    }
    
    /**
     * Load command history from localStorage
     */
    loadHistory() {
        try {
            const history = localStorage.getItem('terminal_history');
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error('Failed to load command history', e);
            return [];
        }
    }
    
    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('terminal_preferences', JSON.stringify({
                theme: this.config.theme,
                typingSpeed: this.config.typingSpeed,
                animationsEnabled: this.config.animationsEnabled,
                soundEnabled: this.config.soundEnabled,
                suggestionsEnabled: this.config.suggestionsEnabled
            }));
        } catch (e) {
            console.error('Failed to save preferences', e);
        }
    }
    
    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        try {
            const prefs = localStorage.getItem('terminal_preferences');
            if (prefs) {
                const savedPrefs = JSON.parse(prefs);
                Object.assign(this.config, savedPrefs);
            }
        } catch (e) {
            console.error('Failed to load preferences', e);
        }
    }

    /* Other existing methods... */
    
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
            if (this.commandHistory.length > this.config.maxHistorySize) {
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
        const commands = this.availableCommands.map(cmd => cmd.name);
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
     * Clear the terminal output
     */
    clearTerminal() {
        this.outputElement.innerHTML = '';
        this.terminalLog = [];
    }
    
    /**
     * Print a new line
     */
    printNewLine() {
        this.printCommand('');
    }
    
    /**
     * Type a message character by character with improved animation
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
                
                // Randomize typing speed slightly for more natural effect
                const variance = Math.random() * 20 - 10; // -10 to +10ms variance
                const delay = this.config.typingSpeed + variance;
                
                setTimeout(typeNextChar, delay);
            }
        };
        
        typeNextChar();
        this.terminalLog.push({ type: 'typed', content: message });
    }
    
    /**
     * Start cursor blinking
     */
    startCursorBlink() {
        if (this.cursorBlinkInterval) {
            clearInterval(this.cursorBlinkInterval);
        }
        
        this.cursorBlinkInterval = setInterval(() => {
            this.cursorElement.classList.toggle('active');
        }, 600);
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
        return new Date().toLocaleTimeString();
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
    
    /**
     * Scroll terminal output to bottom
     */
    scrollToBottom() {
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
    
    /**
     * Print an error message
     */
    printErrorMessage(message) {
        const errorLine = document.createElement('div');
        errorLine.className = 'output-line error-line';
        
        // Add error icon
        errorLine.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${this.escapeHtml(message)}`;
        
        this.outputElement.appendChild(errorLine);
        this.scrollToBottom();
        this.playSound('error');
        this.terminalLog.push({ type: 'error', content: message });
    }
    
    /**
     * Print a success message
     */
    printSuccessMessage(message) {
        const successLine = document.createElement('div');
        successLine.className = 'output-line success-line';
        
        // Add success icon
        successLine.innerHTML = `<i class="fas fa-check-circle"></i> ${this.escapeHtml(message)}`;
        
        this.outputElement.appendChild(successLine);
        this.scrollToBottom();
        this.playSound('success');
        this.terminalLog.push({ type: 'success', content: message });
    }
    
    /**
     * Print formatted HTML output
     */
    printFormattedOutput(html) {
        const outputLine = document.createElement('div');
        outputLine.className = 'output-line formatted-content';
        outputLine.innerHTML = html;
        
        if (this.config.animationsEnabled) {
            outputLine.style.opacity = '0';
            outputLine.style.transform = 'translateY(5px)';
        }
        
        this.outputElement.appendChild(outputLine);
        
        if (this.config.animationsEnabled) {
            setTimeout(() => {
                outputLine.style.transition = 'opacity 0.3s, transform 0.3s';
                outputLine.style.opacity = '1';
                outputLine.style.transform = 'translateY(0)';
            }, 10);
        }
        
        this.scrollToBottom();
        this.terminalLog.push({ type: 'formatted', content: html });
    }
    
    /**
     * Safely executes DOM operations with error handling
     * @param {Function} callback - Function to execute
     * @param {string} fallbackMessage - Message to display if an error occurs
     * @returns {*} - The result of the callback function or undefined if an error occurred
     */
    safeExecute(callback, fallbackMessage = 'An error occurred') {
        try {
            return callback();
        } catch (error) {
            console.error('EnhancedContactTerminal Error:', error);
            this.printErrorMessage(fallbackMessage);
            return undefined;
        }
    }
    
    /**
     * Performance optimization: Debounce function for operations that shouldn't fire too frequently
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} - Debounced function
     */
    debounce(func, wait = 100) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    /**
     * Clean up resources when the terminal is closed or destroyed
     * Good practice to prevent memory leaks
     */
    destroy() {
        // Clear any running intervals
        if (this.cursorBlinkInterval) {
            clearInterval(this.cursorBlinkInterval);
        }
        
        // Remove all event listeners - simplified example
        this.inputElement.removeEventListener('keydown', this._boundKeyDown);
        this.inputElement.removeEventListener('input', this._boundInput);
        
        // Clear all timeout references
        this._timeouts.forEach(clearTimeout);
        this._timeouts = [];
        
        // Save state
        this.saveHistory();
        this.savePreferences();
        
        console.log('Terminal resources cleaned up');
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the contact terminal container exists
    const terminalContainer = document.getElementById('contact-terminal');
    if (terminalContainer) {
        try {
            window.contactTerminal = new EnhancedContactTerminal('contact-terminal');
            
            // Add cleanup on page unload
            window.addEventListener('beforeunload', () => {
                if (window.contactTerminal && typeof window.contactTerminal.destroy === 'function') {
                    window.contactTerminal.destroy();
                }
            });
        } catch (error) {
            console.error('Failed to initialize contact terminal:', error);
            // Provide fallback content if initialization fails
            terminalContainer.innerHTML = `
                <div class="terminal-fallback">
                    <h3>Contact Form</h3>
                    <p>Please enable JavaScript to use the interactive terminal, or contact us directly at <a href="mailto:contact@example.com">contact@example.com</a>.</p>
                </div>
            `;
        }
    }
});
