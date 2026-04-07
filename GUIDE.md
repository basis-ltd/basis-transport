# Basis Transport End-User Journey Guide

This guide explains how to use the application from the screens and navigation you see in the web UI.

It is written for end users first, with a compact admin setup section. Where needed, it also shows:

- **Current behavior (today)**: what the app currently does
- **Ideal behavior**: what users would usually expect

## Who This Guide Is For

- Regular passengers who want to sign in, join trips, exit trips, and manage transport cards
- Admins/operators who create locations and trips, then start/complete/cancel trips

## UI Areas You Will Use

- **Public pages**: landing page, login, sign up
- **Main app sidebar**: Dashboard, Trips, Users (admin roles), Locations (admin roles)
- **Account area**: My profile, My Transport Cards, My trips

## Quick Glossary

- **Trip**: A transport journey from one location to another
- **Location**: A place selected on the map (used as trip origin or destination)
- **Passenger**: A regular user who joins/exits a trip
- **Transport Card**: A saved card number linked to your account
- **Trip Status**:
  - `Pending` (not started yet)
  - `In progress` (started)
  - `Completed` (finished)
  - `Cancelled` (stopped before completion)

## Regular User Journey (Primary)

### 1) Create Account or Log In

1. Open the app landing page.
2. Click **Sign up** (top navigation) to open `/auth/register` if you are new.
3. Fill in your details and click **Sign Up**.
4. If you already have an account, click **Login** to open `/auth/login`.
5. Enter your email and password, then click **Login**.
6. After success, you are redirected to **Dashboard**.

### 2) Access Your Account Area

1. From the app, open your account/profile area and go to **My profile** (`/account/profile`).
2. In **Quick actions**, click:
  - **My cards** -> opens `/account/transport-cards`
  - **My trips** -> opens `/user-trips`

### 3) Find a Trip

1. In the left sidebar, click **Trips**.
2. In the trips table, find the trip you want.
3. Click the trip row/action to open **Trip Details** (`/trips/:id`).
4. Review:
  - Trip status
  - Start/end times
  - From/To locations
  - Available seats
  - Passenger list

### 4) Join a Trip

1. Go to **Sidebar -> Trips -> Trip Details**.
2. In the action area, click **Join Trip**.
3. The app uses your current location (browser location) as your entrance location.
4. Your participation is recorded as an active trip.

### 5) Exit a Trip

1. Stay on **Trip Details** after joining.
2. Wait for the action button to change from **Join Trip** to **Exit Trip**.
3. Click **Exit Trip** to end your participation.
4. Your exit location and end time are recorded.

### 6) Manage Transport Cards

1. Go to **My profile -> Quick actions -> My cards**.
2. On **My Transport Cards**, click **Add card**.
3. Fill in the card form and save.
4. To change a card, use the row action menu and choose **Update**.
5. To remove a card, use the row action menu and choose **Delete**.
6. To view one card in detail, open `/account/transport-cards/:id`.

## Admin/Operator Journey (Compact)

### 1) Create Locations (Admin setup)

1. In the left sidebar, click **Locations**.
2. Click **Create Location**.
3. Fill:
  - Location name
  - Optional description
  - Map point (click on the map)
4. Click **Save Location**.

### 2) Create a Trip

1. In the left sidebar, click **Trips**.
2. Click **Create Trip**.
3. Choose:
  - Departing location
  - Arriving location
  - Total capacity
4. Click **Save**.
5. You return to the trips list, where the new trip appears as pending.

### 3) Start, Complete, or Cancel a Trip

1. Go to **Sidebar -> Trips**.
2. Open a trip from the table to view **Trip Details**.
3. Use lifecycle actions at the top right:
  - **Start Trip** when pending
  - **Complete Trip** when in progress
  - **Cancel Trip** when pending

## Current Behavior vs Ideal Behavior

### A) Roles and Visibility

- **Current behavior (today)**:
  - Navigation menu visibility is role-based (for example, Locations is shown for admin roles).
- **Ideal behavior**:
  - Every user should only see and use screens that match their role.

### B) Joining Trips and Capacity

- **Current behavior (today)**:
  - Joining uses current location and records participation.
  - Re-joining the same trip can reuse/reset the previous participation record for that trip.
  - Seat availability is displayed, but a user may still be able to join in cases where you would expect stricter blocking.
- **Ideal behavior**:
  - Join should be blocked when a trip is not open for boarding.
  - Join should be blocked when no seats remain.
  - Re-join behavior should preserve clear historical records.

### C) Profile Action Links

- **Current behavior (today)**:
  - Profile UI includes links like edit profile/change password.
  - Some linked pages may not be available as dedicated routes in the router.
- **Ideal behavior**:
  - Every visible profile action should lead to a working route/page.

### D) Sign-up With Existing Email

- **Current behavior (today)**:
  - Sign-up with an existing email can behave like a sign-in flow.
- **Ideal behavior**:
  - Existing email on sign-up should prompt the user to log in instead of silently acting like sign-in.

## Practical Tips for End Users

- If **Join Trip** or **Exit Trip** does not work, ensure location access is enabled in your browser.
- If you cannot see a menu item, your account role may not include that feature.
- If your session looks invalid, log out and log in again.
- If a profile action opens a missing page, use available pages like **My profile**, **Trips**, and **My Transport Cards** until that route is added.

## Typical End-User Flow (Quick Version)

1. Landing page -> **Sign up** or **Login**.
2. Sidebar -> **Trips**.
3. Trips table -> open a trip -> **Join Trip**.
4. After riding, same page -> **Exit Trip**.
5. My profile -> **My trips** to review activity.
6. My profile -> **My cards** -> **Add card** (or update/delete).