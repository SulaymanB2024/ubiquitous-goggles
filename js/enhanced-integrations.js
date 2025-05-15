/**
 * Enhanced Components Integration
 * Connects and initializes all enhanced components with cross-communication
 * Optimized for performance with event debouncing and lazy initialization
 */

// Central event bus for optimized component communication
window.EventBus = {
    events: {},
    
    // Subscribe to an event
    subscribe: function(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
        return () => this.unsubscribe(event, callback); // Return unsubscribe function
    },
    
    // Unsubscribe from an event
    unsubscribe: function(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    },
    
    // Publish an event with data
    publish: function(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize System Log first so other components can use it
    window.SystemLog = new EnhancedSystemLog({
        initiallyExpanded: false,
        notificationsEnabled: true,
        containerSelector: '#system-log-console',
        maxEntries: 100 // Limit entries for better performance
    });
    
    SystemLog.addEntry({
        type: "system",
        category: "initialization",
        message: "Strategic Insight Engine initializing",
        timestamp: new Date()
    });
    
    // Initialize the Skills Radar Chart
    if (document.getElementById('skills-radar-container')) {
        window.SkillsRadar = new EnhancedSkillsRadar('skills-radar-container', {
            categories: [
                { id: 'development', name: 'Development', color: '#00BFFF' },
                { id: 'finance', name: 'Finance', color: '#3B4A68' },
                { id: 'analytics', name: 'Analytics', color: '#8A94AD' },
                { id: 'leadership', name: 'Leadership', color: '#415577' },
                { id: 'music', name: 'Music', color: '#6D87B5' }
            ],
            skills: [
                { name: 'JavaScript', value: 90, category: 'development' },
                { name: 'Python', value: 85, category: 'development' },
                { name: 'React', value: 88, category: 'development' },
                { name: 'Node.js', value: 82, category: 'development' },
                { name: 'SQL', value: 80, category: 'development' },
                { name: 'AWS', value: 75, category: 'development' },
                
                { name: 'Financial Modeling', value: 92, category: 'finance' },
                { name: 'Investment Analysis', value: 88, category: 'finance' },
                { name: 'Risk Assessment', value: 85, category: 'finance' },
                { name: 'Portfolio Optimization', value: 90, category: 'finance' },
                { name: 'Quantitative Analysis', value: 86, category: 'finance' },
                
                { name: 'Data Visualization', value: 88, category: 'analytics' },
                { name: 'Statistical Analysis', value: 84, category: 'analytics' },
                { name: 'Machine Learning', value: 78, category: 'analytics' },
                { name: 'Pattern Recognition', value: 82, category: 'analytics' },
                
                { name: 'Strategic Leadership', value: 87, category: 'leadership' },
                { name: 'Team Management', value: 90, category: 'leadership' },
                { name: 'Project Management', value: 85, category: 'leadership' },
                { name: 'Communication', value: 92, category: 'leadership' },
                
                { name: 'Music Production', value: 88, category: 'music' },
                { name: 'Composition', value: 85, category: 'music' },
                { name: 'Audio Engineering', value: 80, category: 'music' },
                { name: 'Digital Audio', value: 87, category: 'music' }
            ]
        });
        
        SystemLog.addEntry({
            type: "system",
            category: "initialization",
            message: "Skills Radar Chart initialized",
            timestamp: new Date()
        });
    }
    
    // Initialize the Contact Terminal
    if (document.getElementById('contact-terminal')) {
        window.ContactTerminal = new EnhancedContactTerminal('contact-terminal', {
            welcomeMessage: "// INITIALIZING CONNECTION PROTOCOL...\n// SYSTEM ONLINE. READY FOR INPUT.\n// TYPE 'help' FOR AVAILABLE COMMANDS."
        });
        
        SystemLog.addEntry({
            type: "system",
            category: "initialization",
            message: "Contact Terminal initialized",
            timestamp: new Date()
        });
    }
    
    // Set up component interactions
    setupComponentInteractions();
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Log full initialization complete
    SystemLog.addEntry({
        type: "system",
        category: "initialization",
        message: "Strategic Insight Engine fully operational",
        timestamp: new Date(),
        priority: "high"
    });
});

