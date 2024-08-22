const graphContainer = document.getElementById('graph-container');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

let currentLevel = 0;
let graphData = {};
const vertexRadius = 25; // Radius of the vertex circle
const containerPadding = 20; // Padding inside the container

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomGraph(numVertices, numEdges) {
    const vertices = Array.from({ length: numVertices }, (_, i) => ({
        id: `v${i}`,
        x: 0, // Placeholder, will be set later
        y: 0, // Placeholder, will be set later
        balance: getRandomInt(-5, 10)
    }));

    // Ensure at least one vertex has a negative balance
    vertices[getRandomInt(0, numVertices - 1)].balance = getRandomInt(-5, -1);

    const edges = [];
    const adjacencyList = new Set();

    // Ensure graph is connected
    for (let i = 0; i < numVertices - 1; i++) {
        edges.push({ from: vertices[i].id, to: vertices[i + 1].id });
        adjacencyList.add(`${vertices[i].id}-${vertices[i + 1].id}`);
        adjacencyList.add(`${vertices[i + 1].id}-${vertices[i].id}`);
    }

    // Add additional edges
    while (edges.length < numEdges) {
        const from = vertices[getRandomInt(0, numVertices - 1)].id;
        const to = vertices[getRandomInt(0, numVertices - 1)].id;

        if (from !== to && !adjacencyList.has(`${from}-${to}`)) {
            edges.push({ from, to });
            adjacencyList.add(`${from}-${to}`);
            adjacencyList.add(`${to}-${from}`);
        }
    }

    // Position vertices to avoid overlap
    positionVertices(vertices);

    return { vertices, edges };
}

function positionVertices(vertices) {
    const containerWidth = graphContainer.clientWidth - 2 * containerPadding;
    const containerHeight = graphContainer.clientHeight - 2 * containerPadding;
    const centerX = containerWidth / 2 + containerPadding;
    const centerY = containerHeight / 2 + containerPadding;
    const angleStep = (2 * Math.PI) / vertices.length;
    const radius = Math.min(containerWidth, containerHeight) / 2 - vertexRadius;

    vertices.forEach((vertex, i) => {
        const angle = i * angleStep;
        vertex.x = Math.cos(angle) * radius + centerX;
        vertex.y = Math.sin(angle) * radius + centerY;
    });
}

function drawGraph() {
    graphContainer.innerHTML = '';
    const { vertices, edges } = graphData;

    // Draw edges
    edges.forEach(edge => {
        const fromVertex = vertices.find(v => v.id === edge.from);
        const toVertex = vertices.find(v => v.id === edge.to);

        if (!fromVertex || !toVertex) return;

        const edgeElement = document.createElement('div');
        edgeElement.className = 'edge';

        const x1 = fromVertex.x;
        const y1 = fromVertex.y;
        const x2 = toVertex.x;
        const y2 = toVertex.y;
        const length = Math.hypot(x2 - x1, y2 - y1);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        // Set initial style for animation
        edgeElement.style.width = '0px';
        edgeElement.style.height = '2px'; // Edge thickness
        edgeElement.style.backgroundColor = 'black';
        edgeElement.style.position = 'absolute';
        edgeElement.style.left = `${x1}px`;
        edgeElement.style.top = `${y1}px`;
        edgeElement.style.transformOrigin = '0 0';
        edgeElement.style.transform = `rotate(${angle}deg)`;
        edgeElement.style.transition = 'width 0.5s ease-out'; // Animation for edge drawing

        // Append edge element to container
        graphContainer.appendChild(edgeElement);

        // Trigger animation by setting final width
        requestAnimationFrame(() => {
            edgeElement.style.width = `${length}px`;
        });
    });

    // Draw vertices
    vertices.forEach(vertex => {
        const vertexElement = document.createElement('div');
        vertexElement.className = 'vertex';
        vertexElement.id = vertex.id;
        vertexElement.style.left = `${vertex.x - vertexRadius}px`; // Centering vertex
        vertexElement.style.top = `${vertex.y - vertexRadius}px`; // Centering vertex
        vertexElement.textContent = vertex.balance;

        // Add animation class for balance update
        vertexElement.classList.add('vertex-update');
        vertexElement.onclick = () => handleVertexClick(vertex.id);

        graphContainer.appendChild(vertexElement);
    });
}

function handleVertexClick(id) {
    const { vertices, edges } = graphData;
    const clickedVertex = vertices.find(v => v.id === id);
    const adjacentVertices = edges
        .filter(edge => edge.from === id || edge.to === id)
        .map(edge => edge.from === id ? edge.to : edge.from)
        .map(adjId => vertices.find(v => v.id === adjId));

    clickedVertex.balance -= adjacentVertices.length;

    adjacentVertices.forEach(vertex => {
        vertex.balance += 1;
    });

    // Re-draw graph to update vertices and edges
    drawGraph();
    checkLevelCompletion();
}

function checkLevelCompletion() {
    const { vertices } = graphData;
    const isCompleted = vertices.every(v => v.balance >= 0);
    if (isCompleted) {
        nextBtn.style.display = 'inline';
    }
}

function updateLevelCounter() {
    document.getElementById('level-counter').textContent = `Level: ${currentLevel}`;
}

function startGame() {
    currentLevel = 0;
    graphData = generateRandomGraph(5 + currentLevel, 10 + currentLevel);
    drawGraph();
    nextBtn.style.display = 'none';
    restartBtn.style.display = 'inline';
    updateLevelCounter();
}

function nextLevel() {
    currentLevel++;
    graphData = generateRandomGraph(5 + currentLevel, 10 + currentLevel);
    drawGraph();
    nextBtn.style.display = 'none';
    restartBtn.style.display = 'inline';
    updateLevelCounter();
}

function restartLevel() {
    graphData = generateRandomGraph(5 + currentLevel, 10 + currentLevel);
    drawGraph();
}

startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextLevel);
restartBtn.addEventListener('click', restartLevel);
