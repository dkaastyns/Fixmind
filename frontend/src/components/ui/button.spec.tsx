import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'
import userEvent from '@testing-library/user-event'

describe('Button Component', () => {
  it('renders correctly with default styles and text', () => {
    render(<Button>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /click me/i })
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveAttribute('type', 'button')
  })

  it('triggers onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /click me/i })
    
    await userEvent.click(buttonElement)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const buttonElement = screen.getByRole('button', { name: /disabled button/i })
    expect(buttonElement).toBeDisabled()
  })
})
