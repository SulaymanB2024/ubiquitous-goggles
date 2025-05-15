/**
 * Interactive Network Visualization
 * Visualizes connections between skills, projects, and leadership experiences
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
        this.categoryColors = {
            'finance': '#00BFFF', // accent-primary
            'tech': '#3B4A68',    // accent-secondary
            'music': '#8A94AD'    // medium-text
        };
        
        // Initialize the InfoPanel
        this.infoPanel = new InfoPanel();
        
        // Initialize the visualization
        this.init();
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
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
        
        // Create the force simulation
        this.createSimulation();
        
        // Create the visualization elements
        this.createVisualization();
        
        // Start the simulation
        this.simulation.on("tick", this.ticked.bind(this));
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
}
