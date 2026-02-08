import { NextResponse } from 'next/server';
import { MeiliSearch } from 'meilisearch';
import { env } from '~/env';

const getMeiliSearchClient = () => {
  if (!env.MEILISEARCH_HOST || !env.MEILISEARCH_API_KEY) {
    return null;
  }
  return new MeiliSearch({
    host: env.MEILISEARCH_HOST,
    apiKey: env.MEILISEARCH_API_KEY,
  });
};

export async function GET(request: Request) {
  try {
    const client = getMeiliSearchClient();
    if (!client) {
      return NextResponse.json({ message: 'MeiliSearch is not configured' }, { status: 503 });
    }

    const index = client.index('productos');
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const results = await index.search(query, { limit, offset });

    return NextResponse.json(results);
  } catch (error) {
    console.error('MeiliSearch API error:', error);
    return NextResponse.json({ message: 'Search failed', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
