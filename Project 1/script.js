const player = document.getElementById('player');
const barriers = document.querySelectorAll('.barrier');
const stepSize = 2;
const dashDistance = 50;
const dashCooldown = 1000;
let playerTop = 350;
let playerLeft = 900;
let lastDirection = { x: 0, y: 0 };
let canDash = true;

// Animation variables
const idleFrames = ['images/tile014.png', 'images/tile015.png', 'images/tile016.png', 'images/tile017.png', 'images/tile018.png', 'images/tile019.png']; // Replace with actual paths
const walkingFrames = ['images/tile014.png', 'images/tile015.png', 'images/tile016.png', 'images/tile017.png', 'images/tile018.png', 'images/tile019.png']; // Replace with actual paths
let currentFrame = 0;
let animationInterval = 200; // Change frames every 200ms
let isMoving = false;
let animationTimer;

const keysPressed = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false
};

// Initialize variables to track mouse position
let mouseX = 0;
let mouseY = 0;

// Function to update player image based on animation state
function updatePlayerAnimation() {
    const frames = isMoving ? walkingFrames : idleFrames;
    player.style.backgroundImage = `url(${frames[currentFrame]})`;
    currentFrame = (currentFrame + 1) % frames.length;
}

// Start the animation loop
function startAnimation() {
    if (animationTimer) clearInterval(animationTimer);
    animationTimer = setInterval(updatePlayerAnimation, animationInterval);
}

// Stop the animation loop
function stopAnimation() {
    if (animationTimer) clearInterval(animationTimer);
}

function movePlayer() {
    let direction = { x: 0, y: 0 };

    if (keysPressed.w) direction.y = -1;
    if (keysPressed.a) direction.x = -1;
    if (keysPressed.s) direction.y = 1;
    if (keysPressed.d) direction.x = 1;

    // Check if the player is moving
    isMoving = direction.x !== 0 || direction.y !== 0;

    // Normalize direction for diagonal movement
    if (isMoving) {
        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x = direction.x / magnitude;
        direction.y = direction.y / magnitude;
        lastDirection = direction;
    }

    // Calculate new position
    let newTop = playerTop + direction.y * stepSize;
    let newLeft = playerLeft + direction.x * stepSize;

    // Ensure the player stays within screen boundaries
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - player.offsetHeight));
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - player.offsetWidth));

    // Check for collisions with barriers
    if (!isColliding(newLeft, newTop, player.offsetWidth, player.offsetHeight)) {
        playerTop = newTop;
        playerLeft = newLeft;
    }

    // Update player position
    player.style.top = playerTop + 'px';
    player.style.left = playerLeft + 'px';

    requestAnimationFrame(movePlayer);
}

function dash() {
    if (canDash && (lastDirection.x !== 0 || lastDirection.y !== 0)) {
        let dashTop = playerTop + lastDirection.y * dashDistance;
        let dashLeft = playerLeft + lastDirection.x * dashDistance;

        // Ensure the player stays within screen boundaries during dash
        dashTop = Math.max(0, Math.min(dashTop, window.innerHeight - player.offsetHeight));
        dashLeft = Math.max(0, Math.min(dashLeft, window.innerWidth - player.offsetWidth));

        if (!isColliding(dashLeft, dashTop, player.offsetWidth, player.offsetHeight)) {
            playerTop = dashTop;
            playerLeft = dashLeft;

            player.style.top = playerTop + 'px';
            player.style.left = playerLeft + 'px';
        }

        // Start cooldown
        canDash = false;
        setTimeout(() => {
            canDash = true;
        }, dashCooldown);
    }
}

function isColliding(newLeft, newTop, playerWidth, playerHeight) {
    for (let barrier of barriers) {
        const barrierRect = barrier.getBoundingClientRect();
        const playerRect = {
            left: newLeft,
            top: newTop,
            right: newLeft + playerWidth,
            bottom: newTop + playerHeight
        };

        if (
            playerRect.right > barrierRect.left &&
            playerRect.left < barrierRect.right &&
            playerRect.bottom > barrierRect.top &&
            playerRect.top < barrierRect.bottom
        ) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

// Update mouse position when the mouse moves within the game container
document.getElementById('game-container').addEventListener('mousemove', function(event) {
    const containerRect = this.getBoundingClientRect();
    mouseX = event.clientX - containerRect.left;
    mouseY = event.clientY - containerRect.top;
});

// Respawn player at mouse position when 'R' is pressed
document.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase(); // Normalize key to lowercase
    if (key in keysPressed) {
        keysPressed[key] = true;
    }
    if (key === 'shift') {
        dash();
    }

    if (key === 'r') {
        const container = document.getElementById('game-container');
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Calculate the player's new position in pixels
        playerLeft = (mouseX / containerWidth) * containerWidth;
        playerTop = (mouseY / containerHeight) * containerHeight;

        // Ensure the player stays within the container boundaries
        playerLeft = Math.max(0, Math.min(playerLeft, containerWidth - player.offsetWidth));
        playerTop = Math.max(0, Math.min(playerTop, containerHeight - player.offsetHeight));

        // Update player position
        player.style.left = playerLeft + 'px';
        player.style.top = playerTop + 'px';
    }

    console.log('Key down:', event.key, keysPressed); // Debugging line
});

// Listen for keyup events to stop movement
document.addEventListener('keyup', function(event) {
    const key = event.key.toLowerCase(); // Normalize key to lowercase
    if (key in keysPressed) {
        keysPressed[key] = false;
    }

    // Set direction to 0 if no movement keys are pressed
    if (!keysPressed.w && !keysPressed.a && !keysPressed.s && !keysPressed.d) {
        lastDirection = { x: 0, y: 0 };
        isMoving = false;
    }
    console.log('Key up:', event.key, keysPressed); // Debugging line
});

// Start the animation loop and the movement loop
startAnimation();
requestAnimationFrame(movePlayer);
