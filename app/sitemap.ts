import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 1. Static Routes
    const routes = [
        '',
        '/series',
        '/lists',
        '/groups',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // 2. Fetch Series for Dynamic Routes
    const { data: series } = await supabase
        .from('series')
        .select('id, updated_at')
        .limit(1000); // Limit for sitemap per page

    const seriesRoutes = series?.map((s) => ({
        url: `${baseUrl}/series/${s.id}`,
        lastModified: new Date(s.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    })) || [];

    return [...routes, ...seriesRoutes];
}
