"use client";

import { useState, useCallback, useEffect, startTransition } from "react";
import { randomChance, randomIndex, randomItem, randomUnit } from "@/lib/tic-tac-toe-rng";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X, Circle, Sparkles, Brain, Users, User, Shuffle, Trophy, Volume2, VolumeX, Settings, Grid, SlidersHorizontal, Palette, Play } from "lucide-react";

type Player = "X" | "O" | null;
type Board = Player[];
type GameMode = "pvp" | "pve";
type Difficulty = "easy" | "medium" | "grandmaster";
type BoardSize = "3x3" | "4x4" | "5x5";
type TournamentFormat = "best-of-3" | "best-of-5";
type ColorTheme = "dark";
type BoardStyle = "default" | "neon" | "wood" | "metal";

// AI Names based on difficulty level
const aiNamesByDifficulty = {
  easy: ["Rookie", "Newbie", "Beginner", "Learner", "Starter", "Novice", "Amateur", "Trainee"],
  medium: ["Challenger", "Competitor", "Rival", "Contender", "Warrior", "Fighter", "Strategist", "Tactician"],
  grandmaster: ["Mastermind", "Genius", "Legend", "Champion", "Supreme", "Ultimate", "Phoenix", "Titan"]
};

const adjectives = ["Quantum", "Cyber", "Neon", "Neural", "Cosmic", "Turbo", "Mecha", "Stealth", "Pixel", "Crypto", "Phantom", "Savage", "Giga", "Omega", "Alpha", "Hyper", "Astral"];
const humanNouns = ["Ninja", "Wizard", "Knight", "Pirate", "Cyborg", "Hacker", "Jedi", "Viking", "Samurai", "Titan", "Ranger", "Gladiator", "Maverick", "Nomad"];
const aiNouns = ["Bot", "Brain", "Algorithm", "CPU", "Matrix", "Android", "Nexus", "Overlord", "Oracle", "Processor", "Engine", "Logic", "Network"];

// Theme Configurations with comprehensive Apple-inspired colors
const colorThemes = {
  dark: {
    background: "bg-black",
    card: "bg-white/5",
    border: "border-white/10",
    text: "text-white",
    textSecondary: "text-gray-400",
    accent: "from-blue-400 to-purple-400",
    xColor: "text-blue-400",
    oColor: "text-green-400",
    panelBg: "bg-gradient-to-br from-white/10 to-white/5",
    panelBorder: "border-white/20",
    buttonText: "text-white",
    buttonBg: "bg-white/10",
    buttonHover: "hover:bg-white/20",
    inputBg: "bg-white/10",
    inputBorder: "border-white/20",
    labelColor: "text-white/80"
  }
};

const boardStyles = {
  default: "bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm",
  neon: "bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-400/50 shadow-[0_0_40px_rgba(168,85,247,0.4),0_0_60px_rgba(236,72,153,0.3)] backdrop-blur-md",
  wood: "bg-gradient-to-br from-amber-700 to-amber-900 border-4 border-amber-800 shadow-xl",
  metal: "bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-gray-500 shadow-2xl"
};

// Apple-inspired grid cell styles
const appleGridStyles = {
  default: "bg-gray-100/90 border border-gray-300/50 shadow-sm hover:bg-gray-200/90 hover:border-gray-400/70 hover:shadow-md",
  hover: "bg-blue-50/90 border-blue-200/70 shadow-md hover:bg-blue-100/90 hover:border-blue-300/80 hover:shadow-lg",
  x: "bg-blue-500/10 border-blue-500/30 shadow-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/50",
  o: "bg-green-500/10 border-green-500/30 shadow-green-500/20 hover:bg-green-500/20 hover:border-green-500/50",
  winning: "bg-yellow-400/20 border-yellow-400/50 shadow-yellow-400/30"
};

// Board Size Configurations
const boardConfigs = {
  "3x3": { size: 3, winLength: 3, cells: 9 },
  "4x4": { size: 4, winLength: 4, cells: 16 },
  "5x5": { size: 5, winLength: 5, cells: 25 }
};

type SetupStep = "mode" | "size" | "difficulty" | "names";

const BOARD_RULE_LINE: Record<BoardSize, string> = {
  "3x3": "Get three in a row to win.",
  "4x4": "Win with four in a row — any row, column, or diagonal.",
  "5x5": "Win with five in a row — any row, column, or diagonal.",
};

const DIFFICULTY_HELP: Record<Difficulty, string> = {
  easy: "Loose play — lots of random moves. Good for warming up.",
  medium: "Blocks obvious threats and takes open wins. Balanced.",
  grandmaster: "Full minimax on 3×3. On larger boards, uses a strong heuristic instead.",
};

