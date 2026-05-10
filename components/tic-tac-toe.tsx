"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, X, Circle, Sparkles, Brain, Users } from "lucide-react";

type Player = "X" | "O" | null;
type Board = Player[];
type GameMode = "pvp" | "pve";
type Difficulty = "easy" | "medium" | "grandmaster";

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
    // Try to win
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

    // Block player from winning
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

    // Take center
    if (board[4] === null) return 4;

    // Take corners
    const corners = [0, 2, 6, 8].filter(i => board[i] === null);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // Take any available space
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

      // AI move in PVE mode when it's O's turn
      if (gameMode === "pve" && nextPlayer === "O") {
        setIsAIThinking(true);
        setTimeout(() => {
          makeAIMove(newBoard);
        }, 800 + Math.random() * 700); // Random thinking time 0.8-1.5s
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

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  const getGameStatus = () => {
    if (winner) return `Player ${winner} Wins!`;
    if (isDraw) return "It's a Draw!";
    if (isAIThinking) return "AI is thinking...";
    if (gameMode === "pve") {
      return currentPlayer === "X" ? "Your Turn" : "AI's Turn";
    }
    return `Player ${currentPlayer}'s Turn`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl" style={{ animation: 'float 6s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
        >
          Tic Tac Toe
        </motion.h1>
          <div className="text-lg sm:text-xl text-gray-300 mb-4">{getGameStatus()}</div>
          
          {/* Game Mode Selection */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center mb-4">
            <div className="flex gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => { setGameMode("pvp"); resetGame(); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  gameMode === "pvp" 
                    ? "bg-purple-500 text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Users className="w-3 h-3" />
                Human vs Human
              </button>
              <button
                onClick={() => { setGameMode("pve"); resetGame(); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  gameMode === "pve" 
                    ? "bg-purple-500 text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Brain className="w-3 h-3" />
                Human vs AI
              </button>
            </div>
            
            {gameMode === "pve" && (
              <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                {(["easy", "medium", "grandmaster"] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => { setDifficulty(level); resetGame(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      difficulty === level 
                        ? "bg-blue-500 text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {level === "grandmaster" ? "♟️ " : ""}{level}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* AI Thinking Indicator */}
          <AnimatePresence>
            {isAIThinking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-blue-400"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-5 h-5" />
                </motion.div>
                <span className="text-sm">AI is calculating...</span>
              </motion.div>
            )}
          </AnimatePresence>
        
        {/* Winner Celebration */}
        <AnimatePresence>
          {showWinnerCelebration && winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: 3 }}
                  className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
                >
                  🎉 WINNER! 🎉
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-8 -right-8 text-4xl"
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-8 -left-8 text-4xl"
                >
                  <Sparkles className="w-8 h-8 text-orange-400" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>

        {/* Score Board */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-center shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span className="text-xs sm:text-sm text-gray-400">Player X</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-400">{scores.X}</div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-center shadow-lg shadow-yellow-500/10">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-xs sm:text-sm text-gray-400">Draws</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">{scores.draws}</div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-center shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
              <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-xs sm:text-sm text-gray-400">
                {gameMode === "pve" ? "AI" : "Player O"}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400">{scores.O}</div>
          </div>
        </motion.div>

        {/* Game Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-2xl shadow-purple-500/5"
        >
          {board.map((cell, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: cell ? 1 : 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: cell ? 1 : 0.95 }}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner || isDraw}
              className={`aspect-square rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold relative overflow-hidden
                ${winningLine.includes(index) 
                  ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-purple-400 shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm'
                }
                ${cell ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {cell && (
                <motion.div
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                  className={`${cell === "X" ? "text-purple-400" : "text-blue-400"} relative`}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {cell === "X" ? <X className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> : <Circle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />}
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 2 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`absolute inset-0 ${cell === "X" ? "bg-purple-400/20" : "bg-blue-400/20"} rounded-full blur-xl`}
                  />
                </motion.div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            New Game
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetScores}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-200 text-sm sm:text-base"
          >
            Reset Scores
          </motion.button>
        </motion.div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default TicTacToe;
