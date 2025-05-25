# Event Calendar React App

A comprehensive event management calendar built with React, featuring recurring events, drag-and-drop functionality, conflict detection, and local storage persistence.

## 🚀 Features

- **Monthly Calendar View** - Navigate through months with intuitive controls
- **Event Management** - Create, edit, and delete events with detailed forms
- **Recurring Events** - Support for daily, weekly, monthly, and custom recurrence patterns
- **Drag & Drop** - Easily reschedule events by dragging them to different dates
- **Conflict Detection** - Automatic detection and resolution of scheduling conflicts
- **Search & Filter** - Find events by title/description and filter by category
- **Color Categories** - Visual organization with Work, Personal, Health, Social, and Other categories
- **Local Storage** - Events persist between browser sessions
- **Responsive Design** - Works on desktop and mobile devices

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Modern web browser

## 🛠️ Installation & Setup

### Option 1: Quick Setup (Recommended)

1. **Clone or create the project directory:**
```bash
npx create-react-app event-calendar
cd event-calendar
```

2. **Install required dependencies:**
```bash
npm install lucide-react
```

3. **Set up Tailwind CSS via CDN:**
   
   Update `public/index.html` and add this line in the `<head>` section:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

4. **Create the EventCalendar component:**
   
   Create `src/EventCalendar.jsx` and paste the provided calendar code.

5. **Update App.js:**
```jsx
import EventCalendar from './EventCalendar';

function App() {
  return (
    <div className="App">
      <EventCalendar />
    </div>
  );
}

export default App;
```

6. **Start the development server:**
```bash
npm start
```

### Option 2: Full Tailwind Setup (Advanced)

If you prefer a complete Tailwind CSS setup:

1. **Follow steps 1-2 from Option 1**

2. **Install Tailwind CSS:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Configure tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

4. **Update src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

5. **Continue with steps 4-6 from Option 1**

## 🏃‍♂️ Running the Project

```bash
npm start
```

The application will open at `http://localhost:3000`

## 📖 Usage Guide

### Adding Events
1. Click the **"Add Event"** button or click on any calendar date
2. Fill in the event details:
   - **Title** (required)
   - **Date** and **Time** (required)
   - **Description** (optional)
   - **Category** (Work, Personal, Health, Social, Other)
   - **Recurrence** options for repeating events

### Managing Events
- **Edit**: Click on any event to modify its details
- **Delete**: Use the trash icon when editing an event
- **Move**: Drag and drop events to different dates
- **Search**: Use the search bar to find specific events
- **Filter**: Filter events by category using the dropdown

### Recurring Events
- **Daily**: Repeats every day
- **Weekly**: Choose specific days of the week
- **Monthly**: Repeats on the same date each month
- **Custom**: Set custom interval in days
- **End Date**: Optional end date for recurring events

### Conflict Resolution
When scheduling conflicts are detected, the app will:
1. Show a warning modal with conflicting events
2. Allow you to save anyway or cancel
3. Highlight conflicting time slots

## 🔧 Dependencies

- **React** - UI framework
- **lucide-react** - Icon library
- **Tailwind CSS** - Styling framework

## 💾 Data Storage

Events are automatically saved to browser's localStorage and will persist between sessions. No external database required.

## 🐛 Troubleshooting

### Common Issues:

1. **Tailwind styles not working:**
   - Ensure the CDN script is properly added to `public/index.html`
   - Try refreshing the browser cache

2. **Icons not displaying:**
   - Verify `lucide-react` is installed: `npm list lucide-react`
   - Reinstall if needed: `npm install lucide-react`

3. **Build errors with PostCSS:**
   - Use the CDN approach (Option 1) to avoid build configuration issues
   - Ensure Node.js version is 14 or higher

4. **Events not persisting:**
   - Check browser settings to ensure localStorage is enabled
   - Try clearing browser data and creating new events

### Getting Help:

If you encounter issues:
1. Check the browser console for error messages
2. Verify all dependencies are installed correctly
3. Ensure you're using a supported Node.js version
4. Try the CDN setup approach if build issues persist

## 🚀 Deployment

To build for production:
```bash
npm run build
```

The built files will be in the `build/` directory, ready for deployment to any static hosting service.

**Happy Scheduling! 📅✨**
