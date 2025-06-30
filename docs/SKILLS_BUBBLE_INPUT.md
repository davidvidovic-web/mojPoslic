# Skills Bubble Input Component

## Overview
The `SkillsBubbleInput` component provides an intuitive way for users to add and manage their skills with bubble-style tags. It combines:

- **Category-based suggestions** from existing job categories
- **Common skills database** with tech, design, business, and handyman skills  
- **Custom skill input** for anything not in the predefined lists
- **Bubble UI** with easy removal and visual feedback

## Features

### 🎯 Smart Suggestions
- Fetches job categories from the API
- Includes 50+ common tech, design, business, and handyman skills
- Real-time filtering as you type
- Prevents duplicate skills

### 🎨 User-Friendly Interface
- Visual bubble tags for selected skills
- Click to remove individual skills
- Popular categories shown for quick selection
- Keyboard shortcuts (Enter to add, Backspace to remove)

### 🔧 Customizable
- Max skills limit (default: 20)
- Custom placeholder text
- Responsive design
- Click-outside to close suggestions

## Usage in User Profile

When users visit their settings page (`/settings`), they'll see:

1. **Skills & Expertise** section with bubble input
2. **Popular categories** displayed initially for quick selection
3. **Search/type** to find or add custom skills
4. **Visual feedback** with animated bubbles and badges

## Skills Data Sources

1. **Job Categories**: Fetched from `/api/categories`
   - Handyman work and repairs
   - Moving and transport  
   - Cleaning and maintenance
   - Garden services
   - And more...

2. **Common Skills Database**:
   - Programming: JavaScript, Python, React, etc.
   - Design: Figma, Photoshop, UI/UX, etc.
   - Business: Project Management, SEO, etc.
   - Handyman: Plumbing, Electrical, Carpentry, etc.

## Data Storage

Skills are stored as comma-separated strings in the database but presented as an array in the UI for better user experience. The component handles conversion automatically.

## Benefits

- **Better UX**: Visual bubbles vs. plain text input
- **Reduced errors**: Suggestions prevent typos
- **Discoverability**: Users see available skill categories
- **Flexibility**: Can add custom skills not in categories
- **Professional**: Clean, modern interface

This replaces the old textarea-based skills input with a much more professional and user-friendly experience.
