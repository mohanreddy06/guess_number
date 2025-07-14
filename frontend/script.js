// Game state variables
let targetNumber;
let attempts = 0;
let bestScore = localStorage.getItem('bestScore') || null;
let gameActive = true;
let gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
let deviceId = localStorage.getItem('deviceId') || generateDeviceId();
let currentGameStartTime = null;
let performanceChart = null;
let currentChartPeriod = '7Days';

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
const historyBtn = document.getElementById('historyBtn');
const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const historyModal = document.getElementById('historyModal');
const victoryModal = document.getElementById('victoryModal');
const finalAttemptsSpan = document.getElementById('finalAttempts');
const currentScoreSpan = document.getElementById('currentScore');
const bestScoreDisplaySpan = document.getElementById('bestScoreDisplay');
const playAgainBtn = document.getElementById('playAgainBtn');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const resetDeviceBtn = document.getElementById('resetDeviceBtn');
const chart7DaysBtn = document.getElementById('chart7Days');
const chart30DaysBtn = document.getElementById('chart30Days');
const chartAllBtn = document.getElementById('chartAll');

// Generate unique device ID with enhanced uniqueness
function generateDeviceId() {
    // Create a more unique identifier using multiple factors
    const userAgent = navigator.userAgent;
    const screenRes = `${screen.width}x${screen.height}`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    // Create a hash-like string from these factors
    const deviceFingerprint = `${userAgent}_${screenRes}_${timeZone}_${language}`;
    const hash = btoa(deviceFingerprint).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
    
    const id = 'device_' + hash + '_' + Date.now();
    localStorage.setItem('deviceId', id);
    return id;
}

// Check if this is a new device/user
function isNewDevice() {
    const storedDeviceId = localStorage.getItem('deviceId');
    const currentDeviceId = generateDeviceId();
    
    // If no stored device ID, this is a new device
    if (!storedDeviceId) {
        return true;
    }
    
    // Check if device characteristics have changed significantly
    const userAgent = navigator.userAgent;
    const screenRes = `${screen.width}x${screen.height}`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    const currentFingerprint = `${userAgent}_${screenRes}_${timeZone}_${language}`;
    const storedFingerprint = localStorage.getItem('deviceFingerprint');
    
    if (storedFingerprint !== currentFingerprint) {
        // Device characteristics changed, treat as new device
        localStorage.setItem('deviceFingerprint', currentFingerprint);
        return true;
    }
    
    return false;
}

// Save game to history
function saveGameToHistory(score, isBest = false) {
    const gameRecord = {
        id: Date.now(),
        deviceId: deviceId,
        score: score,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        isBest: isBest
    };
    
    gameHistory.unshift(gameRecord); // Add to beginning of array
    
    // Keep only last 50 games to prevent localStorage from getting too large
    if (gameHistory.length > 50) {
        gameHistory = gameHistory.slice(0, 50);
    }
    
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
}

// Get device-specific history
function getDeviceHistory() {
    return gameHistory.filter(game => game.deviceId === deviceId);
}

// Calculate statistics
function calculateStats() {
    const deviceHistory = getDeviceHistory();
    const totalGames = deviceHistory.length;
    const bestScoreHistory = deviceHistory.length > 0 ? Math.min(...deviceHistory.map(g => g.score)) : null;
    const avgScore = deviceHistory.length > 0 ? 
        Math.round(deviceHistory.reduce((sum, game) => sum + game.score, 0) / totalGames) : null;
    
    return { totalGames, bestScoreHistory, avgScore };
}

