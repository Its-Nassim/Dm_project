# House Price AI

A housing price classification application built with React, Vite, and React Router. Features an interactive 3D visualization and a refined design system using the Hallmark Studio theme.

## Features

- **Price Classification**: Classify property listings into four price-relevance categories
- **Interactive 3D Model**: Visualize each price class on an interactive 3D house model with Three.js
- **Class Selection**: Switch between the four price categories (Cheaper than average, Reasonable price, Over priced, Too over priced)
- **Typography Measurement**: Interactive wordmark with font metrics and construction guides
- **Interactive Form**: Detailed property input with validation
- **Batch Processing**: Upload CSV files to classify multiple listings at once
- **Model Documentation**: View the classification schema and model details
- **Analytics Dashboard**: View class distribution (data placeholder)
- **Studio Theme**: Design system inspired by Hallmark's Studio theme with proof paper aesthetics

## Routes

- `/` - Homepage with 3D class visualization and typography measurement
- `/prediction` - Property classification form with Single house / Upload CSV tabs
- `/model` - Model details and class schema
- `/analytics` - Class distribution analytics
- `/about` - About the classification tool

## Tech Stack

- **React 18.3.1** - UI library
- **Vite 8.3.5** - Build tool and dev server
- **React Router 6.28.0** - Client-side routing
- **Three.js** - 3D rendering library for house model visualization
- **Node.js** - Runtime environment

## Design System

This project uses the Hallmark Studio theme with:

- **Typography**: Hedvig Letters Serif (display), Geist (body), Sofia Sans Extra Condensed (outlier)
- **Color**: Cool studio-white paper, blue-black ink, cadmium orange accent
- **Surfaces**: Proof texture with dot grid and grain, crop marks on printed pieces
- **Interactive Elements**: Font measurement tool, construction guides, registration marks
- **Motion**: Subtle transitions respecting `prefers-reduced-motion`

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Its-Nassim/Dm_project.git
cd Dm_project

# Install dependencies (includes Three.js for 3D model)
npm install
```

### Installing Three.js Separately

If you need to install Three.js separately (already included in package.json):

```bash
npm install three
```

### Development

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:4173
```

### Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Testing

```bash
# Run tests
npm run test
```

## Project Structure

```
src/
├── api/              # API layer (mock provider)
│   ├── client.js     # API client with error handling
│   └── mock.js       # Mock prediction service
├── components/       # Reusable components
│   ├── ClassBadge.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── House3D.jsx   # Three.js 3D house model
│   ├── MeasureSheet.jsx
│   ├── ProbabilityList.jsx
│   ├── SchemaField.jsx
│   └── Wordmark.jsx  # Interactive wordmark
├── config/           # Configuration files
│   ├── classes.js    # Class definitions
│   ├── featureSchema.js
│   └── fieldMeta.js
├── lib/              # Utility functions
│   ├── csv.js
│   ├── fontMetrics.js
│   ├── measure.js
│   ├── payload.js
│   ├── schema.js
│   └── validation.js
├── pages/            # Page components
│   ├── About.jsx
│   ├── Analytics.jsx
│   ├── Home.jsx      # Homepage with 3D model
│   ├── Model.jsx
│   └── PredictionForm.jsx
├── styles/           # Design system
│   ├── base.css
│   └── tokens.css
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Classification Schema

The model classifies properties into four categories:

|| Class ID | Label | Description |
||----------|-------|-------------|
|| 0 | Cheaper than average | Below market price |
|| 1 | Reasonable price | At market price |
|| 2 | Over priced | Above market price |
|| 3 | Too over priced | Significantly above market price |

The homepage features an interactive 3D house model that changes appearance based on the selected class category.

## API Integration

Currently uses a local mock provider for predictions. To connect to a real API:

1. Set `VITE_USE_MOCK=false` in `.env.local`
2. Configure `VITE_API_BASE_URL` and `VITE_DEV_PROXY_TARGET` in `.env.local`
3. Update `src/api/client.js` endpoints if needed
4. The dev server proxies API requests to the Flask backend

## Field Schema

The classification uses the following property fields:

- **Price**: price (required, USD)
- **Location**: zipcode, lat, long
- **Size and layout**: bedrooms, bathrooms, floors, sqft_living, sqft_lot, sqft_above, sqft_basement, sqft_living15, sqft_lot15
- **Quality and history**: waterfront, view, condition, grade, yr_built, yr_renovated

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Contributing

This is a client project. Please contact the maintainers before making changes.

## Credits

- Design system inspired by [Hallmark](https://github.com/cognition-artifex/hallmark)
- Theme: Studio (proof paper with construction guides)
- 3D rendering powered by Three.js
