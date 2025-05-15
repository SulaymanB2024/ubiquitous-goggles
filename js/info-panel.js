/**
 * Contextual Information Panel
 * Provides detailed information about selected network nodes
 */

class InfoPanel {
    constructor(containerId = 'info-panel-container') {
        this.containerId = containerId;
        this.panelActive = false;
        this.currentNodeData = null;
        this.init();
    }
    
    /**
     * Initialize the information panel
     */
    init() {
        // Create the panel container if it doesn't exist
        if (!document.getElementById(this.containerId)) {
            const container = document.createElement('div');
            container.id = this.containerId;
            document.body.appendChild(container);
        }
        
        // Create the panel overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'info-panel-overlay';
        this.overlay.addEventListener('click', () => this.hidePanel());
        document.body.appendChild(this.overlay);
        
        // Create the panel element
        this.panel = document.createElement('div');
        this.panel.className = 'info-panel';
        this.panel.innerHTML = `
            <div class="info-panel-header">
                <h3 class="info-panel-title">NODE DETAILS</h3>
                <button class="info-panel-close" aria-label="Close panel">&times;</button>
            </div>
            <div class="info-panel-body">
                <div class="loading-indicator">Loading...</div>
            </div>
        `;
        
        // Add the panel to the container
        document.getElementById(this.containerId).appendChild(this.panel);
        
        // Add event listener for close button
        this.panel.querySelector('.info-panel-close').addEventListener('click', () => this.hidePanel());
        
        // Add keyboard event listener for escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panelActive) {
                this.hidePanel();
            }
        });
    }
    
    /**
     * Show the information panel with data for a specific node
     * @param {Object} nodeData - Data for the selected node
     */
    showPanel(nodeData) {
        if (!nodeData) return;
        
        this.currentNodeData = nodeData;
        this.panelActive = true;
        
        // Update panel title based on node type
        const title = this.panel.querySelector('.info-panel-title');
        title.textContent = nodeData.type ? `${nodeData.type.toUpperCase()} DETAILS` : 'NODE DETAILS';
        
        // Generate panel content based on node data
        const content = this.generatePanelContent(nodeData);
        this.panel.querySelector('.info-panel-body').innerHTML = content;
        
        // Add click handlers for related items
        const relatedItems = this.panel.querySelectorAll('.info-related-item');
        relatedItems.forEach(item => {
            item.addEventListener('click', () => {
                const relatedId = item.dataset.id;
                const relatedNode = this.findRelatedNodeById(relatedId);
                if (relatedNode) {
                    this.showPanel(relatedNode);
                }
            });
        });
        
        // Show the panel and overlay with animation
        requestAnimationFrame(() => {
            this.panel.classList.add('active');
            this.overlay.classList.add('active');
        });
    }
    
    /**
     * Hide the information panel
     */
    hidePanel() {
        this.panelActive = false;
        this.panel.classList.remove('active');
        this.overlay.classList.remove('active');
        this.currentNodeData = null;
    }
    
    /**
     * Toggle panel visibility
     * @param {Object} nodeData - Data for the selected node
     */
    togglePanel(nodeData) {
        if (this.panelActive && this.currentNodeData && this.currentNodeData.id === nodeData.id) {
            this.hidePanel();
        } else {
            this.showPanel(nodeData);
        }
    }
    
    /**
     * Generate HTML content for the panel based on node data
     * @param {Object} nodeData - Data for the selected node
     * @returns {string} HTML content for the panel
     */
    generatePanelContent(nodeData) {
        if (!nodeData) return '<div class="error-message">No data available</div>';
        
        // Extract categories as an array
        const categories = Array.isArray(nodeData.categories) 
            ? nodeData.categories 
            : (nodeData.category ? [nodeData.category] : []);
            
        // Basic information section
        let content = `
            <div class="info-panel-section">
                <h4 class="info-panel-section-title">BASIC INFORMATION</h4>
                <div class="info-data-point">
                    <div class="info-data-label">ID:</div>
                    <div class="info-data-value">${nodeData.id || 'N/A'}</div>
                </div>
                <div class="info-data-point">
                    <div class="info-data-label">NAME:</div>
                    <div class="info-data-value">${nodeData.name || nodeData.label || 'N/A'}</div>
                </div>
                <div class="info-data-point">
                    <div class="info-data-label">TYPE:</div>
                    <div class="info-data-value">${nodeData.type ? nodeData.type.toUpperCase() : 'N/A'}</div>
                </div>
        `;
        
        // Add year information if available
        if (nodeData.year) {
            content += `
                <div class="info-data-point">
                    <div class="info-data-label">YEAR:</div>
                    <div class="info-data-value">${nodeData.year}</div>
                </div>
            `;
        }
        
        // Add duration information if available
        if (nodeData.duration) {
            content += `
                <div class="info-data-point">
                    <div class="info-data-label">DURATION:</div>
                    <div class="info-data-value">${nodeData.duration}</div>
                </div>
            `;
        }
        
        // Close the basic information section
        content += '</div>';
        
        // Description section
        if (nodeData.description) {
            content += `
                <div class="info-panel-section">
                    <h4 class="info-panel-section-title">DESCRIPTION</h4>
                    <div class="info-description">${nodeData.description}</div>
                </div>
            `;
        }
        
        // Categories/tags section if available
        if (categories && categories.length > 0) {
            content += `
                <div class="info-panel-section">
                    <h4 class="info-panel-section-title">CATEGORIES</h4>
                    <div class="info-tag-container">
            `;
            
            categories.forEach(category => {
                content += `<span class="info-tag ${category.toLowerCase()}">${category.toUpperCase()}</span>`;
            });
            
            content += `
                    </div>
                </div>
            `;
        }
        
        // Related items section if available
        if (nodeData.connections && nodeData.connections.length > 0) {
            content += `
                <div class="info-panel-section">
                    <h4 class="info-panel-section-title">CONNECTIONS</h4>
                    <div class="info-related-items">
            `;
            
            nodeData.connections.forEach(connection => {
                content += `
                    <div class="info-related-item" data-id="${connection.id}">
                        ${connection.name || connection.label || 'Connection'}
                    </div>
                `;
            });
            
            content += `
                    </div>
                </div>
            `;
        }
        
        // Action buttons section
        if (nodeData.url || nodeData.actions) {
            content += `
                <div class="info-panel-section">
                    <div class="info-action-buttons">
            `;
            
            // Add view details button if url exists
            if (nodeData.url) {
                content += `
                    <a href="${nodeData.url}" target="_blank" class="info-action-btn primary">
                        VIEW DETAILS
                    </a>
                `;
            }
            
            // Add highlight connections button
            content += `
                <button class="info-action-btn" id="highlight-connections">
                    HIGHLIGHT CONNECTIONS
                </button>
            `;
            
            content += `
                    </div>
                </div>
            `;
        }
        
        return content;
    }
    
    /**
     * Find a related node by its ID
     * @param {string} id - ID of the related node
     * @returns {Object|null} The related node data or null if not found
     */
    findRelatedNodeById(id) {
        // Get reference to the network visualization instance
        const networkViz = window.networkVisualization;
        
        // Use the network visualization's findNodeById method if available
        if (networkViz && typeof networkViz.findNodeById === 'function') {
            const node = networkViz.findNodeById(id);
            if (node) {
                return networkViz.enrichNodeData(node);
            }
        }
        
        return null;
    }
}

// Export the InfoPanel class
if (typeof module !== 'undefined') {
    module.exports = InfoPanel;
}
