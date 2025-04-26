import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
function loadEnv(mode) {
    const envPath = join(process.cwd(), `.env.${mode}`);
    try {
        const envData = readFileSync(envPath, 'utf-8');
        const envVars = envData.split('\n');
        envVars.forEach((varLine) => {
            const [key, value] = varLine.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
    catch (error) {
        console.error(`Error loading ${envPath}:`, error);
    }
}
const mode = process.argv[2] || 'development';
const baseUrl = process.env.VITE_BASE_URL || '';
const routes = [
    {
        path: '/home',
        changefreq: 'weekly',
        priority: 1.0,
        lastmod: new Date().toISOString().split('T')[0],
    },
    {
        path: '/products',
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString().split('T')[0],
    },
    {
        path: '/faq',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString().split('T')[0],
    },
    {
        path: '/search/products',
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString().split('T')[0],
    }
];
const dynamicRoutes = [
    { path: '/product/detail/{id}', priority: 0.8 },
    { path: '/shows/{id}', priority: 0.7 },
];
dynamicRoutes.forEach((route) => {
    if (!routes.some((r) => r.path === route.path)) {
        routes.push(route);
    }
});
const generateSitemap = (routes) => {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
    routes.forEach((route) => {
        sitemap += `  <url>
    <loc>${baseUrl}${route.path}</loc>\n`;
        if (route.changefreq) {
            sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
        }
        if (route.priority !== undefined) {
            sitemap += `    <priority>${route.priority}</priority>\n`;
        }
        if (route.lastmod) {
            sitemap += `    <lastmod>${route.lastmod}</lastmod>\n`;
        }
        sitemap += `  </url>\n`;
    });
    sitemap += '</urlset>';
    return sitemap;
};
const generateRobotsTxt = (sitemapUrl) => {
    return `User-agent: *
Disallow: /admin/
Disallow: /login/
Allow: /

Sitemap: ${sitemapUrl}
`;
};
loadEnv(mode);
const sitemap = generateSitemap(routes);
writeFileSync(join('public', 'sitemap.xml'), sitemap);
const robotsTxt = generateRobotsTxt(`${baseUrl}/sitemap.xml`);
writeFileSync(join('public', 'robots.txt'), robotsTxt);
console.log('✔️  Sitemap and robots.txt generated successfully!');
