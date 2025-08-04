# GMAF Webview

A modern web-based frontend for the **GMAF (Generic Multimedia Analysis Framework)**. This application provides a visual interface for analyzing and interacting with multimedia data processed by a GMAF backend service.

---

## Prerequisites

Before running or building this project, make sure the following requirements are fulfilled:

- **GMAF Service is running and accessible**
  - Start the GMAF MVR Service, but make sure to adapt the GMAF MVR API beforehand to support all required file types.
  - You can download the adapted API from the following link: [<https://github.com/Kapuzenjoe/gmaf-mvr-api/tree/preview-all-file-types>]
  - The GMAF service itself can be obtained from: [<https://github.com/marquies/gmaf-mvr-service-public>]
  - The GMAF service must aalso llow additional file types in its config file, such as mp4, mp3, txt, csv or zip, since only file types allowed by the service will be displayed later
  - You must start the GMAF Server separately.
- Node.js (v20 or newer recommended)
- npm (v8 or newer)

---

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

---

## Development Server

Start the React development server:

```bash
npm start
```

The app will be available at: [http://localhost:3000](http://localhost:3000)

The page reloads automatically on code changes, and linting errors (if any) will appear in the console.

> **Important:** Make sure the GMAF backend service is up and running before starting the frontend.

---

## Build

Create an optimized production build:

```bash
npm run build
```

This will output the compiled app to the `build/` directory.

---

## Tests

To run the test suite:

```bash
npm test
```

This will launch the test runner in interactive watch mode.

Test files are located in the `src/tests/` directory and use standard JavaScript testing frameworks.

---

## Project Structure

```
src/
├── components/        # Reusable UI components
├── controllers/       # Logic and flow control
├── service/           # API communication (e.g., GMAF, unzip)
├── views/             # Page-level view components
├── model/             # Data models
├── utils/             # Utility functions and helpers
├── tests/             # Unit/integration tests
├── App.jsx            # Main React component
└── index.jsx          # Entry point
```