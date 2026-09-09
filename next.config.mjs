/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    
    // Add this to handle pdfmake in webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      net: false,
      tls: false,
    };
    
    // Handle font files as static assets - excluding problematic Verida font
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      exclude: /node_modules\/@verida\/account-web-vault\/dist\/assets\/fonts\/Sora-Regular\.ttf$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name].[hash][ext]',
      },
    });
    
    // Specifically handle the problematic Verida font file
    config.module.rules.push({
      test: /node_modules\/@verida\/account-web-vault\/dist\/assets\/fonts\/Sora-Regular\.ttf$/,
      use: 'null-loader',
    });
    
    // Also add a rule to prevent importing the font in JS files
    config.module.rules.push({
      test: /\.js$/,
      include: [/node_modules\/@verida\/account-web-vault\/dist/],
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /import.*?from.*?['"]\.\/assets\/fonts\/Sora-Regular\.ttf['"].*?;/g,
          replace: '/* Font import removed */',
        },
      },
    });
    
    // Handle native modules
    if (isServer) {
      config.externals = [
        ...config.externals,
        { '@verida/account-web-vault': 'commonjs @verida/account-web-vault' },
        { '@verida/client-ts': 'commonjs @verida/client-ts' },
        { '@verida/types': 'commonjs @verida/types' }
      ]
    }
    
    return config
  },
  
  // Add image domains configuration
  images: {
    domains: ['i.pravatar.cc'], // Add the pravatar domain for profile images
  },

  // Add transpilePackages to ensure proper handling of Verida packages
  transpilePackages: [
    '@verida/account-web-vault',
    '@verida/client-ts',
    '@verida/types'
  ]
}


export default nextConfig;