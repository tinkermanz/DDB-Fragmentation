# Database Fragmentation Tool

This application demonstrates database fragmentation concepts including horizontal, vertical, and derived fragmentation with reconstruction capabilities using SQLite3 and Node.js with Sequelize ORM.

## Features

- **Horizontal Fragmentation**: Split data based on row conditions
- **Vertical Fragmentation**: Split data based on column selection
- **Derived Fragmentation**: Two-level fragmentation with parent and child conditions
- **Reconstruction Operations**: Union, Join, and Intersection of fragments
- **Interactive UI**: Easy-to-use web interface for all operations

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 14 or higher recommended)

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage Guide

1. **Initialize Database**:
   - Click the "Initialize Database" button to create a sample database with employee data

2. **Create Fragments**:
   - **Horizontal Fragmentation**: Enter a WHERE clause condition (e.g., `department = 'IT'`)
   - **Vertical Fragmentation**: Select columns to include in the fragment
   - **Derived Fragmentation**: Enter both parent and child conditions

3. **Save Fragments**:
   - After applying fragmentation, click "Save Fragment" to store it for reconstruction

4. **Reconstruct Data**:
   - Select at least two saved fragments
   - Choose a reconstruction method (Union, Join, or Intersection)
   - Click "Reconstruct" to see the results

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express
- **Database**: SQLite3
- **ORM**: Sequelize

## Project Structure

- `public/` - Frontend files (HTML, CSS, JavaScript)
- `server.js` - Express server and API endpoints
- `database.sqlite` - SQLite database file (created on first run)
- `package.json` - Project dependencies

## License

MIT