/**
 * Initialize performance monitoring
 */
function initPerformanceMonitoring() {
    // Monitor frame rate and performance metrics
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    
    // Performance detection loop
    function checkPerformance() {
        // Count frames
        frames++;
        
        // Calculate FPS every second
        const now = performance.now();
        if (now >= lastTime + 1000) {
            fps = Math.round((frames * 1000) / (now - lastTime));
            frames = 0;
            lastTime = now;
            
            // Report low performance
            if (fps < 30) {
                SystemLog.addEntry({
                    type: "system",
                    category: "performance",
                    message: `Low frame rate detected: ${fps} FPS - Activating performance mode`,
                    timestamp: new Date()
                });
                
                // Publish event for components to optimize rendering
                EventBus.publish('performance:low', { fps });
            }
        }
        
        // Continue monitoring
        requestAnimationFrame(checkPerformance);
    }
    
    // Start performance monitoring
    requestAnimationFrame(checkPerformance);
}

/**
 * Setup interactions between the enhanced components using the EventBus
 * for better decoupling and performance
 */
function setupComponentInteractions() {
    // 1. Network Visualization & Skills Radar interactions
    if (window.networkVisualization && window.SkillsRadar) {
        // When a skill-related node is clicked in the network, highlight that skill in the radar
        document.querySelectorAll('.network-node').forEach(node => {
            node.addEventListener('click', function() {
                const nodeData = this.__data__; // D3 data binding
                if (nodeData && nodeData.type === 'skill') {
                    window.SkillsRadar.highlightSkill(nodeData.id);
                    
                    SystemLog.addEntry({
                        type: "user",
                        category: "interaction",
                        message: `Skill node selected: ${nodeData.name}`,
                        timestamp: new Date()
                    });
                }
            });
        });
        
        // Skills radar selection can filter network visualization
        if (window.SkillsRadar) {
            window.SkillsRadar.on('skillSelected', function(skill) {
                if (window.networkVisualization) {
                    window.networkVisualization.highlightConnections(skill.name);
                    
                    SystemLog.addEntry({
                        type: "user",
                        category: "interaction",
                        message: `Skill highlighted in radar: ${skill.name}`,
                        timestamp: new Date()
                    });
                }
            });
        }
    }
    
    // 2. Contact Terminal & System Log interactions
    if (window.ContactTerminal && window.SystemLog) {
        // Log contact form submissions and commands
        window.ContactTerminal.on('commandEntered', function(command) {
            SystemLog.addEntry({
                type: "user",
                category: "terminal",
                message: `Command entered: ${command}`,
                timestamp: new Date()
            });
        });
        
        window.ContactTerminal.on('messageSent', function(formData) {
            SystemLog.addEntry({
                type: "user",
                category: "contact",
                message: `Contact message sent from: ${formData.name}`,
                timestamp: new Date(),
                priority: "high"
            });
        });
        
        // Special terminal command to display system log
        window.ContactTerminal.registerCommand('showlogs', function() {
            document.getElementById('system-log-console').classList.add('expanded');
            return "System logs displayed. Use 'hidelogs' to collapse.";
        });
        
        window.ContactTerminal.registerCommand('hidelogs', function() {
            document.getElementById('system-log-console').classList.remove('expanded');
            return "System logs hidden.";
        });
    }
    
    // Set up global event listeners for various state changes
    setupEventListeners();
    
    // Register performance optimization handlers
    EventBus.subscribe('performance:low', optimizeForLowPerformance);
    
    // Set up interactive elements across the site to log user activity
    setupActivityLogging();
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Listen for theme changes
    EventBus.subscribe('theme:changed', (data) => {
        SystemLog.addEntry({
            type: "system",
            category: "ui",
            message: `Theme changed to: ${data.theme}`,
            timestamp: new Date()
        });
    });
    
    // Listen for data analysis events
    EventBus.subscribe('data:analyzed', (data) => {
        SystemLog.addEntry({
            type: "system",
            category: "analytics",
            message: `Data analyzed: ${data.metric} - ${data.result}`,
            timestamp: new Date()
        });
    });
}

