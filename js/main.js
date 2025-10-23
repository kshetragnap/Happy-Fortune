// Function to generate random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to change background color multiple times
async function changeBackgroundColors(container, times, delay) {
    for (let i = 0; i < times; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        container.style.backgroundColor = getRandomColor();
    }
    // Reset to default background after the animation
    container.style.backgroundColor = '';
}

// Initialize game when window loads
window.addEventListener('load', () => {
    // Set up Cat Mode button
    const catModeBtn = document.getElementById('cat-mode-btn');
    catModeBtn.addEventListener('click', () => {
        catModeBtn.style.display = 'none';
    });

    // Create game engine
    const engine = new GameEngine(800, 600);
    
    // Add game container
    const container = document.getElementById('game-container');
    container.appendChild(engine.canvas);

    // Create and add scenes
    engine.addScene('menu', new MainMenuScene(engine));
    engine.addScene('blackjack', new BlackjackScene(engine));
    engine.addScene('slots', new SlotScene(engine));
    
    // Set initial scene
    engine.setScene('menu');
    
    // Start game loop
    engine.start();

    // Set timeout for background color changes
    setTimeout(() => {
        changeBackgroundColors(container, 10, 500); // Change 10 times with 500ms between each change
    }, 10000); // Start after 10 seconds
});
