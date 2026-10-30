# House Price AI

A housing price classification application built with React, Vite, and React Router. Features a refined design system using the Hallmark Studio theme.

## Features

- **Price Classification**: Classify property listings into four price-relevance categories
- **Interactive Form**: Detailed property input with validation
- **Batch Processing**: Paste CSV data to classify multiple listings at once
- **Model Documentation**: View the classification schema and model details
- **Analytics Dashboard**: View class distribution (data placeholder)
- **Studio Theme**: Design system inspired by Hallmark's Studio theme

## Routes

- `/` - Homepage with classification overview
- `/prediction` - Property classification form
- `/prediction/result` - Classification result display
- `/model` - Model details and class schema
- `/analytics` - Class distribution analytics
- `/about` - About the classification tool

## Tech Stack

- **React 18.3.1** - UI library
- **Vite 5.4.10** - Build tool and dev server
- **React Router 6.28.0** - Client-side routing
- **Node.js** - Runtime environment

## Design System

This project uses the Hallmark Studio theme with:

- **Typography**: Hedvig Letters Serif (display), Geist (body), Sofia Sans Extra Condensed (outlier)
- **Color**: Cool studio-white paper, blue-black ink, cadmium orange accent
- **Surfaces**: Proof texture with dot grid and grain, crop marks on printed pieces
- **Motion**: Subtle cursor parallax on homepage (respects `prefers-reduced-motion`)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Its-Nassim/Dm_project.git
cd Dm_project

# Install dependencies
npm install
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
├── components/       # Reusable components
│   ├── ClassBadge.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── ProbabilityList.jsx
│   └── SchemaField.jsx
├── config/           # Configuration files
│   ├── featureSchema.js
│   └── fieldMeta.js
├── lib/              # Utility functions
│   ├── csv.js
│   ├── payload.js
│   ├── schema.js
│   └── validation.js
├── pages/            # Page components
│   ├── About.jsx
│   ├── Analytics.jsx
│   ├── Home.jsx
│   ├── Model.jsx
│   ├── PredictionForm.jsx
│   └── PredictionResult.jsx
├── styles/           # Design system
│   ├── base.css
│   └── tokens.css
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Classification Schema

The model classifies properties into four categories:

| Class ID | Label | Description |
|----------|-------|-------------|
| 0 | Cheaper than average | Below market price |
| 1 | Reasonable price | At market price |
| 2 | Over priced | Above market price |
| 3 | Too over priced | Significantly above market price |

## API Integration

Currently uses a local mock provider for predictions. To connect to a real API:

1. Update `src/api/mock.js` with your API endpoint
2. Modify `requestPrediction` and `requestBatchPrediction` functions
3. Update the response format validation in `src/lib/validation.js`

## Field Schema

The classification uses the following property fields:

- **Pricing**: price (required)
- **Property**: bedrooms, bathrooms, sqft_living, sqft_lot, floors
- **History**: yr_built, yr_renovated
- **Location**: zipcode, lat, long
- **Identifiers**: id, date
- **Quality**: waterfront, view, condition, grade, sqft_above, sqft_basement
- **Neighborhood**: sqft_living15, sqft_lot15

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
