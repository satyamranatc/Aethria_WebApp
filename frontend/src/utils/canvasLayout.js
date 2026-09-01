import dagre from 'dagre';

const getNodeDimensions = (type) => {
  switch (type) {
    case 'decisionNode':
      return { width: 190, height: 190 };
    case 'circleNode':
      return { width: 120, height: 120 };
    case 'dbNode':
      return { width: 260, height: 130 };
    case 'queueNode':
      return { width: 240, height: 90 };
    case 'noteNode':
      return { width: 200, height: 110 };
    case 'rectNode':
      return { width: 240, height: 110 };
    case 'archNode':
    default:
      return { width: 280, height: 130 };
  }
};

/**
 * Disciplined Tier-Aligned Layout Engine
 * Combines Dagre graph topological sorting with a balanced geometric centering grid.
 */
export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  if (!nodes || nodes.length === 0) return { nodes: [], edges: [] };

  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    ranker: 'tight-tree',
    nodesep: 90,
    ranksep: 130,
    marginx: 80,
    marginy: 60
  });

  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node.type);
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Group nodes by their calculated Y or X rank levels
  const ranksMap = new Map();
  nodes.forEach((node) => {
    const nodeInfo = dagreGraph.node(node.id);
    const key = isHorizontal
      ? Math.round((nodeInfo.x || 0) / 100) * 100
      : Math.round((nodeInfo.y || 0) / 80) * 80;

    if (!ranksMap.has(key)) {
      ranksMap.set(key, []);
    }
    ranksMap.get(key).push({ node, nodeInfo });
  });

  // Sort ranks chronologically
  const sortedRanks = Array.from(ranksMap.keys()).sort((a, b) => a - b);
  const centerX = 500;
  const centerY = 300;

  const layoutedNodes = [];

  sortedRanks.forEach((rankKey, rankIndex) => {
    const tierItems = ranksMap.get(rankKey);
    const count = tierItems.length;

    // Sort nodes within tier by step number if available
    tierItems.sort((a, b) => (a.node.data?.step || 0) - (b.node.data?.step || 0));

    tierItems.forEach((item, itemIdx) => {
      const { node, nodeInfo } = item;
      const { width, height } = getNodeDimensions(node.type);

      let xPos = nodeInfo.x - width / 2;
      let yPos = nodeInfo.y - height / 2;

      // Perfectly center-balance horizontal tiers
      if (!isHorizontal) {
        const spacing = 320;
        const totalRowWidth = (count - 1) * spacing;
        const startX = centerX - totalRowWidth / 2;
        xPos = startX + itemIdx * spacing - width / 2;
        yPos = 80 + rankIndex * 190;
      } else {
        const spacing = 180;
        const totalColHeight = (count - 1) * spacing;
        const startY = centerY - totalColHeight / 2;
        yPos = startY + itemIdx * spacing - height / 2;
        xPos = 80 + rankIndex * 340;
      }

      layoutedNodes.push({
        ...node,
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        position: {
          x: Math.round(xPos),
          y: Math.round(yPos)
        }
      });
    });
  });

  return { nodes: layoutedNodes, edges };
};
