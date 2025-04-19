// Main JavaScript

// Global variables for tracking score, sound, current level, collected items, and unlocked badges.
let score = 0;
let soundEnabled = true;
let currentLevel = 'hub';
let collectedItems = {
    about: [],
    projects: [],
    skills: [],
    education: [],
    contact: []
};
let badges = {
    about: false,
    projects: false,
    skills: false,
    education: false,
    contact: false
};

// Cache DOM elements for later use.
const loadingScreen = document.getElementById('loading-screen');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
const progressBar = document.querySelector('.progress');
const scoreDisplay = document.getElementById('score');
const levelItems = document.querySelectorAll('.level-item');
const backButtons = document.querySelectorAll('.back-button');
const toggleSoundButton = document.getElementById('toggle-sound');
const achievementPopup = document.getElementById('achievement-popup');
const achievementText = document.getElementById('achievement-text');
const achievementPoints = document.getElementById('achievement-points');
const collectibles = document.querySelectorAll('.collectible');
const badgeElements = document.querySelectorAll('.badge');
const contactForm = document.getElementById('contact-form');

// Game level containers mapped by name.
const levels = {
    hub: document.getElementById('hub-world'),
    about: document.getElementById('about-level'),
    projects: document.getElementById('projects-level'),
    skills: document.getElementById('skills-level'),
    education: document.getElementById('education-level'),
    contact: document.getElementById('contact-level')
};

// Sound effect elements.
const sounds = {
    background: document.getElementById('background-music'),
    levelComplete: document.getElementById('level-complete-sound')
};

// Initialize the game: show loading, set up listeners, and preload sounds.
function initGame() {
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            progressBar.style.width = '100%';
            startButton.classList.add('ready');
        } else {
            progressBar.style.width = `${progress}%`;
        }
    }, 200);

    startButton.addEventListener('click', startGame);
    levelItems.forEach(item => {
        item.addEventListener('click', () => navigateToLevel(item.dataset.level));
    });
    backButtons.forEach(button => {
        button.addEventListener('click', () => navigateToLevel('hub'));
    });
    toggleSoundButton.addEventListener('click', toggleSound);
    collectibles.forEach(collectible => {
        collectible.addEventListener('click', (e) => collectItem(e.target));
    });
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Enable keyboard navigation.
    document.addEventListener('keydown', handleKeyPress);
    
    // Preload sounds so they're ready when needed.
    preloadSounds();
}

// Preload sound files.
function preloadSounds() {
    if (sounds.background) {
        sounds.background.volume = 0.3;
        sounds.background.load();
    }
    if (sounds.levelComplete) {
        sounds.levelComplete.volume = 0.5;
        sounds.levelComplete.load();
    }
    const clickAudio = document.getElementById('click-sound');
    if (clickAudio) {
        clickAudio.volume = 0.3;
        clickAudio.load();
    }
}

// Starts the game by hiding the loading screen, showing the game container, updating the score, and playing background music.
function startGame() {
    loadingScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    updateScore(0);
    playSound('background', true);
    startGlitchEffect();
}

// Initiate the glitch effect on the title.
function startGlitchEffect() {
    const title = document.querySelector('.glitch-title');
    if (!title) return;
    setInterval(() => {
        title.classList.add('glitch-animate');
        setTimeout(() => title.classList.remove('glitch-animate'), 400);
    }, 2000);
}

// Navigate to the specified level.
function navigateToLevel(levelName) {
    // Hide all levels.
    Object.values(levels).forEach(level => {
        level.classList.remove('active');
    });
    // Display the selected level.
    levels[levelName].classList.add('active');
    currentLevel = levelName;
    
    playClickSound();
    positionCharacter(levelName);
}

// Set the character's starting position based on the current level.
function positionCharacter(levelName) {
    const character = document.querySelector(`#${levelName}-level .character`);
    if (!character) return;
    // For now, set a generic starting position.
    character.style.left = '50px';
}

// Called when a collectible item is clicked.
function collectItem(item) {
    const points = parseInt(item.dataset.points) || 100;
    const levelName = currentLevel;
    
    // Only collect if not already collected.
    if (collectedItems[levelName].includes(item)) return;
    
    collectedItems[levelName].push(item);
    updateScore(points);
    playCollectSound();
    showAchievement('ITEM COLLECTED!', points);
    
    // Hide the collectible after collection.
    item.style.display = 'none';
    
    // Check if the level is complete after collecting.
    checkLevelCompletion(levelName);
}

// Check if all collectibles in the level have been collected.
function checkLevelCompletion(levelName) {
    const levelCollectibles = document.querySelectorAll(`#${levelName}-level .collectible`);
    const collectedCount = collectedItems[levelName].length;
    
    const progressElement = document.getElementById(`${levelName}-progress`);
    if (progressElement) {
        const progressPercentage = (collectedCount / levelCollectibles.length) * 100;
        progressElement.style.width = `${progressPercentage}%`;
    }
    
    // When all collectibles are done and the badge isn't unlocked yet.
    if (collectedCount === levelCollectibles.length && !badges[levelName]) {
        badges[levelName] = true;
        const badgeElement = document.querySelector(`.badge[data-badge="${levelName}"]`);
        if (badgeElement) {
            badgeElement.dataset.unlocked = "true";
        }
        showAchievement(`${levelName.toUpperCase()} LEVEL COMPLETE!`, 500);
        updateScore(500);
        playSound('levelComplete');
        checkGameCompletion();
    }
}

