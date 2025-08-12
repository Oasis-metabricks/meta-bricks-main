const { processBrickPurchase, generateBrickMetadata } = require('./pinata-integration');

// MetaBricks Backend Integration
class MetaBricksBackend {
    constructor() {
        this.purchasedBricks = new Map();
        this.brickCounter = 1;
        this.brickTypes = ['regular', 'industrial', 'legendary'];
    }
    
    // Process a brick purchase from your existing wall
    async handleBrickPurchase(userData) {
        const {
            userId,
            userAddress,
            paymentAmount,
            paymentMethod, // 'stripe', 'crypto', etc.
            brickPosition, // x, y coordinates on the wall
            timestamp
        } = userData;
        
        try {
            console.log(`🧱 Processing brick purchase for user ${userId} at position ${brickPosition.x}, ${brickPosition.y}`);
            
            // Determine brick type based on position or random selection
            const brickType = this.determineBrickType(brickPosition);
            
            // Generate unique brick ID
            const brickId = this.brickCounter++;
            
            // Process the brick purchase (upload metadata to Pinata)
            const result = await processBrickPurchase(brickId, brickType, userAddress);
            
            if (result.success) {
                // Store purchase record
                this.purchasedBricks.set(brickId, {
                    ...result,
                    userId,
                    paymentAmount,
                    paymentMethod,
                    brickPosition,
                    timestamp,
                    status: 'metadata_uploaded'
                });
                
                console.log(`✅ Brick #${brickId} processed successfully!`);
                console.log(`📍 Position: ${brickPosition.x}, ${brickPosition.y}`);
                console.log(`🎨 Type: ${brickType}`);
                console.log(`🔗 IPFS: ${result.ipfsHash}`);
                
                return {
                    success: true,
                    brickId,
                    brickType,
                    ipfsHash: result.ipfsHash,
                    pinataUrl: result.pinataUrl,
                    nextStep: 'mint_nft'
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error(`❌ Error processing brick purchase for user ${userId}:`, error);
            return {
                success: false,
                error: error.message,
                brickId: null
            };
        }
    }
    
    // Determine brick type based on position or random selection
    determineBrickType(brickPosition) {
        // You can implement custom logic here:
        // - Position-based rarity (corners = legendary, edges = industrial, center = regular)
        // - Time-based rarity
        // - Random selection with weighted probabilities
        
        // For now, using weighted random selection
        const weights = {
            regular: 0.6,      // 60% chance
            industrial: 0.3,   // 30% chance  
            legendary: 0.1     // 10% chance
        };
        
        const random = Math.random();
        let cumulative = 0;
        
        for (const [type, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (random <= cumulative) {
                return type;
            }
        }
        
        return 'regular'; // fallback
    }
    
    // Get brick information
    getBrickInfo(brickId) {
        return this.purchasedBricks.get(brickId);
    }
    
    // Get all bricks for a user
    getUserBricks(userId) {
        const userBricks = [];
        for (const [brickId, brickData] of this.purchasedBricks) {
            if (brickData.userId === userId) {
                userBricks.push({
                    brickId,
                    ...brickData
                });
            }
        }
        return userBricks;
    }
    
    // Get wall status (which positions are filled)
    getWallStatus() {
        const wallStatus = {
            totalBricks: this.purchasedBricks.size,
            filledPositions: [],
            availablePositions: this.calculateAvailablePositions()
        };
        
        for (const [brickId, brickData] of this.purchasedBricks) {
            wallStatus.filledPositions.push({
                brickId,
                position: brickData.brickPosition,
                type: brickData.brickType,
                status: brickData.status
            });
        }
        
        return wallStatus;
    }
    
    // Calculate available positions on the wall
    calculateAvailablePositions() {
        // This would integrate with your existing wall layout
        // For now, returning a simple grid
        const wallWidth = 20; // 20 bricks wide
        const wallHeight = 22; // 22 bricks tall
        const totalPositions = wallWidth * wallHeight;
        
        const available = [];
        for (let x = 0; x < wallWidth; x++) {
            for (let y = 0; y < wallHeight; y++) {
                const position = { x, y };
                const isOccupied = Array.from(this.purchasedBricks.values())
                    .some(brick => brick.brickPosition.x === x && brick.brickPosition.y === y);
                
                if (!isOccupied) {
                    available.push(position);
                }
            }
        }
        
        return available;
    }
    
    // Process multiple brick purchases (for bulk operations)
    async processBulkPurchase(userData, numBricks) {
        const results = [];
        
        for (let i = 0; i < numBricks; i++) {
            const result = await this.handleBrickPurchase({
                ...userData,
                brickPosition: this.findNextAvailablePosition()
            });
            results.push(result);
        }
        
        return results;
    }
    
    // Find next available position on the wall
    findNextAvailablePosition() {
        const available = this.calculateAvailablePositions();
        if (available.length === 0) {
            throw new Error('Wall is full!');
        }
        
        // Simple strategy: take the first available position
        // You could implement more sophisticated placement logic
        return available[0];
    }
    
    // Get purchase statistics
    getPurchaseStats() {
        const stats = {
            totalBricks: this.purchasedBricks.size,
            byType: { regular: 0, industrial: 0, legendary: 0 },
            byStatus: {},
            revenue: 0
        };
        
        for (const [brickId, brickData] of this.purchasedBricks) {
            // Count by type
            stats.byType[brickData.brickType]++;
            
            // Count by status
            stats.byStatus[brickData.status] = (stats.byStatus[brickData.status] || 0) + 1;
            
            // Calculate revenue
            stats.revenue += brickData.paymentAmount || 0;
        }
        
        return stats;
    }
}

// Example usage and testing
async function testBackendIntegration() {
    console.log('🏗️ Testing MetaBricks Backend Integration...\n');
    
    const backend = new MetaBricksBackend();
    
    // Simulate a brick purchase
    const purchaseResult = await backend.handleBrickPurchase({
        userId: 'user123',
        userAddress: '85ArqfA2fy8spGcMGsSW7cbEJAWj26vewmmoG2bwkgT9',
        paymentAmount: 50.00,
        paymentMethod: 'stripe',
        brickPosition: { x: 5, y: 10 },
        timestamp: new Date().toISOString()
    });
    
    if (purchaseResult.success) {
        console.log('\n🎉 Backend integration test successful!');
        console.log('Brick ID:', purchaseResult.brickId);
        console.log('Brick Type:', purchaseResult.brickType);
        console.log('IPFS Hash:', purchaseResult.ipfsHash);
        
        // Get wall status
        const wallStatus = backend.getWallStatus();
        console.log('\n📊 Wall Status:');
        console.log('Total Bricks:', wallStatus.totalBricks);
        console.log('Available Positions:', wallStatus.availablePositions.length);
        
        // Get purchase stats
        const stats = backend.getPurchaseStats();
        console.log('\n💰 Purchase Stats:');
        console.log('Revenue: $', stats.revenue.toFixed(2));
        console.log('By Type:', stats.byType);
    } else {
        console.log('\n❌ Backend integration test failed:', purchaseResult.error);
    }
}

// Export the backend class
module.exports = {
    MetaBricksBackend,
    testBackendIntegration
};

// Run test if this file is executed directly
if (require.main === module) {
    testBackendIntegration();
}
