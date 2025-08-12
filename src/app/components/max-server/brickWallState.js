const BRICK_TYPES = {
    regular: { count: 360, price: 10 },
    industrial: { count: 60, price: 25 },
    legendary: { count: 12, price: 100 }
};

// Generate all 432 bricks (24x18 wall)
function generateAllBricks() {
    const bricks = [];
    let brickId = 1;
    
    // Generate regular bricks (360)
    for (let i = 0; i < BRICK_TYPES.regular.count; i++) {
        bricks.push({
            id: brickId,
            type: 'regular',
            price: BRICK_TYPES.regular.price,
            sold: false,
            // Frontend expected properties
            name: `MetaBrick #${brickId}`,
            seriesNumber: brickId,
            mintPrice: `$${BRICK_TYPES.regular.price}`,
            image: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/regular_${i % 20}.png`,
            // Backend properties (for compatibility)
            metadataUri: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/${brickId}.json`,
            imageUrl: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/regular_${i % 20}.png`,
            position: {
                row: Math.floor((brickId - 1) / 24),
                col: (brickId - 1) % 24
            }
        });
        brickId++;
    }
    
    // Generate industrial bricks (60)
    for (let i = 0; i < BRICK_TYPES.industrial.count; i++) {
        bricks.push({
            id: brickId,
            type: 'industrial',
            price: BRICK_TYPES.industrial.price,
            sold: false,
            // Frontend expected properties
            name: `MetaBrick #${brickId}`,
            seriesNumber: brickId,
            mintPrice: `$${BRICK_TYPES.industrial.price}`,
            image: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/industrial_${i % 7}.png`,
            // Backend properties (for compatibility)
            metadataUri: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/${brickId}.json`,
            imageUrl: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/industrial_${i % 7}.png`,
            position: {
                row: Math.floor((brickId - 1) / 24),
                col: (brickId - 1) % 24
            }
        });
        brickId++;
    }
    
    // Generate legendary bricks (12)
    for (let i = 0; i < BRICK_TYPES.legendary.count; i++) {
        bricks.push({
            id: brickId,
            type: 'legendary',
            price: BRICK_TYPES.legendary.price,
            sold: false,
            // Frontend expected properties
            name: `MetaBrick #${brickId}`,
            seriesNumber: brickId,
            mintPrice: `$${BRICK_TYPES.legendary.price}`,
            image: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/legendary_${i % 3}.png`,
            // Backend properties (for compatibility)
            metadataUri: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/${brickId}.json`,
            imageUrl: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/legendary_${i % 3}.png`,
            position: {
                row: Math.floor((brickId - 1) / 24),
                col: (brickId - 1) % 24
            }
        });
        brickId++;
    }
    
    return bricks;
}

let bricks = generateAllBricks();

// Get all bricks
function getBricks() {
    return bricks;
}

// Get brick statistics
function getBrickStats() {
    const total = bricks.length;
    const sold = bricks.filter(brick => brick.sold).length;
    const available = total - sold;
    
    const stats = {
        total,
        sold,
        available,
        types: {
            regular: {
                total: BRICK_TYPES.regular.count,
                sold: bricks.filter(brick => brick.type === 'regular' && brick.sold).length,
                available: BRICK_TYPES.regular.count - bricks.filter(brick => brick.type === 'regular' && brick.sold).length
            },
            industrial: {
                total: BRICK_TYPES.industrial.count,
                sold: bricks.filter(brick => brick.type === 'industrial' && brick.sold).length,
                available: BRICK_TYPES.industrial.count - bricks.filter(brick => brick.type === 'industrial' && brick.sold).length
            },
            legendary: {
                total: BRICK_TYPES.legendary.count,
                sold: bricks.filter(brick => brick.type === 'legendary' && brick.sold).length,
                available: BRICK_TYPES.legendary.count - bricks.filter(brick => brick.type === 'legendary' && brick.sold).length
            }
        }
    };
    
    return stats;
}

// Get brick by ID
function getBrickById(id) {
    return bricks.find(brick => brick.id === parseInt(id));
}

// Mark brick as sold
function markBrickAsSold(id) {
    const brick = bricks.find(brick => brick.id === parseInt(id));
    if (brick) {
        brick.sold = true;
        return true;
    }
    return false;
}

// Reset brick wall
function resetBrickWall() {
    bricks = generateAllBricks();
}

module.exports = {
    getBricks,
    getBrickStats,
    getBrickById,
    markBrickAsSold,
    resetBrickWall
};
