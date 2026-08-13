<p align="center">
  <img src="public/paddleup-logo.jpg" alt="Paddle Up Manipal logo" width="200">
</p>

# Paddle Up Manipal

[@Paddle Up Manipal](https://paddleupbooking.lovable.app) is a court booking and community platform for a pickleball facility in Manipal. It lets players book courts, find people to play with, join tournaments, chat with the community, and track their standing on a leaderboard. It also has an admin dashboard for managing bookings, players, and courts.

## What it does

- **Court booking**: Book one of 3 courts across time slots from 8 AM to 9 PM, with peak hour pricing after 4 PM.
- **Player matching**: While booking, mark that you need players and set a skill level, gender preference, and play mode (casual or competitive) so others can join your slot.
- **Payments**: Checkout is handled through Paddle, with a UPI/QR code option for local payments and a test mode banner for staging.
- **Find players**: Browse and connect with other players looking for a game.
- **Community chat**: A shared chat room for the player community.
- **Tournaments**: View and join tournaments run by the facility.
- **Leaderboard**: See player rankings based on activity and results.
- **Player profiles**: Each player has a public profile page and can set up their profile after signup.
- **Notifications**: In-app notification bell for booking updates and matches.
- **My Bookings**: Players can view and manage their own upcoming and past bookings.
- **Admin dashboard**: Manage bookings, add bookings manually, reset player passwords, view revenue charts, export bookings, and manage tournaments.

## Tech stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Edge Functions, Realtime)
- **Payments**: Paddle (checkout, webhooks, price lookup)
- **Other**: React Router, React Query, React Hook Form, Zod, Recharts, qrcode.react, jsPDF, xlsx

This project was originally scaffolded with Lovable, so you'll also see a `lovable-tagger` dev dependency and some Lovable-related config left in place.

## Project structure

```
src/
  pages/           # Route-level pages (Booking, Admin, Community, Leaderboard, etc.)
  components/      # Shared components and shadcn/ui primitives
  contexts/        # React context providers (e.g. auth)
  hooks/           # Custom hooks
  integrations/    # Supabase and Paddle client setup
  lib/             # Shared config and helper functions
supabase/
  functions/       # Edge functions (admin actions, Paddle webhook, price lookup)
  migrations/      # Database schema and migrations
```

## Getting started

### Prerequisites

- Node.js (use [nvm](https://github.com/nvm-sh/nvm) to manage versions if you don't already have Node installed)
- A Supabase project
- A Paddle account for payments (sandbox is fine for local development)

### Setup

1. Clone the repository

```sh
git clone https://github.com/codePatronus/paddleupbooking.git
cd paddleupbooking
```

2. Install dependencies

```sh
npm install
```

3. Set up environment variables

Create a `.env` file in the project root with your Supabase and Paddle credentials. Check `src/integrations` and `supabase/functions` for the exact variable names your setup expects, such as the Supabase URL and anon key, and the Paddle client token and price IDs.

4. Set up the database

Run the SQL migrations in `supabase/migrations` against your Supabase project, either through the Supabase CLI or the SQL editor in the dashboard, in order by filename.

5. Start the dev server

```sh
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Other useful scripts

```sh
npm run build       # Production build
npm run build:dev   # Development-mode build
npm run preview     # Preview a production build locally
npm run lint         # Run ESLint
npm run test         # Run tests once with Vitest
npm run test:watch  # Run tests in watch mode
```

## Deployment

The app is a standard Vite/React build, so it can be deployed to any static host. A `vercel.json` is included for deploying to Vercel. Make sure your environment variables are set on whichever platform you deploy to, and that your Supabase edge functions, including the Paddle webhook, are deployed separately through Supabase.

## Find us

- **Instagram**: [@paddles.manipal](https://instagram.com/paddles.manipal)
- **Location**: [PaddleUp Manipal on Google Maps](https://www.google.com/maps?q=PaddleUp+Manipal&ll=13.348002906513592,74.77728207537672)

## Contributing

Issues and pull requests are welcome. If you're adding a feature that touches bookings, payments, or admin actions, please test it against a Supabase sandbox and a Paddle sandbox environment before opening a PR.

## License

No license has been specified for this project yet. Contact the repository owner if you want to use this code outside of personal or internal use.
- Node.js (use [nvm](https://github.com/nvm-sh/nvm) to manage versions if you don't already have Node installed)
- A Supabase project
- A Paddle account for payments (sandbox is fine for local development)

### Setup

1. Clone the repository

```sh
git clone https://github.com/codePatronus/paddleupbooking.git
cd paddleupbooking
```

2. Install dependencies

```sh
npm install
```

3. Set up environment variables

Create a `.env` file in the project root with your Supabase and Paddle credentials. Check `src/integrations` and `supabase/functions` for the exact variable names your setup expects, such as the Supabase URL and anon key, and the Paddle client token and price IDs.

4. Set up the database

Run the SQL migrations in `supabase/migrations` against your Supabase project, either through the Supabase CLI or the SQL editor in the dashboard, in order by filename.

5. Start the dev server

```sh
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Other useful scripts

```sh
npm run build       # Production build
npm run build:dev   # Development-mode build
npm run preview     # Preview a production build locally
npm run lint         # Run ESLint
npm run test         # Run tests once with Vitest
npm run test:watch  # Run tests in watch mode
```

## Deployment

The app is a standard Vite/React build, so it can be deployed to any static host. A `vercel.json` is included for deploying to Vercel. Make sure your environment variables are set on whichever platform you deploy to, and that your Supabase edge functions, including the Paddle webhook, are deployed separately through Supabase.

## Contributing

Issues and pull requests are welcome. If you're adding a feature that touches bookings, payments, or admin actions, please test it against a Supabase sandbox and a Paddle sandbox environment before opening a PR.

## License

No license has been specified for this project yet. Contact the repository owner if you want to use this code outside of personal or internal use.
