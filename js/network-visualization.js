/**
 * Advanced Strategic Network Visualization
 * Palantir-grade visualization of interconnected data points with real-time analysis
 * Optimized for performance with WebGL acceleration and efficient rendering
 * @version 1.3.0
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
        
        // Enhanced visual effects configuration
        this.visualEffects = {
            nodeGlow: true,
            linkAnimation: true,
            pulseEffect: true,
            interactiveHighlighting: true,
            nodeHighlightIntensity: 2.0,
            nodeHighlightSpread: 1.5,
            highlightTransitionDuration: 300,
            particleEffects: true,
            particleCount: 8,
            particleLifespan: 60
        };
        
        // Particle system
        this.particles = [];
        this.lastParticleUpdate = 0;
        
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
        
        // Create the force simulation
        this.createSimulation();
        
        // Create the visualization elements
        this.createVisualization();
        
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
        // Create container for links and link effects
        const linksGroup = d3.select(this.svg)
            .append("g")
            .attr("class", "links-group");
            
        // Create link highlight effects for later use
        this.linkHighlights = linksGroup
            .selectAll(".link-highlight")
            .data(this.data.links)
            .enter()
            .append("line")
            .attr("class", "link-highlight")
            .attr("stroke", "rgba(var(--theme-accent-primary-rgb), 0.7)")
            .attr("stroke-width", d => (d.strength * 2) + 4)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0)
            .attr("stroke-linecap", "round");
            
        // Create animated link particles container
        const linkParticlesGroup = d3.select(this.svg)
            .append("g")
            .attr("class", "link-particles-group");
            
        // Create standard links
        this.links = linksGroup
            .selectAll(".link-standard")
            .data(this.data.links)
            .enter()
            .append("line")
            .attr("class", "link-standard")
            .attr("stroke", d => this.visualEffects.linkAnimation ? 
                `url(#network-link-gradient-${d.type || 'default'})` : 
                "rgba(255, 255, 255, 0.15)")
            .attr("stroke-width", d => d.strength * 2.5)
            .attr("stroke-opacity", 0.8)
            .attr("stroke-linecap", "round");
        
        // Create nodes container
        const nodesGroup = d3.select(this.svg)
            .append("g")
            .attr("class", "nodes-group");
            
        // Create node glow effects (appear on hover)
        this.nodeGlows = nodesGroup
            .selectAll(".node-glow")
            .data(this.data.nodes)
            .enter()
            .append("circle")
            .attr("class", "node-glow")
            .attr("r", d => this.getNodeRadius(d) * 2.5)
            .attr("fill", d => `url(#network-node-glow-${d.category})`)
            .attr("opacity", 0)
            .attr("pointer-events", "none");
        
        // Create nodes with enhanced styling
        this.nodes = nodesGroup
            .selectAll(".node")
            .data(this.data.nodes)
            .enter()
            .append("circle")
            .attr("class", d => `node node-${d.category}`)
            .attr("r", d => this.getNodeRadius(d))
            .attr("fill", d => this.visualEffects.nodeGlow ? 
                `url(#network-node-gradient-${d.category})` : 
                this.getNodeColor(d))
            .attr("stroke", d => d3.color(this.getNodeColor(d)).darker(0.5))
            .attr("stroke-width", 1.5)
            .attr("filter", "url(#network-node-shadow)")
            .call(d3.drag()
                .on("start", this.dragstarted.bind(this))
                .on("drag", this.dragged.bind(this))
                .on("end", this.dragended.bind(this)));
                
        // Add pulse animation to important nodes
        if (this.visualEffects.pulseEffect) {
            this.nodes
                .filter(d => d.weight > 85)
                .append("animate")
                .attr("attributeName", "r")
                .attr("from", d => this.getNodeRadius(d))
                .attr("to", d => this.getNodeRadius(d) * 1.15)
                .attr("dur", d => 1 + Math.random() * 2 + "s")
                .attr("repeatCount", "indefinite")
                .attr("calcMode", "spline")
                .attr("keySplines", "0.42 0 0.58 1; 0.42 0 0.58 1")
                .attr("keyTimes", "0; 0.5; 1")
                .attr("values", d => {
                    const r = this.getNodeRadius(d);
                    return `${r}; ${r * 1.15}; ${r}`;
                });
        }
        
        // Add hover and click interactions
        this.nodes
            .on("mouseover", this.nodeMouseover.bind(this))
            .on("mousemove", this.moveTooltip.bind(this))
            .on("mouseout", this.nodeMouseout.bind(this))
            .on("click", this.highlightConnections.bind(this));
        
        // Create node labels with enhanced styling
        this.labels = d3.select(this.svg)
            .selectAll(".node-label")
            .data(this.data.nodes)
            .enter()
            .append("text")
            .attr("class", "node-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("y", d => this.getNodeRadius(d) + 12)
            .attr("font-size", d => Math.min(11, 8 + (d.weight / 30)) + "px")
            .attr("fill", "rgba(255, 255, 255, 0.85)")
            .attr("opacity", d => d.weight > 75 ? 0.9 : 0.5)
            .attr("pointer-events", "none")
            .attr("filter", "url(#network-text-shadow)")
            .text(d => this.getNodeShortLabel(d));
            
        // Create defs for filters and gradients
        this.createEnhancedVisualElements();
    }
    
    /**
     * Create enhanced visual elements like filters, gradients and patterns
     */
    createEnhancedVisualElements() {
        const defs = d3.select(this.svg).select("defs");
        if (defs.empty()) {
            defs = d3.select(this.svg).append("defs");
        }
        
        // Create shadow filter for nodes
        const nodeShadow = defs.append("filter")
            .attr("id", "network-node-shadow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
            
        nodeShadow.append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("stdDeviation", 2.5)
            .attr("flood-color", "rgba(0, 0, 0, 0.4)")
            .attr("flood-opacity", 0.5);
            
        // Create text shadow filter
        const textShadow = defs.append("filter")
            .attr("id", "network-text-shadow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
            
        textShadow.append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("stdDeviation", 1.5)
            .attr("flood-color", "rgba(0, 0, 0, 0.8)")
            .attr("flood-opacity", 0.9);
        
        // Create enhanced gradients for each category
        Object.keys(this.categoryColors).forEach(category => {
            const color = this.categoryColors[category];
            const colorObj = d3.color(color);
            
            // Node gradient (center to edge)
            const nodeGradient = defs.append("radialGradient")
                .attr("id", `network-node-gradient-${category}`)
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%")
                .attr("fx", "25%")
                .attr("fy", "25%");
                
            nodeGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", d3.color(color).brighter(0.5))
                .attr("stop-opacity", 0.95);
                
            nodeGradient.append("stop")
                .attr("offset", "85%")
                .attr("stop-color", color)
                .attr("stop-opacity", 0.95);
                
            nodeGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", d3.color(color).darker(0.7))
                .attr("stop-opacity", 0.8);
                
            // Node glow effect
            const glowGradient = defs.append("radialGradient")
                .attr("id", `network-node-glow-${category}`)
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%");
                
            glowGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", color)
                .attr("stop-opacity", 0.7);
                
            glowGradient.append("stop")
                .attr("offset", "40%")
                .attr("stop-color", color)
                .attr("stop-opacity", 0.3);
                
            glowGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", color)
                .attr("stop-opacity", 0);
        });
        
        // Create link gradients for different link types
        const linkTypes = ['default', 'strong', 'weak', 'influenced'];
        linkTypes.forEach(type => {
            const linkGradient = defs.append("linearGradient")
                .attr("id", `network-link-gradient-${type}`)
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("spreadMethod", "reflect");
                
            let color1, color2, opacity;
            
            switch(type) {
                case 'strong':
                    color1 = "rgba(var(--theme-accent-primary-rgb), 0.9)";
                    color2 = "rgba(var(--theme-accent-secondary-rgb), 0.7)";
                    opacity = 0.9;
                    break;
                case 'weak':
                    color1 = "rgba(255, 255, 255, 0.2)";
                    color2 = "rgba(255, 255, 255, 0.1)";
                    opacity = 0.6;
                    break;
                case 'influenced':
                    color1 = "rgba(var(--theme-accent-secondary-rgb), 0.7)";
                    color2 = "rgba(var(--theme-accent-secondary-rgb), 0.3)";
                    opacity = 0.8;
                    break;
                default:
                    color1 = "rgba(255, 255, 255, 0.3)";
                    color2 = "rgba(255, 255, 255, 0.1)";
                    opacity = 0.7;
            }
            
            // Add animated gradient effect
            linkGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", color1)
                .attr("stop-opacity", opacity);
                
            linkGradient.append("stop")
                .attr("offset", "50%")
                .attr("stop-color", color2)
                .attr("stop-opacity", opacity * 0.8);
                
            linkGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", color1)
                .attr("stop-opacity", opacity);
                
            // Add animation for link gradients
            if (this.visualEffects.linkAnimation) {
                linkGradient.append("animate")
                    .attr("attributeName", "x1")
                    .attr("values", "-100%;0%")
                    .attr("dur", "3s")
                    .attr("repeatCount", "indefinite");
                    
                linkGradient.append("animate")
                    .attr("attributeName", "x2")
                    .attr("values", "0%;100%")
                    .attr("dur", "3s")
                    .attr("repeatCount", "indefinite");
            }
        });
    }
    
    /**
     * Create and animate particles around a node
     * @param {Object} d - The node data
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createParticles(d, x, y) {
        if (!this.visualEffects.particleEffects) return;
        
        const color = this.getNodeColor(d);
        const count = this.visualEffects.particleCount;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            const size = 1 + Math.random() * 3;
            const life = this.visualEffects.particleLifespan + Math.random() * 30;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: color,
                life: life,
                maxLife: life,
                node: d
            });
        }
    }
    
    /**
     * Update and render particles
     */
    updateParticles() {
        if (!this.visualEffects.particleEffects || this.particles.length === 0) return;
        
        // Remove existing particles
        d3.select(this.svg).selectAll(".network-particle").remove();
        
        // Update particle positions
        this.particles.forEach((p, i) => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity and friction
            p.vy += 0.05;
            p.vx *= 0.99;
            p.vy *= 0.99;
            
            // Decrease life
            p.life--;
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                return;
            }
        });
        
        // Render particles
        d3.select(this.svg).select(".nodes-group")
            .selectAll(".network-particle")
            .data(this.particles)
            .enter()
            .append("circle")
            .attr("class", "network-particle")
            .attr("cx", p => p.x)
            .attr("cy", p => p.y)
            .attr("r", p => p.size * (p.life / p.maxLife))
            .attr("fill", p => {
                const color = d3.color(p.color);
                color.opacity = 0.7 * (p.life / p.maxLife);
                return color.toString();
            })
            .attr("pointer-events", "none");
    }
    
    /**
     * Enhanced node mouseover with interactive highlighting
     */
    nodeMouseover(event, d) {
        if (!this.visualEffects.interactiveHighlighting) {
            this.showTooltip(event, d);
            return;
        }
        
        // Highlight the node
        this.highlightedNode = d;
        
        // Find connected nodes and links
        const connectedNodeIds = this.getConnectedNodes(d.id);
        connectedNodeIds.add(d.id);
        
        // Enhanced node styling
        this.nodes
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("opacity", node => connectedNodeIds.has(node.id) ? 1 : 0.3)
            .attr("r", node => {
                const radius = this.getNodeRadius(node);
                return node.id === d.id ? radius * 1.2 : radius;
            });
            
        // Show glow effect on hovered node
        this.nodeGlows
            .filter(node => node.id === d.id)
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("opacity", 0.7);
            
        // Highlight connected links
        this.links
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("stroke-opacity", link => 
                (link.source.id === d.id || link.target.id === d.id) ? 0.9 : 0.1)
            .attr("stroke-width", link => {
                const width = link.strength * 2.5;
                return (link.source.id === d.id || link.target.id === d.id) ? width * 1.5 : width;
            });
            
        // Add visual trails on links connected to this node
        this.linkHighlights
            .filter(link => link.source.id === d.id || link.target.id === d.id)
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("opacity", 0.7)
            .attr("stroke-dashoffset", 30);
            
        // Enhance connected node labels
        this.labels
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("opacity", node => {
                if (node.id === d.id) return 1;
                if (connectedNodeIds.has(node.id)) return 0.9;
                return 0.2;
            })
            .attr("font-size", node => {
                const size = Math.min(11, 8 + (node.weight / 30));
                return node.id === d.id ? (size * 1.2) + "px" : size + "px";
            })
            .attr("y", node => {
                const radius = this.getNodeRadius(node);
                return node.id === d.id ? (radius * 1.2) + 14 : radius + 12;
            });
            
        // Create particles around the highlighted node
        if (this.visualEffects.particleEffects) {
            this.createParticles(d, d.x, d.y);
        }
        
        // Show enhanced tooltip
        this.showEnhancedTooltip(event, d);
    }
    
    /**
     * Node mouseout handler
     */
    nodeMouseout(event, d) {
        if (!this.visualEffects.interactiveHighlighting || this.selectedNodes.size > 0) {
            this.hideTooltip();
            return;
        }
        
        // Reset highlighted state
        this.highlightedNode = null;
        
        // Restore normal node appearance
        this.nodes
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("opacity", 1)
            .attr("r", node => this.getNodeRadius(node));
            
        // Hide node glow
        this.nodeGlows
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("opacity", 0);
            
        // Restore normal link appearance
        this.links
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("stroke-opacity", 0.8)
            .attr("stroke-width", link => link.strength * 2.5);
            
        // Hide link highlights
        this.linkHighlights
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("opacity", 0);
            
        // Restore normal label appearance
        this.labels
            .transition()
            .duration(this.visualEffects.highlightTransitionDuration)
            .attr("opacity", node => node.weight > 75 ? 0.9 : 0.5)
            .attr("font-size", node => Math.min(11, 8 + (node.weight / 30)) + "px")
            .attr("y", node => this.getNodeRadius(node) + 12);
            
        // Hide tooltip
        this.hideTooltip();
    }
    
    /**
     * Show an enhanced tooltip with more information
     */
    showEnhancedTooltip(event, d) {
        // Create tooltip content with more information and visual enhancements
        this.tooltip.innerHTML = `
            <div class="network-tooltip-header">
                <div class="network-tooltip-title">${d.name}</div>
                <div class="network-tooltip-badge" style="background-color: ${this.getNodeColor(d)}">
                    ${d.category.toUpperCase()}
                </div>
            </div>
            <div class="network-tooltip-type">${d.type.toUpperCase()}</div>
            <div class="network-tooltip-weight">
                <span>Significance:</span>
                <div class="network-tooltip-weight-bar">
                    <div class="network-tooltip-weight-fill" style="width: ${d.weight}%; background-color: ${this.getNodeColor(d)}"></div>
                </div>
                <span>${d.weight}%</span>
            </div>
            ${d.description ? `<div class="network-tooltip-description">${d.description}</div>` : ''}
            <div class="network-tooltip-connections">
                <span>Connections: ${this.getConnectedNodes(d.id).size}</span>
                <span class="network-tooltip-hint">Click to explore relationships</span>
            </div>
        `;
        
        this.tooltip.classList.add("network-tooltip-enhanced");
        this.tooltip.style.display = "block";
        this.moveTooltip(event);
        
        // Add entrance animation
        this.tooltip.animate(
            [
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            {
                duration: 200,
                easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
                fill: 'forwards'
            }
        );
    }
    
    /**
     * Move tooltip with mouse - with improved positioning logic
     */
    moveTooltip(event) {
        if (!this.tooltip) return;
        
        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;
        const margin = 15;
        const containerRect = this.container.getBoundingClientRect();
        
        // Calculate initial position
        let x = event.pageX - containerRect.left - window.scrollX + margin;
        let y = event.pageY - containerRect.top - window.scrollY - tooltipHeight - margin;
        
        // Check boundaries and adjust if needed
        if (x + tooltipWidth > this.width) {
            x = event.pageX - containerRect.left - window.scrollX - tooltipWidth - margin;
        }
        
        if (y < 0) {
            y = event.pageY - containerRect.top - window.scrollY + margin;
        }
        
        // Apply position
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
    }
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (!this.tooltip) return;
        
        // Add exit animation
        const animation = this.tooltip.animate(
            [
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(10px)' }
            ],
            {
                duration: 150,
                easing: 'ease-out',
                fill: 'forwards'
            }
        );
        
        // Hide tooltip after animation completes
        animation.onfinish = () => {
            this.tooltip.style.display = "none";
            this.tooltip.classList.remove("network-tooltip-enhanced");
        };
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
            pulse.setAttribute("cx", node.x);
            pulse.setAttribute("cy", node.y);
            pulse.setAttribute("r", node.radius * 1.5);
            pulse.setAttribute("fill", "none");
            pulse.setAttribute("stroke", this.getNodeColor(node));
            pulse.setAttribute("stroke-width", "2");
            
            // Add pulse to SVG
            this.svg.appendChild(pulse);
            
            // Create animation
            const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            animate.setAttribute("attributeName", "r");
            animate.setAttribute("from", node.radius * 1.5);
            animate.setAttribute("to", node.radius * 4);
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
}