const TicTacToe = () => {
  // Enhanced Game State
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  
  // Original Game State
  const [gameMode, setGameMode] = useState<GameMode>("pvp");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [userName, setUserName] = useState("");
  const [userName2, setUserName2] = useState("");
  const [aiName, setAIName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  /** First-run wizard: mode → size → (PvE only) difficulty → names → play */
  const [setupStep, setSetupStep] = useState<SetupStep>("mode");
  const [settingsTab, setSettingsTab] = useState<"game" | "audio" | "appearance">("game");
  
  // New Enhanced Features State
  const [boardSize, setBoardSize] = useState<BoardSize>("3x3");
  // Tournament features - commented out for future release
  // const [tournamentFormat, setTournamentFormat] = useState<TournamentFormat | null>(null);
  // const [tournamentScores, setTournamentScores] = useState({ X: 0, O: 0, games: [] as { game: number; winner: Player | null }[] });
  // const [currentGameInTournament, setCurrentGameInTournament] = useState(1);
  // const [tournamentFinished, setTournamentFinished] = useState(false);
  const [colorTheme, setColorTheme] = useState<ColorTheme>("dark");
  const [boardStyle, setBoardStyle] = useState<BoardStyle>("default");
  const [soundEnabled, setSoundEnabled] = useState(true);
  // const [showTournamentMode, setShowTournamentMode] = useState(false);
  const [showNameValidationPopup, setShowNameValidationPopup] = useState(false);
  const [pendingGameStart, setPendingGameStart] = useState(false);
  
  // Audio state
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Dynamic winning combinations based on board size
  const getWinningCombinations = useCallback((size: BoardSize): number[][] => {
    const config = boardConfigs[size];
    const combinations: number[][] = [];
    
    // Square grids (3x3, 4x4, 5x5)
    const boardSize = config.size;
    
    // Rows
    for (let row = 0; row < boardSize; row++) {
      const rowCombination: number[] = [];
      for (let col = 0; col < boardSize; col++) {
        rowCombination.push(row * boardSize + col);
      }
      combinations.push(rowCombination);
    }
    
    // Columns
    for (let col = 0; col < boardSize; col++) {
      const colCombination: number[] = [];
      for (let row = 0; row < boardSize; row++) {
        colCombination.push(row * boardSize + col);
      }
      combinations.push(colCombination);
    }
    
    // Diagonals
    const diagonal1: number[] = [];
    const diagonal2: number[] = [];
    for (let i = 0; i < boardSize; i++) {
      diagonal1.push(i * boardSize + i);
      diagonal2.push(i * boardSize + (boardSize - 1 - i));
    }
    combinations.push(diagonal1, diagonal2);
    
    return combinations;
  }, []);
  
  // Audio Context initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;

    let cancelled = false;
    try {
      const ctx = new Ctor();
      queueMicrotask(() => {
        if (cancelled) return;
        setAudioContext(ctx);
      });
      return () => {
        cancelled = true;
        if (ctx && ctx.close) {
          ctx.close().catch(() => {});
        }
      };
    } catch (error) {
      console.warn("AudioContext initialization failed:", error);
    }
  }, []);
  
  const playSound = useCallback((type: 'move' | 'win' | 'draw' | 'click') => {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'move':
        oscillator.frequency.value = 440; // A4 for all moves
        gainNode.gain.value = 0.1;
        break;
      case 'win':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.2;
        break;
      case 'draw':
        oscillator.frequency.value = 300;
        gainNode.gain.value = 0.15;
        break;
      case 'click':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.05;
        break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEnabled, audioContext]);
  
  const announceWinner = useCallback((winner: Player) => {
    if (!soundEnabled) return;
    
    const message = winner === 'X' 
      ? `${userName || 'Player X'} wins!`
      : winner === 'O' 
        ? gameMode === 'pvp' ? `${userName2 || 'Player O'} wins!` : `${aiName || 'AI'} wins!`
        : "It's a draw!";
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.1;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  }, [soundEnabled, userName, userName2, aiName, gameMode]);

  const checkWinner = useCallback((currentBoard: Board): { winner: Player; line: number[] } => {
    const combinations = getWinningCombinations(boardSize);

    for (const combination of combinations) {
      const firstPlayer = currentBoard[combination[0]];
      if (!firstPlayer) continue;

      const isWinning = combination.every((index) => currentBoard[index] === firstPlayer);

      if (isWinning) {
        return { winner: firstPlayer, line: combination };
      }
    }

    return { winner: null, line: [] };
  }, [boardSize]);

  // Minimax (3×3 grandmaster path only). Named `function` so recursion is valid for the compiler.
  function runMinimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
    const result = checkWinner(board);

    if (result.winner === "O") return 10 - depth;
    if (result.winner === "X") return depth - 10;
    if (board.every((cell) => cell !== null)) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = "O";
          const eval_ = runMinimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, eval_);
          alpha = Math.max(alpha, eval_);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    }
    let minEval = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = "X";
        const eval_ = runMinimax(board, depth + 1, true, alpha, beta);
        board[i] = null;
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }

  const getAIMove = useCallback(
    (board: Board): number => {
      let bestMove = -1;
      let bestValue = -Infinity;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = "O";
          const moveValue = runMinimax(board, 0, false, -Infinity, Infinity);
          board[i] = null;

          if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = i;
          }
        }
      }

      return bestMove;
    },
    [checkWinner],
  );

  const getRandomMove = (board: Board): number => {
    const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
    return availableMoves[randomIndex(availableMoves.length)];
  };

  const getSmartMove = (board: Board): number => {
    const n = board.length;
    const s = boardConfigs[boardSize].size;

    for (let i = 0; i < n; i++) {
      if (board[i] === null) {
        board[i] = "O";
        if (checkWinner(board).winner === "O") {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }

    for (let i = 0; i < n; i++) {
      if (board[i] === null) {
        board[i] = "X";
        if (checkWinner(board).winner === "X") {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }

    const center = Math.floor((s * s) / 2);
    if (board[center] === null) return center;

    const corners = [0, s - 1, n - s, n - 1].filter((i) => i >= 0 && i < n && board[i] === null);
    if (corners.length > 0) {
      return corners[randomIndex(corners.length)];
    }

    return getRandomMove(board);
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw || isAIThinking) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    // Play move sound
    playSound('move');

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
      playSound('win');
      announceWinner(result.winner);
      
      // Handle tournament game end - commented out for future release
      // if (tournamentFormat) {
      //   handleTournamentGameEnd(result.winner);
      // }
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      playSound('draw');
      announceWinner(null);
      
      // Handle tournament game end - commented out for future release
      // if (tournamentFormat) {
      //   handleTournamentGameEnd(null);
      // }
    } else {
      const nextPlayer = currentPlayer === "X" ? "O" : "X";
      setCurrentPlayer(nextPlayer);

      if (gameMode === "pve" && nextPlayer === "O") {
        setIsAIThinking(true);
        setTimeout(() => {
          makeAIMove(newBoard);
        }, 800 + randomUnit() * 700);
      }
    }
  };

  const makeAIMove = (currentBoard: Board) => {
    let aiMove: number;
    switch (difficulty) {
      case "easy":
        aiMove = randomChance(0.3) ? getSmartMove(currentBoard) : getRandomMove(currentBoard);
        break;
      case "medium":
        aiMove = randomChance(0.7) ? getSmartMove(currentBoard) : getRandomMove(currentBoard);
        break;
      case "grandmaster":
        aiMove = boardSize === "3x3" ? getAIMove(currentBoard) : getSmartMove(currentBoard);
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

  // Enhanced game functions
  const initializeBoard = useCallback((size: BoardSize): Board => {
    return Array(boardConfigs[size].cells).fill(null);
  }, []);
  
  // Initialize board on component mount and when size changes
  useEffect(() => {
    const newBoard = initializeBoard(boardSize);
    startTransition(() => {
      setBoard(newBoard);
    });
  }, [boardSize, initializeBoard]);
  
  // Tournament functions - commented out for future release
  /*
  const startTournament = useCallback((format: TournamentFormat) => {
    setTournamentFormat(format);
    setTournamentScores({ X: 0, O: 0, games: [] });
    setCurrentGameInTournament(1);
    resetGame();
  }, []);
  
  const handleTournamentGameEnd = useCallback((gameWinner: Player) => {
    if (!tournamentFormat || tournamentFinished) return;
    
    const newScores = { ...tournamentScores };
    if (gameWinner) {
      newScores[gameWinner]++;
    }
    newScores.games.push({ game: currentGameInTournament, winner: gameWinner });
    
    setTournamentScores(newScores);
    
    const maxGames = tournamentFormat === 'best-of-3' ? 3 : 5;
    const gamesNeeded = Math.ceil(maxGames / 2);
    
    if (newScores.X >= gamesNeeded || newScores.O >= gamesNeeded) {
      // Tournament finished - announce tournament winner
      const tournamentWinner = newScores.X > newScores.O ? 'X' : 'O';
      const winnerName = tournamentWinner === 'X' 
        ? `${userName || 'Player X'}`
        : gameMode === 'pvp' ? `${userName2 || 'Player O'}` : `${aiName || 'AI'}`;
      
      // Set tournament finished state
      setTournamentFinished(true);
      
      // Special tournament winner announcement
      if (soundEnabled && 'speechSynthesis' in window) {
        // Cancel any existing speech
        speechSynthesis.cancel();
        
        // Play immediately without delay
        setTimeout(() => {
          const tournamentMessage = `🏆 Tournament winner! ${winnerName} wins the ${tournamentFormat === 'best-of-3' ? 'Best of 3' : 'Best of 5'} tournament!`;
          const utterance = new SpeechSynthesisUtterance(tournamentMessage);
          utterance.rate = 1.0;
          utterance.pitch = 1.3;
          utterance.volume = 1.0;
          
          // Ensure speech synthesis is ready
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
          
          speechSynthesis.speak(utterance);
        }, 1000); // Reduced delay to 1 second
      }
      
      setShowWinnerCelebration(true);
    } else {
      // Continue tournament - delay reset to avoid circular dependency
      setTimeout(() => {
        setCurrentGameInTournament(prev => prev + 1);
        setBoard(initializeBoard(boardSize));
        setCurrentPlayer("X");
        setWinner(null);
        setWinningLine([]);
        setIsDraw(false);
      }, 2000); // 2 second delay before next game
    }
  }, [tournamentFormat, tournamentScores, currentGameInTournament, boardSize, soundEnabled, userName, userName2, aiName, gameMode, initializeBoard, tournamentFinished]);
  
  const resetTournament = useCallback(() => {
    setTournamentFormat(null);
    setTournamentScores({ X: 0, O: 0, games: [] });
    setCurrentGameInTournament(1);
    setTournamentFinished(false);
    resetGame();
  }, [resetGame]);
  */

  const resetGame = useCallback(() => {
    setBoard(initializeBoard(boardSize));
    setCurrentPlayer("X");
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
    setShowWinnerCelebration(false);
    setIsAIThinking(false);
    playSound('click');
  }, [boardSize, initializeBoard, playSound]);

  const changeBoardSize = useCallback(
    (newSize: BoardSize) => {
      setBoardSize(newSize);
      setBoard(initializeBoard(newSize));
      setCurrentPlayer("X");
      setWinner(null);
      setIsDraw(false);
      setWinningLine([]);
      setShowWinnerCelebration(false);
      setIsAIThinking(false);
      playSound("click");
    },
    [initializeBoard, playSound],
  );

  const startNewGame = () => {
    resetGame();
    if (gameMode === "pve" && !aiName) {
      getAIName();
    }
    setGameStarted(true);
  };

  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    setSetupStep("size");
    setUserName("");
    setUserName2("");
    setAIName("");
    setShowNameValidationPopup(false);
    setPendingGameStart(false);

    if (mode === "pve") {
      generateAIName();
    }
  };

  const goBackSetup = () => {
    if (setupStep === "names") {
      setSetupStep(gameMode === "pve" ? "difficulty" : "size");
    } else if (setupStep === "difficulty") {
      setSetupStep("size");
    } else if (setupStep === "size") {
      setSetupStep("mode");
    }
  };

  const pickBoardSize = (size: BoardSize) => {
    setBoardSize(size);
    if (gameMode === "pve") {
      setSetupStep("difficulty");
    } else {
      setSetupStep("names");
    }
  };

  const pickDifficulty = (level: Difficulty) => {
    setDifficulty(level);
    generateAIName();
    setSetupStep("names");
  };

  const generateDynamicName = (type: "human" | "ai") => {
    const adj = randomItem(adjectives);
    const noun = type === "ai" ? randomItem(aiNouns) : randomItem(humanNouns);
    return `${adj} ${noun}`;
  };

  const getRandomFunnyName = (playerNumber: number = 1) => {
    const newName = generateDynamicName("human");
    if (playerNumber === 1) {
      setUserName(newName);
    } else {
      setUserName2(newName);
    }
  };

  const generateAIName = () => {
    const names = aiNamesByDifficulty[difficulty];
    // Use one unique name per difficulty level
    const uniqueNames = {
      easy: "Rookie",
      medium: "Challenger", 
      grandmaster: "Mastermind"
    };
    const selectedName = uniqueNames[difficulty] ?? randomItem(names);
    const adjective = randomItem(adjectives);
    const aiName = `${adjective} ${selectedName}`;
    setAIName(aiName);
  };

  const startQuickPlay = useCallback(() => {
    if (typeof window !== "undefined" && audioContext) {
      void audioContext.resume();
    }
    setGameMode("pve");
    setBoardSize("3x3");
    setDifficulty("medium");
    setUserName(generateDynamicName("human"));
    setUserName2("");
    setAIName(`${randomItem(adjectives)} Challenger`);
    setSetupStep("mode");
    setShowNameValidationPopup(false);
    setPendingGameStart(false);
    setBoard(initializeBoard("3x3"));
    setCurrentPlayer("X");
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
    setShowWinnerCelebration(false);
    setIsAIThinking(false);
    setGameStarted(true);
    playSound("click");
  }, [audioContext, initializeBoard, playSound]);

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
    <div className={`relative flex min-h-screen flex-col overflow-x-hidden transition-all duration-500 md:flex-row ${colorThemes[colorTheme].background} ${colorThemes[colorTheme].text}`}>
      {/* Animated Gradient Background */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(to bottom right, #000000, #000000)",
            "linear-gradient(to bottom right, #000000, #16002b)",
            "linear-gradient(to bottom right, #0a0014, #2d0052)",
            "linear-gradient(to bottom right, #000000, #000000)",
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col lg:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col items-center px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="w-full max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            Tic Tac Toe
          </h1>
        </motion.div>

        {/* Beautiful Theme Preview Grid - Only show when game not started */}
        {!gameStarted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="mb-6 flex justify-center"
          >
            <div className={`p-4 rounded-2xl ${colorThemes[colorTheme].card} border ${colorThemes[colorTheme].border} shadow-xl`}>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => {
                  const states = ['X', 'O', 'X']; // All 3 cells have content
                  const cellContent = states[index];
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`aspect-square w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold transition-all shadow-md ${
                        `${colorThemes[colorTheme].card} border-2 ${colorThemes[colorTheme].border} shadow-lg`
                      }`}
                      style={{
                        background:
                          boardStyle === 'default' ? 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' :
                          boardStyle === 'neon' ? 'linear-gradient(145deg, #9333ea, #ec4899)' :
                          boardStyle === 'wood' ? 'linear-gradient(145deg, #d97706, #92400e)' :
                          boardStyle === 'metal' ? 'linear-gradient(145deg, #6b7280, #374151)' :
                          'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
                      }}
                    >
                      {cellContent === 'X' ? (
                        <X className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${colorThemes[colorTheme].xColor} shadow-lg`} style={{ filter: `drop-shadow(0 0 8px #a855f7)` }} />
                      ) : (
                        <Circle className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${colorThemes[colorTheme].oColor} shadow-lg`} style={{ filter: `drop-shadow(0 0 8px #3b82f6)` }} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 w-full"
          >
            <motion.button
              type="button"
              aria-label="Quick play: Human versus AI, medium difficulty, three by three board"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startQuickPlay}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-500/35 bg-gradient-to-r from-cyan-500/25 to-blue-500/20 px-5 py-4 text-lg font-semibold text-white shadow-lg ring-1 ring-cyan-400/20 transition-colors hover:border-cyan-400/50 hover:from-cyan-500/35 hover:to-blue-500/30"
            >
              <Play className="h-6 w-6 shrink-0 fill-white text-white" />
              Quick play
            </motion.button>
            <p className="mt-2 text-center text-xs text-white/50">
              Human vs AI · Medium · 3×3 — random names. Or use the steps below for a custom game.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          
          {/* Wizard step 1: Mode */}
          {!gameStarted && setupStep === "mode" && (
            <motion.div key="mode-select" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-2xl">
              <p className="mb-4 text-center text-sm text-white/60">Step 1</p>
              <h2 className="mb-6 text-center text-2xl font-bold text-white">Who is playing?</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => selectMode("pvp")} className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 font-semibold text-white">
                  <Users className="h-8 w-8" />
                  <span className="text-lg">Human vs Human</span>
                  <span className="text-center text-xs text-white/80">Same device — two names on the next screen.</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => selectMode("pve")} className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 font-semibold text-white">
                  <div className="flex gap-2">
                    <User className="h-8 w-8" />
                    <Brain className="h-8 w-8" />
                  </div>
                  <span className="text-lg">Human vs AI</span>
                  <span className="text-center text-xs text-white/80">You will pick board size, then AI difficulty, then your name.</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Wizard step 2: Board size */}
          {!gameStarted && setupStep === "size" && (
            <motion.div key="size-select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg">
              <p className="mb-2 text-center text-sm text-white/60">Step 2 of {gameMode === "pve" ? 4 : 3}</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={goBackSetup} className="mb-4 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15">
                ← Back
              </motion.button>
              <h2 className="mb-2 text-center text-2xl font-bold text-white">Board size</h2>
              <p className="mb-6 text-center text-sm text-white/55">Larger grids need longer lines to win — each option reminds you below.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(Object.keys(boardConfigs) as BoardSize[]).map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    aria-label={`Choose ${size} for this game`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pickBoardSize(size)}
                    className={`flex flex-col items-center rounded-xl border-2 p-4 text-left transition-all ${
                      boardSize === size ? "border-purple-400 bg-purple-500/20" : "border-white/10 bg-black/20 hover:border-white/25"
                    }`}
                  >
                    <span className="text-lg font-bold text-white">{size}</span>
                    <span className="mt-2 text-center text-xs leading-snug text-white/65">{BOARD_RULE_LINE[size]}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Wizard step 3: AI difficulty (PvE only) */}
          {!gameStarted && setupStep === "difficulty" && gameMode === "pve" && (
            <motion.div key="difficulty-select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg">
              <p className="mb-2 text-center text-sm text-white/60">Step 3 of 4</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={goBackSetup} className="mb-4 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15">
                ← Back
              </motion.button>
              <h2 className="mb-6 text-center text-2xl font-bold text-white">AI difficulty</h2>
              <div className="flex flex-col gap-3">
                {(["easy", "medium", "grandmaster"] as Difficulty[]).map((level) => (
                  <motion.button
                    key={level}
                    type="button"
                    aria-label={`Choose ${level} AI difficulty for this game`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => pickDifficulty(level)}
                    className={`rounded-xl border-2 px-4 py-4 text-left transition-all ${
                      difficulty === level ? "border-cyan-400 bg-cyan-500/15" : "border-white/10 bg-black/20 hover:border-white/25"
                    }`}
                  >
                    <span className="text-lg font-semibold capitalize text-white">{level}</span>
                    <span className="mt-1 block text-sm text-white/60">{DIFFICULTY_HELP[level]}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Wizard step 4 (or 3 for PvP): Names */}
          {!gameStarted && setupStep === "names" && (
            <motion.div key="name-input" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg">
              <p className="mb-2 text-center text-sm text-white/60">Step {gameMode === "pve" ? 4 : 3} of {gameMode === "pve" ? 4 : 3}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={goBackSetup}
                className="mb-4 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
              >
                ← Back
              </motion.button>

              <div className="mb-4 rounded-lg border border-white/10 bg-gradient-to-r from-blue-500/15 to-purple-500/15 p-3 text-center">
                <p className="text-sm text-white/90">
                  <span className="font-semibold text-white">{boardSize}</span>
                  <span className="text-white/70"> — </span>
                  {BOARD_RULE_LINE[boardSize]}
                </p>
                {gameMode === "pve" && (
                  <p className="mt-2 text-xs text-white/70">
                    vs <span className="text-cyan-300">{aiName || "AI"}</span>
                    <span className="text-white/50"> · </span>
                    <span className="capitalize text-purple-300">{difficulty}</span>
                  </p>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="ttt-name-1">
                    {gameMode === "pvp" ? "Player 1 name" : "Your name"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      id="ttt-name-1"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name..."
                      className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none min-h-[48px]"
                    />
                    <button
                      type="button"
                      onClick={() => getRandomFunnyName(1)}
                      aria-describedby="ttt-suggest-hint"
                      className="flex shrink-0 items-center gap-2 rounded-lg bg-purple-500 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-400 min-h-[48px] sm:px-4"
                    >
                      <Shuffle className="h-5 w-5 shrink-0" aria-hidden />
                      <span>Suggest</span>
                    </button>
                  </div>
                </div>

                {gameMode === "pvp" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="ttt-name-2">
                      Player 2 name
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        id="ttt-name-2"
                        type="text"
                        value={userName2}
                        onChange={(e) => setUserName2(e.target.value)}
                        placeholder="Player 2..."
                        className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none min-h-[48px]"
                      />
                      <button
                        type="button"
                        onClick={() => getRandomFunnyName(2)}
                        aria-describedby="ttt-suggest-hint"
                        className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-500 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400 min-h-[48px] sm:px-4"
                      >
                        <Shuffle className="h-5 w-5 shrink-0" aria-hidden />
                        <span>Suggest</span>
                      </button>
                    </div>
                  </div>
                )}

                <p id="ttt-suggest-hint" className="text-center text-xs leading-relaxed text-white/55">
                  <span className="font-semibold text-white/75">Suggest</span> fills in a random fun display name for that
                  player when you are not sure what to type.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  const namesMissing = gameMode === "pvp" ? !userName.trim() || !userName2.trim() : !userName.trim();
                  if (namesMissing) {
                    setShowNameValidationPopup(true);
                    setPendingGameStart(true);
                  } else {
                    startNewGame();
                  }
                }}
                className="mt-6 w-full rounded-xl bg-white px-6 py-4 text-base font-bold text-black transition-all hover:bg-gray-200 min-h-[52px]"
              >
                Play
              </motion.button>
            </motion.div>
          )}

          {/* Difficulty Change Confirmation Popup - removed */}
          {/* Name Validation Popup */}
          <AnimatePresence>
            {showNameValidationPopup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setShowNameValidationPopup(false)}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-4">Names Not Entered</h3>
                  <p className="text-gray-300 mb-6">
                    {gameMode === "pvp" 
                      ? (!userName.trim() && !userName2.trim())
                        ? "Player names are not entered. Would you like AI to choose random names for both players?"
                        : (!userName.trim() && userName2.trim())
                        ? "Player 1 name is not entered. Would you like AI to choose a random name for Player 1?"
                        : (userName.trim() && !userName2.trim())
                        ? "Player 2 name is not entered. Would you like AI to choose a random name for Player 2?"
                        : "Would you like AI to choose random names?"
                      : "Name is not entered. Would you like AI to choose a random name for you?"
                    }
                  </p>
                  
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Generate AI names only for missing ones
                        if (gameMode === "pvp") {
                          if (!userName.trim()) {
                            getRandomFunnyName(1);
                          }
                          if (!userName2.trim()) {
                            getRandomFunnyName(2);
                          }
                        } else {
                          if (!userName.trim()) {
                            getRandomFunnyName(1);
                          }
                        }
                        setShowNameValidationPopup(false);
                        setPendingGameStart(false);
                        // Start game after a short delay to let names populate
                        setTimeout(() => {
                          startNewGame();
                        }, 100);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
                    >
                      Yes, Choose Names
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowNameValidationPopup(false);
                        setPendingGameStart(false);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
                    >
                      {"No, I'll Enter Names"}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 3: Game Board Screen */}
          {gameStarted && (
            <motion.div key="game-board" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              {/* Mobile landscape: gentle hint */}
              <p className="mb-3 hidden text-center text-xs text-amber-200/90 max-md:landscape:block">
                Tip: portrait mode gives a roomier board on phones.
              </p>

              {/* Scoreboard */}
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

              {boardSize !== "3x3" && (
                <p className="mb-4 text-center text-xs text-white/50 sm:text-sm">{BOARD_RULE_LINE[boardSize]}</p>
              )}

              {/* Status Indicator */}
              <div className="text-xl sm:text-2xl text-center font-bold text-white mb-2 min-h-8 flex items-center justify-center gap-2 drop-shadow-md">
                {getGameStatus()}
                {isAIThinking && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Brain className="w-5 h-5 text-blue-400" /></motion.div>}
              </div>

              {gameStarted &&
                !winner &&
                !isDraw &&
                !isAIThinking &&
                board.every((c) => c === null) && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-cyan-100/95 sm:text-base"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200 sm:text-sm">
                      Your move
                    </span>
                    <span>
                      Tap any empty square on the board to place{" "}
                      <span className="font-bold text-white">{currentPlayer}</span>.
                    </span>
                  </motion.p>
                )}

              {(winner || isDraw) && (
                <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center backdrop-blur-md">
                  {gameMode === "pve" && (
                    <p className="text-sm text-white/90 sm:text-base">
                      {isDraw
                        ? "Stalemate — solid play on both sides. Good game."
                        : winner === "X"
                          ? "Nice win! Fancy another round?"
                          : "Good game. Ready for a rematch?"}
                    </p>
                  )}
                  {gameMode === "pvp" && (
                    <p className="text-sm text-white/90 sm:text-base">
                      {isDraw ? "Draw — even match." : `Round to ${winner === "X" ? userName || "Player 1" : userName2 || "Player 2"}. Play again?`}
                    </p>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => resetGame()}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  >
                    Rematch
                  </motion.button>
                </div>
              )}

              {/* Tournament Finished Prompt - commented out for future release */}
              {/* {tournamentFinished && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                >
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <h3 className="font-bold text-lg text-white">Tournament Complete!</h3>
                    </div>
                    <p className="text-sm text-white/80">
                      {tournamentFormat === 'best-of-3' ? 'Best of 3' : 'Best of 5'} Tournament Finished
                    </p>
                    <div className="flex justify-center gap-4 text-sm text-white/90">
                      <span className="text-purple-300">X: {tournamentScores.X}</span>
                      <span className="text-blue-300">O: {tournamentScores.O}</span>
                    </div>
                    <button
                      onClick={resetTournament}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:scale-105 transition-transform shadow-lg"
                    >
                      Start New Tournament
                    </button>
                  </div>
                </motion.div>
              )} */}

              {/* Dynamic Game Board */}
              <div className="mb-12 max-w-[1200px] mx-auto">
                {/* Game Layout with Left Sidebar */}
                <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
                  {/* Game actions — horizontal on small screens, column beside board on sm+ */}
                  <div className="flex flex-row justify-center gap-3 sm:flex-col sm:justify-start">
                    <motion.button 
                      onClick={resetGame}
                      whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white font-medium flex items-center gap-2 shadow-lg border border-white/10 backdrop-blur-sm transition-all duration-200"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset Game
                    </motion.button>
                    <motion.button 
                      onClick={() => {
                        setSetupStep("mode");
                        setGameStarted(false);
                        resetScores();
                      }}
                      whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 text-white font-medium flex items-center gap-2 shadow-lg border border-white/10 backdrop-blur-sm transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Quit Game
                    </motion.button>
                  </div>
                  
                  {/* Center - Game Board */}
                  <div className={`p-2 sm:p-4 max-w-[1000px] ${
                    boardSize === '3x3' ? 'grid grid-cols-3 gap-3 sm:gap-4' :
                    boardSize === '4x4' ? 'grid grid-cols-4 gap-2.5 sm:gap-4 md:gap-5' :
                    boardSize === '5x5' ? 'grid grid-cols-5 gap-2 sm:gap-3' :
                    'grid grid-cols-3 gap-3 sm:gap-4'
                  }`}>
                    {board.map((cell, index) => {
                      const isWinningCell = winningLine.includes(index);
                      
                      return (
                        <motion.button
                          key={index}
                          type="button"
                          aria-label={
                            cell
                              ? `Board square ${index + 1}, ${cell}`
                              : `Board square ${index + 1}, empty`
                          }
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: cell ? 1 : 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                          whileTap={{ scale: cell ? 1 : 0.95 }}
                          onClick={() => handleCellClick(index)}
                          disabled={cell !== null || winner !== null || isAIThinking}
                          className={`${
                            boardSize === "5x5"
                              ? "min-h-[3rem] min-w-[3rem] h-[min(17vw,5.25rem)] w-[min(17vw,5.25rem)] sm:min-h-[3.5rem] sm:min-w-[3.5rem] sm:h-24 sm:w-24 md:h-[6.75rem] md:w-[6.75rem]"
                              : boardSize === "4x4"
                                ? "min-h-[2.875rem] min-w-[2.875rem] h-[min(18vw,5.75rem)] w-[min(18vw,5.75rem)] sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
                                : "h-20 w-20 min-h-[5rem] min-w-[5rem] sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
                          } rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold relative overflow-hidden shrink-0 ${
                            isWinningCell 
                              ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400 shadow-lg shadow-yellow-500/40 ring-2 ring-yellow-400/50' 
                              : boardStyle === 'default' 
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm'
                                : boardStyle === 'neon'
                                ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] backdrop-blur-md'
                                : boardStyle === 'wood'
                                ? 'bg-gradient-to-br from-amber-700/50 to-amber-900/50 border-4 border-amber-800/70 shadow-xl hover:shadow-2xl'
                                : boardStyle === 'metal'
                                ? 'bg-gradient-to-br from-gray-400/30 to-gray-600/30 border-2 border-gray-500/50 shadow-2xl hover:shadow-3xl'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm'
                          } ${cell ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {cell && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                              className={`relative ${
                                boardStyle === 'default' 
                                  ? cell === "X" ? "text-purple-400" : "text-blue-400"
                                  : boardStyle === 'neon'
                                  ? cell === "X" ? "text-pink-400" : "text-cyan-400"
                                  : boardStyle === 'wood'
                                  ? cell === "X" ? "text-yellow-300" : "text-orange-300"
                                  : boardStyle === 'metal'
                                  ? cell === "X" ? "text-gray-300" : "text-gray-100"
                                  : cell === "X" ? "text-purple-400" : "text-blue-400"
                              }`}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                              >
                                {cell === "X" ? (
                                  <X className={`${
                                    boardSize === '3x3' ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24' :
                                    boardSize === '4x4' ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16' :
                                    boardSize === '5x5' ? 'w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16' :
                                    'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16'
                                  }`} />
                                ) : (
                                  <Circle className={`${
                                    boardSize === '3x3' ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24' :
                                    boardSize === '4x4' ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16' :
                                    boardSize === '5x5' ? 'w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16' :
                                    'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16'
                                  }`} />
                                )}
                              </motion.div>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 2 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`absolute inset-0 rounded-full blur-xl ${
                                  boardStyle === 'default' 
                                    ? cell === "X" ? "bg-purple-400/20" : "bg-blue-400/20"
                                    : boardStyle === 'neon'
                                    ? cell === "X" ? "bg-pink-400/30" : "bg-cyan-400/30"
                                    : boardStyle === 'wood'
                                    ? cell === "X" ? "bg-yellow-300/20" : "bg-orange-300/20"
                                    : boardStyle === 'metal'
                                    ? cell === "X" ? "bg-gray-300/15" : "bg-gray-100/15"
                                    : cell === "X" ? "bg-purple-400/20" : "bg-blue-400/20"
                                }`}
                              />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </main>

        <aside
          className="relative flex w-full shrink-0 flex-col border-t border-white/10 bg-gradient-to-b from-zinc-950/98 via-black/90 to-black/95 backdrop-blur-2xl lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:w-[min(20rem,92vw)] xl:w-80 lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:border-white/10 lg:shadow-[inset_1px_0_0_rgba(255,255,255,0.06)]"
          aria-label="Game settings"
        >
          <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-6">
            <div className="relative border-b border-white/10 pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 shadow-inner">
                  <Settings className="h-5 w-5 text-violet-300" aria-hidden />
                </div>
                <div>
                  <h2 className={`text-base font-bold tracking-tight sm:text-lg ${colorThemes[colorTheme].text}`}>
                    Settings
                  </h2>
                  <p className="mt-1 text-xs leading-snug text-white/50">
                    Tune the match, sound, and board look. Changes apply as you tap.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-black/35 p-1.5 shadow-inner">
              {(
                [
                  { id: "game" as const, label: "Game", Icon: SlidersHorizontal },
                  { id: "audio" as const, label: "Sound", Icon: Volume2 },
                  { id: "appearance" as const, label: "Board", Icon: Palette },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSettingsTab(id)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-[0.65rem] font-semibold uppercase tracking-wide transition-all sm:text-xs ${
                    settingsTab === id
                      ? "bg-gradient-to-br from-blue-600/90 to-purple-600/90 text-white shadow-lg ring-1 ring-white/20"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 opacity-90 sm:h-[1.125rem] sm:w-[1.125rem]" aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 space-y-1">
              {settingsTab === "game" && (
                <div className="space-y-5">
                  <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg">
                    <label className={`mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider ${colorThemes[colorTheme].labelColor}`}>
                      Board size
                    </label>
                    <p className="mb-3 text-xs text-white/45">Resets the current round when changed.</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(boardConfigs) as BoardSize[]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          aria-label={`Set board size to ${size} (resets round)`}
                          onClick={() => changeBoardSize(size)}
                          className={`min-h-[48px] rounded-xl py-3 text-sm font-semibold capitalize transition-all active:scale-[0.98] ${
                            boardSize === size
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md ring-2 ring-white/25"
                              : `${colorThemes[colorTheme].buttonBg} ${colorThemes[colorTheme].buttonText} ${colorThemes[colorTheme].buttonHover} border border-white/10`
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 rounded-lg bg-amber-500/10 px-2 py-2 text-[0.7rem] leading-snug text-amber-100/90 ring-1 ring-amber-500/20">
                      {BOARD_RULE_LINE[boardSize]}
                    </p>
                  </section>

                  {gameMode === "pve" && (
                    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg">
                      <label className={`mb-3 block text-[0.7rem] font-semibold uppercase tracking-wider ${colorThemes[colorTheme].labelColor}`}>
                        AI difficulty
                      </label>
                      <div className="flex flex-col gap-2">
                        {(["easy", "medium", "grandmaster"] as Difficulty[]).map((level) => (
                          <button
                            key={level}
                            type="button"
                            aria-label={`Set AI difficulty to ${level} (resets round)`}
                            onClick={() => {
                              setDifficulty(level);
                              generateAIName();
                              resetGame();
                            }}
                            className={`rounded-xl border px-3 py-3 text-left transition-all active:scale-[0.99] ${
                              difficulty === level
                                ? "border-purple-400/80 bg-purple-500/25 text-white shadow-md ring-1 ring-purple-400/40"
                                : "border-white/10 bg-white/[0.06] text-white/90 hover:border-white/20 hover:bg-white/10"
                            }`}
                          >
                            <span className="font-semibold capitalize">{level}</span>
                            <span className="mt-1 block text-xs leading-snug text-white/55">{DIFFICULTY_HELP[level]}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  <button
                    type="button"
                    onClick={() => resetScores()}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.07] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/12 active:scale-[0.99]"
                  >
                    Reset match scores
                  </button>
                </div>
              )}

              {settingsTab === "audio" && (
                <div className="space-y-3">
                  <p className="text-xs text-white/45">Tap a row to toggle.</p>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.99] ${
                      soundEnabled ? "border-emerald-500/45 bg-emerald-500/12 shadow-md ring-1 ring-emerald-500/25" : "border-white/10 bg-white/[0.05] hover:border-white/15"
                    }`}
                  >
                    <span className="flex items-center gap-3 font-medium text-white">
                      {soundEnabled ? <Volume2 className="h-5 w-5 shrink-0 text-emerald-300" /> : <VolumeX className="h-5 w-5 shrink-0 text-white/50" />}
                      <span>
                        <span className="block">Move &amp; UI sounds</span>
                        <span className="text-xs font-normal text-white/45">Clicks and move feedback</span>
                      </span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${soundEnabled ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/50"}`}>
                      {soundEnabled ? "On" : "Off"}
                    </span>
                  </button>
                </div>
              )}

              {settingsTab === "appearance" && (
                <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg">
                  <label className={`mb-3 block text-[0.7rem] font-semibold uppercase tracking-wider ${colorThemes[colorTheme].labelColor}`}>
                    Board style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(boardStyles) as BoardStyle[]).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setBoardStyle(style)}
                        className={`min-h-[48px] rounded-xl px-2 py-3 text-sm font-semibold capitalize transition-all active:scale-[0.98] ${
                          boardStyle === style
                            ? style === "neon"
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md ring-2 ring-white/25"
                              : style === "wood"
                                ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-md ring-2 ring-white/20"
                                : style === "metal"
                                  ? "bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-md ring-2 ring-white/20"
                                  : "border-2 border-white/45 bg-white/15 text-white shadow-md"
                            : `${colorThemes[colorTheme].buttonBg} ${colorThemes[colorTheme].buttonText} ${colorThemes[colorTheme].buttonHover} border border-white/10`
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </aside>
      </div>

        {/* Winner Celebration Overlay */}
        <AnimatePresence>
          {showWinnerCelebration && winner && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.5 }} 
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999] bg-black/70 backdrop-blur-md"
            >
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 0.6, repeat: 3 }} 
                  className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl"
                >
                  WINNER!
                </motion.div>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                  className="absolute -top-8 -right-8 text-4xl"
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <div className="text-center mt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {winner === 'X' 
                      ? `${userName || 'Player 1'} Wins!`
                      : gameMode === 'pvp' 
                        ? `${userName2 || 'Player 2'} Wins!`
                        : `${aiName || 'AI'} Wins!`
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default TicTacToe;