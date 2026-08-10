# 📱 Connexa Mobile App (Flutter)

A modern, minimalist Flutter app for Android and iOS that connects to the Connexa backend API.

The app shares the same visual language as the web experience, with clean Dart state management, smooth animations, and a direct REST API integration.

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- **Flutter SDK** (>= 3.0.0) -> [Install Flutter](https://docs.flutter.dev/get-started/install)
- **Android Studio** / VS Code with Flutter extension
- An Android emulator, iOS simulator, or a physical device

### 2. Install Dependencies
Open your terminal inside the `flutter_app` folder and run:
```bash
flutter pub get
```

### 3. Configure Backend Server Endpoint
The app connects to the Connexa Express backend API.
- **Default backend**: `https://connexa-qacu.onrender.com/api`
- You can also change the API endpoint live in the app via **Profile Screen -> Settings (⚙️ icon)**.
- If you want to test a local backend, enter your local API URL in the same settings screen.

### 4. Run the app
```bash
flutter run
```

To target a specific device, use:

```bash
flutter devices
flutter run -d <device_id>
```

---

## 🎨 Design System & Highlights
- **Palette**: Indigo (`#4F46E5`), Slate (`#0F172A`), Emerald (`#10B981`)
- **Typography**: Inter (via Google Fonts)
- **Animations**: Minimalist, fluid page transitions, spring curves, animated AI match percentage pills
- **Backend URL**: `https://connexa-qacu.onrender.com/api`

---

## 📂 Project Structure
```
flutter_app/
├── lib/
│   ├── main.dart             # App Entry point & Provider setup
│   ├── models/               # Data classes (User, Job, Application)
│   ├── providers/            # State Management (AuthProvider, JobProvider)
│   ├── screens/              # App Screens (Splash, Login, Register, Home, JobDetail, PostJob, Profile)
│   ├── services/             # REST API Client (ApiService, JWT storage)
│   ├── theme/                # Global Theme (Colors, Typography, Radius)
│   └── widgets/              # Reusable UI Components (AiMatchBadge, JobCard, etc.)
└── pubspec.yaml              # Package dependencies
```

## ✅ Current Scope
- Android and iOS only
- Shared Connexa backend API integration
- No web, desktop, or browser-specific Flutter targets are included in this app
