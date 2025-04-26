import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface Route {
    path: string;
    changefreq?: string;
    priority?: number;
    lastmod?: string;
}


/**
 * Loads environment variables from a .env file based on the specified mode.
 * 
 * @param mode - The mode in which to load the environment variables.
 */
function loadEnv(mode: string): void {
    const envPath: string = join(process.cwd(), `.env.${mode}`);
    try {
        const envData: string = readFileSync(envPath, 'utf-8');
        const envVars: string[] = envData.split('\n');
        envVars.forEach((varLine: string) => {
            const [key, value] = varLine.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    } catch (error) {
        console.error(`Error loading ${envPath}:`, error);
    }
}

const mode: string = process.argv[2] || 'development';
const baseUrl: string = process.env.VITE_BASE_URL || '';


/**
 * These routes are static and do not change frequently
 * They are defined with their respective properties
 * such as change frequency, priority, and last modification date
 * The last modification date is set to the current date
 * you can modify the properties as per your requirements adding
 * or removing routes as needed
*/
const routes: Route[] = [
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

// These routes are dynamic and may change frequently
// They are defined with their respective properties
// such as change frequency, priority, and last modification date
const dynamicRoutes: Route[] = [
    { path: '/product/detail/{id}', priority: 0.8 },
    { path: '/shows/{id}', priority: 0.7 },
];

// Merge the static and dynamic routes
dynamicRoutes.forEach((route: Route) => {
    if (!routes.some((r: Route) => r.path === route.path)) {
        routes.push(route);
    }
});


/**
 * This function generates a sitemap in XML format
 * It takes an array of routes as input and constructs the XML
 * structure for each route
 * @param routes - An array of route objects
 * @returns The generated sitemap as a string        
 */
const generateSitemap = (routes: Route[]): string => {
    let sitemap: string = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    routes.forEach((route: Route) => {
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


/**
 * Generates the robots.txt file content.
 * 
 * @param sitemapUrl - The URL of the sitemap
 * @returns The content of the robots.txt file
 */
const generateRobotsTxt = (sitemapUrl: string): string => {
    return `User-agent: *
Disallow: /admin/
Disallow: /login/
Allow: /

Sitemap: ${sitemapUrl}
`;
};


// Generate the sitemap and robots.txt files

loadEnv(mode);

const sitemap: string = generateSitemap(routes);
writeFileSync(join('public', 'sitemap.xml'), sitemap);

const robotsTxt: string = generateRobotsTxt(`${baseUrl}/sitemap.xml`);
writeFileSync(join('public', 'robots.txt'), robotsTxt);

console.log('✔️  Sitemap and robots.txt generated successfully!');
