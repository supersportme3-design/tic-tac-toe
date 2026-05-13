import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  renderTicTacToe,
  startPvpGame,
  startPveGame,
  openSettings,
  getBoardCells,
  expectAudioContextCreated,
} from "../test-utils/tic-tac-toe";

function cellHasMark(cell: HTMLElement) {
  return Boolean(cell.querySelector("svg"));
}

describe("TicTacToe Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("renders without crashing", () => {
      renderTicTacToe();
      expect(screen.getByRole("heading", { name: /tic tac toe/i })).toBeInTheDocument();
    });

    test("shows game mode selection initially", () => {
      renderTicTacToe();
      expect(
        screen.getByRole("button", { name: /Human vs Human/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Human vs AI/i }),
      ).toBeInTheDocument();
    });

    test("opens settings sheet from control", async () => {
      renderTicTacToe();
      openSettings();
      expect(await screen.findByRole("heading", { name: /^Settings$/ })).toBeInTheDocument();
      expect(screen.getByText("Board size")).toBeInTheDocument();
    });
  });

  describe("Game Mode Selection", () => {
    test("PvP wizard reaches name step with turn indicator after Play", async () => {
      renderTicTacToe();
      await startPvpGame("Pat", "Sam");
      await waitFor(() => {
        expect(screen.getByText(/Pat.*Turn|Pat's Turn/i)).toBeInTheDocument();
      });
    });

    test("PvE wizard reaches game with your turn", async () => {
      renderTicTacToe();
      await startPveGame("Alex");
      await waitFor(() => {
        expect(screen.getByText(/Alex.*Turn|Your Turn/i)).toBeInTheDocument();
      });
    });

    test("shows name inputs on name step", async () => {
      renderTicTacToe();
      fireEvent.click(screen.getByRole("button", { name: /Human vs Human/i }));
      fireEvent.click(await screen.findByRole("button", { name: /Choose 3x3 for this game/i }));
      expect(await screen.findByPlaceholderText("Enter your name...")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Player 2...")).toBeInTheDocument();
    });
  });

  describe("Settings sheet", () => {
    test("Game tab: can change board size (resets round)", async () => {
      renderTicTacToe();
      await startPvpGame();
      openSettings();
      await screen.findByRole("heading", { name: /^Settings$/ });
      const five = screen.getByRole("button", { name: /Set board size to 5x5/i });
      fireEvent.click(five);
      const cells = getBoardCells();
      expect(cells).toHaveLength(25);
    });

    test("Appearance tab: board styles are selectable", async () => {
      renderTicTacToe();
      openSettings();
      await screen.findByRole("heading", { name: /^Settings$/ });
      fireEvent.click(screen.getByRole("button", { name: /^Board$/i }));
      const neon = screen.getByRole("button", { name: /^neon$/i });
      fireEvent.click(neon);
      expect(neon.className.length).toBeGreaterThan(10);
    });

    test("Audio tab: sound toggle is reachable", async () => {
      renderTicTacToe();
      openSettings();
      await screen.findByRole("heading", { name: /^Settings$/ });
      fireEvent.click(screen.getByRole("button", { name: /^Sound$/i }));
      expect(screen.getByText(/Move & UI sounds|UI sounds/i)).toBeInTheDocument();
    });
  });

  describe("Game Logic", () => {
    test("can make moves on empty board", async () => {
      renderTicTacToe();
      await startPvpGame();
      const cells = getBoardCells();
      fireEvent.click(cells[0]);
      expect(cellHasMark(cells[0])).toBe(true);
    });

    test("prevents moves on occupied cells", async () => {
      renderTicTacToe();
      await startPvpGame();
      const cells = getBoardCells();
      fireEvent.click(cells[0]);
      fireEvent.click(cells[0]);
      expect(cells[0]).toBeDisabled();
    });

    test("detects winning conditions - horizontal", async () => {
      renderTicTacToe();
      await startPvpGame();
      const cells = getBoardCells();
      fireEvent.click(cells[0]);
      fireEvent.click(cells[3]);
      fireEvent.click(cells[1]);
      fireEvent.click(cells[4]);
      fireEvent.click(cells[2]);
      await waitFor(() => {
        expect(screen.getByText("WINNER!")).toBeInTheDocument();
      });
    });

    test("detects draw condition", async () => {
      renderTicTacToe();
      await startPvpGame();
      const cells = getBoardCells();
      const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
      moves.forEach((index) => {
        fireEvent.click(cells[index]);
      });
      await waitFor(() => {
        expect(screen.getByText(/It's a Draw!/i)).toBeInTheDocument();
      });
    });
  });

  describe("AI Functionality", () => {
    test("AI makes a move after player in PvE", async () => {
      renderTicTacToe();
      await startPveGame();
      const cells = getBoardCells();
      fireEvent.click(cells[0]);
      await waitFor(
        () => {
          const marks = cells.filter((c) => cellHasMark(c));
          expect(marks.length).toBeGreaterThanOrEqual(2);
        },
        { timeout: 5000 },
      );
    });

    test("AI difficulty appears in settings after PvE start", async () => {
      renderTicTacToe();
      await startPveGame();
      openSettings();
      await screen.findByRole("heading", { name: /^Settings$/ });
      expect(screen.getByText("AI difficulty")).toBeInTheDocument();
      expect(screen.getAllByText(/easy/i).length).toBeGreaterThan(0);
    });
  });

  describe("Audio Functionality", () => {
    test("AudioContext is initialized", async () => {
      renderTicTacToe();
      await expectAudioContextCreated();
    });
  });

  describe("Edge Cases", () => {
    test("handles rapid clicking on same cell", async () => {
      renderTicTacToe();
      await startPvpGame();
      const cells = getBoardCells();
      for (let i = 0; i < 5; i++) {
        fireEvent.click(cells[0]);
      }
      expect(cellHasMark(cells[0])).toBe(true);
      expect(cells[0]).toBeDisabled();
    });

    test("handles game reset during play", async () => {
      renderTicTacToe();
      await startPvpGame();
      const cells = getBoardCells();
      fireEvent.click(cells[0]);
      fireEvent.click(screen.getByRole("button", { name: /Reset Game/i }));
      expect(cellHasMark(cells[0])).toBe(false);
      expect(cells[0]).not.toBeDisabled();
    });

    test("handles quit game during play", async () => {
      renderTicTacToe();
      await startPvpGame();
      fireEvent.click(screen.getByRole("button", { name: /Quit Game/i }));
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Human vs Human/i }),
        ).toBeInTheDocument();
      });
    });

    test("changing board size during game via settings", async () => {
      renderTicTacToe();
      await startPvpGame();
      openSettings();
      await screen.findByRole("heading", { name: /^Settings$/ });
      fireEvent.click(screen.getByRole("button", { name: /Set board size to 4x4/i }));
      expect(getBoardCells()).toHaveLength(16);
    });
  });

  describe("Performance", () => {
    test("renders quickly", () => {
      const startTime = performance.now();
      renderTicTacToe();
      expect(performance.now() - startTime).toBeLessThan(2000);
    });
  });

  describe("Accessibility", () => {
    test("board cells expose names for assistive tech", async () => {
      renderTicTacToe();
      await startPvpGame();
      getBoardCells().forEach((cell) => {
        expect(cell).toHaveAccessibleName();
      });
    });

    test("keyboard focus works on first control", () => {
      renderTicTacToe();
      const gameTab = screen.getByRole("button", { name: /^game$/i });
      gameTab.focus();
      expect(document.activeElement).toBe(gameTab);
    });
  });
});
