const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CspHtmlWebpackPlugin = require("csp-html-webpack-plugin");
// const BundleAnalyzerPlugin =
//   require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const HtmlMinifierTerser = require("html-minifier-terser");

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyJS: true,
  minifyCSS: true,
  minifyURLs: true,
  html5: true,
  keepClosingSlash: true,
  caseSensitive: true,
};

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  externals: {
    google: "google",
    "google.maps": "google.maps",
  },
  mode: isDev ? "development" : "production",
  entry: {
    bundle: path.resolve(__dirname, "./src/index.js"),
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: isDev ? "[name].js" : "[name][contenthash].js",
    assetModuleFilename: isDev
      ? "assets/[name][ext]"
      : "assets/[name][contenthash][ext]",
    clean: true,
    publicPath: "/",
  },
  performance: {
    hints: isDev ? false : "warning",
    maxAssetSize: 400 * 1024,
    maxEntrypointSize: 400 * 1024,
    assetFilter: function (assetFilename) {
      return !/\.map$/.test(assetFilename) && !/\.txt$/.test(assetFilename);
    },
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "./dist"),
      publicPath: "/",
      serveIndex: true,
      watch: true,
    },
    server: {
      type: "http",
      options: {
        key: fs.readFileSync(
          path.resolve(__dirname, "https/localhost+2-key.pem")
        ),
        cert: fs.readFileSync(path.resolve(__dirname, "https/localhost+2.pem")),
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Service-Worker-Allowed": "/",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
    host: "localhost",
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/impressum/, to: "/impressum.html" },
        { from: /^\/datenschutz/, to: "/datenschutz.html" },
        { from: /^\/agb/, to: "/agb.html" },
        { from: /^\/offline/, to: "/offline.html" },
      ],
    },
    open: true,
    client: {
      logging: "verbose",
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: isDev ? "style-loader" : MiniCssExtractPlugin.loader,
            options: isDev
              ? {}
              : {
                  publicPath: "../",
                },
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: false,
              sourceMap: isDev,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "autoprefixer",
                    {
                      // Browser-Unterstützung explizit definieren
                      grid: "autoplace",
                    },
                  ],
                ],
              },
              sourceMap: isDev,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp|ico)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
        generator: {
          filename: "assets/img/[name][contenthash][ext]",
        },
      },
      {
        test: /\.(mp4|webm)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/video/[name][ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
      "process.env.ENABLE_TEST_PRICES": JSON.stringify(
        process.env.ENABLE_TEST_PRICES === "true"
      ),
    }),
    new HtmlWebpackPlugin({
      template: "src/template.html",
      filename: "index.html",
      scriptLoading: "defer",
      inject: true,
      minify: !isDev && {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
        html5: true,
        quoteCharacter: '"',
        keepClosingSlash: true,
        caseSensitive: true,
      },
      meta: {
        "Content-Security-Policy": false, // Deaktiviert automatische Meta-Tag-Generierung
      },
    }),
    new CspHtmlWebpackPlugin(
      {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "blob:",
          "https://*.stripe.com",
          "https://*.googleapis.com",
          "https://*.gstatic.com",
          "*.googleusercontent.com",
          "https://*.ggpht.com",
          "https://*.firebase.googleapis.com",
          "https://*.consentmanager.net",
          "https://*.emailjs.com",
          "https://cdn.consentmanager.net",
          "https://a.delivery.consentmanager.net",
          "https://checkout.stripe.com",
          "https://firestore.googleapis.com",
          "https://cloud.ccm19.de",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
        ],
        "connect-src": [
          "'self'",
          "data:",
          "blob:",
          "https://*.stripe.com",
          "https://*.googleapis.com",
          "https://*.google.com",
          "https://*.gstatic.com",
          "https://*.firebase.googleapis.com",
          "wss://*.firestore.googleapis.com",
          "https://*.cloudfunctions.net",
          "https://*.consentmanager.net",
          "https://*.emailjs.com",
          "https://cdn.consentmanager.net",
          "https://a.delivery.consentmanager.net",
          "https://checkout.stripe.com",
          "https://firestore.googleapis.com",
          "https://cloud.ccm19.de",
          // Entwicklungsumgebung
          ...(isDev
            ? [
                "http://localhost:3001", // Firebase Functions Emulator
                "http://localhost:5000", // Firestore Emulator
                "ws://localhost:*", // WebSocket für Hot Reload
              ]
            : []),
        ],
        "frame-src": [
          "'self'",
          "https://*.stripe.com",
          "https://*.google.com",
          "https://*.googleapis.com",
          "https://*.consentmanager.net",
          "https://*.firebase.googleapis.com",
          "https://checkout.stripe.com",
        ],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://*.upgrade4-me.de",
          "https://*.stripe.com",
          "https://*.googleapis.com",
          "https://*.gstatic.com",
          "*.googleusercontent.com",
          "https://*.google.com",
          "https://*.consentmanager.net",
          "https://*.firebase.googleapis.com",
          "https://*.emailjs.com",
          "https://cloud.ccm19.de",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.consentmanager.net",
          "https://fonts.googleapis.com",
          "https://cloud.ccm19.de",
        ],
        "media-src": ["'self'", "blob:", "data:"],
        "worker-src": ["'self'", "blob:"],
        "manifest-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'", "https://*.stripe.com"],
      },
      {
        enabled: true,
        hashingMethod: "sha256",
        hashEnabled: {
          "script-src": true,
          "style-src": true,
        },
        nonceEnabled: {
          "script-src": false,
          "style-src": false,
        },
        processFn: (builtPolicy, htmlPluginData) => {
          // Extrahiere den HTML-Inhalt
          const html = htmlPluginData.html;

          // Suche nach dem charset Meta-Tag
          const charsetPos = html.indexOf('<meta charset="UTF-8">');

          if (charsetPos !== -1) {
            // Finde das Ende des charset Tags
            const charsetEndPos = html.indexOf(">", charsetPos) + 1;

            // Teile das HTML
            const beforeCharset = html.slice(0, charsetEndPos);
            const afterCharset = html.slice(charsetEndPos);

            // Erstelle das CSP-Meta-Tag ohne zusätzliche Whitespaces/Newlines
            const cspTag = `<meta http-equiv="Content-Security-Policy" content="${builtPolicy}">`;

            // Setze das HTML neu zusammen ohne zusätzliche Formatierung
            htmlPluginData.html = beforeCharset + cspTag + afterCharset;
          }

          return builtPolicy;
        },
      }
    ),
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: "gzip", // compression algorithmus
      minRatio: 1, // versuche alle Dateien zu komprimieren
      compressionOptions: { level: 9 }, // max. compression level
    }),
    new WebpackPwaManifest({
      name: "Upgrade4me",
      short_name: "Upgrade4me",
      description: "Coaching für persönliche Transformation",
      background_color: "#ffffff",
      theme_color: "#40499d",
      display: "standalone",
      orientation: "portrait",
      // Damit die PWA Tags auch im Entwicklungsmodus eingefügt werden
      includeInDevelopment: true,
      inject: true,
      fingerprints: true,
      includeDirectory: true,
      filename: "manifest.json",
      publicPath: "/",
      start_url: "/",
      scope: "/",
      // Icons
      icons: [
        {
          src: path.resolve("src/assets/favicon/android-chrome-512x512.png"), // Besser: hochauflösendes PNG statt WebP
          sizes: [72, 96, 128, 144, 152, 192, 384, 512],
          destination: path.join("assets", "icons"),
          purpose: "any maskable",
          ios: true,
        },
      ],
      // Apple spezifische Anpassungen
      ios: true,
      appleStatusBarStyle: "default",
      // Zusätzliche Features
      shortcuts: [
        {
          name: "Termine",
          url: "/calendar",
          description: "Termine buchen",
        },
      ],
      // Metadaten
      categories: ["lifestyle", "health"],
      lang: "de-DE",
      dir: "ltr",
      includeDirectory: true,
      generateMaskIcon: true,
      fingerprints: true,
    }),
    new MiniCssExtractPlugin({
      filename: isDev ? "styles/[name].css" : "styles/[name].[contenthash].css",
      chunkFilename: isDev
        ? "styles/[id].css"
        : "styles/[id].[contenthash].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/assets",
          to: "assets",
          globOptions: {
            ignore: ["**/*.txt", "**/fonts/**", "**/source_videos/**"],
          },
        },
        {
          from: "src/offline.html",
          to: "offline.html",
          transform: async (content) => {
            if (isDev) return content; // Im Development-Modus nicht minifizieren
            return await HtmlMinifierTerser.minify(
              content.toString(),
              minifyOptions
            );
          },
        },
        {
          from: "src/datenschutz.html",
          to: "datenschutz.html",
          transform: async (content) => {
            if (isDev) return content;
            return await HtmlMinifierTerser.minify(
              content.toString(),
              minifyOptions
            );
          },
        },
        {
          from: "src/impressum.html",
          to: "impressum.html",
          transform: async (content) => {
            if (isDev) return content;
            return await HtmlMinifierTerser.minify(
              content.toString(),
              minifyOptions
            );
          },
        },
        {
          from: "src/agb.html",
          to: "agb.html",
          transform: async (content) => {
            if (isDev) return content;
            return await HtmlMinifierTerser.minify(
              content.toString(),
              minifyOptions
            );
          },
        },
        {
          from: "src/scripts/workers/service_worker.js",
          to: "service_worker.js",
        },
        {
          from: "src/robots.txt",
          to: "robots.txt",
          transform(content) {
            return content
              .toString()
              .replace(
                "Sitemap: https://upgrade4me-7a4f0.web.app/sitemap.xml",
                `Sitemap: ${
                  process.env.SITE_URL || "https://upgrade4me-7a4f0.web.app"
                }/sitemap.xml`
              );
          },
        },
        {
          from: "src/sitemap.xml",
          to: "sitemap.xml",
          transform(content) {
            return content
              .toString()
              .replace(
                "https://upgrade4me-7a4f0.web.app",
                process.env.SITE_URL || "https://upgrade4me-7a4f0.web.app"
              );
          },
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          format: {
            comments: false,
            quote_style: 2, // 0: auto, 1: single, 2: double, 3: original
          },
        },
      }),
    ],
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace("@", "")}`;
          },
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        styles: {
          name: "styles",
          type: "css/mini-extract",
          chunks: "all",
          enforce: true,
          test: /\.css$/,
        },
        largeLibs: {
          test: /[\\/]node_modules[\\/](react|firebase|stripe)[\\/]/, // Regex-Test
          priority: -5, // Priorität der Chunk-Gruppe
          chunks: "all", // Verarbeitet alle Chunks
          enforce: true, // Erzwingt die Erstellung dieses Chunks
        },
      },
    },
  },
  devtool: isDev ? "eval-source-map" : "source-map",
  watch: false,
};
