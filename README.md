# Logos College Student Portal

A responsive student portal built with Next.js for academic registration, program selection, and payment management.

## Features

- Student registration and authentication
- Program selection and enrollment
- Payment submission and tracking
- Class schedule management
- Multi-language support (Amharic, Oromo)
- Fully responsive design (mobile and desktop)
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:

Copy `.env.example` to `.env` and configure your API URL:

```bash
cp .env.example .env
```

Edit `.env`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel](https://vercel.com/new) and import your repository
3. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Your production API URL
5. Deploy!

Alternatively, install the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Base URL for the backend API (required)

## Project Structure

- `src/app/`: Next.js app directory with pages and layouts
- `src/components/`: Reusable React components
- `src/lib/`: Utility functions and helpers
- `src/services/`: API service functions
- `src/types/`: TypeScript type definitions
- `src/locales/`: Translation files for multi-language support
- `public/`: Static assets (images, icons)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Lucide React icons

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
