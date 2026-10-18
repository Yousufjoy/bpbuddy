# BP Buddy — Blood Pressure & Medicine Reminder App

A lightweight, mobile-first health tracking application built with **React Native**, **Expo Router**, **expo-sqlite**, **Expo Notifications**, **expo-print**, and **Supabase**.

Recreated faithfully to match the reference design across all 9 screens with persistent data, real-time blood pressure trend charts, local notifications, daily medicine checklists, PDF reports, and local-first guest & cloud synchronization.

---

## 📱 Features & Screens

1. **Home Dashboard (`/(tabs)/index.tsx`)**:
   - **Latest Blood Pressure Card**: Displays current systolic, diastolic, pulse bpm, measurement timestamp, and clinical category badge ("Good range").
   - **Quick Action Button**: Prominent "+ Add Reading" button.
   - **Next Medicine Card**: Immediate visibility of upcoming dose with time, dosage, and medicine name.
   - **Health Tip Card**: Daily rotating advice ("Keep going! Small steps every day make a big difference").

2. **Add Reading (`/readings/add.tsx`)**:
   - Numeric inputs for Systolic (`mmHg`), Diastolic (`mmHg`), and Pulse (`bpm`).
   - Dynamic clinical classification preview based on 2017 ACC/AHA guidelines.
   - Custom Date & Time selector and optional notes.
   - Real-time local SQLite persistence and background sync.

3. **History (`/(tabs)/history.tsx`)**:
   - **Trend Chart**: Dual-line chart featuring Systolic (red line) and Diastolic (blue line) trends with interactive touch tooltips, Y-axis gridlines (40, 80, 120, 160), and date labels.
   - **Period Filters**: Filter trends and reading lists by **Week**, **Month**, **3 Months**, and **Year**.
   - **Recent Readings**: Chronological list of measurements with status badges, pulse, and tap-to-edit.

4. **Medicine Reminder & Daily Checklist (`/(tabs)/medicine.tsx`)**:
   - **Today's Schedule**: Grouped by time of day (Morning, Afternoon, Evening, Night).
   - **Interactive Checkboxes**: Tap to mark doses taken (green checkmark) or pending; long-press to record skipped doses.
   - **Upcoming Schedule**: Shows upcoming days and scheduled doses.
   - **Adherence History**: Dedicated screen (`/medicines/history.tsx`) calculating adherence rates and past records.

5. **How to Measure (`/health/measure.tsx`)**:
   - Vector medical illustration of arm, cuff at heart level, and digital monitor (strictly no human faces or photos).
   - 4 numbered clinical steps for accurate self-measurement.
   - Helpful pre-measurement tips (avoid caffeine, exercise, smoking for 30 min).

6. **Report & PDF Export (`/(tabs)/report.tsx`)**:
   - Period selector (Last 7 days, 30 days, 90 days, 1 year, All time).
   - Calculated clinical statistics: Total readings, average systolic/diastolic, average pulse, highest recorded, lowest recorded.
   - Mini trend chart.
   - **"Generate PDF Report"**: Produces a medical-grade PDF report with summary stats, reading log, and disclaimers using `expo-print`, opening the native share sheet (`expo-sharing`).

7. **Medicine Management (`/medicines/add.tsx`, `/medicines/[id].tsx`, `/medicines/all.tsx`)**:
   - Add/edit medicine names, doses, instructions, and frequencies.
   - Suggested time presets (Morning, Afternoon, Evening, Night) and custom times.
   - Pause or resume reminders, and view dose history.

8. **More & Settings (`/(tabs)/more.tsx`)**:
   - Profile & Account (`/settings/profile.tsx`): Guest mode vs cloud account.
   - Notifications (`/settings/notifications.tsx`): Reminders toggle and "Send Test Notification".
   - Data Backup (`/settings/backup.tsx`): JSON export/restore, CSV table export, manual cloud sync.
   - Health Tips (`/health/tips.tsx`): Lifestyle guidance on dietary sodium, sleep, movement, and stress.

---

## 🗄️ Database Architecture

### Local-First SQLite Database (`src/database/database.ts`)
- `blood_pressure_readings`: Stores measurement values, timestamps, and sync status.
- `medicines`: Stores active/paused medication records.
- `medicine_schedules`: Stores reminder times, time of day, and days of week.
- `medicine_dose_logs`: Stores taken, skipped, and pending dose statuses.
- `app_settings`: Key-value store for preferences.

### Cloud Storage (Supabase PostgreSQL)
- SQL migrations and Row Level Security (RLS) policies are in `supabase/migrations/20261015000000_bp_buddy_initial.sql`.
- Each authenticated user can only access their own records.
- Seamless guest-to-account migration attaches local records upon login.

---

## 🚀 Running the App

### Start the development server:
```bash
npm start
```

### Run on Android:
```bash
npm run android
```

### Run on iOS:
```bash
npm run ios
```

### Run in Web browser:
```bash
npm run web
```


<!-- npx eas-cli@latest build -p android --profile preview  -->
