import { NextResponse } from 'next/server';
import { MeiliSearch } from 'meilisearch';
import { env } from '~/env';

const client = new MeiliSearch({
  host: env.MEILISEARCH_HOST,
  apiKey: env.MEILISEARCH_API_KEY,
});

const index = client.index('productos');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const results = await index.search(query, { limit, offset });

    return NextResponse.json(results);
  } catch (error) {
    console.error('MeiliSearch API error:', error);
    return NextResponse.json({ message: 'Search failed', error }, { status: 500 });
  }
}
