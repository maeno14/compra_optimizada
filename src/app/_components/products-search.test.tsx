import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MeiliSearch } from 'meilisearch'
import ProductsSearch from './products-search'
import React from 'react'

const { searchMock, clientMock } = vi.hoisted(() => {
  const searchMock = vi.fn().mockResolvedValue({ hits: [] });
  const indexMock = { search: searchMock };
  const clientMock = { index: vi.fn().mockReturnValue(indexMock) };
  return { searchMock, clientMock };
});

vi.mock('meilisearch', () => {
  return {
    MeiliSearch: vi.fn(function() { return clientMock })
  }
})

describe('ProductsSearch Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls search API only once with debounce', async () => {
    vi.useFakeTimers()
    render(<ProductsSearch />)

    const input = screen.getByPlaceholderText('Escribi para buscar productos a precios competitivos')

    // Simulate typing "test"
    fireEvent.change(input, { target: { value: 't' } })
    fireEvent.change(input, { target: { value: 'te' } })
    fireEvent.change(input, { target: { value: 'tes' } })
    fireEvent.change(input, { target: { value: 'test' } })

    // Should not be called immediately
    expect(searchMock).not.toHaveBeenCalled()

    // Advance time by 300ms
    vi.advanceTimersByTime(300)

    // Should be called once
    expect(searchMock).toHaveBeenCalledTimes(1)
    expect(searchMock).toHaveBeenCalledWith('test', expect.anything())

    vi.useRealTimers()
  })

  it('does NOT instantiate MeiliSearch on render', () => {
    const { rerender } = render(<ProductsSearch />)

    // Should be 0 because instantiation happens at module load, which is before clearAllMocks (in beforeEach)
    // If it was inside the component, it would be 1 here.
    expect(MeiliSearch).toHaveBeenCalledTimes(0)

    rerender(<ProductsSearch />)

    expect(MeiliSearch).toHaveBeenCalledTimes(0)
  })
})