// Check if the user has completed all levels.
function checkGameCompletion() {
    const allComplete = Object.values(badges).every(badge => badge);
    if (allComplete) {
        showAllBadgesPopup();
        updateScore(1000);
        playVictorySound();
    }
}

// Update the score display.
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

// Display an achievement popup with a message and the awarded points.
function showAchievement(text, points) {
    achievementText.textContent = text;
    achievementPoints.textContent = `+${points} POINTS`;
    achievementPopup.classList.remove('hidden');
    setTimeout(() => {
        achievementPopup.classList.add('hidden');
    }, 5000);
}

// Show a popup when the game is complete.
function showGameCompletePopup() {
    const popup = document.getElementById('game-complete-popup');
    popup.classList.remove('hidden');
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 6000);
}

// Toggle sound on or off.
function toggleSound() {
    soundEnabled = !soundEnabled;
    toggleSoundButton.textContent = soundEnabled ? 'SOUND: ON' : 'SOUND: OFF';
    toggleSoundButton.className = soundEnabled ? 'sound-on' : 'sound-off';

    if (sounds.background) {
        if (soundEnabled) {
            sounds.background.play();
        } else {
            sounds.background.pause();
        }
    }
}

// Play a specified sound effect.
function playSound(soundName, loop = false) {
    if (!soundEnabled || !sounds[soundName]) return;
    const sound = sounds[soundName];
    if (loop) sound.loop = true;
    sound.currentTime = 0;
    sound.play().catch(error => {
        console.error('Error playing sound:', error);
    });
}

// play a click sound effect.
function playClickSound() {
    if (!soundEnabled) return;
    const clickAudio = document.getElementById('click-sound');
    if (clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(error => {
            console.error('Error playing click sound:', error);
        });
    }
}

// Generate a sound effect for collecting items.
function playCollectSound() {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    setTimeout(() => oscillator.stop(), 300);
}

// play a victory sound.
function playVictorySound() {
    if (!soundEnabled) return;
    const sound = document.getElementById('complete');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error('Error playing victory sound:', error);
        });
    }
}

// Show a popup when the game is complete
function showAllBadgesPopup() {
    const popup = document.getElementById('all-badges-popup');
    popup.classList.remove('hidden');
    
    const closeButton = document.getElementById('close-all-badges-popup');
    closeButton.addEventListener('click', () => {
        popup.classList.add('hidden');
    });

   
}

// Handle the submission of the contact form.
function handleContactSubmit(e) {
    e.preventDefault();

    const formData = new FormData(contactForm);

    fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        const name = formData.get('name');
        showAchievement(`MESSAGE SENT! THANKS, ${name.toUpperCase()}!`, 300);
        updateScore(300);
        contactForm.reset();

        const contactCollectible = document.querySelector('#contact-level .collectible');
        if (contactCollectible) {
            collectItem(contactCollectible);
        }
    })
    .catch(error => {
        console.error('Form error:', error);
        alert("Something went wrong. Please try again later.");
    });
}

// cheks if the user is typing in an input field or textarea.
function isTyping() {
    const active = document.activeElement;
    return active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable
    );
}

// Manage keyboard navigation.
function handleKeyPress(e) {
    if ((e.key === 'Backspace' || e.key === 'Escape') && !isTyping()) {
        if (currentLevel !== 'hub') {
            navigateToLevel('hub');
            return;
        }
    }    

    if (currentLevel !== 'hub') return;

    const character = document.querySelector('#hub-world .character');
    if (!character) return;

    const currentLeft = parseInt(character.style.left) || 50;

    switch(e.key) {
        case 'ArrowLeft':
            character.style.left = `${Math.max(currentLeft - 20, 0)}px`;
            break;
        case 'ArrowRight':
            character.style.left = `${Math.min(currentLeft + 20, window.innerWidth - 64)}px`;
            break;
        case ' ':
            const characterRect = character.getBoundingClientRect();
            const characterCenter = characterRect.left + (characterRect.width / 2);

            let closestItem = null;
            let closestDistance = Infinity;

            levelItems.forEach(item => {
                if (!item.dataset.level) return;
                const itemRect = item.getBoundingClientRect();
                const itemCenter = itemRect.left + (itemRect.width / 2);
                const distance = Math.abs(characterCenter - itemCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestItem = item;
                }
            });

            if (closestItem && closestDistance < 100) {
                navigateToLevel(closestItem.dataset.level);
            }
            break;
    }
}

function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    positionCharacter(currentLevel);
    repositionCollectibles();
}

function repositionCollectibles() {
    // Optional: Reposition collectibles dynamically based on screen size
}

// Start the game once the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    window.addEventListener('resize', handleResize);
});

