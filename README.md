# 🐾 The Apawstrophe - Adoption Platform

A modern, responsive pet adoption platform built with React, Tailwind CSS, and Supabase.

## Features
- 🏠 **Adoption Feed**: Latest updates and news about our furry friends.
- 🐶 **Available Pets**: Browse pets looking for a forever home.
- ❤️ **Success Stories**: Gallery of happily adopted pets.
- 🔐 **Admin Dashboard**: Manage pets, updates, and images securely.
- 📱 **Mobile First**: Fully responsive design.

## Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS v4
- **Backend & Auth**: Supabase
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- A Supabase account

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
1. Go to your Supabase Dashboard -> SQL Editor.
2. Open `supabase_schema.sql` from this repository.
3. Run the script to create tables, policies, and storage buckets.

### 5. Run Locally
```bash
npm run dev
```

## Deployment
This project is ready for Vercel or GitHub Pages.

### Vercel (Recommended)
1. Push code to GitHub.
2. Import repository in Vercel.
3. Add Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Vercel Project Settings.
4. Deploy!

## Admin Access
To access the admin dashboard:
1. Enable Email Auth in Supabase.
2. Create a user in Supabase Authentication tab.
3. Navigate to `/admin` and login with those credentials.
