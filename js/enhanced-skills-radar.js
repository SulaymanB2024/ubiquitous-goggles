/**
 * Enhanced Skills Radar Chart
 * Interactive visualization of skills across different domains with animation and interaction
 */

class SkillsRadarChart {
    constructor(containerId, data = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        
        this.data = data || this.getDefaultData();
        this.chart = null;
        this.canvas = null;
        this.tooltip = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.maxValue = 10;
        this.levels = 5;
        this.valueLabels = ['Beginner', 'Familiar', 'Proficient', 'Advanced', 'Expert'];
        this.labelFactor = 1.2;
        this.wrapWidth = 60;
        this.opacityArea = 0.25; // Reduced opacity for better performance
        this.dotRadius = 3; // Smaller dots for better performance
        this.strokeWidth = 1.5; // Thinner strokes for better performance
        this.roundStrokes = true;
        this.transitionDuration = 1200; // Longer transition for smoother animation
        this.colorScheme = {
            'technical': 'rgba(var(--theme-accent-primary-rgb), 0.7)',
            'leadership': 'rgba(0, 177, 106, 0.7)',
            'creative': 'rgba(214, 51, 132, 0.7)',
            'business': 'rgba(var(--theme-accent-secondary-rgb), 0.7)',
            'languages': 'rgba(241, 196, 15, 0.7)'
        };
        this.activeCategory = null;
        this.animatedFactor = 0;
        this.animationStartTime = null;
        this.resizeDebounceTimeout = null; // For debouncing resize events

        // Initialize the chart
        this.init();
        this.setupResponsiveness();
    }

    /**
     * Initialize the chart
     */
    init() {
        // Set up the container with necessary HTML elements
        this.setupContainer();
        
        // Create canvas for radar chart
        this.setupCanvas();
        
        // Create tooltip element
        this.setupTooltip();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Draw the chart with animation
        this.startAnimation();
    }

