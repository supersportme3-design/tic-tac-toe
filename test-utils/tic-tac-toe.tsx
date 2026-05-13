import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TicTacToe from "../components/tic-tac-toe";

export const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn(),
    frequency: { value: 0, setTargetAtTime: jest.fn() },
    type: "sine",
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 0 },
  })),
  destination: {},
  currentTime: 0,
  state: "running",
  close: jest.fn().mockResolvedValue(undefined),
};

export const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  speaking: false,
  pending: false,
  paused: false,
};

export function installWindowMocks() {
  Object.defineProperty(window, "AudioContext", {
    writable: true,
    configurable: true,
    value: jest.fn(() => mockAudioContext),
  });
  Object.defineProperty(window, "speechSynthesis", {
    writable: true,
    configurable: true,
    value: mockSpeechSynthesis,
  });
  if (typeof (window as unknown as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance === "undefined") {
    class SpeechSynthesisUtteranceMock {
      rate = 1;
      pitch = 1;
      volume = 1;
      constructor(public text: string) {}
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      writable: true,
      configurable: true,
      value: SpeechSynthesisUtteranceMock,
    });
  }
}

export function renderTicTacToe() {
  installWindowMocks();
  return render(<TicTacToe />);
}

/** Wizard: Human vs Human → 3×3 → names → Play */
export async function startPvpGame(user1 = "Alice", user2 = "Bob") {
  fireEvent.click(screen.getByRole("button", { name: /Human vs Human/i }));
  fireEvent.click(await screen.findByRole("button", { name: /Choose 3x3 for this game/i }));
  await screen.findByPlaceholderText("Enter your name...");
  fireEvent.change(screen.getByPlaceholderText("Enter your name..."), {
    target: { value: user1 },
  });
  fireEvent.change(screen.getByPlaceholderText("Player 2..."), {
    target: { value: user2 },
  });
  fireEvent.click(screen.getByRole("button", { name: /^Play$/ }));
  await screen.findByRole("button", { name: /Reset Game/i });
}

/** Wizard: Human vs AI → 3×3 → easy → name → Play */
export async function startPveGame(user = "Alice") {
  fireEvent.click(screen.getByRole("button", { name: /Human vs AI/i }));
  fireEvent.click(await screen.findByRole("button", { name: /Choose 3x3 for this game/i }));
  fireEvent.click(await screen.findByRole("button", { name: /Choose easy AI difficulty for this game/i }));
  await screen.findByPlaceholderText("Enter your name...");
  fireEvent.change(screen.getByPlaceholderText("Enter your name..."), {
    target: { value: user },
  });
  fireEvent.click(screen.getByRole("button", { name: /^Play$/ }));
  await screen.findByRole("button", { name: /Reset Game/i });
}

export function openSettings() {
  fireEvent.click(screen.getByRole("button", { name: /^game$/i }));
}

export function getBoardCells(): HTMLElement[] {
  return screen.getAllByRole("button", { name: /Board square \d+/i });
}

export async function expectAudioContextCreated() {
  await waitFor(() => {
    expect(window.AudioContext).toHaveBeenCalled();
  });
}
