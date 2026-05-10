# 🎮 State-of-the-Art Tic Tac Toe

A modern, beautifully designed Tic Tac Toe game built with Next.js 16, React 19, and TypeScript. Features an unbeatable AI opponent using Minimax algorithm, stunning glassmorphism UI, and smooth animations.

![Tic Tac Toe Game](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Game Modes
- **Human vs Human** - Classic two-player mode
- **Human vs AI** - Play against an intelligent computer opponent

### 🤖 AI Opponent
- **Three Difficulty Levels**:
  - **Easy**: 30% smart moves, 70% random (great for beginners)
  - **Medium**: 70% smart moves, 30% random (challenging but beatable)
  - **Grandmaster**: Perfect Minimax algorithm (unbeatable!)

### 🎨 Visual Design
- **Glassmorphism UI** - Modern frosted glass effect with backdrop blur
- **Responsive Design** - Perfectly optimized for iPhone and all mobile devices
- **Smooth Animations** - Powered by Framer Motion with spring physics
- **Dark Theme** - Pure black background with purple/blue gradient accents
- **Winner Celebration** - Animated confetti effect with rotating sparkles

### 🎮 Interactive Elements
- **Pop-in Animations** - X and O symbols spring into place
- **Hover Effects** - Interactive feedback on all clickable elements
- **AI Thinking Indicator** - Shows when computer is calculating its move
- **Score Tracking** - Persistent score tracking for both players and draws
- **Winning Line Highlight** - Visual emphasis on winning combinations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone repository**:
   ```bash
   git clone https://github.com/supersportme3-design/tic-tac-toe.git
   cd tic-tac-toe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📚 Learn from This Project

This project is perfect for developers wanting to learn modern web development concepts. Here's what you can learn:

### 🧠 AI & Algorithms

#### Minimax Algorithm Implementation
The AI uses the **Minimax algorithm** with **alpha-beta pruning** - a classic game theory algorithm:

```typescript
const minimax = (board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
  const result = checkWinner(board);
  
  if (result.winner === "O") return 10 - depth;  // AI wins
  if (result.winner === "X") return depth - 10;   // Player wins
  if (board.every(cell => cell !== null)) return 0; // Draw

  // Recursive evaluation of all possible moves
  // with alpha-beta pruning for optimization
}
```

**Key Concepts**:
- **Game Tree**: Explores all possible future moves
- **Evaluation Function**: Scores board positions (+10 for AI win, -10 for player win)
- **Depth Optimization**: Prefers faster wins, slower losses
- **Alpha-Beta Pruning**: Cuts off branches that won't affect the outcome

#### Smart Move Logic
For easier difficulties, the AI uses strategic heuristics:

1. **Win Move**: Check if AI can win in one move
2. **Block Move**: Prevent player from winning
3. **Center Control**: Take center square (most valuable)
4. **Corner Strategy**: Prefer corner positions
5. **Random Fallback**: Choose randomly if no strategic move exists

### ⚛️ Modern React Patterns

#### TypeScript Integration
```typescript
type Player = "X" | "O" | null;
type Board = Player[];
type GameMode = "pvp" | "pve";
type Difficulty = "easy" | "medium" | "grandmaster";
```

**Benefits**:
- Type safety prevents runtime errors
- Better IDE autocomplete and refactoring
- Self-documenting code

#### State Management with Hooks
```typescript
const [board, setBoard] = useState<Board>(Array(9).fill(null));
const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
const [gameMode, setGameMode] = useState<GameMode>("pvp");
```

**Best Practices**:
- Component-level state for UI state
- Derived state for computed values
- Proper TypeScript typing

### 🎨 UI/UX Design

#### Glassmorphism Effect
```css
backdrop-blur-lg bg-white/5 border border-white/10 shadow-2xl
```

**Techniques**:
- **Backdrop Blur**: Creates depth and layering
- **Semi-transparent backgrounds**: Allows content to show through
- **Subtle borders**: Defines boundaries without harsh lines
- **Colored shadows**: Adds depth and visual interest

#### Responsive Design with Tailwind
```tsx
className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
```

**Mobile-First Approach**:
- Base styles for mobile (`text-4xl`)
- Progressive enhancement for larger screens
- Consistent spacing and sizing across devices

#### Framer Motion Animations
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
```

**Animation Principles**:
- **Spring Physics**: Natural, bouncy animations
- **Staggered Timing**: Sequential animations for visual flow
- **Micro-interactions**: Hover states and tap feedback
- **Performance**: GPU-accelerated transforms

### 🏗️ Project Structure

```
tic-tac-toe/
├── app/
│   ├── globals.css          # Global styles and Tailwind
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page (renders game)
├── components/
│   └── tic-tac-toe.tsx     # Main game component
├── public/                  # Static assets
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies and scripts
```

**Next.js 16 App Router**:
- **Server Components by Default**: Better performance
- **Client Components**: Only when needed (interactivity)
- **File-based Routing**: Simple and intuitive
- **Built-in Optimizations**: Image optimization, code splitting

## 🛠️ Technology Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js 16** | React Framework | Latest features, App Router, great performance |
| **React 19** | UI Library | Latest React features, concurrent rendering |
| **TypeScript** | Type Safety | Prevents bugs, better developer experience |
| **Tailwind CSS 4** | Styling | Utility-first, responsive design |
| **Framer Motion** | Animations | Declarative animations, great performance |
| **Lucide React** | Icons | Modern, consistent icon library |

## 🎯 How to Play

1. **Choose Game Mode**: Select "Human vs Human" or "Human vs AI"
2. **Select Difficulty** (AI mode only): Choose Easy, Medium, or Grandmaster
3. **Make Your Move**: Click any empty square to place your X
4. **Win Conditions**: Get 3 in a row (horizontal, vertical, or diagonal)
5. **Track Progress**: Monitor scores in the scoreboard above

### Strategy Tips

**Against AI**:
- **Grandmaster mode is unbeatable** - aim for a draw!
- Try to control the center square early
- Create multiple winning threats simultaneously
- Block the AI's winning moves immediately

**For Beginners**:
- Start with Easy mode to understand the game
- Watch how the AI blocks and creates threats
- Practice recognizing winning patterns

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically with zero configuration

### Netlify
1. Run `npm run build`
2. Upload the `.next` folder to Netlify
3. Configure build settings

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Customization

### Adding New Features

**New Difficulty Level**:
```typescript
type Difficulty = "easy" | "medium" | "hard" | "grandmaster";

// Add to makeAIMove function
case "hard":
  aiMove = Math.random() < 0.9 ? getSmartMove(board) : getRandomMove(board);
  break;
```

**Custom Themes**:
```css
/* Add to globals.css */
.theme-dark {
  background: #000000;
}
.theme-blue {
  background: #0f172a;
}
```

**Sound Effects**:
```typescript
const playSound = (sound: string) => {
  const audio = new Audio(`/sounds/${sound}.mp3`);
  audio.play();
};
```

### Performance Optimization

The project is already optimized with:
- **React Compiler**: Automatic optimization
- **Code Splitting**: Next.js automatic splitting
- **Image Optimization**: Built-in image handling
- **Tree Shaking**: Unused code elimination

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Framer Motion** - For smooth animations
- **Tailwind CSS** - For utility-first styling
- **Lucide** - For beautiful icons

---

## 🎓 Learning Resources

If you're learning from this project, check out these resources:

### AI & Game Theory
- [Minimax Algorithm Explained](https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-1-introduction/)
- [Alpha-Beta Pruning](https://www.chessprogramming.org/Alpha-Beta_Pruning)
- [Game Theory Basics](https://www.coursera.org/learn/game-theory)

### React & TypeScript
- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js 16 Tutorial](https://nextjs.org/learn)

### UI/UX Design
- [Glassmorphism Design Guide](https://ui.glass/glassmorphism)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/tutorial)

---

**Built with ❤️ using modern web technologies**
