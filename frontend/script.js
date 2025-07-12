// Game state variables
let targetNumber;
let attempts = 0;
let bestScore = localStorage.getItem('bestScore') || null;
let gameActive = true;

// DOM elements
const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');
const attemptsSpan = document.getElementById('attempts');
const bestScoreSpan = document.getElementById('bestScore');
const currentGuessSpan = document.getElementById('currentGuess');
const hintFill = document.getElementById('hintFill');
const hintText = document.getElementById('hintText');
const newGameBtn = document.getElementById('newGameBtn');
const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const victoryModal = document.getElementById('victoryModal');
const finalAttemptsSpan = document.getElementById('finalAttempts');
const currentScoreSpan = document.getElementById('currentScore');
const bestScoreDisplaySpan = document.getElementById('bestScoreDisplay');
const playAgainBtn = document.getElementById('playAgainBtn');

// Initialize the game
function initGame() {
    // Generate random number between 1 and 100 (equivalent to rand()%100+1)
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameActive = true;
    
    // Reset UI
    updateAttempts();
    clearMessage();
    resetHintBar();
    currentGuessSpan.textContent = '?';
    guessInput.value = '';
    guessInput.disabled = false;
    submitBtn.disabled = false;
    
    // Update best score display
    if (bestScore) {
        bestScoreSpan.textContent = bestScore;
    }
    
    console.log('Target number:', targetNumber); // For debugging
}

// Update attempts display
function updateAttempts() {
    attemptsSpan.textContent = attempts;
}

// Clear message area
function clearMessage() {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
}

// Show message with animation
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // Trigger animation
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 10);
}

// Update hint bar based on guess
function updateHintBar(guess) {
    const percentage = (guess / 100) * 100;
    hintFill.style.width = `${percentage}%`;
    
    if (guess < targetNumber) {
        hintText.textContent = `Your guess (${guess}) is too low!`;
        hintFill.style.background = 'linear-gradient(90deg, #f56565, #ed8936)';
    } else if (guess > targetNumber) {
        hintText.textContent = `Your guess (${guess}) is too high!`;
        hintFill.style.background = 'linear-gradient(90deg, #ed8936, #48bb78)';
    }
}

// Reset hint bar
function resetHintBar() {
    hintFill.style.width = '0%';
    hintText.textContent = 'Start guessing!';
    hintFill.style.background = 'linear-gradient(90deg, #f56565, #ed8936, #48bb78)';
}

// Handle guess submission
function handleGuess() {
    if (!gameActive) return;
    
    const guess = parseInt(guessInput.value);
    
    // Validate input
    if (isNaN(guess) || guess < 1 || guess > 100) {
        showMessage('Please enter a valid number between 1 and 100!', 'error');
        return;
    }
    
    attempts++;
    updateAttempts();
    
    // Update current guess display
    currentGuessSpan.textContent = guess;
    
    // Check guess against target number
    if (guess > targetNumber) {
        showMessage('Lower number please!', 'lower');
        updateHintBar(guess);
    } else if (guess < targetNumber) {
        showMessage('Greater number please!', 'higher');
        updateHintBar(guess);
    } else {
        // Correct guess!
        showMessage('Yayy you got it!!', 'correct');
        gameActive = false;
        guessInput.disabled = true;
        submitBtn.disabled = true;
        
        // Update best score
        if (!bestScore || attempts < bestScore) {
            bestScore = attempts;
            localStorage.setItem('bestScore', bestScore);
            bestScoreSpan.textContent = bestScore;
        }
        
        // Show victory modal after a short delay
        setTimeout(() => {
            showVictoryModal();
            celebrateVictory();
        }, 1500);
    }
    
    // Clear input for next guess
    guessInput.value = '';
    guessInput.focus();
}

// Show victory modal
function showVictoryModal() {
    finalAttemptsSpan.textContent = attempts;
    currentScoreSpan.textContent = attempts;
    bestScoreDisplaySpan.textContent = bestScore || '-';
    victoryModal.style.display = 'block';
}

// Hide victory modal
function hideVictoryModal() {
    victoryModal.style.display = 'none';
}

// Show rules modal
function showRulesModal() {
    rulesModal.style.display = 'block';
}

// Hide rules modal
function hideRulesModal() {
    rulesModal.style.display = 'none';
}

// Start new game
function startNewGame() {
    hideVictoryModal();
    initGame();
}

// Event listeners
submitBtn.addEventListener('click', handleGuess);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGuess();
    }
});

newGameBtn.addEventListener('click', startNewGame);
rulesBtn.addEventListener('click', showRulesModal);
playAgainBtn.addEventListener('click', startNewGame);

// Modal close functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        hideRulesModal();
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === rulesModal) {
        hideRulesModal();
    }
    if (e.target === victoryModal) {
        hideVictoryModal();
    }
});

// Add some fun effects
guessInput.addEventListener('focus', () => {
    guessInput.style.transform = 'translateY(-2px)';
});

guessInput.addEventListener('blur', () => {
    guessInput.style.transform = 'translateY(0)';
});

// Create colorful confetti in congratulations modal
function createConfettiInModal() {
    const modalContent = document.querySelector('.modal-content.victory');
    if (!modalContent) return;
    
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'congratulations-confetti';
    modalContent.appendChild(confettiContainer);
    
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    
    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 1 + 's';
            confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
            confettiContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }, i * 100);
    }
    
    // Remove confetti container after all confetti is done
    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.parentNode.removeChild(confettiContainer);
        }
    }, 6000);
}

// Create cup celebration in modal
function createCupCelebrationInModal() {
    const modalContent = document.querySelector('.modal-content.victory');
    if (!modalContent) return;
    
    const cup = document.createElement('div');
    cup.className = 'cup-celebration';
    cup.textContent = '🏆';
    modalContent.appendChild(cup);
    
    // Remove cup after animation
    setTimeout(() => {
        if (cup.parentNode) {
            cup.parentNode.removeChild(cup);
        }
    }, 2000);
}

// Enhanced victory celebration
function celebrateVictory() {
    // Create cup celebration in modal first
    createCupCelebrationInModal();
    
    // Start confetti celebration after a short delay
    setTimeout(() => {
        createConfettiInModal();
    }, 500);
    
    console.log('🎉 Congratulations! 🏆✨');
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // Add some initial animations
    setTimeout(() => {
        document.querySelector('.game-card').style.opacity = '1';
    }, 100);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        startNewGame();
    }
    if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        showRulesModal();
    }
});

// Add some Easter eggs
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Konami code activated!
        document.body.style.background = 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)';
        document.body.style.animation = 'rainbow 2s infinite';
        
        setTimeout(() => {
            document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            document.body.style.animation = '';
        }, 5000);
        
        konamiCode = [];
    }
});

// Add rainbow animation for Easter egg
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle); 