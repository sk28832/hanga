/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/studio",
        destination: "/",
        permanent: true,
      },
      {
        source: "/study",
        destination:
          process.env.NEXT_PUBLIC_STUDY_URL ??
          "https://shreyankkadadi.com/studio/hanga",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
