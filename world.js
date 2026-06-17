const CHUNK_SIZE = 16;
const WORLD_HEIGHT = 64;
const RENDER_DISTANCE = 8;

class Chunk {
    constructor(x, z, seed) {
        this.x = x;
        this.z = z;
        this.blocks = [];
        this.mesh = null;
        this.seed = seed;
        this.generate();
    }

    getBlockIndex(x, y, z) {
        return (y * CHUNK_SIZE * CHUNK_SIZE) + (z * CHUNK_SIZE) + x;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return null;
        }
        return this.blocks[this.getBlockIndex(x, y, z)];
    }

    setBlock(x, y, z, blockType) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return;
        }
        this.blocks[this.getBlockIndex(x, y, z)] = new Block(blockType, x, y, z);
    }

    generate() {
        const noise = new SimplexNoise(this.seed);

        for (let y = 0; y < WORLD_HEIGHT; y++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    const worldX = this.x * CHUNK_SIZE + x;
                    const worldZ = this.z * CHUNK_SIZE + z;

                    // Terrain height generation
                    const heightNoise = noise.noise(worldX * 0.05, worldZ * 0.05);
                    const terrainHeight = Math.floor((heightNoise + 1) * 16 + 32);

                    let blockType = BLOCKS.AIR;

                    if (y < terrainHeight - 4) {
                        blockType = BLOCKS.STONE;
                    } else if (y < terrainHeight - 1) {
                        blockType = BLOCKS.DIRT;
                    } else if (y === terrainHeight - 1) {
                        blockType = BLOCKS.GRASS;
                    }

                    // Add ores
                    if (y < terrainHeight - 4 && Math.random() < 0.01) {
                        const oreRand = Math.random();
                        if (oreRand < 0.3) blockType = BLOCKS.COAL_ORE;
                        else if (oreRand < 0.6) blockType = BLOCKS.IRON_ORE;
                        else if (oreRand < 0.95) blockType = BLOCKS.GRAVEL;
                        else blockType = BLOCKS.GOLD_ORE;
                    }

                    // Water level
                    if (y < 32 && blockType === BLOCKS.AIR) {
                        blockType = BLOCKS.WATER;
                    }

                    this.blocks.push(new Block(blockType, x, y, z));
                }
            }
        }
    }

    buildMesh(scene) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        for (let y = 0; y < WORLD_HEIGHT; y++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    const block = this.getBlock(x, y, z);
                    if (!block || block.type === BLOCKS.AIR) continue;

                    const color = new THREE.Color(block.getColor());

                    // Only render visible faces (simplified culling)
                    const above = y + 1 < WORLD_HEIGHT ? this.getBlock(x, y + 1, z) : null;
                    const below = y - 1 >= 0 ? this.getBlock(x, y - 1, z) : null;
                    const north = this.getBlock(x, z + 1, y) ? this.getBlock(x, z + 1, y) : null;
                    const south = this.getBlock(x, z - 1, y) ? this.getBlock(x, z - 1, y) : null;
                    const east = this.getBlock(x + 1, y, z) ? this.getBlock(x + 1, y, z) : null;
                    const west = this.getBlock(x - 1, y, z) ? this.getBlock(x - 1, y, z) : null;

                    // Top face
                    if (!above || above.isTransparent()) {
                        vertices.push(x, y + 1, z + 1);
                        vertices.push(x + 1, y + 1, z + 1);
                        vertices.push(x, y + 1, z);
                        vertices.push(x + 1, y + 1, z + 1);
                        vertices.push(x + 1, y + 1, z);
                        vertices.push(x, y + 1, z);
                        for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
                    }

                    // Bottom face
                    if (!below || below.isTransparent()) {
                        vertices.push(x, y, z);
                        vertices.push(x, y, z + 1);
                        vertices.push(x + 1, y, z);
                        vertices.push(x + 1, y, z + 1);
                        vertices.push(x + 1, y, z);
                        vertices.push(x, y, z + 1);
                        for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
                    }

                    // Front face
                    if (!north || north.isTransparent()) {
                        vertices.push(x, y, z + 1);
                        vertices.push(x + 1, y, z + 1);
                        vertices.push(x, y + 1, z + 1);
                        vertices.push(x + 1, y, z + 1);
                        vertices.push(x + 1, y + 1, z + 1);
                        vertices.push(x, y + 1, z + 1);
                        for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
                    }

                    // Back face
                    if (!south || south.isTransparent()) {
                        vertices.push(x, y, z);
                        vertices.push(x, y + 1, z);
                        vertices.push(x + 1, y, z);
                        vertices.push(x + 1, y, z);
                        vertices.push(x, y + 1, z);
                        vertices.push(x + 1, y + 1, z);
                        for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
                    }

                    // Right face
                    if (!east || east.isTransparent()) {
                        vertices.push(x + 1, y, z);
                        vertices.push(x + 1, y, z + 1);
                        vertices.push(x + 1, y + 1, z);
                        vertices.push(x + 1, y, z + 1);
                        vertices.push(x + 1, y + 1, z + 1);
                        vertices.push(x + 1, y + 1, z);
                        for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
                    }

                    // Left face
                    if (!west || west.isTransparent()) {
                        vertices.push(x, y, z);
                        vertices.push(x, y + 1, z);
                        vertices.push(x, y, z + 1);
                        vertices.push(x, y, z + 1);
                        vertices.push(x, y + 1, z);
                        vertices.push(x, y + 1, z + 1);
                        for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
                    }
                }
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

        const material = new THREE.MeshBasicMaterial({ vertexColors: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x * CHUNK_SIZE, 0, this.z * CHUNK_SIZE);
        scene.add(this.mesh);
    }
}

class World {
    constructor(seed) {
        this.seed = seed || Math.random();
        this.chunks = new Map();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 200, 500);
    }

    getChunkKey(x, z) {
        return `${x},${z}`;
    }

    getOrCreateChunk(x, z) {
        const key = this.getChunkKey(x, z);
        if (!this.chunks.has(key)) {
            const chunk = new Chunk(x, z, this.seed);
            chunk.buildMesh(this.scene);
            this.chunks.set(key, chunk);
        }
        return this.chunks.get(key);
    }

    getBlock(x, y, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = x - chunkX * CHUNK_SIZE;
        const localZ = z - chunkZ * CHUNK_SIZE;

        const chunk = this.chunks.get(this.getChunkKey(chunkX, chunkZ));
        if (!chunk) return null;
        return chunk.getBlock(localX, y, localZ);
    }

    setBlock(x, y, z, blockType) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = x - chunkX * CHUNK_SIZE;
        const localZ = z - chunkZ * CHUNK_SIZE;

        const chunk = this.chunks.get(this.getChunkKey(chunkX, chunkZ));
        if (chunk) {
            chunk.setBlock(localX, y, localZ, blockType);
            chunk.buildMesh(this.scene);
        }
    }

    updateChunksAroundPlayer(playerX, playerZ) {
        const playerChunkX = Math.floor(playerX / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE);

        for (let x = playerChunkX - RENDER_DISTANCE; x <= playerChunkX + RENDER_DISTANCE; x++) {
            for (let z = playerChunkZ - RENDER_DISTANCE; z <= playerChunkZ + RENDER_DISTANCE; z++) {
                this.getOrCreateChunk(x, z);
            }
        }
    }
}
