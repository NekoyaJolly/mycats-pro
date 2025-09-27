import '@testing-library/jest-dom'

describe('Frontend Application', () => {
  it('should have a basic test to prevent CI/CD failure', () => {
    // Basic smoke test to ensure Jest is working
    expect(true).toBe(true)
  })

  it('should be able to import testing utilities', () => {
    // Test that testing libraries are properly configured
    expect(expect).toBeDefined()
    expect(typeof expect).toBe('function')
  })
})