# 🧾 CueIT Kiosk Display Requirements

This document outlines the full technical and UX requirements for building the **CueIT Kiosk Display App**, designed to emulate the Apple/Zoom Room-style interface for in-office kiosk usage.

---

## 🧱 Core Layout Goals

| UI Element            | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| **Room Title**       | Displays the name of the room/kiosk (e.g. "36th Street")                    |
| **Status Bar**       | Displays status ("Available", "In Use") with bold green/red color bar       |
| **Main Info Panel**  | Shows system notifications or alerts                                        |
| **Action Button**    | Button labeled “Open Ticket” to launch IT Help form                         |
| **Settings Gear**    | Opens a protected admin panel + Apple-style setup wizard                    |


---

## 🖥 Visual Layout Breakdown

```swift
ZStack {
  BackgroundImage
  VStack {
    HeaderBar (Room Name + Gear Icon)
    NotificationCard (Time + Message)
    Spacer()
    StatusBar (Status + Open Ticket Button)
  }
}
```


---

## ✅ Functional Requirements

### 📌 Room Name Display
- Should dynamically pull from configuration or allow override in Admin settings

### 🟢 Status Bar (Indicator)
- Large "Available" or "In Use" indicator at bottom
- Color should be green (available) or red (occupied)
- Status pulled from backend or manually overridden

### 📩 Notifications Area
- Display current time and notification text (e.g., "No upcoming meetings")
- Can be updated remotely or by backend API

### 📤 Open Ticket Button
- Triggers the support request form modal
- Reuses shared ticket form component (Name, Email, Title, Urgency, etc.)

### ⚙️ Admin Settings Panel
- Accessed via gear icon in upper-right
- Allows:
  - Manual override of status
  - View / Edit Kiosk/Room Name (ensure it syncs to the server)
  - Launch Activation Wizard if setup is incomplete or activation errors. 


---

## ✨ Apple-Style Activation Wizard

### 🎯 Purpose
A beautiful, full-screen onboarding wizard to walk admins through first-time kiosk setup.

### 🧩 Setup Steps (in order):
1. **Welcome Screen** – "Welcome to CueIT Kiosk"
2. **Server Connection** – Enter backend URL (e.g. Supabase or self-hosted API)
3. **PIN Setup** – Enter Admin PIN
4. **Room Name Setup** – Assign Room/Kiosk Name (Ensure kiosks can be assigned to rooms via the admin UI)
5. **Confirmation Screen** – Summary of setup and success message

### 💡 UX Guidelines
- Use `NavigationStack` with `@State` enum to control flow
- Each step is its own SwiftUI View with `onNext` and `onBack` callbacks
- Large titles, system images, and clean Apple-style padding
- Persist wizard completion using `@AppStorage("isSetupComplete")`
- On completion, wizard should transition to KioskHomeView

---

## 📱 Design Tokens / UX Styling

| Element              | Value / Behavior                              |
|---------------------|------------------------------------------------|
| Font Sizes          | Title: 48pt, Subtitle: 20–24pt                 |
| Colors              | Status green/red, text white on dark overlay  |
| Spacing             | Consistent 16–24pt padding                    |
| Background          | Blurred grayscale image (like Brooklyn Bridge)|
| Animations          | Slide or fade between wizard steps            |
| Buttons             | Use `.borderedProminent` in wizard steps      |

---

## 🧪 Advanced Features

- Background polling from backend to update status or alert, config etc.
- Manual override mode (offline support)
- Offline ticket taking with sync once reconnected
- Fully remotely configurable via the admin UI.
- Ensure approriate transitions / menus etc. 
- Auto-refresh every 30s to sync state
- iOS idle timeout and reset to main view
- Local caching for offline fallback
- Ensure exisiting features transfer to the new design using the requirements
- 

---

## ✅ Deliverables
- [ ] `KioskHomeView.swift`: main kiosk UI layout
- [ ] `ActivationWizard.swift`: full Apple-style setup wizard
- [ ] `SettingsView.swift`: admin panel with config + override
- [ ] `StatusManager.swift`: syncs indicator from backend or manual
- [ ] Assets: background image, icons, font definitions

---

Let me know if you want me to generate the SwiftUI code for the full `ActivationWizard.swift` based on this plan!
