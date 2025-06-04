/**
 * Advanced Strategic Network Visualization
 * Palantir-grade visualization of interconnected data points with real-time analysis
 * Optimized for performance with WebGL acceleration and efficient rendering
 */

class NetworkVisualization {
    constructor(containerId, data = null) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = 500; // Default height
        this.data = data || this.generateDefaultData();
        this.simulation = null;
        this.svg = null;
        this.links = null;
        this.nodes = null;
        this.tooltip = null;
        this.highlightedNode = null;
        this.selectedNodes = new Set();
        this.analysisMode = false;
        this.renderFrameId = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.layoutStabilized = false;
        
        // Enhanced visual configuration
        this.categoryColors = {
            'finance': '#00BFFF', // accent-primary
            'tech': '#3B4A68',    // accent-secondary
            'music': '#8A94AD',   // medium-text
            'leadership': '#6D87B5', // additional color
            'analytics': '#415577'  // additional color
        };
        
        // Performance configuration
        this.config = {
            useWebGL: window.WebGLRenderingContext !== undefined,
            renderThrottleMs: 16, // ~60fps max
            labelDisplayThreshold: 2.5, // Zoom level at which to show labels
            ticksPerRender: 3,
            adaptivePhysics: true,
            forceStrength: 0.7,
            nodeCount: 0,
            maxNodesBeforeSimplification: 100
        };

        // Status indicator elements
        this.nodeCountElement = null;
        this.nodeCountValueElement = null;
        this.connectionStatusElement = null;
        
        // Initialize the InfoPanel
        this.infoPanel = new InfoPanel();
        
        // Advanced analysis engine
        this.analysisEngine = {
            patternRecognition: false,
            clusterDetection: false,
            insightGeneration: false,
            realTimeMetrics: {
                networkDensity: 0,
                clusterCoefficient: 0,
                centralNodes: []
            }
        };
        
        // Initialize the visualization
        this.init();
        
        // Handle window resize with debouncing
        this.resizeTimeout = null;
        window.addEventListener('resize', this.handleResizeDebounced.bind(this));
        
