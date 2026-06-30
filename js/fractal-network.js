// Fractal Network Effect (advanced, interactive)
(function() {
  const container = document.getElementById('network-bg');
  if (!container) return;

  // Remove any existing SVG/canvas
  container.innerHTML = '';

  // Create SVG for D3
  let width = container.offsetWidth;
  let height = container.offsetHeight;
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('position', 'absolute')
    .style('top', 0)
    .style('left', 0)
    .style('z-index', 0);

  // Color palette
  const COLORS = {
    node: '#00eaff', // neon cyan
    nodeGlow: '#00eaff',
    link: '#1e90ff', // neon blue
    linkPulse: '#ffffff',
    bg: 'none',
  };

  // Fractal network parameters
  const MAX_DEPTH = 4;
  const BRANCHES = 3;
  const BASE_LENGTH = Math.min(width, height) / 6;
  const NODE_RADIUS = 3;

  // Store all nodes and links
  let nodes = [];
  let links = [];

  // Recursive function to generate fractal network
  function generateFractal(x, y, angle, depth, parent = null) {
    if (depth > MAX_DEPTH) return;
    const node = { x, y, depth, parent, id: nodes.length };
    nodes.push(node);
    if (parent) {
      links.push({ source: parent, target: node });
    }
    const branchLength = BASE_LENGTH * Math.pow(0.6, depth);
    for (let i = 0; i < BRANCHES; i++) {
      const branchAngle = angle + ((i - (BRANCHES-1)/2) * (Math.PI/3) / (depth+1));
      const nx = x + branchLength * Math.cos(branchAngle);
      const ny = y + branchLength * Math.sin(branchAngle);
      generateFractal(nx, ny, branchAngle, depth + 1, node);
    }
  }

  // Center of hero section
  const centerX = width / 2;
  const centerY = height / 2;
  generateFractal(centerX, centerY, -Math.PI/2, 0, null);

  // Draw links
  const link = svg.selectAll('.fractal-link')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'fractal-link')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)
    .attr('stroke', COLORS.link)
    .attr('stroke-width', 1.2)
    .attr('opacity', 0.7);

  // Draw nodes
  const node = svg.selectAll('.fractal-node')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('class', 'fractal-node')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', NODE_RADIUS)
    .attr('fill', COLORS.node)
    .attr('filter', 'url(#glow)');

  // Add SVG filter for glow effect
  const defs = svg.append('defs');
  const filter = defs.append('filter')
    .attr('id', 'glow');
  filter.append('feGaussianBlur')
    .attr('stdDeviation', '2.5')
    .attr('result', 'coloredBlur');
  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode')
    .attr('in', 'coloredBlur');
  feMerge.append('feMergeNode')
    .attr('in', 'SourceGraphic');

  // Animate links (pulse effect)
  function animateLinks() {
    link.transition()
      .duration(1200)
      .attr('stroke', COLORS.linkPulse)
      .transition()
      .duration(1200)
      .attr('stroke', COLORS.link)
      .on('end', animateLinks);
  }
  animateLinks();

  // Interactivity: nodes repel from mouse
  svg.on('mousemove', function(event) {
    const [mx, my] = d3.pointer(event);
    nodes.forEach(d => {
      const dx = d.x - mx;
      const dy = d.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 80) {
        const angle = Math.atan2(dy, dx);
        d.x += Math.cos(angle) * (80 - dist) * 0.08;
        d.y += Math.sin(angle) * (80 - dist) * 0.08;
      } else {
        // Ease back to original position
        if (d.parent) {
          const ox = (d.parent.x + (d.x - d.parent.x) * 0.7);
          const oy = (d.parent.y + (d.y - d.parent.y) * 0.7);
          d.x += (ox - d.x) * 0.02;
          d.y += (oy - d.y) * 0.02;
        } else {
          d.x += (centerX - d.x) * 0.01;
          d.y += (centerY - d.y) * 0.01;
        }
      }
    });
    updateNetwork();
  });

  // Redraw network
  function updateNetwork() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }

  // Responsive: re-generate on resize
  window.addEventListener('resize', () => {
    width = container.offsetWidth;
    height = container.offsetHeight;
    svg.attr('width', width).attr('height', height);
    nodes = [];
    links = [];
    generateFractal(width/2, height/2, -Math.PI/2, 0, null);
    // Update data
    link.data(links)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node.data(nodes)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    updateNetwork();
  });

  // Initial draw
  updateNetwork();
})(); 
