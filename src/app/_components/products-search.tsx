"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Input } from '~/components/ui/input';

const SEARCH_LIMIT = 50;

// Simple debounce function
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}


export default function ProductsSearch() {
    const [searchResults, setSearchResult] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");

    const observer = useRef();
    const lastProductElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreProducts();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchProducts = async (currentQuery, currentOffset) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/search?query=${currentQuery}&limit=${SEARCH_LIMIT}&offset=${currentOffset}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const results = await response.json();

            if (currentOffset === 0) {
                setSearchResult(results.hits);
            } else {
                setSearchResult(prevResults => [...prevResults, ...results.hits]);
            }

            setHasMore(results.hits.length === SEARCH_LIMIT);
            setOffset(currentOffset + results.hits.length);

        } catch (err) {
            setError('Failed to fetch products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = (newQuery) => {
        setQuery(newQuery);
        setSearchResult([]);
        setOffset(0);
        setHasMore(true);
        fetchProducts(newQuery, 0);
    };

    const loadMoreProducts = () => {
        if (!hasMore || loading) return;
        fetchProducts(query, offset);
    };

    const debouncedSearch = useCallback(debounce(searchProducts, 300), []);

    const handleInputChange = (e) => {
        debouncedSearch(e.target.value);
    }

    return (
        <div className="space-y-4">
            <Input type="text" placeholder='Escribi para buscar productos a precios competitivos' onChange={handleInputChange} style={{ color: 'black' }} />
            {error && <p className="text-red-500">{error}</p>}
            <div className="space-y-4">
                <div>
                    <p>Se obtuvo {searchResults.length} productos</p>
                </div>
                {searchResults.map((product, index) => {
                    const isLastElement = searchResults.length === index + 1;
                    return (
                        <div key={product.id} ref={isLastElement ? lastProductElementRef : null}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{product.marca} - {product.nombre}</CardTitle>
                                    <CardDescription>Categoria: {product.category}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Precio: {product.precio_descuento}</p>
                                    <p>Stock: {product.url}</p>
                                </CardContent>
                                <CardFooter>
                                    <p>Precio por unidad: {product.precio_por}</p>
                                </CardFooter>
                            </Card>
                        </div>
                    );
                })}
                 {loading && <p>Loading...</p>}
                 {!hasMore && searchResults.length > 0 && <p>You've reached the end of the results.</p>}
            </div>
        </div>
    );
}