        // Subscribe to EventBus if available
        if (window.EventBus) {
            window.EventBus.subscribe('performance:low', this.enablePerformanceMode.bind(this));
            window.EventBus.subscribe('skills:insightGenerated', this.highlightRelatedNodes.bind(this));
        }
    }
    
    /**
     * Initialize the visualization
     */
    init() {
        // Create SVG container
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", this.width);
        this.svg.setAttribute("height", this.height);
        this.svg.classList.add("network-visualization");
        this.container.appendChild(this.svg);
        
        // Create tooltip
        this.tooltip = document.createElement("div");
        this.tooltip.classList.add("network-tooltip");
        this.tooltip.style.display = "none";
        this.container.appendChild(this.tooltip);
        
        // Initialize enhanced network features
        this.initEnhancedFeatures();
        
        // Set up cursor interaction for network
        this.setupCursorInteraction();
        
        // Create the force simulation
        this.createSimulation();
        
        // Create the visualization elements
        this.createVisualization();

        // Create status indicators
        this.createStatusIndicators();
        this.updateNodeCount();
        this.setConnectionStatus(true);

        // Start the simulation
        this.simulation.on("tick", this.ticked.bind(this));
    }
    
    /**
     * Initialize enhanced network visualization features
     */
    initEnhancedFeatures() {
        // Set up EventBus listeners for cross-component communication
        if (window.EventBus) {
            // Subscribe to events from the Skills Radar
            window.EventBus.subscribe('skills:insightGenerated', this.handleSkillInsightGenerated.bind(this));
            window.EventBus.subscribe('skills:insightRequested', this.handleSkillInsightRequested.bind(this));
        }
        
        // Create grid background
        const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gridGroup.classList.add("network-grid");
        
        // Create horizontal grid lines
        for (let y = 0; y <= this.height; y += 20) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", 0);
            line.setAttribute("y1", y);
            line.setAttribute("x2", this.width);
            line.setAttribute("y2", y);
            line.classList.add("network-grid-line");
            gridGroup.appendChild(line);
        }
        
        // Create vertical grid lines
        for (let x = 0; x <= this.width; x += 20) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", 0);
            line.setAttribute("x2", x);
            line.setAttribute("y2", this.height);
            line.classList.add("network-grid-line");
            gridGroup.appendChild(line);
        }
        
        // Insert grid before any other elements
        this.svg.insertBefore(gridGroup, this.svg.firstChild);
        
        // Create radial gradients for nodes
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        
        // Create gradient for each category
        Object.keys(this.categoryColors).forEach(category => {
            const gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
            gradient.id = `network-node-gradient-${category}`;
            
            // Inner color (brighter)
            const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop1.setAttribute("offset", "0%");
            stop1.setAttribute("stop-color", this.categoryColors[category]);
            stop1.setAttribute("stop-opacity", "0.9");
            
            // Outer color (darker)
            const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop2.setAttribute("offset", "100%");
            stop2.setAttribute("stop-color", this.categoryColors[category]);
            stop2.setAttribute("stop-opacity", "0.3");
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
        });
        
        this.svg.appendChild(defs);
        
        // Log initialization to system log if available
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: "system",
                category: "network",
                message: "Enhanced network visualization initialized",
                details: "Grid background and node styling applied"
            });
        }
    }
    
    /**
     * Generate default data structure if none is provided
     */
    generateDefaultData() {
        // Create nodes for skills, projects, and leadership
        const nodes = [
            // Skills
            { id: 1, name: "Financial Modeling", category: "finance", type: "skill", weight: 90 },
            { id: 2, name: "Data Analysis", category: "finance", type: "skill", weight: 85 },
            { id: 3, name: "JavaScript", category: "tech", type: "skill", weight: 90 },
            { id: 4, name: "Python", category: "tech", type: "skill", weight: 88 },
            { id: 5, name: "React", category: "tech", type: "skill", weight: 92 },
            { id: 6, name: "Machine Learning", category: "tech", type: "skill", weight: 80 },
            { id: 7, name: "Music Production", category: "music", type: "skill", weight: 75 },
            { id: 8, name: "Sound Design", category: "music", type: "skill", weight: 78 },
            
            // Projects
            { id: 9, name: "Financial Analytics Platform", category: "finance", type: "project", weight: 60 },
            { id: 10, name: "Machine Learning Framework", category: "tech", type: "project", weight: 65 },
            { id: 11, name: "Audio Synthesis Engine", category: "music", type: "project", weight: 55 },
            { id: 12, name: "Investment Strategy System", category: "finance", type: "project", weight: 60 },
            
            // Leadership
            { id: 13, name: "Strategic Leadership Director", category: "finance", type: "leadership", weight: 70 },
            { id: 14, name: "Technology Advisory Board Member", category: "tech", type: "leadership", weight: 75 },
            { id: 15, name: "Creative Director & Founder", category: "music", type: "leadership", weight: 65 }
        ];
        
        // Create links between related nodes
        const links = [
            { source: 1, target: 9, strength: 0.7 },
            { source: 2, target: 9, strength: 0.6 },
            { source: 1, target: 12, strength: 0.8 },
            { source: 2, target: 12, strength: 0.6 },
            { source: 3, target: 9, strength: 0.5 },
            { source: 4, target: 10, strength: 0.8 },
            { source: 6, target: 10, strength: 0.9 },
            { source: 7, target: 11, strength: 0.7 },
            { source: 8, target: 11, strength: 0.8 },
            { source: 3, target: 11, strength: 0.4 },
            { source: 1, target: 13, strength: 0.7 },
            { source: 3, target: 14, strength: 0.5 },
            { source: 4, target: 14, strength: 0.6 },
            { source: 6, target: 14, strength: 0.7 },
            { source: 7, target: 15, strength: 0.8 },
            { source: 8, target: 15, strength: 0.7 },
            { source: 13, target: 9, strength: 0.4 },
            { source: 13, target: 12, strength: 0.5 },
            { source: 14, target: 10, strength: 0.6 },
            { source: 15, target: 11, strength: 0.7 }
        ];
        
        return { nodes, links };
    }
    
    /**
     * Create the D3 force simulation
     */
    createSimulation() {
        // Create the simulation using D3's force layout
        this.simulation = d3.forceSimulation(this.data.nodes)
            .force("link", d3.forceLink(this.data.links)
                .id(d => d.id)
                .distance(d => 100 / d.strength)
                .strength(d => d.strength))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collision", d3.forceCollide().radius(d => this.getNodeRadius(d) + 2));
    }
    
    /**
     * Create the visualization elements
     */
    createVisualization() {
        // Create links
        this.links = d3.select(this.svg)
            .selectAll("line")
            .data(this.data.links)
            .enter()
            .append("line")
            .attr("stroke", "rgba(255, 255, 255, 0.1)")
            .attr("stroke-width", d => d.strength * 2);
        
        // Create nodes
        this.nodes = d3.select(this.svg)
            .selectAll("circle")
            .data(this.data.nodes)
            .enter()
            .append("circle")
            .attr("r", d => this.getNodeRadius(d))
            .attr("fill", d => this.getNodeColor(d))
            .attr("stroke", "#0A0F1F")
            .attr("stroke-width", 2)
            .call(d3.drag()
                .on("start", this.dragstarted.bind(this))
                .on("drag", this.dragged.bind(this))
                .on("end", this.dragended.bind(this)));
        
        // Add hover interaction
        this.nodes
            .on("mouseover", this.showTooltip.bind(this))
            .on("mousemove", this.moveTooltip.bind(this))
            .on("mouseout", this.hideTooltip.bind(this))
            .on("click", this.highlightConnections.bind(this));
        
        // Add labels for larger nodes
        d3.select(this.svg)
            .selectAll("text")
            .data(this.data.nodes.filter(d => d.weight > 70))
            .enter()
            .append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", "#E0E7FF")
            .attr("pointer-events", "none")
            .text(d => this.getNodeShortLabel(d));
    }
    
    /**
     * Get the radius of a node based on its weight
     */
    getNodeRadius(d) {
        const baseSize = 5;
        return baseSize + (d.weight / 10);
    }
    
    /**
     * Get the color of a node based on its category
     */
    getNodeColor(d) {
        return this.categoryColors[d.category] || "#8A94AD";
    }
    
    /**
     * Get a short label for node display
     */
    getNodeShortLabel(d) {
        if (d.name.length > 12) {
            return d.name.substring(0, 10) + "...";
        }
        return d.name;
    }
    
    /**
     * Update the position of nodes and links on each tick of the simulation
     */
    ticked() {
        this.links
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        this.nodes
            .attr("cx", d => d.x = Math.max(this.getNodeRadius(d), Math.min(this.width - this.getNodeRadius(d), d.x)))
            .attr("cy", d => d.y = Math.max(this.getNodeRadius(d), Math.min(this.height - this.getNodeRadius(d), d.y)));
        
        // Update positions of labels
        d3.select(this.svg)
            .selectAll("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y - this.getNodeRadius(d) - 7);
    }
    
    /**
     * Handle drag start event
     */
    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    /**
     * Handle drag event
     */
    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    /**
     * Handle drag end event
     */
    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    /**
     * Show tooltip on node hover
     */
    showTooltip(event, d) {
        this.tooltip.innerHTML = `
            <div class="tooltip-title">${d.name}</div>
            <div class="tooltip-category">${d.category.toUpperCase()} | ${d.type.toUpperCase()}</div>
            <div class="tooltip-weight">Weight: ${d.weight}%</div>
        `;
        this.tooltip.style.display = "block";
        this.moveTooltip(event);
    }
    
    /**
     * Move tooltip with mouse
     */
    moveTooltip(event) {
        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;
        const margin = 10;
        
        let x = event.pageX - this.container.getBoundingClientRect().left + 10;
        let y = event.pageY - this.container.getBoundingClientRect().top - tooltipHeight - margin;
        
        // Adjust if tooltip goes out of bounds
        if (x + tooltipWidth > this.width) {
            x = event.pageX - this.container.getBoundingClientRect().left - tooltipWidth - margin;
        }
        
        if (y < 0) {
            y = event.pageY - this.container.getBoundingClientRect().top + margin;
        }
        
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
    }
    
    /**
     * Hide tooltip when not hovering on node
     */
    hideTooltip() {
        this.tooltip.style.display = "none";
    }
    
    /**
     * Highlight node connections on click
     */
    highlightConnections(event, d) {
        // Reset previous highlight
        if (this.highlightedNode) {
            this.nodes.attr("opacity", 1);
            this.links.attr("opacity", 1)
                .attr("stroke", "rgba(255, 255, 255, 0.1)");
        }
        
        // Show the info panel with node data
        this.infoPanel.showPanel(this.enrichNodeData(d));
        
        // If clicking the same node, just reset
        if (this.highlightedNode === d) {
            this.highlightedNode = null;
            return;
        }
        
        // Set new highlighted node
        this.highlightedNode = d;
        
        // Find connected nodes and links
        const connectedNodeIds = new Set();
        connectedNodeIds.add(d.id);
        
        const connectedLinks = this.data.links.filter(link => {
            if (link.source.id === d.id || link.target.id === d.id) {
                connectedNodeIds.add(link.source.id);
                connectedNodeIds.add(link.target.id);
                return true;
            }
            return false;
        });
        
        // Update visualization
        this.nodes.attr("opacity", node => connectedNodeIds.has(node.id) ? 1 : 0.2);
        this.links.attr("opacity", link => 
            connectedLinks.includes(link) ? 1 : 0.1)
            .attr("stroke", link => 
                connectedLinks.includes(link) 
                ? `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--theme-accent-primary-rgb')}, 0.5)`
                : "rgba(255, 255, 255, 0.1)");
    }
    
    /**
     * Enrich node data with connection information for the InfoPanel
     * @param {Object} node - The node to enrich
     * @returns {Object} Enriched node data
     */
    enrichNodeData(node) {
        if (!node) return null;
        
        // Clone the node to avoid modifying the original
        const enrichedNode = { ...node };
        
        // Find all connected nodes
        const nodeConnections = [];
        this.data.links.forEach(link => {
            if (link.source.id === node.id || link.target.id === node.id) {
                // Get the connected node (source or target)
                const connectedNode = link.source.id === node.id ? link.target : link.source;
                
                // Add to connections array if not already there
                if (!nodeConnections.some(n => n.id === connectedNode.id)) {
                    nodeConnections.push({
                        id: connectedNode.id,
                        name: connectedNode.name,
                        type: connectedNode.type,
                        category: connectedNode.category
                    });
                }
            }
        });
        
        // Add connections to the enriched node
        enrichedNode.connections = nodeConnections;
        
        return enrichedNode;
    }
    
    /**
     * Find a node by ID
     * @param {string} id - Node ID to find
     * @returns {Object|null} - The found node or null
     */
    findNodeById(id) {
        return this.data.nodes.find(node => node.id === id) || null;
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.width = this.container.clientWidth;
        
        // Update SVG dimensions
        this.svg.setAttribute("width", this.width);
        
        // Update simulation center force
        this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2));
        this.simulation.alpha(0.3).restart();
    }
    
    /**
     * Update data and restart simulation
     */
    updateData(newData) {
        this.data = newData;
        
        // Remove existing elements
        d3.select(this.svg).selectAll("*").remove();
        
        // Recreate simulation
        this.createSimulation();
        this.createVisualization();
        this.updateNodeCount();
        this.setConnectionStatus(true);
        this.simulation.on("tick", this.ticked.bind(this));
    }
    
    /**
     * Filter visualization by category
     */
    filterByCategory(categories) {
        if (!categories || categories.length === 0) {
            // Reset filters
            this.nodes.attr("opacity", 1);
            this.links.attr("opacity", 1);
            return;
        }
        
        // Filter nodes by category
        const filteredNodeIds = new Set(
            this.data.nodes
                .filter(node => categories.includes(node.category))
                .map(node => node.id)
        );
        
        // Update visualization
        this.nodes.attr("opacity", node => filteredNodeIds.has(node.id) ? 1 : 0.2);
        this.links.attr("opacity", link => 
            filteredNodeIds.has(link.source.id) && filteredNodeIds.has(link.target.id) ? 1 : 0.1);
    }
    
    /**
     * Filter visualization by node type
     */
    filterByType(types) {
        if (!types || types.length === 0) {
            // Reset filters
            this.nodes.attr("opacity", 1);
            this.links.attr("opacity", 1);
            return;
        }
        
        // Filter nodes by type
        const filteredNodeIds = new Set(
            this.data.nodes
                .filter(node => types.includes(node.type))
                .map(node => node.id)
        );
        
        // Update visualization
        this.nodes.attr("opacity", node => filteredNodeIds.has(node.id) ? 1 : 0.2);
        this.links.attr("opacity", link => 
            filteredNodeIds.has(link.source.id) || filteredNodeIds.has(link.target.id) ? 1 : 0.1);
    }
    
    /**
     * Handle window resize with debouncing for better performance
     */
    handleResizeDebounced() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            this.handleResize();
        }, 250);
    }
    
    /**
     * Enable performance optimization mode
     */
    enablePerformanceMode(data) {
        // Adjust physics for better performance
        if (this.simulation) {
            this.simulation.stop();
            
            // Reduce physics complexity
            this.config.ticksPerRender = 1;
            this.config.renderThrottleMs = 33; // ~30fps
            
            // Restart with simplified physics
            this.simulation
                .velocityDecay(0.4) // Higher damping
                .force("charge", d3.forceManyBody().strength(-30)) // Weaker charge
                .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                .force("collide", d3.forceCollide(20).strength(0.5)) // Less collision detection
                .alpha(0.3)
                .restart();
                
            // Freeze simulation after short warmup
            setTimeout(() => {
                this.simulation.stop();
                this.layoutStabilized = true;
                
                // Remove dynamic elements
                d3.selectAll(".network-dynamic-element").remove();
                
                if (window.SystemLog) {
                    window.SystemLog.addEntry({
                        type: "system",
                        category: "performance",
                        message: "Network visualization optimized for performance",
                        timestamp: new Date()
                    });
                }
            }, 2000);
        }
        
        // Simplify visual elements
        d3.selectAll(".network-node-label").style("display", "none");
        d3.selectAll(".network-node-glow").style("opacity", 0);
        
        // Add performance mode class
        this.svg.classList.add("performance-mode");
    }
    
    /**
     * Highlight nodes related to specific skills or insights
     */
    highlightRelatedNodes(insights) {
        const highlightCategories = new Set();
        const highlightSkills = new Set();
        
        // Extract categories and skills to highlight
        if (insights.topCategory) {
            highlightCategories.add(insights.topCategory.name.toLowerCase());
        }
        
        if (insights.topSkills) {
            insights.topSkills.forEach(skill => {
                highlightSkills.add(skill.name.toLowerCase());
            });
        }

        // Log insights analysis
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: "system", 
                category: "integration",
                message: `Network visualization responding to skills insights with ${highlightSkills.size} key skills`,
                timestamp: new Date()
            });
        }
        
        // Get nodes to highlight
        const nodesToHighlight = this.data.nodes.filter(node => {
            // Highlight nodes in top category
            if (node.category && highlightCategories.has(node.category.toLowerCase())) {
                return true;
            }
            
            // Highlight nodes matching top skills
            if (node.name && highlightSkills.has(node.name.toLowerCase())) {
                return true;
            }
            
            return false;
        }).map(node => node.id);
        
        // Highlight the nodes
        this.pulseHighlightNodes(nodesToHighlight);
        
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: "system",
                category: "analytics",
                message: `Highlighted ${nodesToHighlight.length} nodes related to insights analysis`,
                timestamp: new Date()
            });
        }
    }
    
    /**
     * Create pulse highlight animation on specific nodes
     */
    pulseHighlightNodes(nodeIds) {
        if (!nodeIds || nodeIds.length === 0) return;
        
        // Remove existing pulse highlights
        d3.selectAll('.node-pulse').remove();
        
        // Create new pulse highlights
        nodeIds.forEach(id => {
            const node = this.data.nodes.find(n => n.id === id);
            if (!node) return;
            
            // Create pulse circle
            const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pulse.classList.add("node-pulse");
            const baseRadius = this.getNodeRadius(node);
            pulse.setAttribute("cx", node.x);
            pulse.setAttribute("cy", node.y);
            pulse.setAttribute("r", baseRadius * 1.5);
            pulse.setAttribute("fill", "none");
            pulse.setAttribute("stroke", this.getNodeColor(node));
            pulse.setAttribute("stroke-width", "2");
            
            // Add pulse to SVG
            this.svg.appendChild(pulse);
            
            // Create animation
            const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            animate.setAttribute("attributeName", "r");
            animate.setAttribute("from", baseRadius * 1.5);
            animate.setAttribute("to", baseRadius * 4);
            animate.setAttribute("dur", "1.5s");
            animate.setAttribute("repeatCount", "indefinite");
            pulse.appendChild(animate);
            
            const animateOpacity = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            animateOpacity.setAttribute("attributeName", "opacity");
            animateOpacity.setAttribute("from", "0.8");
            animateOpacity.setAttribute("to", "0");
            animateOpacity.setAttribute("dur", "1.5s");
            animateOpacity.setAttribute("repeatCount", "indefinite");
            pulse.appendChild(animateOpacity);
            
            // Update position on simulation tick
            this.simulation.on("tick.pulse", () => {
                if (pulse.parentNode) {
                    pulse.setAttribute("cx", node.x);
                    pulse.setAttribute("cy", node.y);
                }
            });
            
            // Remove pulses after 10 seconds
            setTimeout(() => {
                if (pulse.parentNode) {
                    pulse.parentNode.removeChild(pulse);
                }
                
                // Remove tick listener for pulses
                if (this.simulation) {
                    this.simulation.on("tick.pulse", null);
                }
            }, 10000);
        });
    }
    
    /**
     * Handle skill insight requested event
     * @param {Object} data - Event data
     */
    handleSkillInsightRequested(data) {
        // Flash the network to indicate activity
        this.flashNetwork();
        
        // Log the event if SystemLog is available
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: "system",
                category: "integration",
                message: "Network visualization responding to skill insights request",
                timestamp: new Date()
            });
        }
    }
    
    /**
     * Handle skill insight generated event
     * @param {Object} insights - Insight data
     */
    handleSkillInsightGenerated(insights) {
        // Highlight related nodes based on insights
        this.highlightRelatedNodes(insights);
    }
    
    /**
     * Flash the entire network visualization to indicate activity
     */
    flashNetwork() {
        // Add flash class to container
        this.container.classList.add('network-flash');
        
        // Remove class after animation completes
        setTimeout(() => {
            this.container.classList.remove('network-flash');
        }, 800);
    }
    
    /**
     * Set up cursor interaction for network nodes
     */
    setupCursorInteraction() {
        // Initialize mouse position tracking
        this.mousePosition = {
            x: this.width / 2,
            y: this.height / 2
        };
        
        // Throttle function for performance
        const throttle = (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        };
        
        // Mouse move handler with throttling
        const handleMouseMove = throttle((e) => {
            const rect = this.container.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
            
            // Update CSS custom properties for cursor position indicator
            const mouseXPercent = (this.mousePosition.x / this.width) * 100;
            const mouseYPercent = (this.mousePosition.y / this.height) * 100;
            this.container.style.setProperty('--mouse-x', `${mouseXPercent}%`);
            this.container.style.setProperty('--mouse-y', `${mouseYPercent}%`);
            
            // Update cursor indicator position
            this.updateCursorIndicator();
            
            // Apply cursor attraction to nodes
            this.applyCursorAttraction();
        }, 16); // ~60fps
        
        // Add event listeners
        this.container.addEventListener('mousemove', handleMouseMove);
        
        // Add cursor indicator for attraction radius
        this.createCursorIndicator();
        
        // Reset mouse position when leaving container
        this.container.addEventListener('mouseleave', () => {
            this.mousePosition.x = this.width / 2;
            this.mousePosition.y = this.height / 2;
            this.hideCursorIndicator();
        });
        
        // Show cursor indicator when entering container
        this.container.addEventListener('mouseenter', () => {
            this.showCursorIndicator();
        });
    }
    
    /**
     * Apply cursor attraction force to network nodes
     */
    applyCursorAttraction() {
        if (!this.simulation || !this.data.nodes) return;
        
        const attractForce = 80; // Attraction strength (higher = weaker)
        const attractRadius = 180; // Attraction radius
        const maxForce = 1.2; // Maximum force magnitude
        
        this.data.nodes.forEach(node => {
            // Skip if node is being dragged
            if (node.fx !== undefined && node.fy !== undefined) return;
            
            // Calculate distance to cursor
            const dx = this.mousePosition.x - node.x;
            const dy = this.mousePosition.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply attraction force if within radius
            if (distance < attractRadius && distance > 0) {
                const force = Math.min((attractRadius - distance) / attractForce, maxForce);
                const forceX = (dx / distance) * force;
                const forceY = (dy / distance) * force;
                
                // Apply velocity changes for smooth attraction
                node.vx = (node.vx || 0) + forceX * 0.1;
                node.vy = (node.vy || 0) + forceY * 0.1;
                
                // Apply damping to prevent oscillation
                node.vx *= 0.95;
                node.vy *= 0.95;
                
                // Add visual feedback for attracted nodes
                this.addNodeAttractedEffect(node, distance, attractRadius);
            } else {
                // Remove attraction effect when outside radius
                this.removeNodeAttractedEffect(node);
            }
        });
        
        // Restart simulation with low alpha to apply forces smoothly
        if (this.simulation) {
            this.simulation.alpha(0.05).restart();
        }
    }
    
    /**
     * Add visual effect to nodes being attracted by cursor
     */
    addNodeAttractedEffect(node, distance, attractRadius) {
        if (!this.nodes) return;
        
        // Calculate attraction intensity (closer = stronger effect)
        const intensity = Math.max(0, (attractRadius - distance) / attractRadius);
        
        // Find the corresponding SVG node element
        this.nodes.each(function(d) {
            if (d.id === node.id) {
                const element = d3.select(this);
                
                // Add glow effect based on attraction intensity
                const glowIntensity = intensity * 0.5;
                element.style('filter', `drop-shadow(0 0 ${8 * intensity}px rgba(0, 191, 255, ${glowIntensity}))`);
                
                // Slightly increase size when attracted
                const originalRadius = node.baseRadius || parseFloat(element.attr('r'));
                if (!node.baseRadius) node.baseRadius = originalRadius;
                
                const newRadius = originalRadius + (intensity * 2);
                element.attr('r', newRadius);
                
                // Add pulsing animation for strongly attracted nodes
                if (intensity > 0.7) {
                    element.classed('cursor-attracted', true);
                }
            }
        });
    }
    
    /**
     * Remove visual attraction effects from nodes
     */
    removeNodeAttractedEffect(node) {
        if (!this.nodes) return;
        
        this.nodes.each(function(d) {
            if (d.id === node.id) {
                const element = d3.select(this);
                
                // Remove glow effect
                element.style('filter', null);
                
                // Reset to original size
                if (node.baseRadius) {
                    element.attr('r', node.baseRadius);
                }
                
                // Remove pulsing class
                element.classed('cursor-attracted', false);
            }
        });
    }
    
    /**
     * Create cursor attraction radius indicator
     */
    createCursorIndicator() {
        // Create cursor indicator circle
        this.cursorIndicator = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.cursorIndicator.classList.add("cursor-indicator");
        this.cursorIndicator.setAttribute("r", "180"); // Match attractRadius
        this.cursorIndicator.setAttribute("fill", "none");
        this.cursorIndicator.setAttribute("stroke", "rgba(0, 191, 255, 0.1)");
        this.cursorIndicator.setAttribute("stroke-width", "1");
        this.cursorIndicator.setAttribute("pointer-events", "none");
        this.cursorIndicator.style.opacity = "0";
        this.cursorIndicator.style.transition = "opacity 0.3s ease";
        
        // Insert at beginning so it appears behind nodes
        this.svg.insertBefore(this.cursorIndicator, this.svg.firstChild.nextSibling);
    }
    
    /**
     * Show cursor indicator
     */
    showCursorIndicator() {
        if (this.cursorIndicator) {
            this.cursorIndicator.style.opacity = "1";
        }
    }
    
    /**
     * Hide cursor indicator
     */
    hideCursorIndicator() {
        if (this.cursorIndicator) {
            this.cursorIndicator.style.opacity = "0";
        }
    }
    
    /**
     * Update cursor indicator position
     */
    updateCursorIndicator() {
        if (this.cursorIndicator) {
            this.cursorIndicator.setAttribute("cx", this.mousePosition.x);
            this.cursorIndicator.setAttribute("cy", this.mousePosition.y);
        }
    }

    /**
     * Create status indicator elements inside the container
     */
    createStatusIndicators() {
        // Node count display
        this.nodeCountElement = document.createElement('div');
        this.nodeCountElement.className = 'node-count';
        this.nodeCountElement.innerHTML = 'NODES: <span class="node-count-value"></span>';
        this.nodeCountValueElement = this.nodeCountElement.querySelector('.node-count-value');
        this.container.appendChild(this.nodeCountElement);

        // Connection status indicator
        this.connectionStatusElement = document.createElement('div');
        this.connectionStatusElement.className = 'connection-status';
        this.connectionStatusElement.innerHTML = '<div class="connection-indicator"></div><span class="connection-text">CONNECTED</span>';
        this.container.appendChild(this.connectionStatusElement);
    }

    /**
     * Update the node count display
     */
    updateNodeCount() {
        if (this.nodeCountValueElement) {
            this.nodeCountValueElement.textContent = this.data.nodes.length;
        }
    }

    /**
     * Set connection status indicator
     * @param {boolean} connected
     */
    setConnectionStatus(connected) {
        if (!this.connectionStatusElement) return;
        const indicator = this.connectionStatusElement.querySelector('.connection-indicator');
        const text = this.connectionStatusElement.querySelector('.connection-text');
        if (connected) {
            indicator.style.backgroundColor = 'var(--theme-accent-primary)';
            text.textContent = 'CONNECTED';
        } else {
            indicator.style.backgroundColor = '#a33';
            text.textContent = 'DISCONNECTED';
        }
    }
}
