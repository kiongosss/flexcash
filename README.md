# Flexit - Pay to Flex

## Overview

Flexit is a viral web application where users pay to flex on a public leaderboard. The more you pay, the higher your ranking! This project showcases a fun, gamified payment system where users compete for the top spot on the leaderboard.

### Core Features

1. **Landing Page**
   - Title: "Flex Cash"
   - Subtitle: "Pay to flex. The internet's most expensive leaderboard."
   - CTA Button: "Claim Your Spot"

2. **Claim Spot Flow**
   - Modal form requesting social handle or website URL
   - Redirect to payment processing
   - Users can pay any amount (minimum $1)

3. **Leaderboard**
   - Public and always visible
   - Shows rank, handle/URL, amount paid, and timestamp
   - Top payer gets special highlighting

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + TailwindCSS
- **Payment**: Lemon Squeezy Checkout (with webhook handling)
- **Database**: Prisma with PostgreSQL
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Lemon Squeezy account (for production)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd flexit
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Copy the `.env` file and update with your credentials:

```bash
cp .env.example .env
```

Update the following variables in the `.env` file:
- `DATABASE_URL`: Your PostgreSQL connection string
- `LEMON_SQUEEZY_API_KEY`: Your Lemon Squeezy API key
- `LEMON_SQUEEZY_STORE_ID`: Your Lemon Squeezy store ID
- `LEMON_SQUEEZY_WEBHOOK_SECRET`: Your webhook secret for verifying events

4. Set up the database

```bash
npx prisma migrate dev --name init
```

5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment

The app is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy!

## Setting Up Lemon Squeezy

For production use, you'll need to:

1. Create a Lemon Squeezy account
2. Set up a product with custom pricing enabled
3. Configure webhooks to point to your `/api/webhook` endpoint
4. Update your environment variables with the Lemon Squeezy credentials

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

KaseeMoka - [GitHub](https://github.com/kiongosss)
