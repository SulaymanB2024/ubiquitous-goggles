/**
 * Event Bus
 * Lightweight publish/subscribe system to enable cross-component communication
 * Enhanced with diagnostic capabilities and error handling
 */

class EventBus {
    constructor() {
        this.subscribers = {};
        this.eventHistory = [];
        this.maxHistoryLength = 100;
        this.debugMode = false;
        
        // Log creation
        console.log("[EventBus] Initialized cross-component communication system");
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Function to call when event is published
     * @returns {function} Unsubscribe function
     */
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        
        this.subscribers[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
        };
    }
    
    /**
     * Publish an event with data
     * @param {string} event - Event name
     * @param {any} data - Event data
     * @returns {boolean} Success status
     */
    publish(event, data) {
        // Track event in history
        const eventRecord = {
            event,
            data,
            timestamp: new Date(),
            subscriberCount: this.subscribers[event]?.length || 0
        };
        
        this.eventHistory.unshift(eventRecord);
        
        // Maintain history size
        if (this.eventHistory.length > this.maxHistoryLength) {
            this.eventHistory.pop();
        }
        
        // Log event if in debug mode
        if (this.debugMode) {
            console.log(`[EventBus] Event "${event}" published with data:`, data);
        }
        
        // Track event in system log if available
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: "system",
                category: "event-bus",
                message: `Event published: ${event}`,
                timestamp: new Date(),
                data: { subscriberCount: this.subscribers[event]?.length || 0 }
            });
        }
        
        // If no subscribers, return false
        if (!this.subscribers[event] || this.subscribers[event].length === 0) {
            if (this.debugMode) {
                console.warn(`[EventBus] No subscribers for event "${event}"`);
            }
            return false;
        }
        
        // Execute callbacks for all subscribers
        let success = true;
        this.subscribers[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                success = false;
                console.error(`[EventBus] Error in subscriber for "${event}":`, error);
                
                // Log error in system log if available
                if (window.SystemLog) {
                    window.SystemLog.addEntry({
                        type: "error",
                        category: "event-bus",
                        message: `Error in subscriber for event "${event}": ${error.message}`,
                        timestamp: new Date(),
                        error: error.stack
                    });
                }
            }
        });
        
        return success;
    }
    
    /**
     * Get all events
     * @returns {string[]} List of event names
     */
    getEvents() {
        return Object.keys(this.subscribers);
    }
    
    /**
     * Get event history
     * @param {number} limit - Maximum number of events to return
     * @returns {Array} Event history
     */
    getEventHistory(limit = this.maxHistoryLength) {
        return this.eventHistory.slice(0, limit);
    }
    
    /**
     * Get subscriber count for an event
     * @param {string} event - Event name
     * @returns {number} Number of subscribers
     */
    getSubscriberCount(event) {
        return this.subscribers[event]?.length || 0;
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[EventBus] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Clear event history
     */
    clearEventHistory() {
        this.eventHistory = [];
    }
}

// Create global instance
if (!window.EventBus) {
    window.EventBus = new EventBus();
    
    // Log to console when ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[EventBus] Global instance initialized and ready for cross-component communication');
        
        // Enable debug mode in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.EventBus.setDebugMode(true);
        }
    });
}

// Create system log if not exists
window.SystemLog = window.SystemLog || {
    entries: [],
    addEntry(entry) {
        // Add timestamp if not provided
        if (!entry.timestamp) {
            entry.timestamp = new Date();
        }
        
        this.entries.push(entry);
        
        // If in debug mode, also log to console
        if (window.DEBUG_MODE) {
            console.log(`[${entry.type.toUpperCase()}] ${entry.message}`);
        }
        
        // Publish to event bus if available
        if (window.EventBus) {
            window.EventBus.publish('systemLog:entry', entry);
        }
        
        // Limit log size to prevent memory issues
        if (this.entries.length > 1000) {
            this.entries.shift();
        }
    },
    getEntries(type = null) {
        if (!type) {
            return this.entries.slice();
        }
        return this.entries.filter(entry => entry.type === type);
    },
    clear() {
        this.entries = [];
        console.log('[SystemLog] Log cleared');
    }
};
