# Number Guessing Game 🎲

A modern, interactive web version of the classic number guessing game, converted from C to JavaScript with an impressive user interface.

## 🎮 How to Play

1. **Objective**: Guess the randomly generated number between 1 and 100
2. **Hints**: After each guess, you'll get feedback:
   - "Lower number please!" if your guess is too high
   - "Greater number please!" if your guess is too low
3. **Goal**: Find the number in as few attempts as possible!

## ✨ Features

### Core Gameplay
- **Random Number Generation**: Uses `Math.random()` (equivalent to C's `rand()%100+1`)
- **Attempt Counter**: Tracks your guesses
- **Smart Hints**: Visual feedback with color-coded messages
- **Input Validation**: Ensures valid numbers between 1-100

### Enhanced UI/UX
- **Modern Design**: Beautiful gradient backgrounds and glassmorphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Engaging transitions and micro-interactions
- **Visual Feedback**: 
  - Animated number display
  - Progress bar showing guess range
  - Color-coded messages (green for low, red for high, orange for correct)

### Additional Features
- **Score Tracking**: Saves your best score locally
- **Victory Celebration**: Confetti animation and victory modal
- **Game Rules**: Built-in help modal
- **Keyboard Shortcuts**: 
  - `Enter` to submit guess
  - `Ctrl+N` for new game
  - `Ctrl+R` for rules
- **Easter Egg**: Try the Konami code! (↑↑↓↓←→←→BA)

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required!

### Installation
1. Download all files to a folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`

2. Open `index.html` in your web browser

3. Start playing! 🎯

## 📁 File Structure

```
number-guessing-game/
├── index.html      # Main HTML structure
├── styles.css      # Modern CSS styling and animations
├── script.js       # Game logic and interactivity
└── README.md       # This file
```

## 🎯 Game Logic Comparison

### C Program → JavaScript Conversion

| C Code | JavaScript Equivalent | Purpose |
|--------|---------------------|---------|
| `srand(time(0))` | `Math.random()` | Initialize random seed |
| `rand()%100+1` | `Math.floor(Math.random() * 100) + 1` | Generate 1-100 random number |
| `scanf("%d",&guess)` | `parseInt(guessInput.value)` | Get user input |
| `printf()` | `showMessage()` | Display feedback |
| `do-while` loop | Event-driven architecture | Game flow control |

## 🎨 Design Features

### Visual Elements
- **Gradient Backgrounds**: Beautiful purple-blue gradients
- **Glassmorphism**: Semi-transparent cards with blur effects
- **Smooth Animations**: Bounce, pulse, and slide effects
- **Icon Integration**: Font Awesome icons throughout
- **Typography**: Modern Poppins font family

### Interactive Elements
- **Hover Effects**: Buttons and inputs respond to user interaction
- **Focus States**: Clear visual feedback for form elements
- **Loading States**: Smooth transitions between game states
- **Modal Dialogs**: Clean overlay for rules and victory screens

## 🏆 Scoring System

- **Attempts**: Counts every guess made
- **Best Score**: Automatically saves your lowest attempt count
- **Local Storage**: Persists between browser sessions
- **Score Display**: Shows current and best scores in victory modal

## 🎪 Easter Eggs

### Konami Code
Enter the classic Konami code sequence to activate a rainbow background effect:
1. ↑ ↑ ↓ ↓ ← → ← → B A
2. Watch the background transform into a colorful rainbow!

## 🔧 Customization

### Easy Modifications
- **Number Range**: Change the range by modifying the random number generation in `script.js`
- **Colors**: Update CSS variables for different color schemes
- **Animations**: Adjust timing and effects in the CSS animations
- **Difficulty**: Add time limits or different number ranges

### Adding Features
- **Sound Effects**: Add audio files and play them on events
- **Leaderboards**: Connect to a backend for global scores
- **Multiple Rounds**: Add tournament mode
- **Difficulty Levels**: Different number ranges or time limits

## 🌟 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Experience

The game is fully responsive and optimized for mobile devices:
- Touch-friendly buttons and inputs
- Optimized layout for small screens
- Smooth performance on mobile browsers
- Portrait and landscape orientation support

## 🎯 Future Enhancements

Potential improvements for future versions:
- [ ] Sound effects and background music
- [ ] Multiple difficulty levels
- [ ] Global leaderboards
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements
- [ ] PWA (Progressive Web App) features
- [ ] Multiplayer mode
- [ ] Statistics and analytics

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Add new game modes
- Improve the visual design
- Add more Easter eggs
- Implement accessibility features
- Create different themes

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing the Number Guessing Game!** 🎉 