/**
 * Optimize visualizations and animations when low performance is detected
 */
function optimizeForLowPerformance(data) {
    // Reduce particles count and effects
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        const pJS = window.pJSDom[0].pJS;
        
        // Reduce number of particles
        const currentParticles = pJS.particles.array.length;
        const targetParticles = Math.floor(currentParticles * 0.6);
        
        while (pJS.particles.array.length > targetParticles) {
            pJS.particles.array.pop();
        }
        
        // Disable animations
        pJS.particles.move.speed = 0.2;
        
        // Update particles
        pJS.fn.particlesRefresh();
    }
    
    // Add performance class to body for CSS optimizations
    document.body.classList.add('performance-mode');
    
    // Disable non-critical animations
    document.querySelectorAll('.animated-bg, .floating-data').forEach(el => {
        el.style.animationPlayState = 'paused';
    });
}

/**
 * Set up activity logging for interactive elements with debouncing
 * to reduce system log spam and improve performance
 */
function setupActivityLogging() {
    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Log section navigation (no debounce needed)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const section = this.getAttribute('href').replace('#', '');
            
            SystemLog.addEntry({
                type: "user",
                category: "navigation",
                message: `Navigated to section: ${section}`,
                timestamp: new Date()
            });
        });
    });
    
    // Log project interactions
    document.querySelectorAll('.btn-project').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            
            SystemLog.addEntry({
                type: "user",
                category: "projects",
                message: `Viewed project details: ${projectId}`,
                timestamp: new Date()
            });
        });
    });
    
    // Log timeline filter usage
    const timelineElement = document.getElementById('projects-timeline');
    if (timelineElement) {
        timelineElement.addEventListener('change', function() {
            SystemLog.addEntry({
                type: "user",
                category: "filter",
                message: "Timeline filter adjusted",
                timestamp: new Date()
            });
        });
    }
    
    // Log when user has scrolled to bottom of page - throttled
    let hasReachedBottom = false;
    let lastScrollTime = 0;
    const scrollThreshold = 100; // ms between scroll events
    
    window.addEventListener('scroll', function() {
        const now = Date.now();
        if (now - lastScrollTime < scrollThreshold) return;
        lastScrollTime = now;
        
        const scrollPosition = window.scrollY + window.innerHeight;
        const pageHeight = document.body.offsetHeight - 100; // minus 100px threshold
        
        if (scrollPosition >= pageHeight && !hasReachedBottom) {
            hasReachedBottom = true;
            
            SystemLog.addEntry({
                type: "user",
                category: "engagement",
                message: "User reached bottom of page",
                timestamp: new Date()
            });
            
            // Trigger insight analysis when user has viewed all content
            setTimeout(() => {
                EventBus.publish('engagement:complete', { timestamp: Date.now() });
                
                // Show insight summary
                if (window.SkillsRadar) {
                    window.SkillsRadar.showInsightSummary();
                }
                
                SystemLog.addEntry({
                    type: "system",
                    category: "analytics",
                    message: "Full content engagement detected - Insight analysis complete",
                    timestamp: new Date(),
                    priority: "high"
                });
            }, 2000);
            
        } else if (scrollPosition < pageHeight - window.innerHeight/2) {
            hasReachedBottom = false;
        }
    });
    
    // Track idle time for engagement metrics
    let idleTimer = null;
    const idleThreshold = 60000; // 60 seconds
    
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            SystemLog.addEntry({
                type: "system",
                category: "engagement",
                message: "User inactive for 60+ seconds",
                timestamp: new Date()
            });
        }, idleThreshold);
    }
    
    // Reset idle timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, debounce(resetIdleTimer, 100), { passive: true });
    });
    
    // Initial timer start
    resetIdleTimer();
    
    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}
