# BicolStay

BicolStay is a Next.js directory and editorial travel site for the Bicol Region in the Philippines. It combines curated destination pages, province and category browsing, and a Google Maps powered listing dataset for resorts, beaches, staycations, hotels, and food spots.

## Features

- Browse listings by category, province, and slug-based detail pages
- Filter listings by search term, province, category, price range, vibe, and amenities
- Explore province landing pages and editorial travel guides
- Load listing data from a local Google Maps export
- Scrape or refresh the Google Maps dataset with Playwright

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Playwright for data scraping

## Project Structure

```text
app/                  Next.js app routes and pages
components/           Shared UI components
lib/                  Data loading, types, and utilities
data/google-maps/     Local dataset files
scripts/              Data collection and maintenance scripts
public/               Static assets
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run scrape:google-maps
```

## Data

The app reads listing data from:

- `data/google-maps/bicol-google-maps-all.csv`
- `data/google-maps/bicol-google-maps-all.json`

The Google Maps import pipeline is implemented in `scripts/scrape-google-maps.mjs` and transformed for the app through `lib/data/googleMapsListings.ts`.

### Refresh the dataset

```bash
npm run scrape:google-maps
```

Optional environment filters:

```bash
GMAP_CATEGORY=resorts,hotels
GMAP_PROVINCE=Albay,Sorsogon
GMAP_TERM=hotel,resort
GMAP_MAX_PLACES=100
npm run scrape:google-maps
```

## Git and Local Files

This repo is set up to keep generated and machine-specific files out of version control, including:

- `node_modules/`
- `.next/`
- `.DS_Store`
- editor metadata like `.vscode/` and `.idea/`
- local scraper checkpoint files such as `data/google-maps/*-progress.json`

If you need environment variables later, prefer committing an `.env.example` file and keeping real `.env` files local only.

## Build for Production

```bash
npm run build
npm run start
```

## Notes

- Listing content is partially derived from Google Maps data and may need manual editorial review before publication.
- The scraper writes resumable progress locally, but that checkpoint file is intentionally ignored for Git cleanliness.
