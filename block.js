const BLOCKS = {
    AIR: 0,
    STONE: 1,
    DIRT: 2,
    GRASS: 3,
    COBBLESTONE: 4,
    OAK_LOG: 5,
    OAK_LEAVES: 6,
    SAND: 7,
    GRAVEL: 8,
    GOLD_ORE: 9,
    IRON_ORE: 10,
    COAL_ORE: 11,
    WATER: 12,
    LAVA: 13,
    GLASS: 14
};

const BLOCK_COLORS = {
    [BLOCKS.AIR]: 0x87ceeb,
    [BLOCKS.STONE]: 0x888888,
    [BLOCKS.DIRT]: 0x8b7355,
    [BLOCKS.GRASS]: 0x228b22,
    [BLOCKS.COBBLESTONE]: 0x696969,
    [BLOCKS.OAK_LOG]: 0x8b4513,
    [BLOCKS.OAK_LEAVES]: 0x228b22,
    [BLOCKS.SAND]: 0xf4a460,
    [BLOCKS.GRAVEL]: 0xa9a9a9,
    [BLOCKS.GOLD_ORE]: 0xffd700,
    [BLOCKS.IRON_ORE]: 0xc0c0c0,
    [BLOCKS.COAL_ORE]: 0x36454f,
    [BLOCKS.WATER]: 0x4169e1,
    [BLOCKS.LAVA]: 0xff6347,
    [BLOCKS.GLASS]: 0xb0e0e6
};

class Block {
    constructor(type, x, y, z) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getColor() {
        return BLOCK_COLORS[this.type] || 0xffffff;
    }

    isTransparent() {
        return this.type === BLOCKS.AIR || this.type === BLOCKS.WATER || this.type === BLOCKS.GLASS;
    }

    isLiquid() {
        return this.type === BLOCKS.WATER || this.type === BLOCKS.LAVA;
    }
}
