"use client"
import { MeiliSearch } from 'meilisearch'
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "~/components/ui/card"
import { Input } from '~/components/ui/input';

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
    const index = client.index<Product>('productos')
    const searchProducts = useDebouncedCallback(async (value: string) => {
        const results = await index.search(value, { limit: 10000 });
        setSearchResult(results.hits)
    }, 300);

    return (
        <div className="space-y-4">
            <Input type="text" placeholder='Escribi para buscar productos a precios competitivos' onChange={(e)=> searchProducts(e.target.value)} style={{ color: 'black' }}/>
            <div className="space-y-4">
                <div>
                    <p>Se obtuvo {searchResults.length} productos</p>
                </div>
                {searchResults.map((product) => {
                    return ( 
                        <div key={product.id}>
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
                    )
                })}
            </div>
        </div>
    );
}

