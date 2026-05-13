import '@testing-library/jest-dom'

// Mock Web Audio API
class MockAudioContext {
  createOscillator() {
    return {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      frequency: { 
        value: 0,
        setTargetAtTime: jest.fn()
      },
      type: 'sine'
    }
  }

  createGain() {
    return {
      connect: jest.fn(),
      gain: { value: 0 }
    }
  }

  destination = {}
  state = 'running'
}

// Mock Speech Synthesis
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  speaking: false,
  pending: false,
  paused: false
}

// Setup global mocks
global.AudioContext = MockAudioContext
global.speechSynthesis = mockSpeechSynthesis

// Mock window object
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext
})

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis
})

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now())
  }
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
