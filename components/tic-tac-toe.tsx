"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X, Circle, Sparkles, Brain, Users, User, Shuffle } from "lucide-react";

type Player = "X" | "O" | null;
type Board = Player[];
type GameMode = "pvp" | "pve";
type Difficulty = "easy" | "medium" | "grandmaster";

const adjectives = ["Quantum", "Cyber", "Neon", "Neural", "Cosmic", "Turbo", "Mecha", "Stealth", "Pixel", "Crypto", "Phantom", "Savage", "Giga", "Omega", "Alpha", "Hyper", "Astral"];
const humanNouns = ["Ninja", "Wizard", "Knight", "Pirate", "Cyborg", "Hacker", "Jedi", "Viking", "Samurai", "Titan", "Ranger", "Gladiator", "Maverick", "Nomad"];
const aiNouns = ["Bot", "Brain", "Algorithm", "CPU", "Matrix", "Android", "Nexus", "Overlord", "Oracle", "Processor", "Engine", "Logic", "Network"];

const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("pvp");
  const [difficulty, setDifficulty] = useState<Difficulty>("grandmaster");
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [userName, setUserName] = useState("");
  const [userName2, setUserName2] = useState("");
  const [aiName, setAIName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [modeSelected, setModeSelected] = useState(false);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  // Minimax Algorithm
  const minimax = useCallback((board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
    const result = checkWinner(board);
    
    if (result.winner === "O") return 10 - depth;
    if (result.winner === "X") return depth - 10;
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "O";
          const eval_ = minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, eval_);
          alpha = Math.max(alpha, eval_);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "X";
          const eval_ = minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          minEval = Math.min(minEval, eval_);
          beta = Math.min(beta, eval_);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  }, []);

  const getAIMove = useCallback((board: Board): number => {
    let bestMove = -1;
    let bestValue = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        const moveValue = minimax(board, 0, false, -Infinity, Infinity);
        board[i] = null;

        if (moveValue > bestValue) {
          bestValue = moveValue;
          bestMove = i;
        }
      }
    }

    return bestMove;
  }, [minimax]);

  const getRandomMove = (board: Board): number => {
    const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const getSmartMove = (board: Board): number => {
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        if (checkWinner(board).winner === "O") {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "X";
        if (checkWinner(board).winner === "X") {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }

    if (board[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter(i => board[i] === null);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return getRandomMove(board);
  };

  const checkWinner = (currentBoard: Board): { winner: Player; line: number[] } => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], line: combination };
      }
    }
    return { winner: null, line: [] };
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw || isAIThinking) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({
        ...prev,
        [result.winner!]: prev[result.winner!] + 1
      }));
      setShowWinnerCelebration(true);
      setTimeout(() => setShowWinnerCelebration(false), 3000);
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    } else {
      const nextPlayer = currentPlayer === "X" ? "O" : "X";
      setCurrentPlayer(nextPlayer);

      if (gameMode === "pve" && nextPlayer === "O") {
        setIsAIThinking(true);
        setTimeout(() => {
          makeAIMove(newBoard);
        }, 800 + Math.random() * 700);
      }
    }
  };

  const makeAIMove = (currentBoard: Board) => {
    let aiMove: number;
    switch (difficulty) {
      case "easy":
        aiMove = Math.random() < 0.3 ? getSmartMove(currentBoard) : getRandomMove(currentBoard);
        break;
      case "medium":
        aiMove = Math.random() < 0.7 ? getSmartMove(currentBoard) : getRandomMove(currentBoard);
        break;
      case "grandmaster":
        aiMove = getAIMove(currentBoard);
        break;
      default:
        aiMove = getSmartMove(currentBoard);
    }

    const newBoard = [...currentBoard];
    newBoard[aiMove] = "O";
    setBoard(newBoard);
    setIsAIThinking(false);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({
        ...prev,
        [result.winner!]: prev[result.winner!] + 1
      }));
      setShowWinnerCelebration(true);
      setTimeout(() => setShowWinnerCelebration(false), 3000);
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    } else {
      setCurrentPlayer("X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
    setShowWinnerCelebration(false);
    setIsAIThinking(false);
  };

  const startNewGame = () => {
    resetGame();
    if (gameMode === "pve" && !aiName) {
      getAIName();
    }
    setGameStarted(true);
  };

  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    setModeSelected(true);
    setUserName("");
    setUserName2("");
    setAIName("");
  };

  const generateDynamicName = (type: "human" | "ai") => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = type === "ai" 
      ? aiNouns[Math.floor(Math.random() * aiNouns.length)] 
      : humanNouns[Math.floor(Math.random() * humanNouns.length)];
    return `${adj} ${noun}`;
  };

  const getRandomFunnyName = (playerNumber: number = 1) => {
    const newName = generateDynamicName("human");
    playerNumber === 1 ? setUserName(newName) : setUserName2(newName);
  };

  const getAIName = () => setAIName(generateDynamicName("ai"));

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  const getGameStatus = () => {
    if (winner) {
      // Fixed logic: Now uses actual names instead of just 'X' or 'O'
      if (gameMode === "pvp") {
        return `${winner === "X" ? (userName || "Player 1") : (userName2 || "Player 2")} Wins!`;
      } else {
        return `${winner === "X" ? (userName || "You") : (aiName || "AI")} Wins!`;
      }
    }
    if (isDraw) return "It's a Draw!";
    if (isAIThinking) return "AI is thinking...";
    if (gameMode === "pvp") return currentPlayer === "X" ? `${userName || "Player 1"}'s Turn` : `${userName2 || "Player 2"}'s Turn`;
    return currentPlayer === "X" ? `${userName || "Your"} Turn` : `${aiName || "AI"}'s Turn`;
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(to bottom right, #000000, #000000)",
            "linear-gradient(to bottom right, #000000, #16002b)",
            "linear-gradient(to bottom right, #0a0014, #2d0052)",
            "linear-gradient(to bottom right, #000000, #000000)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            Tic Tac Toe
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Mode Selection */}
          {!modeSelected && (
            <motion.div key="mode-select" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-2xl">
              <h2 className="text-2xl text-center font-bold mb-6 text-white">Choose Game Mode</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => selectMode("pvp")} className="p-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex flex-col items-center gap-2">
                  <Users className="w-8 h-8" />
                  <span className="text-lg">Human vs Human</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => selectMode("pve")} className="p-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex flex-col items-center gap-2">
                  <div className="flex gap-2"><User className="w-8 h-8" /><Brain className="w-8 h-8" /></div>
                  <span className="text-lg">Human vs AI</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Name Input */}
          {modeSelected && !gameStarted && (
            <motion.div key="name-input" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-2xl">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder={gameMode === "pvp" ? "Player 1 name" : "Your name"} className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-400" />
                  <button onClick={() => getRandomFunnyName(1)} className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-400 transition-colors"><Shuffle className="w-4 h-4" /></button>
                </div>
                
                {gameMode === "pvp" && (
                  <div className="flex gap-3">
                    <input type="text" value={userName2} onChange={(e) => setUserName2(e.target.value)} placeholder="Player 2 name" className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-400" />
                    <button onClick={() => getRandomFunnyName(2)} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-colors"><Shuffle className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startNewGame} disabled={gameMode === "pvp" ? (!userName.trim() || !userName2.trim()) : !userName.trim()} className="w-full mt-6 px-6 py-3 rounded-xl font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50 transition-all">
                Start Game
              </motion.button>
            </motion.div>
          )}

          {/* STEP 3: Game Board Screen */}
          {gameStarted && (
            <motion.div key="game-board" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              
              {/* Top Controls: Difficulty (if PVE) */}
              {gameMode === "pve" && (
                <div className="flex justify-center mb-4">
                  <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                    {(["easy", "medium", "grandmaster"] as Difficulty[]).map((level) => (
                      <button key={level} onClick={() => { setDifficulty(level); resetGame(); }} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${difficulty === level ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"}`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scoreboard Added at the top */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                <div className={`p-4 rounded-xl border backdrop-blur-md text-center transition-all shadow-lg ${currentPlayer === 'X' ? 'bg-purple-500/20 border-purple-500/50 shadow-purple-500/20' : 'bg-white/5 border-white/10'}`}>
                  <div className="text-sm font-semibold text-purple-300 truncate mb-1">{userName || "Player 1"} (X)</div>
                  <div className="text-3xl font-bold text-white">{scores.X}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-center shadow-lg">
                  <div className="text-sm font-semibold text-gray-400 mb-1">Draws</div>
                  <div className="text-3xl font-bold text-white">{scores.draws}</div>
                </div>
                <div className={`p-4 rounded-xl border backdrop-blur-md text-center transition-all shadow-lg ${currentPlayer === 'O' ? 'bg-blue-500/20 border-blue-500/50 shadow-blue-500/20' : 'bg-white/5 border-white/10'}`}>
                  <div className="text-sm font-semibold text-blue-300 truncate mb-1">{gameMode === "pvp" ? (userName2 || "Player 2") : (aiName || "AI")} (O)</div>
                  <div className="text-3xl font-bold text-white">{scores.O}</div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="text-xl sm:text-2xl text-center font-bold text-white mb-6 h-8 flex items-center justify-center gap-2 drop-shadow-md">
                {getGameStatus()}
                {isAIThinking && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Brain className="w-5 h-5 text-blue-400" /></motion.div>}
              </div>

              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-[400px] mx-auto">
                {board.map((cell, index) => {
                  const isWinningCell = winningLine.includes(index);
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: cell || winner ? 1 : 1.05 }}
                      whileTap={{ scale: cell || winner ? 1 : 0.95 }}
                      onClick={() => handleCellClick(index)}
                      disabled={cell !== null || winner !== null || isAIThinking}
                      className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                        isWinningCell ? 'bg-green-500/20 border-2 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : cell ? 'bg-white/5 border border-white/10' : 'bg-white/[0.02] border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <AnimatePresence>
                        {cell === "X" && (
                          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} className="text-purple-400">
                            <X size={64} strokeWidth={2.5} />
                          </motion.div>
                        )}
                        {cell === "O" && (
                          <motion.div initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} className="text-blue-400">
                            <Circle size={56} strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom Actions with Spring Animation */}
              <div className="flex flex-wrap justify-center gap-4">
                <motion.button 
                  onClick={resetGame}
                  whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-2 shadow-lg border border-white/5"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Game
                </motion.button>
                <motion.button 
                  onClick={() => { setModeSelected(false); setGameStarted(false); resetScores(); }}
                  whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-xl bg-black/30 hover:bg-red-500/20 text-gray-400 hover:text-red-400 font-medium transition-colors border border-white/5"
                >
                  Quit Game
                </motion.button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner Celebration Overlay */}
        <AnimatePresence>
          {showWinnerCelebration && winner && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="relative">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: 3 }} className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
                  WINNER!
                </motion.div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute -top-8 -right-8 text-4xl">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TicTacToe;