// Initialize the game
function initGame() {
    // Generate random number between 1 and 100 (equivalent to rand()%100+1)
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameActive = true;
    currentGameStartTime = Date.now();
    
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
        
        // Check if this is a new best score
        const isNewBest = !bestScore || attempts < bestScore;
        
        // Update best score
        if (isNewBest) {
            bestScore = attempts;
            localStorage.setItem('bestScore', bestScore);
            bestScoreSpan.textContent = bestScore;
        }
        
        // Save game to history
        saveGameToHistory(attempts, isNewBest);
        
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

// Show history modal
function showHistoryModal() {
    updateHistoryDisplay();
    historyModal.style.display = 'block';
}

// Hide history modal
function hideHistoryModal() {
    historyModal.style.display = 'none';
}

// Update history display
function updateHistoryDisplay() {
    const deviceHistory = getDeviceHistory();
    const stats = calculateStats();
    
    // Update statistics
    document.getElementById('totalGames').textContent = stats.totalGames;
    document.getElementById('bestScoreHistory').textContent = stats.bestScoreHistory || '-';
    document.getElementById('avgScore').textContent = stats.avgScore || '-';
    
    // Update device ID display
    const deviceIdDisplay = document.getElementById('currentDeviceId');
    if (deviceIdDisplay) {
        deviceIdDisplay.textContent = deviceId.substring(0, 20) + '...';
    }
    
    // Update performance chart
    updatePerformanceChart(currentChartPeriod);
    
    // Update history list
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    if (deviceHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-gamepad"></i>
                <p>No games played yet. Start playing to see your history!</p>
            </div>
        `;
        return;
    }
    
    // Show last 10 games
    const recentGames = deviceHistory.slice(0, 10);
    recentGames.forEach(game => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(game.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const badgeClass = game.isBest ? 'history-item-badge best' : 'history-item-badge';
        const badgeIcon = game.isBest ? 'fas fa-trophy' : 'fas fa-star';
        
        historyItem.innerHTML = `
            <div class="history-item-info">
                <div class="history-item-date">${formattedDate}</div>
                <div class="history-item-score">${game.score} attempts</div>
            </div>
            <div class="${badgeClass}">
                <i class="${badgeIcon}"></i>
                ${game.isBest ? 'Best' : 'Score'}
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all game history? This action cannot be undone.')) {
        gameHistory = gameHistory.filter(game => game.deviceId !== deviceId);
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
        
        // Also clear best score for this device
        localStorage.removeItem('bestScore');
        bestScore = null;
        bestScoreSpan.textContent = '-';
        
        updateHistoryDisplay();
    }
}

// Reset device (for testing purposes)
function resetDevice() {
    if (confirm('This will reset all data for this device and treat it as a new device. Continue?')) {
        // Clear device ID and fingerprint
        localStorage.removeItem('deviceId');
        localStorage.removeItem('deviceFingerprint');
        
        // Clear all history
        localStorage.removeItem('gameHistory');
        localStorage.removeItem('bestScore');
        
        // Reload page to reinitialize
        location.reload();
    }
}

// Update chart button states
function updateChartButtons(activePeriod) {
    // Remove active class from all buttons
    chart7DaysBtn.classList.remove('active');
    chart30DaysBtn.classList.remove('active');
    chartAllBtn.classList.remove('active');
    
    // Add active class to selected button
    switch (activePeriod) {
        case '7Days':
            chart7DaysBtn.classList.add('active');
            break;
        case '30Days':
            chart30DaysBtn.classList.add('active');
            break;
        case 'All':
            chartAllBtn.classList.add('active');
            break;
    }
}

// Export history data
function exportHistory() {
    const deviceHistory = getDeviceHistory();
    if (deviceHistory.length === 0) {
        alert('No history to export!');
        return;
    }
    
    const dataStr = JSON.stringify(deviceHistory, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `game-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Get additional statistics
function getDetailedStats() {
    const deviceHistory = getDeviceHistory();
    if (deviceHistory.length === 0) return null;
    
    const scores = deviceHistory.map(g => g.score);
    const totalGames = deviceHistory.length;
    const bestScore = Math.min(...scores);
    const worstScore = Math.max(...scores);
    const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalGames);
    
    // Calculate median
    const sortedScores = [...scores].sort((a, b) => a - b);
    const median = sortedScores.length % 2 === 0 
        ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
        : sortedScores[Math.floor(sortedScores.length / 2)];
    
    // Calculate games in last 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentGames = deviceHistory.filter(g => g.timestamp > sevenDaysAgo).length;
    
    return {
        totalGames,
        bestScore,
        worstScore,
        avgScore: Math.round(avgScore),
        median: Math.round(median),
        recentGames
    };
}

// Prepare chart data based on time period
function prepareChartData(period = '7Days') {
    const deviceHistory = getDeviceHistory();
    if (deviceHistory.length === 0) return { labels: [], scores: [] };
    
    let filteredHistory = [...deviceHistory];
    const now = Date.now();
    
    // Filter by time period
    switch (period) {
        case '7Days':
            const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
            filteredHistory = deviceHistory.filter(g => g.timestamp > sevenDaysAgo);
            break;
        case '30Days':
            const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
            filteredHistory = deviceHistory.filter(g => g.timestamp > thirtyDaysAgo);
            break;
        case 'All':
            // Use all data
            break;
    }
    
    if (filteredHistory.length === 0) return { labels: [], scores: [] };
    
    // Sort by date and take last 20 games for better visualization
    const sortedHistory = filteredHistory
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-20);
    
    const labels = sortedHistory.map(game => {
        const date = new Date(game.date);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    });
    
    const scores = sortedHistory.map(game => game.score);
    
    return { labels, scores };
}

// Create or update performance chart
function updatePerformanceChart(period = '7Days') {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    const { labels, scores } = prepareChartData(period);
    
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    if (labels.length === 0) {
        // Show empty state
        ctx.style.display = 'none';
        const chartContainer = ctx.parentElement;
        if (!chartContainer.querySelector('.empty-chart')) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-chart';
            emptyDiv.innerHTML = `
                <i class="fas fa-chart-line"></i>
                <p>No data available for this time period</p>
            `;
            chartContainer.appendChild(emptyDiv);
        }
        return;
    }
    
    // Remove empty state if it exists
    const emptyChart = ctx.parentElement.querySelector('.empty-chart');
    if (emptyChart) {
        emptyChart.remove();
    }
    
    ctx.style.display = 'block';
    
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score (Attempts)',
                data: scores,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#1d4ed8',
                pointHoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return `Score: ${context.parsed.y} attempts`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(59, 130, 246, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 11
                        },
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(59, 130, 246, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value + ' attempts';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
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
historyBtn.addEventListener('click', showHistoryModal);
rulesBtn.addEventListener('click', showRulesModal);
playAgainBtn.addEventListener('click', startNewGame);
exportHistoryBtn.addEventListener('click', exportHistory);
clearHistoryBtn.addEventListener('click', clearHistory);
resetDeviceBtn.addEventListener('click', resetDevice);

// Chart period button event listeners
chart7DaysBtn.addEventListener('click', () => {
    currentChartPeriod = '7Days';
    updateChartButtons('7Days');
    updatePerformanceChart('7Days');
});

chart30DaysBtn.addEventListener('click', () => {
    currentChartPeriod = '30Days';
    updateChartButtons('30Days');
    updatePerformanceChart('30Days');
});

chartAllBtn.addEventListener('click', () => {
    currentChartPeriod = 'All';
    updateChartButtons('All');
    updatePerformanceChart('All');
});

// Modal close functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        hideRulesModal();
        hideHistoryModal();
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === rulesModal) {
        hideRulesModal();
    }
    if (e.target === historyModal) {
        hideHistoryModal();
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

// Generate sample data for testing (remove in production)
function generateSampleData() {
    if (gameHistory.length > 0) return; // Only generate if no data exists
    
    const sampleGames = [];
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    // Generate 15 sample games over the last 30 days
    for (let i = 0; i < 15; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const timestamp = now - (daysAgo * dayInMs);
        const score = Math.floor(Math.random() * 20) + 5; // Random score between 5-25
        
        sampleGames.push({
            id: timestamp + i,
            deviceId: deviceId,
            score: score,
            date: new Date(timestamp).toISOString(),
            timestamp: timestamp,
            isBest: false
        });
    }
    
    // Sort by timestamp and mark the best score
    sampleGames.sort((a, b) => a.timestamp - b.timestamp);
    const bestScore = Math.min(...sampleGames.map(g => g.score));
    sampleGames.forEach(game => {
        if (game.score === bestScore) {
            game.isBest = true;
        }
    });
    
    gameHistory = sampleGames;
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
}

// Initialize device and history for new users
function initializeNewDevice() {
    // Clear any existing history for this device
    const existingHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
    const filteredHistory = existingHistory.filter(game => game.deviceId !== deviceId);
    localStorage.setItem('gameHistory', JSON.stringify(filteredHistory));
    
    // Reset best score for new device
    localStorage.removeItem('bestScore');
    bestScore = null;
    
    // Clear game history array
    gameHistory = [];
    
    // Store device fingerprint
    const userAgent = navigator.userAgent;
    const screenRes = `${screen.width}x${screen.height}`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const currentFingerprint = `${userAgent}_${screenRes}_${timeZone}_${language}`;
    localStorage.setItem('deviceFingerprint', currentFingerprint);
    
    // Show welcome message for new device
    showNewDeviceNotification();
    
    console.log('New device detected - history cleared');
}

// Show notification for new device
function showNewDeviceNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'new-device-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-user-plus"></i>
            <div class="notification-text">
                <h4>Welcome to a New Device!</h4>
                <p>Your game history has been reset for this device. Each device maintains its own separate history.</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 1000);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 8000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is a new device
    if (isNewDevice()) {
        initializeNewDevice();
    }
    
    initGame();
    
    // Generate sample data for testing (remove this line in production)
    generateSampleData();
    
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
    if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        showHistoryModal();
    }
    if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        showRulesModal();
    }
    if (e.key === 'd' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        resetDevice();
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