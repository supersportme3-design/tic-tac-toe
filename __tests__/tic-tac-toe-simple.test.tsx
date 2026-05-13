import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TicTacToe from "../components/tic-tac-toe";
import {
  installWindowMocks,
  renderTicTacToe,
  startPvpGame,
  openSettings,
  getBoardCells,
  expectAudioContextCreated,
} from "../test-utils/tic-tac-toe";

describe("TicTacToe Component - Core Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    renderTicTacToe();
    expect(screen.getByRole("heading", { name: /tic tac toe/i })).toBeInTheDocument();
  });

  test("can select game modes from wizard", () => {
    renderTicTacToe();
    expect(
      screen.getByRole("button", { name: /Human vs Human/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Human vs AI/i }),
    ).toBeInTheDocument();
  });

  test("settings sheet exposes appearance and board styles", async () => {
    renderTicTacToe();
    openSettings();
    await screen.findByRole("heading", { name: /^Settings$/ });
    fireEvent.click(screen.getByRole("button", { name: /^Board$/i }));
    expect(screen.getByRole("button", { name: /^default$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^neon$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^wood$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^metal$/i })).toBeInTheDocument();
  });

  test("quick play starts Human vs AI medium 3x3 without wizard", async () => {
    renderTicTacToe();
    fireEvent.click(screen.getByRole("button", { name: /Quick play/i }));
    await screen.findByRole("button", { name: /Reset Game/i });
    expect(getBoardCells()).toHaveLength(9);
  });

  test("wizard exposes board sizes on step 2", async () => {
    renderTicTacToe();
    fireEvent.click(screen.getByRole("button", { name: /Human vs Human/i }));
    expect(await screen.findByRole("button", { name: /Choose 3x3 for this game/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Choose 4x4 for this game/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Choose 5x5 for this game/i })).toBeInTheDocument();
  });

  test("audio controls live in settings", async () => {
    renderTicTacToe();
    openSettings();
    await screen.findByRole("heading", { name: /^Settings$/ });
    fireEvent.click(screen.getByRole("button", { name: /^Sound$/i }));
    expect(screen.getByText(/Move & UI sounds|UI sounds/i)).toBeInTheDocument();
  });

  test("AudioContext initialization runs", async () => {
    renderTicTacToe();
    await expectAudioContextCreated();
  });

  test("handles missing AudioContext gracefully", () => {
    installWindowMocks();
    const prev = window.AudioContext;
    Object.defineProperty(window, "AudioContext", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    expect(() => render(<TicTacToe />)).not.toThrow();
    Object.defineProperty(window, "AudioContext", {
      value: prev,
      writable: true,
      configurable: true,
    });
  });

  test("handles missing speech synthesis gracefully", () => {
    installWindowMocks();
    const prev = window.speechSynthesis;
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    expect(() => render(<TicTacToe />)).not.toThrow();
    Object.defineProperty(window, "speechSynthesis", {
      value: prev,
      writable: true,
      configurable: true,
    });
  });
});

describe("TicTacToe Component - Edge Cases", () => {
  test("handles multiple rapid clicks on same button", () => {
    renderTicTacToe();
    const gameTab = screen.getByRole("button", { name: /^game$/i });
    for (let j = 0; j < 10; j++) {
      fireEvent.click(gameTab);
    }
    expect(gameTab).toBeInTheDocument();
  });

  test("handles keyboard navigation", () => {
    renderTicTacToe();
    const gameTab = screen.getByRole("button", { name: /^game$/i });
    gameTab.focus();
    expect(document.activeElement).toBe(gameTab);
  });

  test("performance test - renders quickly", () => {
    const startTime = performance.now();
    renderTicTacToe();
    expect(performance.now() - startTime).toBeLessThan(2000);
  });

  test("handles window resize gracefully", async () => {
    renderTicTacToe();
    window.dispatchEvent(new Event("resize"));
    expect(
      screen.getByRole("heading", { name: /tic tac toe/i }),
    ).toBeInTheDocument();
  });

  test("handles focus and blur events", () => {
    renderTicTacToe();
    const firstButton = screen.getAllByRole("button")[0];
    fireEvent.focus(firstButton);
    fireEvent.blur(firstButton);
    expect(firstButton).toBeInTheDocument();
  });

  test("full PvP board has nine playable cells after start", async () => {
    renderTicTacToe();
    await startPvpGame();
    expect(getBoardCells()).toHaveLength(9);
  });
});
