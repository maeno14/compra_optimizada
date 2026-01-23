import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import ProductsSearch from './products-search'
import { vi, describe, it, expect, beforeAll } from 'vitest'
import React from 'react'
import '@testing-library/jest-dom'

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

// Mock MeiliSearch
vi.mock('meilisearch', () => {
  return {
    MeiliSearch: class {
      constructor() {}
      index() {
        return {
          search: vi.fn().mockResolvedValue({
            hits: Array.from({ length: 5000 }, (_, i) => ({
              id: i,
              marca: `Marca ${i}`,
              nombre: `Producto ${i}`,
              category: `Categoria ${i}`,
              precio_descuento: `$${i}`,
              url: `http://example.com/${i}`,
              precio_por: `$${i}/u`,
            })),
          }),
        }
      }
    },
  }
})

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('ProductsSearch Performance', () => {
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
})
