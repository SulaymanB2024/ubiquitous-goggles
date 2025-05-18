/**
 * Enhanced Contact Terminal - Fixes
 * This file contains fixes for the enhanced-contact-terminal.js component
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for the terminal to initialize
    setTimeout(() => {
        if (window.contactTerminal) {
            // Fix the settings panel
            const originalShowSettings = window.contactTerminal.showSettings;
            window.contactTerminal.showSettings = function() {
                // Call original method
                originalShowSettings.call(this);
                
                // After the settings panel is created, we need to properly handle typing speed settings
                setTimeout(() => {
                    // Set the correct active state for typing speed buttons based on current setting
                    const typingSpeedButtons = document.querySelectorAll('.setting-item[data-setting="typing-speed"] .setting-btn');
                    
                    if (typingSpeedButtons.length > 0) {
                        // Clear all active states
                        typingSpeedButtons.forEach(button => button.classList.remove('active'));
                        
                        // Set the correct active state based on current setting
                        let activeButtonIndex = 1; // Default is medium
                        if (this.config.typingSpeed >= 50) {
                            activeButtonIndex = 0; // Slow
                        } else if (this.config.typingSpeed <= 10) {
                            activeButtonIndex = 2; // Fast
                        }
                        
                        if (typingSpeedButtons[activeButtonIndex]) {
                            typingSpeedButtons[activeButtonIndex].classList.add('active');
                        }
                    }
                    
                    // Make sure typing speed buttons have event handlers
                    typingSpeedButtons.forEach((btn, index) => {
                        // Remove existing handlers to avoid duplication
                        const newBtn = btn.cloneNode(true);
                        btn.parentNode.replaceChild(newBtn, btn);
                        
                        // Add fresh handler
                        newBtn.addEventListener('click', (e) => {
                            // Remove active class from all buttons in this group
                            typingSpeedButtons.forEach(b => b.classList.remove('active'));
                            
                            // Add active class to clicked button
                            e.target.classList.add('active');
                            
                            // Set typing speed based on button index
                            switch(index) {
                                case 0: // Slow
                                    window.contactTerminal.config.typingSpeed = 50;
                                    break;
                                case 1: // Medium
                                    window.contactTerminal.config.typingSpeed = 30;
                                    break;
                                case 2: // Fast
                                    window.contactTerminal.config.typingSpeed = 10;
                                    break;
                            }
                            
                            window.contactTerminal.playSound('click');
                            window.contactTerminal.savePreferences();
                        });
                    });
                    
                    // Make sure the save button works correctly
                    const saveButton = document.querySelector('.save-settings');
                    if (saveButton) {
                        // Remove existing handler
                        const newSaveBtn = saveButton.cloneNode(true);
                        saveButton.parentNode.replaceChild(newSaveBtn, saveButton);
                        
                        // Add fresh handler that also clears the settings panel
                        newSaveBtn.addEventListener('click', () => {
                            window.contactTerminal.savePreferences();
                            window.contactTerminal.printSuccessMessage('Settings saved successfully!');
                            window.contactTerminal.playSound('success');
                            window.contactTerminal.clearOutput(); // Clear the settings panel
                        });
                    }
                    
                    // Fix reset button
                    const resetButton = document.querySelector('.reset-settings');
                    if (resetButton) {
                        // Remove existing handler
                        const newResetBtn = resetButton.cloneNode(true);
                        resetButton.parentNode.replaceChild(newResetBtn, resetButton);
                        
                        // Add fresh handler with complete reset functionality
                        newResetBtn.addEventListener('click', () => {
                            // Reset to default values
                            window.contactTerminal.config = {
                                typingSpeed: 30,
                                maxHistorySize: 50,
                                theme: 'dark',
                                animationsEnabled: true,
                                soundEnabled: false,
                                suggestionsEnabled: true
                            };
                            
                            window.contactTerminal.savePreferences();
                            window.contactTerminal.applyTheme(window.contactTerminal.config.theme);
                            window.contactTerminal.printSuccessMessage('Settings reset to defaults');
                            window.contactTerminal.playSound('success');
                            window.contactTerminal.clearOutput(); // Clear the settings panel
                            
                            // Re-show settings with default values
                            setTimeout(() => window.contactTerminal.showSettings(), 500);
                        });
                    }
                }, 100); // Short timeout to ensure DOM is ready
            };
            
            console.log("Enhanced Contact Terminal fixes applied");
        }
    }, 500); // Wait for terminal initialization
});
