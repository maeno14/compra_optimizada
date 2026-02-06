import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import ProductsSearch from './products-search'
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest'
import React from 'react'
import '@testing-library/jest-dom'
import { MeiliSearch } from 'meilisearch'

// Mock AutoSizer to avoid JSDOM/Vite issues and ensure dimensions
vi.mock('react-virtualized-auto-sizer', () => {
  const AutoSizer = ({ children }: any) => children({ height: 600, width: 800 });
  return { default: AutoSizer };
})

// Mock react-window to avoid ESM/CJS issues and simulate virtualization
vi.mock('react-window', () => {
  const FixedSizeList = ({ children, itemCount, height, width, itemSize }: any) => {
    // Simulate virtualization: render only first 20 items
    const visibleItemCount = Math.min(itemCount, 20);
    return (
      <div style={{ height, width, overflow: 'auto' }}>
        {Array.from({ length: visibleItemCount }).map((_, index) => (
          <div key={index} style={{ height: itemSize }}>
            {children({ index, style: { height: itemSize, top: index * itemSize } })}
          </div>
        ))}
      </div>
    );
  };
  return { FixedSizeList };
})

const { searchMock, clientMock } = vi.hoisted(() => {
  const searchMock = vi.fn().mockResolvedValue({
    hits: Array.from({ length: 5000 }, (_, i) => ({
      id: i,
      marca: `Marca ${i}`,
      nombre: `Producto ${i}`,
      category: `Categoria ${i}`,
      precio_descuento: `$${i}`,
      url: `http://example.com/${i}`,
      precio_por: `$${i}/u`,
    })),
  });
>>>>>>> upstream/main
  const indexMock = { search: searchMock };
  const clientMock = { index: vi.fn().mockReturnValue(indexMock) };
  return { searchMock, clientMock };
});

vi.mock('meilisearch', () => {
  return {
    MeiliSearch: vi.fn(function () { return clientMock })
  }
})

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
  }
})
describe('ProductsSearch Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders large list of products', async () => {
    const { container } = render(<ProductsSearch />)

    const input = screen.getByPlaceholderText('Escribi para buscar productos a precios competitivos')

    const start = performance.now()

    fireEvent.change(input, { target: { value: 'test' } })

    // Wait for the results to be updated.
    await waitFor(() => {
      expect(screen.getByText('Se obtuvo 5000 productos')).toBeInTheDocument()
    }, { timeout: 10000 }) // Give it enough time to render the slow list

    const end = performance.now()
    console.log(`Render time for 5000 items: ${end - start}ms`)
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
