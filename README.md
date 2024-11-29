# PIZZA APP

## Overview

This project is a web application designed for managing a delivery service. It provides features for tracking orders, managing inventory, and analyzing delivery statistics. The application is built using Remix, a modern framework for building web applications with React.

## Features

- **User Authentication**: Secure login and registration for users.
- **Order Management**: View, create, and manage customer orders.
- **Delivery Tracking**: Track delivery routes and statuses.
- **Inventory Management**: Manage inventory levels and product details.
- **Analytics Dashboard**: Visualize delivery statistics and performance metrics.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn-UI
- **Backend**: RemixJS
- **Database**: Mysql
- **Testing**: Vitest, Cypress

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment variables:

   Copy the .env.example file to .env and fill in the required variables.

4. Set up the database:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
