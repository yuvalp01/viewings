This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

**Database:**
- `SQL_SERVER` - Database server address (e.g., `myserver.database.windows.net` for Azure SQL) (required)
- `SQL_USER` - Database username (required)
- `SQL_PASSWORD` - Database password (required)
- `SQL_DATABASE` - Database name (required)

**Authentication (Google OAuth):**
- `AUTH_SECRET` - Secret key for JWT signing (required). Generate with: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (required)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (required)
- `NEXTAUTH_URL` - Base URL of your application (required). Use `http://localhost:3000` for local development

**AI Features:**
- `OPENAI_API_KEY` - OpenAI API key for AI ad data extraction feature (required)
- `EXTRACTION_RATE_LIMIT` - Rate limit for ad extraction API (optional, default: 10 requests per hour)

See `.env.example` for a template.

### Development

First, run the development server:

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
