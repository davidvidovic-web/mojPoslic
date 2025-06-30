# Supabase Setup Guide

## Step 1: Enable Authentication

1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com)
2. Navigate to **Authentication** > **Settings** in the left sidebar
3. Configure authentication settings:
   - **Site URL**: Set to `http://localhost:3000` for development
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`

### Optional: Enable Google OAuth (Recommended)

1. In **Authentication** > **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials (you'll need to create a Google Cloud project)
4. Set authorized redirect URIs in Google Cloud Console to include your Supabase auth callback URL

## Step 2: Create the Database Table

1. Navigate to **SQL Editor** in the left sidebar
2. Copy the entire content from `supabase-schema.sql` in this project
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the SQL

This will:
- Create the `jobs` table with all necessary columns including `posted_by` for user tracking
- Set up indexes for better performance
- Enable Row Level Security (RLS)
- Create policies for public read access and authenticated user insert access
- Add triggers for automatic timestamp updates

## Step 3: Update Row Level Security Policies

The schema includes updated policies for authentication:
- **Public read**: Anyone can view active jobs
- **Authenticated insert**: Only signed-in users can post jobs
- **User-specific updates**: Users can only edit their own job posts

## Step 4: Verify the Setup

After running the SQL, verify everything is working:

1. Go to **Table Editor** in Supabase
2. You should see a `jobs` table
3. Check that the table has all columns including the new `posted_by` field
4. Go to **Authentication** > **Users** to see user registrations

## Step 5: Test the Application

1. Start your development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Try to post a job - you should be redirected to the login page
4. Create an account or sign in
5. Post a job - it should now work and be associated with your user account
6. Test the search and filter functionality

## Authentication Features

The job board now includes:

- **User Registration**: Email/password and Google OAuth
- **Protected Job Posting**: Only authenticated users can post jobs
- **User Menu**: Profile dropdown with logout functionality
- **Job Ownership**: Jobs are linked to the user who posted them
- **Automatic Redirects**: Seamless login/logout experience

## Troubleshooting

Common issues and solutions:

1. **"relation does not exist"** - Run the SQL schema in Supabase
2. **RLS policy errors** - Check that authentication policies were created
3. **OAuth redirect errors** - Verify redirect URLs in both Supabase and OAuth provider
4. **Authentication context errors** - Ensure AuthProvider wraps your app in layout.tsx

## Security Notes

The current setup provides:

- ✅ Row Level Security (RLS) enabled
- ✅ Public job reading, authenticated job posting
- ✅ User-specific job ownership tracking
- ✅ Secure authentication with Supabase Auth

For production deployment:
- Update Site URL and Redirect URLs to your production domain
- Configure email templates in Supabase Auth
- Set up proper OAuth credentials for production
- Consider adding admin roles and job moderation
