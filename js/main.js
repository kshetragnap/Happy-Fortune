// Initialize game when window loads
window.addEventListener('load', () => {
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
});