    /**
     * Set up the container with necessary DOM elements
     */
    setupContainer() {
        // Create container elements
        this.container.innerHTML = `
            <div class="skills-grid-bg"></div>
            <div class="skills-radar-header">
                <h3 class="skills-radar-title">SKILLS VISUALIZATION</h3>
                <p class="skills-radar-description">Interactive visualization of competencies across technical, leadership, and business domains. Hover over data points for detailed information.</p>
            </div>
            <div class="skills-radar-chart">
                <canvas class="radar-chart-canvas"></canvas>
                <div class="radar-decoration radar-circle-1"></div>
                <div class="radar-decoration radar-circle-2"></div>
                <div class="radar-decoration radar-circle-3"></div>
            </div>
            <div class="skills-radar-controls">
                <button class="radar-control-btn radar-control-insights-btn" data-action="insights">
                    <i class="fas fa-lightbulb"></i> Strategic Insights
                </button>
                <button class="radar-control-btn" data-action="reset">Reset View</button>
                <button class="radar-control-btn" data-action="animate">Animate</button>
            </div>
            <div class="skills-radar-legend"></div>
        `;

        // Create legend items
        const legendEl = this.container.querySelector('.skills-radar-legend');
        Object.keys(this.colorScheme).forEach(category => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.dataset.category = category;
            item.innerHTML = `
                <span class="legend-color" style="background-color: ${this.colorScheme[category]}"></span>
                <span class="legend-label">${this.capitalizeFirstLetter(category)}</span>
            `;
            legendEl.appendChild(item);
        });
    }

    /**
     * Set up the canvas element
     */
    setupCanvas() {
        this.canvas = this.container.querySelector('.radar-chart-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas dimensions
        this.resizeCanvas();
    }

    /**
     * Set up the tooltip element
     */
    setupTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'radar-tooltip';
        this.container.appendChild(this.tooltip);
    }

    /**
     * Set up event listeners for interactions
     */
    setupEventListeners() {
        // Canvas interactions
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Legend interactions
        const legendItems = this.container.querySelectorAll('.legend-item');
        legendItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.toggleCategory(category);
                this.updateLegendState();
                this.redrawChart();
            });
        });
        
        // Control buttons
        const controlButtons = this.container.querySelectorAll('.radar-control-btn');
        controlButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'reset') {
                    this.resetView();
                } else if (action === 'animate') {
                    this.startAnimation();
                } else if (action === 'insights') {
                    this.showInsightSummary();
                    
                    // Log event if system log is available
                    if (window.SystemLog) {
                        window.SystemLog.addEntry({
                            type: "user",
                            category: "analytics",
                            message: "[STRATEGIC ENGINE] User requested skills domain insights analysis",
                            timestamp: new Date(),
                            priority: "high"
                        });
                    }
                    
                    // Publish event for cross-component communication
                    if (window.EventBus) {
                        window.EventBus.publish('skills:insightRequested', {
                            source: 'skillsRadar',
                            timestamp: new Date()
                        });
                    }
                }
            });
        });
    }

    /**
     * Set up responsiveness for the chart
     */
    setupResponsiveness() {
        window.addEventListener('resize', () => {
            // Clear previous timeout
            if (this.resizeDebounceTimeout) {
                clearTimeout(this.resizeDebounceTimeout);
            }
            
            // Set a new timeout to update dimensions and redraw
            this.resizeDebounceTimeout = setTimeout(() => {
                this.resizeCanvas();
                this.redrawChart();
            }, 250); // 250ms debounce time
        });
    }

    /**
     * Resize the canvas based on container size
     */
    resizeCanvas() {
        const containerWidth = this.container.clientWidth;
        const size = Math.min(containerWidth * 0.8, 500);
        
        this.width = size;
        this.height = size;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // Set canvas dimensions with proper scaling for high DPI screens
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
    }

    /**
     * Start animation sequence
     */
    startAnimation() {
        this.animationStartTime = null;
        this.animatedFactor = 0;
        requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Animation frame handler
     */
    animate(timestamp) {
        if (!this.animationStartTime) this.animationStartTime = timestamp;
        const progress = timestamp - this.animationStartTime;
        const duration = this.transitionDuration;
        
        if (progress < duration) {
            // Calculate easing (cubic-bezier)
            const t = progress / duration;
            this.animatedFactor = this.cubicEaseOut(t);
            
            // Draw frame
            this.redrawChart();
            
            // Request next frame
            requestAnimationFrame(this.animate.bind(this));
        } else {
            this.animatedFactor = 1;
            this.redrawChart();
        }
    }

    /**
     * Cubic ease out function for smoother animations
     */
    cubicEaseOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Draw the radar chart
     */
    redrawChart() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw axis and levels
        this.drawLevels();
        this.drawAxis();
        
        // Draw data
        this.drawData();
    }

    /**
     * Draw the circular levels of the chart
     */
    drawLevels() {
        const radius = Math.min(this.centerX, this.centerY) * 0.85;
        
        this.ctx.strokeStyle = 'rgba(var(--theme-accent-secondary-rgb), 0.1)';
        this.ctx.fillStyle = 'rgba(var(--theme-accent-secondary-rgb), 0.03)';
        
        // Draw level circles and labels
        for (let level = 0; level < this.levels; level++) {
            const levelFactor = radius * ((level + 1) / this.levels);
            
            // Draw level circle - optimized with fewer points for better performance
            this.ctx.beginPath();
            const steps = 40; // Reduced from 360 to 40 points (still visually smooth)
            
            for (let i = 0; i <= steps; i++) {
                const radian = (i * 2 * Math.PI) / steps;
                const x = this.centerX + levelFactor * Math.cos(radian);
                const y = this.centerY + levelFactor * Math.sin(radian);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.stroke();
            
            // Draw level value label - only for first and last levels
            if (level === 0 || level === this.levels - 1) {
                const labelText = this.valueLabels[level];
                
                this.ctx.fillStyle = 'rgba(var(--theme-medium-text-rgb), 0.5)';
                this.ctx.font = '10px "Source Code Pro", monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(labelText, this.centerX, this.centerY - levelFactor - 5);
            }
        }
    }

    /**
     * Draw the axis lines for each skill
     */
    drawAxis() {
        const radius = Math.min(this.centerX, this.centerY) * 0.85;
        const allAxes = this.getAllSkillNames();
        const total = allAxes.length;
        
        this.ctx.strokeStyle = 'rgba(var(--theme-accent-secondary-rgb), 0.3)';
        this.ctx.lineWidth = 1;
        
        allAxes.forEach((axis, i) => {
            const angle = (Math.PI * 2 * i) / total;
            const x = this.centerX + radius * Math.cos(angle);
            const y = this.centerY + radius * Math.sin(angle);
            
            // Draw axis line
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            
            // Draw axis label
            const labelX = this.centerX + radius * this.labelFactor * Math.cos(angle);
            const labelY = this.centerY + radius * this.labelFactor * Math.sin(angle);
            
            this.ctx.fillStyle = 'rgba(var(--theme-light-text-rgb), 0.7)';
            this.ctx.font = '11px "Source Code Pro", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Adjust label position based on angle
            if (angle === 0) {
                this.ctx.textAlign = 'left';
            } else if (Math.abs(angle - Math.PI) < 0.1) {
                this.ctx.textAlign = 'right';
            }
            
            this.wrapText(this.ctx, axis, labelX, labelY, this.wrapWidth, 14);
        });
    }

    /**
     * Draw the data polygons and points
     */
    drawData() {
        const radius = Math.min(this.centerX, this.centerY) * 0.85;
        const allAxes = this.getAllSkillNames();
        const total = allAxes.length;
        
        // Filter data based on active category - using cached result if available
        let dataToRender;
        
        if (this.activeCategory) {
            // Cache filtered data by category to avoid redundant filtering
            if (!this._cachedFilteredData || this._cachedFilteredData.category !== this.activeCategory) {
                this._cachedFilteredData = {
                    category: this.activeCategory,
                    data: this.data.filter(item => item.category === this.activeCategory)
                };
            }
            dataToRender = this._cachedFilteredData.data;
        } else {
            dataToRender = this.data;
        }
        
        // Draw each data series
        dataToRender.forEach(d => {
            const points = [];
            const color = this.colorScheme[d.category];
            
            // Path for the polygon - all drawing operations batched together
            this.ctx.beginPath();
            
            // Calculate and store points for each skill
            allAxes.forEach((axis, i) => {
                // Find the skill in this category - optimize with Map for larger datasets
                const skill = d.skills.find(s => s.name === axis);
                let value = skill ? skill.value : 0;
                
                // Apply animation factor
                value = value * this.animatedFactor;
                
                // Calculate point position - only once per skill
                const angle = (Math.PI * 2 * i) / total;
                const valueScale = radius * (value / this.maxValue);
                const x = this.centerX + valueScale * Math.cos(angle);
                const y = this.centerY + valueScale * Math.sin(angle);
                
                points.push({ x, y, value: skill ? skill.value : 0, name: axis });
                
                // Add to path
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });
            
            // Close the path
            this.ctx.lineTo(points[0].x, points[0].y);
            
            // Fill the polygon
            this.ctx.fillStyle = color.replace(/rgba\((.*?),\s*0\.\d+\)/g, `rgba($1, ${this.opacityArea})`);
            this.ctx.fill();
            
            // Draw the polygon outline in one step
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = this.strokeWidth;
            if (this.roundStrokes) {
                this.ctx.lineJoin = 'round';
            }
            this.ctx.stroke();
            
            // Draw the points - only for values > 0 and batch similar operations
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1;
            
            // Draw all points in batches to reduce context switching
            // First all fills, then all strokes
            points.forEach(p => {
                if (p.value > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, this.dotRadius, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            });
            
            // Only draw the outer circles for high-value data points to improve performance
            points.filter(p => p.value >= 7).forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, this.dotRadius + 2, 0, 2 * Math.PI);
                this.ctx.stroke();
            });
        });
    }

    /**
     * Handle mouse movement for showing tooltips - with throttling for performance
     */
    handleMouseMove(event) {
        // Throttle mousemove handling to improve performance
        if (this._mouseMoveThrottle) {
            return;
        }
        
        // Set throttle flag
        this._mouseMoveThrottle = true;
        
        // Release throttle after delay
        setTimeout(() => {
            this._mouseMoveThrottle = false;
        }, 30); // 30ms throttle for smooth experience
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) * (this.canvas.width / rect.width / window.devicePixelRatio);
        const mouseY = (event.clientY - rect.top) * (this.canvas.height / rect.height / window.devicePixelRatio);
        
        // Check if mouse is over any data point
        let closestPoint = null;
        let closestDistance = Infinity;
        
        // Filter data based on active category - use cached data
        let dataToCheck;
        if (this.activeCategory) {
            if (this._cachedFilteredData && this._cachedFilteredData.category === this.activeCategory) {
                dataToCheck = this._cachedFilteredData.data;
            } else {
                this._cachedFilteredData = {
                    category: this.activeCategory,
                    data: this.data.filter(item => item.category === this.activeCategory)
                };
                dataToCheck = this._cachedFilteredData.data;
            }
        } else {
            dataToCheck = this.data;
        }
        
        // Cache these calculations since they're used in the loop
        const allAxes = this.getAllSkillNames();
        const total = allAxes.length;
        const radius = Math.min(this.centerX, this.centerY) * 0.85;
        const hitboxSize = this.dotRadius + 5; // Slightly larger hitbox
        
        // Use early termination where possible - this avoids unnecessary calculations
        let foundPoint = false;
        
        dataToCheck.forEach(d => {
            if (foundPoint) return; // Early termination if we found a close point
            
            const color = this.colorScheme[d.category];
            
            // Create a skill lookup map for faster retrieval
            const skillMap = {};
            d.skills.forEach(s => {
                skillMap[s.name] = s;
            });
            
            allAxes.forEach((axis, i) => {
                if (foundPoint) return; // Early termination
                
                // Find the skill in this category - use map for faster lookup
                const skill = skillMap[axis];
                let value = skill ? skill.value : 0;
                
                // Apply animation factor
                value = value * this.animatedFactor;
                
                // Only process points that actually exist
                if (value > 0) {
                    // Calculate point position
                    const angle = (Math.PI * 2 * i) / total;
                    const valueScale = radius * (value / this.maxValue);
                    const x = this.centerX + valueScale * Math.cos(angle);
                    const y = this.centerY + valueScale * Math.sin(angle);
                    
                    // Simpler distance calculation - avoid square root when possible
                    const dx = mouseX - x;
                    const dy = mouseY - y;
                    const distanceSquared = dx * dx + dy * dy;
                    const hitboxSquared = hitboxSize * hitboxSize;
                    
                    // Only compute the actual distance if we're within the hitbox area
                    if (distanceSquared <= hitboxSquared) {
                        const distance = Math.sqrt(distanceSquared);
                        
                        if (distance <= hitboxSize && distance < closestDistance) {
                            closestDistance = distance;
                            closestPoint = {
                                x,
                                y,
                                name: axis,
                                value: skill.value,
                                category: d.category,
                                description: skill.description || ''
                            };
                            
                            // If we're very close to a point, we can stop searching
                            if (distance < this.dotRadius) {
                                foundPoint = true;
                            }
                        }
                    }
                }
            });
        });
        
        // Show tooltip if point found
        if (closestPoint) {
            const tooltipX = closestPoint.x + rect.left;
            const tooltipY = closestPoint.y + rect.top - 10;
            
            // Only update tooltip HTML if content has changed
            const tooltipContent = `
                <div class="tooltip-skill-name">${closestPoint.name}</div>
                <div class="tooltip-skill-value">${this.getSkillLevelText(closestPoint.value)} (${closestPoint.value}/10)</div>
                ${closestPoint.description ? `<p>${closestPoint.description}</p>` : ''}
            `;
            
            if (this._lastTooltipContent !== tooltipContent) {
                this.tooltip.innerHTML = tooltipContent;
                this._lastTooltipContent = tooltipContent;
            }
            
            this.tooltip.style.left = `${tooltipX}px`;
            this.tooltip.style.top = `${tooltipY}px`;
            this.tooltip.classList.add('active');
        } else {
            this.tooltip.classList.remove('active');
        }
    }

    /**
     * Handle mouse leaving the canvas
     */
    handleMouseLeave() {
        this.tooltip.classList.remove('active');
    }

    /**
     * Toggle category selection
     */
    toggleCategory(category) {
        if (this.activeCategory === category) {
            this.activeCategory = null; // Deselect if already selected
        } else {
            this.activeCategory = category;
        }
    }

    /**
     * Update legend item active states
     */
    updateLegendState() {
        const legendItems = this.container.querySelectorAll('.legend-item');
        legendItems.forEach(item => {
            if (item.dataset.category === this.activeCategory) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Reset the chart view to show all categories
     */
    resetView() {
        this.activeCategory = null;
        this.updateLegendState();
        this.startAnimation();
    }
    
    /**
     * Show insight summary modal with skill analysis
     */
    showInsightSummary() {
        // Generate insights from skills data
        const insights = this.generateSkillsInsights();
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'insight-summary-modal';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'insight-header';
        header.innerHTML = `
            <h3>Strategic Skills Analysis</h3>
            <div class="insight-subtitle">Palantir-Grade Insight Engine</div>
        `;
        modalContent.appendChild(header);
        
        // Add primary insights
        const primaryInsight = document.createElement('div');
        primaryInsight.className = 'primary-insight';
        primaryInsight.innerHTML = `
            <div class="insight-metric">${insights.topCategory.name}</div>
            <div class="insight-description">Primary skill domain with ${insights.topCategory.avgScore.toFixed(1)} average proficiency</div>
        `;
        modalContent.appendChild(primaryInsight);
        
        // Add skill distribution visualization
        const distribution = document.createElement('div');
        distribution.className = 'skill-distribution';
        distribution.innerHTML = `
            <h4>Skill Distribution Analysis</h4>
            <div class="distribution-bars">
                ${Object.entries(insights.categoryScores).map(([category, score]) => `
                    <div class="distribution-bar-container">
                        <div class="distribution-label">${this.capitalizeFirstLetter(category)}</div>
                        <div class="distribution-bar">
                            <div class="distribution-fill" style="width: ${score * 10}%; background-color: ${this.colorScheme[category]}"></div>
                        </div>
                        <div class="distribution-value">${score.toFixed(1)}</div>
                    </div>
                `).join('')}
            </div>
        `;
        modalContent.appendChild(distribution);
        
        // Add recommendations section
        const recommendations = document.createElement('div');
        recommendations.className = 'skill-recommendations';
        recommendations.innerHTML = `
            <h4>Strategic Recommendations</h4>
            <ul>
                ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
        modalContent.appendChild(recommendations);
        
        // Create modal if not already present
        if (!document.querySelector('.insight-modal-container')) {
            const modalContainer = document.createElement('div');
            modalContainer.className = 'insight-modal-container';
            modalContainer.innerHTML = `
                <div class="insight-modal-backdrop"></div>
                <div class="insight-modal">
                    <div class="insight-modal-close">&times;</div>
                    <div class="insight-modal-content"></div>
                </div>
            `;
            document.body.appendChild(modalContainer);
            
            // Add close button listener
            modalContainer.querySelector('.insight-modal-close').addEventListener('click', () => {
                modalContainer.classList.remove('active');
                setTimeout(() => {
                    modalContainer.remove();
                }, 300);
            });
            
            // Add backdrop click to close
            modalContainer.querySelector('.insight-modal-backdrop').addEventListener('click', () => {
                modalContainer.classList.remove('active');
                setTimeout(() => {
                    modalContainer.remove();
                }, 300);
            });
        }
        
        // Add content to modal
        const modalContentContainer = document.querySelector('.insight-modal-content');
        modalContentContainer.innerHTML = '';
        modalContentContainer.appendChild(modalContent);
        
        // Show modal with animation
        setTimeout(() => {
            document.querySelector('.insight-modal-container').classList.add('active');
        }, 100);
        
        // Log insight generation
        if (window.SystemLog) {
            window.SystemLog.addEntry({
                type: "system",
                category: "analytics",
                message: "Generated strategic skills insight analysis",
                timestamp: new Date()
            });
        }
        
        // Publish event
        if (window.EventBus) {
            window.EventBus.publish('skills:insightGenerated', insights);
        }
    }
    
    /**
     * Generate insights from skills data
     */
    generateSkillsInsights() {
        // Analysis container
        const insights = {
            topSkills: [],
            developmentAreas: [],
            categoryScores: {},
            balance: 0,
            recommendations: []
        };
        
        // Calculate average scores by category
        this.data.forEach(category => {
            let totalScore = 0;
            category.skills.forEach(skill => {
                totalScore += skill.value;
            });
            const avgScore = totalScore / category.skills.length;
            insights.categoryScores[category.category] = avgScore;
        });
        
        // Find top category
        let maxScore = 0;
        let topCategory = '';
        
        Object.entries(insights.categoryScores).forEach(([category, score]) => {
            if (score > maxScore) {
                maxScore = score;
                topCategory = category;
            }
        });
        
        insights.topCategory = {
            name: this.capitalizeFirstLetter(topCategory),
            avgScore: maxScore
        };
        
        // Get top skills
        const allSkills = [];
        this.data.forEach(category => {
            category.skills.forEach(skill => {
                allSkills.push({
                    name: skill.name,
                    value: skill.value,
                    category: category.category
                });
            });
        });
        
        // Sort by value and get top 3
        allSkills.sort((a, b) => b.value - a.value);
        insights.topSkills = allSkills.slice(0, 3);
        
        // Get development areas (lowest 3 skills)
        insights.developmentAreas = [...allSkills].sort((a, b) => a.value - b.value).slice(0, 3);
        
        // Calculate skill balance (standard deviation of category averages)
        const categoryValues = Object.values(insights.categoryScores);
        const meanCategoryScore = categoryValues.reduce((sum, val) => sum + val, 0) / categoryValues.length;
        
        const variance = categoryValues.reduce((sum, val) => sum + Math.pow(val - meanCategoryScore, 2), 0) / categoryValues.length;
        insights.balance = Math.sqrt(variance);
        
        // Generate recommendations based on analysis
        if (insights.balance > 1.5) {
            insights.recommendations.push(`Focus on balancing skills across ${this.getLowestCategory(insights.categoryScores)} domain to create a more well-rounded profile.`);
        } else {
            insights.recommendations.push("Maintain current balanced approach across different skill domains.");
        }
        
        // Add specific skill recommendations
        if (insights.developmentAreas.length > 0) {
            insights.recommendations.push(`Consider developing ${insights.developmentAreas[0].name} to enhance overall capabilities.`);
        }
        
        // Add domain-specific recommendations
        insights.recommendations.push(`Leverage strong ${insights.topCategory.name} skills as a core differentiator in strategic initiatives.`);
        
        return insights;
    }
    
    /**
     * Get the lowest scoring category
     */
    getLowestCategory(categoryScores) {
        let minScore = Infinity;
        let lowestCategory = '';
        
        Object.entries(categoryScores).forEach(([category, score]) => {
            if (score < minScore) {
                minScore = score;
                lowestCategory = category;
            }
        });
        
        return this.capitalizeFirstLetter(lowestCategory);
    }

    /**
     * Get all unique skill names from all categories
     */
    getAllSkillNames() {
        const names = new Set();
        this.data.forEach(category => {
            category.skills.forEach(skill => {
                names.add(skill.name);
            });
        });
        return Array.from(names);
    }

    /**
     * Convert skill value to text level
     */
    getSkillLevelText(value) {
        if (value >= 9) return 'Expert';
        if (value >= 7) return 'Advanced';
        if (value >= 5) return 'Proficient';
        if (value >= 3) return 'Familiar';
        return 'Beginner';
    }

    /**
     * Helper function to wrap text in canvas
     */
    wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = 1;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y - ((lines - 1) * lineHeight) / 2);
                line = words[n] + ' ';
                lines++;
            } else {
                line = testLine;
            }
        }
        
        const yOffset = lines > 1 ? ((lines - 1) * lineHeight) / 2 : 0;
        context.fillText(line, x, y + lineHeight * ((lines - 1) / 2) - yOffset);
    }

    /**
     * Helper function to capitalize first letter
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Default data structure for skills radar
     */
    getDefaultData() {
        return [
            {
                category: 'technical',
                skills: [
                    { name: 'JavaScript', value: 9, description: 'Modern JS, ES6+, functional programming' },
                    { name: 'TypeScript', value: 8, description: 'Type systems, interfaces, generics' },
                    { name: 'React', value: 9, description: 'Hooks, context, state management' },
                    { name: 'Node.js', value: 8, description: 'API development, Express, middleware' },
                    { name: 'GraphQL', value: 7, description: 'Schema design, resolvers, Apollo' },
                    { name: 'DevOps', value: 6, description: 'CI/CD, Docker, infrastructure as code' }
                ]
            },
            {
                category: 'leadership',
                skills: [
                    { name: 'Team Management', value: 8, description: 'Leading cross-functional teams' },
                    { name: 'Product Strategy', value: 9, description: 'Vision, roadmap development' },
                    { name: 'Mentoring', value: 8, description: 'Developer growth and coaching' },
                    { name: 'Communication', value: 9, description: 'Clear, effective stakeholder communication' },
                    { name: 'Process Optimization', value: 7, description: 'Agile methodologies and workflows' },
                    { name: 'Conflict Resolution', value: 7, description: 'Mediating team challenges' }
                ]
            },
            {
                category: 'business',
                skills: [
                    { name: 'Financial Analysis', value: 6, description: 'P&L, budgeting, forecasting' },
                    { name: 'Market Research', value: 7, description: 'Competitive analysis, market trends' },
                    { name: 'Business Strategy', value: 8, description: 'Growth planning, pivoting' },
                    { name: 'Client Relations', value: 9, description: 'Partnership building, retention' },
                    { name: 'Negotiation', value: 7, description: 'Contract negotiations, partnerships' },
                    { name: 'Digital Marketing', value: 6, description: 'SEO, content strategy, analytics' }
                ]
            },
            {
                category: 'creative',
                skills: [
                    { name: 'Design Thinking', value: 8, description: 'Human-centered solutions' },
                    { name: 'UX/UI Design', value: 7, description: 'Wireframing, prototyping, user flows' },
                    { name: 'Visual Design', value: 6, description: 'Typography, color theory, composition' },
                    { name: 'Content Creation', value: 7, description: 'Technical writing, presentations' },
                    { name: 'Brand Development', value: 8, description: 'Identity, messaging, positioning' },
                    { name: 'Data Visualization', value: 7, description: 'Presenting complex data clearly' }
                ]
            },
            {
                category: 'languages',
                skills: [
                    { name: 'English', value: 10, description: 'Native fluency' },
                    { name: 'Arabic', value: 7, description: 'Professional working proficiency' },
                    { name: 'French', value: 5, description: 'Intermediate proficiency' },
                    { name: 'Spanish', value: 4, description: 'Basic conversational' },
                    { name: 'Python', value: 7, description: 'Data analysis, automation' },
                    { name: 'SQL', value: 8, description: 'Complex queries, performance optimization' }
                ]
            }
        ];
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the skills radar container exists
    const skillsRadarContainer = document.getElementById('skills-radar-container');
    if (skillsRadarContainer) {
        new SkillsRadarChart('skills-radar-container');
    }
});
