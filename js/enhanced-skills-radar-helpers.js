/**
 * Enhanced Skills Radar Chart - Helper Methods
 * @version 1.3.0
 */

// Immediately add helper methods to the SkillsRadarChart prototype
(function() {
    // Add helper methods directly to the prototype, they'll be available 
    // once the SkillsRadarChart class is loaded
    
    // Make sure we don't overwrite existing methods if they're already defined
    if (typeof window.SkillsRadarChart !== 'undefined') {
        initHelpers();
    } else {
        // Create a helper initialization function
        function initHelpers() {
            console.log('Initializing SkillsRadarChart helper methods');
            
            /**
             * Draw level circles in the background
             * @param {number} radius - Chart radius
             * @param {number} axisCount - Number of axes
             * @private
             */
            SkillsRadarChart.prototype._drawLevels = function(radius, axisCount) {
                const levelFactor = radius / this.levels;
                
                // Store a reference to the context for better readability
                const ctx = this.ctx;
                
                // Save context state
                ctx.save();
                
                // Set styling for level circles
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                
                // Draw each level
                for (let level = 0; level < this.levels; level++) {
                    const currentLevelFactor = levelFactor * (level + 1);
                    
                    // Draw level circle
                    ctx.beginPath();
                    for (let i = 0; i < axisCount; i++) {
                        const angle = (Math.PI * 2 * i) / axisCount;
                        const x = this.centerX + currentLevelFactor * Math.cos(angle);
                        const y = this.centerY + currentLevelFactor * Math.sin(angle);
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                    
                    // Draw level labels if needed
                    if (this.valueLabels && this.valueLabels[level]) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.font = '10px Inter, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(
                            this.valueLabels[level],
                            this.centerX,
                            this.centerY - currentLevelFactor - 5
                        );
                    }
                }
                
                // Restore context state
                ctx.restore();
            };

            /**
             * Draw axis lines
             * @param {Array} axes - Array of axis names
             * @param {number} radius - Chart radius
             * @private
             */
            SkillsRadarChart.prototype._drawAxes = function(axes, radius) {
                const axisCount = axes.length;
                
                // Store a reference to the context for better readability
                const ctx = this.ctx;
                
                // Save context state
                ctx.save();
                
                // Set styling for axes
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                
                // Draw each axis
                for (let i = 0; i < axisCount; i++) {
                    const angle = (Math.PI * 2 * i) / axisCount;
                    const x = this.centerX + radius * Math.cos(angle);
                    const y = this.centerY + radius * Math.sin(angle);
                    
                    ctx.beginPath();
                    ctx.moveTo(this.centerX, this.centerY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                
                // Restore context state
                ctx.restore();
            };

            /**
             * Draw colored areas for each data category
             * @param {Array} data - Data to render
             * @param {Array} axes - Array of axis names
             * @param {number} radius - Chart radius
             * @private
             */
            SkillsRadarChart.prototype._drawAreas = function(data, axes, radius) {
                const axisCount = axes.length;
                
                // Store a reference to the context for better readability
                const ctx = this.ctx;
                
                // Save context state
                ctx.save();
                
                // Get current time for animations
                const now = performance.now() / 1000;
                
                // Draw each category
                data.forEach(category => {
                    const categoryName = category.category;
                    const color = this.colorScheme[categoryName] || 'rgba(255, 255, 255, 0.5)';
                    
                    // Extract RGB values for creating custom gradients
                    let rgbValues = color.match(/\d+/g);
                    if (!rgbValues || rgbValues.length < 3) {
                        rgbValues = [255, 255, 255]; // Fallback to white
                    }
                    
                    // Determine if this is the active category
                    const isActiveCategory = !this.activeCategory || this.activeCategory === categoryName;
                    const baseOpacity = isActiveCategory ? this.opacityArea * 1.5 : this.opacityArea * 0.7;
                    
                    // Calculate breathing effect for active category
                    const breathEffect = isActiveCategory ? 0.1 * Math.sin(now * 1.5) : 0;
                    const areaOpacity = baseOpacity + breathEffect;
                    
                    // Create points array for drawing
                    const points = [];
                    
                    // First pass - collect all points
                    axes.forEach((axis, i) => {
                        // Find the skill value for this axis
                        const skill = category.skills.find(s => s.name === axis);
                        const value = skill ? skill.value * this.animatedFactor : 0;
                        
                        // Calculate position
                        const angle = (Math.PI * 2 * i) / axisCount;
                        const ratio = value / this.maxValue;
                        const x = this.centerX + radius * ratio * Math.cos(angle);
                        const y = this.centerY + radius * ratio * Math.sin(angle);
                        
                        // Store point
                        points.push({ x, y, angle });
                        
                        // Cache the position for tooltip interaction
                        this._cachedPositions = this._cachedPositions || {};
                        const cacheKey = `${axis}_${skill ? skill.value : 0}_${categoryName}`;
                        this._cachedPositions[cacheKey] = { x, y };
                    });
                    
                    // Create a radial gradient from center to edges
                    const gradient = ctx.createRadialGradient(
                        this.centerX, this.centerY, 0,
                        this.centerX, this.centerY, radius
                    );
                    
                    // Add gradient stops with subtle pulsing effect
                    gradient.addColorStop(0, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${areaOpacity * 0.7})`);
                    gradient.addColorStop(0.7, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${areaOpacity})`);
                    gradient.addColorStop(1, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${areaOpacity * 0.5})`);
                    
                    // Apply fill style
                    ctx.fillStyle = gradient;
                    
                    // Set stroke style with animation for active category
                    const glowIntensity = isActiveCategory ? 0.2 + 0.3 * Math.sin(now * 2) : 0;
                    ctx.shadowColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${isActiveCategory ? 0.7 : 0.3})`;
                    ctx.shadowBlur = isActiveCategory ? 15 + glowIntensity * 10 : 5;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = isActiveCategory ? this.strokeWidth * 1.5 : this.strokeWidth;
                    
                    // Begin path for category area
                    ctx.beginPath();
                    
                    // Draw shape using collected points
                    points.forEach((point, i) => {
                        if (i === 0) {
                            ctx.moveTo(point.x, point.y);
                        } else {
                            if (this.roundStrokes) {
                                // Enhanced curved corners with adaptive control points
                                const prevPoint = points[i - 1];
                                const ctrlX = this.centerX + (Math.cos((prevPoint.angle + point.angle) / 2) * radius * 0.2);
                                const ctrlY = this.centerY + (Math.sin((prevPoint.angle + point.angle) / 2) * radius * 0.2);
                                ctx.quadraticCurveTo(ctrlX, ctrlY, point.x, point.y);
                            } else {
                                ctx.lineTo(point.x, point.y);
                            }
                        }
                    });
                    
                    // Connect back to the first point to close the shape
                    if (points.length > 0) {
                        if (this.roundStrokes) {
                            const firstPoint = points[0];
                            const lastPoint = points[points.length - 1];
                            const ctrlX = this.centerX + (Math.cos((lastPoint.angle + firstPoint.angle) / 2) * radius * 0.2);
                            const ctrlY = this.centerY + (Math.sin((lastPoint.angle + firstPoint.angle) / 2) * radius * 0.2);
                            ctx.quadraticCurveTo(ctrlX, ctrlY, firstPoint.x, firstPoint.y);
                        } else {
                            ctx.lineTo(points[0].x, points[0].y);
                        }
                    }
                    
                    // Close the path
                    ctx.closePath();
                    
                    // Fill and stroke the path
                    ctx.fill();
                    ctx.stroke();
                });
                
                // Reset shadow settings
                ctx.shadowBlur = 0;
                
                // Restore context state
                ctx.restore();
            };
            
            /**
             * Helper function to wrap text in canvas
             * @param {CanvasRenderingContext2D} context - Canvas context
             * @param {string} text - Text to wrap
             * @param {number} x - X position
             * @param {number} y - Y position
             * @param {number} maxWidth - Maximum width in pixels
             * @param {number} lineHeight - Line height in pixels
             */
            SkillsRadarChart.prototype.wrapText = function(ctx, text, x, y, maxWidth, lineHeight) {
                const words = text.split(' ');
                let line = '';
                const lineArray = [];
                
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    
                    if (testWidth > maxWidth && n > 0) {
                        lineArray.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lineArray.push(line);
                
                // Draw lines
                if (ctx.textAlign === 'right') {
                    // For right-aligned text
                    for (let i = 0; i < lineArray.length; i++) {
                        ctx.fillText(lineArray[i], x, y + (i * lineHeight));
                    }
                } else {
                    // For left-aligned text
                    for (let i = 0; i < lineArray.length; i++) {
                        ctx.fillText(lineArray[i], x, y + (i * lineHeight));
                    }
                }
            };

            /**
             * Draws a pulsing glow effect for active data points
             * @param {Array} data - The data points to draw
             * @param {number} radius - Chart radius
             * @private
             */
            SkillsRadarChart.prototype._drawPulsingGlow = function(data, radius) {
                if (!data || !data.length) return;
                
                const ctx = this.ctx;
                const now = performance.now() / 1000;
                
                // Only draw glow for the active category or all categories if none active
                const filteredData = this.activeCategory 
                    ? data.filter(d => d.category === this.activeCategory) 
                    : data;
                
                ctx.save();
                
                // Process each category
                filteredData.forEach(category => {
                    const categoryName = category.category;
                    
                    // Process each skill in the category
                    category.skills.forEach(skill => {
                        const axis = skill.name;
                        const value = skill.value;
                        
                        // Skip if no value
                        if (isNaN(value)) return;
                        
                        // Find the axis index
                        const axisIndex = this.allAxis ? this.allAxis.indexOf(axis) : -1;
                        if (axisIndex === -1) return;
                        
                        // Calculate position
                        const angleSlice = (Math.PI * 2) / (this.allAxis ? this.allAxis.length : data[0].skills.length);
                        const angle = axisIndex * angleSlice;
                        
                        const posX = this.centerX + (value / this.maxValue) * radius * Math.cos(angle) * this.animatedFactor;
                        const posY = this.centerY + (value / this.maxValue) * radius * Math.sin(angle) * this.animatedFactor;
                        
                        // Create pulsing effect - oscillate between 0.6 and 1
                        const pulseIntensity = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now * 2));
                        
                        // Draw glow
                        const gradientSize = this.dotRadius * (6 + 4 * pulseIntensity);
                        const gradient = ctx.createRadialGradient(posX, posY, 0, posX, posY, gradientSize);
                        
                        // Get the appropriate color based on category
                        let color = this.colorScheme[categoryName] || 'rgba(255, 255, 255, 0.7)';
                        
                        // Extract RGB values from rgba color
                        let rgbValues = color.match(/\d+/g);
                        if (rgbValues && rgbValues.length >= 3) {
                            // Create gradient with fading opacity
                            gradient.addColorStop(0, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${0.7 * pulseIntensity})`);
                            gradient.addColorStop(0.5, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${0.3 * pulseIntensity})`);
                            gradient.addColorStop(1, `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0)`);
                            
                            // Draw glow
                            ctx.fillStyle = gradient;
                            ctx.beginPath();
                            ctx.arc(posX, posY, gradientSize, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    });
                });
                
                ctx.restore();
            };
        }
        
        // Check if SkillsRadarChart already exists, and initialize helpers if it does
        if (window.SkillsRadarChart) {
            initHelpers();
        } else {
            // If not yet available, wait for the global class to be defined
            // This handles the case where the class is loaded after this script
            Object.defineProperty(window, 'SkillsRadarChart', {
                configurable: true,
                get: function() { return this._SkillsRadarChart; },
                set: function(value) {
                    this._SkillsRadarChart = value;
                    if (value) {
                        initHelpers();
                    }
                }
            });
        }
    }
})();
