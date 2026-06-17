const PLAYER_SPEED = 0.1;
const PLAYER_JUMP_FORCE = 0.15;
const GRAVITY = 0.008;
const MOUSE_SENSITIVITY = 0.003;

class Player {
    constructor(world) {
        this.world = world;
        this.position = new THREE.Vector3(0, 50, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.copy(this.position);

        this.isGrounded = false;
        this.canJump = false;
        this.selectedBlock = BLOCKS.STONE;

        this.keys = {};
        this.setupControls();
        this.raycaster = new THREE.Raycaster();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
        });

        window.addEventListener('click', (e) => {
            this.onClick(e);
        });

        window.addEventListener('scroll', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.selectNextBlock();
            } else {
                this.selectPreviousBlock();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                gameState.togglePause();
            }
        });
    }

    onMouseMove(event) {
        const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.rotation.setFromQuaternion(this.camera.quaternion);
        this.rotation.order = 'YXZ';

        this.rotation.setFromVector3(new THREE.Vector3(
            this.rotation.x - deltaY * MOUSE_SENSITIVITY,
            this.rotation.y - deltaX * MOUSE_SENSITIVITY,
            0
        ));

        this.camera.quaternion.setFromEuler(this.rotation);
    }

    onClick(event) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        const meshes = Array.from(this.world.chunks.values()).map(chunk => chunk.mesh).filter(m => m);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const normal = intersects[0].face.normal;

            const blockX = Math.round(point.x - normal.x * 0.5);
            const blockY = Math.round(point.y - normal.y * 0.5);
            const blockZ = Math.round(point.z - normal.z * 0.5);

            if (event.button === 0) {
                // Left click - destroy block
                this.world.setBlock(blockX, blockY, blockZ, BLOCKS.AIR);
            } else if (event.button === 2) {
                // Right click - place block
                const placeX = Math.round(point.x + normal.x * 0.5);
                const placeY = Math.round(point.y + normal.y * 0.5);
                const placeZ = Math.round(point.z + normal.z * 0.5);
                this.world.setBlock(placeX, placeY, placeZ, this.selectedBlock);
            }
        }
    }

    selectNextBlock() {
        const blockTypes = [BLOCKS.STONE, BLOCKS.DIRT, BLOCKS.OAK_LOG, BLOCKS.GLASS, BLOCKS.SAND];
        const currentIndex = blockTypes.indexOf(this.selectedBlock);
        this.selectedBlock = blockTypes[(currentIndex + 1) % blockTypes.length];
        this.updateHotbar();
    }

    selectPreviousBlock() {
        const blockTypes = [BLOCKS.STONE, BLOCKS.DIRT, BLOCKS.OAK_LOG, BLOCKS.GLASS, BLOCKS.SAND];
        const currentIndex = blockTypes.indexOf(this.selectedBlock);
        this.selectedBlock = blockTypes[(currentIndex - 1 + blockTypes.length) % blockTypes.length];
        this.updateHotbar();
    }

    updateHotbar() {
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach(slot => slot.classList.remove('active'));
        const blockTypes = [BLOCKS.STONE, BLOCKS.DIRT, BLOCKS.OAK_LOG, BLOCKS.GLASS, BLOCKS.SAND];
        const index = blockTypes.indexOf(this.selectedBlock);
        if (slots[index]) slots[index].classList.add('active');
    }

    update() {
        // Movement
        const forward = this.keys['w'] ? 1 : 0;
        const backward = this.keys['s'] ? 1 : 0;
        const left = this.keys['a'] ? 1 : 0;
        const right = this.keys['d'] ? 1 : 0;

        const moveDir = new THREE.Vector3();
        if (forward) moveDir.z -= 1;
        if (backward) moveDir.z += 1;
        if (left) moveDir.x -= 1;
        if (right) moveDir.x += 1;

        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);
        moveDir.normalize();
        moveDir.multiplyScalar(PLAYER_SPEED);

        this.position.add(moveDir);

        // Gravity
        this.velocity.y -= GRAVITY;
        this.position.y += this.velocity.y;

        // Collision detection
        const block = this.world.getBlock(
            Math.floor(this.position.x),
            Math.floor(this.position.y),
            Math.floor(this.position.z)
        );

        if (block && block.type !== BLOCKS.AIR && block.type !== BLOCKS.WATER) {
            this.position.y = Math.floor(this.position.y) + 2;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.canJump = true;
        } else {
            this.isGrounded = false;
        }

        // Jumping
        if (this.keys[' '] && this.canJump) {
            this.velocity.y = PLAYER_JUMP_FORCE;
            this.canJump = false;
        }

        this.camera.position.copy(this.position);
        this.camera.position.y += 1.6; // Eye height

        this.world.updateChunksAroundPlayer(this.position.x, this.position.z);
    }
}
