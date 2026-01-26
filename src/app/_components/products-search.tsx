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

export default function ProductsSearch() {
    const [searchResults, setSearchResult] = useState([])
    const client = new MeiliSearch({
    host: 'http://192.168.1.34:7700',
    apiKey: '630da5b9-9d2f-4758-bb60-a8d8c0580999',
    })
    const index = client.index('productos')
    const searchProducts = async (e) => {
        index.search(e.target.value, {limit: 20}).then((results) => {
            setSearchResult(results.hits)
        });
    };
    return (
        <div className="space-y-4">
            <Input type="text" placeholder='Escribi para buscar productos a precios competitivos' onChange={(e)=> searchProducts(e)} style={{ color: 'black' }}/>
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

