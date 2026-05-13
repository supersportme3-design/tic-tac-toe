# 🎮 Enhanced Tic Tac Toe - Modern Web Game

A beautifully designed, feature-rich Tic Tac Toe game built with Next.js 16, React 19, and TypeScript. Features an unbeatable AI opponent, stunning glassmorphism UI, and smooth animations.

![Tic Tac Toe Game](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## Version 2 — May 13, 2026

**Release highlights**

- **Quick play** — On the first screen, the **Quick play** button starts a match in one tap: **Human vs AI**, **Medium** difficulty, **3×3** board, and random fun names for you and the AI (the setup wizard is skipped). The button exposes a clear accessibility label so screen-reader users know it is Human vs AI, medium, on a three-by-three board. To pick another mode, board size, difficulty, or custom names, use the full wizard instead.
- **Compared to the earlier live deploy** ([tictactoem.netlify.app](https://tictactoem.netlify.app/)): that build shows a minimal **Create Next App** shell and a single **Choose Game Mode** step only. This tree adds the full wizard (mode → size → difficulty → names), variable board sizes, settings (**Game** / **Sound** / **Appearance**), Web Audio move/UI sounds, board skins, and the quick-play shortcut above.

**Git note — last commit vs this release**

The latest commit referenced in docs is **`857bc7b`** (*“Update README.md with enhanced game features and current implementation status”*), which **only changed `README.md`**. Game and `lib/` updates are in the working tree until you commit and redeploy.

**Function-level differences vs the last committed `components/tic-tac-toe.tsx` (`857bc7b`)**

| Topic | Commit `857bc7b` (`tic-tac-toe.tsx`) | Version 2 (current sources) |
|--------|--------------------------------------|-------------------------------|
| Minimax | `minimax` as `useCallback` | Nested **`runMinimax`**; **`getAIMove`** uses it for grandmaster on 3×3 |
| `useCallback` usage | **`minimax`**, **`getAIMove`** only | Adds **`getWinningCombinations`**, **`playSound`**, **`announceWinner`**, **`checkWinner`**, **`initializeBoard`**, tournament helpers, **`resetGame`**, **`changeBoardSize`**, **`startQuickPlay`**, … |
| Randomness | Inline `Math.random()` | **`lib/tic-tac-toe-rng.ts`** (`randomChance`, `randomIndex`, …) |
| Board & UI | Fixed 3×3-style flow | **`BoardSize`**, **`getWinningCombinations`**, settings sidebar, wizard, **Quick play** |

## ✨ Features

### 🎯 Game Modes
- **Quick play** — Instantly start **Human vs AI**, **Medium** difficulty, **3×3** with random generated names (bypasses the setup wizard)
- **Human vs Human** - Classic two-player mode with personalized names
- **Human vs AI** - Play against an intelligent computer opponent
- **Dynamic Name Generation** - Automatic funny names for both players and AI with adjective + noun combinations

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
- **Animated Background**: Dynamic gradient animations

### 🔊 Audio
- **Sound effects** - Optional move / win / draw / click tones via the Web Audio API (toggle under Settings → Sound)

### 🎮 Interactive Elements
- **Pop-in Animations** - X and O symbols spring into place with rotation
- **Hover Effects** - Interactive feedback on all clickable elements
- **AI Thinking Indicator** - Shows when computer is calculating its move
- **Score Tracking** - Persistent score tracking for both players and draws
- **Winning Line Highlight** - Visual emphasis on winning combinations
- **Micro-interactions** - Spring physics on buttons and controls

### 🚀 Quick Start

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

3. **Start development server**:
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

### 🧠 AI & Algorithms

#### Minimax Algorithm Implementation
The AI uses **Minimax algorithm** with **alpha-beta pruning** - a classic game theory algorithm:

```typescript
const minimax = (board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
  const result = checkWinner(board);
  
  if (result.winner === "O") return 10 - depth;  // AI wins
  if (result.winner === "X") return depth - 10;   // Player wins
  if (board.every(cell => cell !== null)) return 0; // Draw

  // Recursive evaluation of all possible moves
  // with alpha-beta pruning for optimization
};
```

**Key Concepts**:
- **Game Tree**: Explores all possible future moves
- **Evaluation Function**: Scores board positions (+10 for AI win, -10 for player win)
- **Depth Optimization**: Prefers faster wins, slower losses
- **Alpha-Beta Pruning**: Cuts off branches that won't affect the outcome

#### Smart Move Logic
For easier difficulties, AI uses strategic heuristics:
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
className="text-4xl sm:text-5xl md:text-6xl"
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
│   └── tic-tac-toe.tsx      # Main game component
├── lib/
│   └── tic-tac-toe-rng.ts   # Small RNG helpers (React Compiler–friendly)
├── public/                  # Static assets
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies and scripts
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

### 🎮 Game Flow
1. **Mode Selection**: Choose between "Human vs Human" or "Human vs AI"
2. **Name Input**: Enter your name or get random funny names (adaptive to mode)
3. **Difficulty Selection**: Choose AI difficulty (Easy, Medium, Grandmaster)
4. **Start Game**: Begin playing with personalized experience
5. **Gameplay**: Take turns placing X's and O's
6. **Win Conditions**: Get 3 in a row, column, or diagonal
7. **Score Tracking**: Monitor wins, losses, and draws

### Strategy Tips

#### Against AI**:
- **Grandmaster mode is unbeatable** - Aim for a draw!
- Try to control the center square early
- Create multiple winning threats simultaneously
- Block AI's winning moves immediately

#### For Beginners**:
- Start with Easy mode to understand the game
- Watch how AI blocks and creates threats
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

#### New Difficulty Level
```typescript
type Difficulty = "easy" | "medium" | "hard" | "grandmaster";

// Add to makeAIMove function
case "hard":
  aiMove = Math.random() < 0.9 ? getSmartMove(board) : getRandomMove(board);
  break;
```

#### Custom Themes
```css
/* Add to globals.css */
.theme-dark {
  background: #000000;
}
.theme-blue {
  background: #0f172a;
}
```

#### Sound Effects
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
