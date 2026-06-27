// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: `${process.env.BACKEND_URL ?? 'https://localhost:5000'}/api/:path*`,
//       },
//     ];
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL ?? 'https://localhost:5000'}/api/:path*`,
      },
    ];
  },
  // Adicione esta função para configurar o comportamento do proxy do Next.js
  webpack(config, { isServer }) {
    if (isServer) {
      // Força o ambiente Node do servidor Next.js a ignorar o certificado
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    return config;
  },
};

export default nextConfig;