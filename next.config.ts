import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    typescript: {
        tsconfigPath: 'tsconfig.next.json',
    },
    turbopack: {
        root: path.join(__dirname),
    },
};

export default nextConfig;
