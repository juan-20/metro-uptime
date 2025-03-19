# São Paulo Metro Status App

A real-time metro status tracking application for São Paulo's metro system. This application allows users to view the current status of metro lines, report issues, and view statistics about reported issues.

## Features

- Real-time metro line status tracking
- User-submitted issue reports with rate limiting (3 reports per hour per IP)
- Detailed statistics and visualizations
- Admin dashboard for managing metro lines and reports
- Mobile-responsive design

## Tech Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL database)
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/saopaulo-metro-status.git
   cd saopaulo-metro-status
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a Supabase project and configure the database schema as per the `prisma/migrations` directory.

4. Configure environment variables:
   - Create a `.env.local` file and add the necessary environment variables (e.g., database URL, API keys).

## Usage

To run the application locally:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser to view the application.

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) for more details.

## Architecture Overview

The application is built using a modern web stack with a focus on real-time data and responsive design. Key components include:

- **Next.js** for server-side rendering and routing
- **Supabase** for database management and authentication
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components



