"use client"
import { MeiliSearch } from 'meilisearch'
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "~/components/ui/card"
import { Input } from '~/components/ui/input';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useDebouncedCallback } from 'use-debounce';

interface Product {
    id: string | number;
    marca: string;
    nombre: string;
    category: string;
    precio_descuento: number | string;
    url: string;
    precio_por: string | number;
}

export default function ProductsSearch() {
    const [searchResults, setSearchResult] = useState<Product[]>([])
    const client = new MeiliSearch({
        host: 'http://192.168.1.34:7700',
        apiKey: '630da5b9-9d2f-4758-bb60-a8d8c0580999',
    })
    const index = client.index('productos')

    const searchProducts = useDebouncedCallback((value: string) => {
        index.search(value, {limit: 10000}).then((results) => {
            setSearchResult(results.hits as unknown as Product[])
        });
    }, 300);

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const product = searchResults[index];
        if (!product) return null;

        return (
            <div style={style}>
                <div className="h-[95%] w-full pr-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="truncate">{product.marca} - {product.nombre}</CardTitle>
                            <CardDescription>Categoria: {product.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Precio: {product.precio_descuento}</p>
                            <p className="truncate">Stock: {product.url}</p>
                        </CardContent>
                        <CardFooter>
                            <p>Precio por unidad: {product.precio_por}</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <Input
                type="text"
                placeholder='Escribi para buscar productos a precios competitivos'
                onChange={(e)=> searchProducts(e.target.value)}
                style={{ color: 'black' }}
            />
            <div className="space-y-4">
                <div>
                    <p>Se obtuvo {searchResults.length} productos</p>
                </div>
                <div style={{ height: '600px' }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                height={height}
                                itemCount={searchResults.length}
                                itemSize={250}
                                width={width}
                            >
                                {Row}
                            </List>
                        )}
                    </AutoSizer>
                </div>
            </div>
        </div>
    );
}
