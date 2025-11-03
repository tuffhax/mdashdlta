# Context
# 🪐 Martian Habitat Dashboard – Project Context (Current Implementation)

## 🚀 Overview
The **Martian Habitat Dashboard** is an interactive, browser-based simulation for managing and visualizing life-support systems and crew health in a small Martian or Lunar habitat. It is designed to emulate how astronauts could monitor **oxygen, temperature, food, power, sleep, and wellness** — using fully simulated data for training, education, and prototype testing.

All system data in this prototype is **locally simulated** through JavaScript algorithms.
No external APIs or databases are used — all readings, charts, and alerts are generated dynamically in real time.

---

## 🧩 Core Components

### 1. 🌡️ Life Support Dashboard
**Files:** `index.html`, `script.js`, `styles.css`

This is the main interface for environmental monitoring and visualization.

#### Features

* **Simulated Data Generation:**
    Environmental values (oxygen, temperature, food, power, sleep, and wellness) are created using mathematical functions:
    * Sinusoidal patterns (for smooth periodic variation)
    * Gaussian noise (for random realism)
    * Example:
    ```js
    const oxygen = 20 + 2 * Math.sin(t * 0.5) + randomNormal(0, 0.3);
    ```
    This makes the readings “feel alive,” as if actual sensors are fluctuating with time.

* **Real-Time Charts (via Chart.js):**
    * **Oxygen and temperature:** line graphs showing live trends.
    * **Food inventory:** bar chart with warning coloration.
    * **Power usage:** doughnut chart split into “used” vs. “available.”
    * **Sleep cycles:** line chart showing hours slept.
    * **Wellness:** radar chart displaying stress, mood, and energy.

    Charts update continuously using a timed `updateData()` loop.

* **Alerts & Anomalies:**
    * If oxygen < 19%, temperature > 25°C, or food < 20%, an alert appears in the **“Active Alerts”** section.
    * Alerts pulse visually (red glow) and include acknowledgment buttons.
    * Color-coded indicators (green for normal, red for danger).

* **Bay Occupancy:**
    * Randomized occupancy indicators for each crew bay (green = occupied, red = vacant).
    * Hover tooltips show which crew member is currently in each section.

### 2. 🧑‍🚀 Crew System & Profiles
**Purpose:** Manage a team of six simulated crew members.

* **Crew Members:**
    * Dheeraj Chennaboina – **Commander**
    * Tarushv Kosgi – **Engineer**
    * Abhinav Boora – **Scientist**
    * Lalith Dasa – **Medic**
    * Crew Member 5 – **Technician**
    * Crew Member 6 – **Pilot**

* **Each member has:**
    * Role and biography
    * Custom alerts (e.g., “Hydration reminder,” “Sleep cycle alert”)
    * Privilege-based access control
    * Editable personal notes stored in memory during runtime

* Crew profiles are dynamically rendered in the **“Users”** section with buttons to:
    * Edit alerts
    * View health stats (pulled live from dashboard readings)

### 3. 💻 Terminal Command Interface
A built-in command console lets users interact with the system through text commands.

#### Command Examples
| Command | Description |
| :--- | :--- |
| `login [username]` | Logs in as a crew member (case-insensitive match) |
| `whoami` | Displays current logged-in user |
| `oxygen`, `temperature`, `food`, `power`, `sleep`, `wellness` | Shows live metric data |
| `set oxygen [value]` | Adjusts simulated oxygen (requires write privilege) |
| `analytics` | Displays simulated analytics summary |
| `logout` | Logs out of current session |
| `alerts` | Lists all current system alerts |
| `users` | Lists crew roles and privileges |

#### Permissions
Access to commands depends on the user’s privileges:

* **read** → basic metrics
* **write** → modify environment variables
* **admin** → override privileges
* **research** → analytics
* **medical** → health-related queries

This system mimics real command-line control aboard a spacecraft, encouraging **role-based decision-making**.

### 4. 🤖 ARIA AI Uplink
**Files:** `aria-uplink.js`, `ARIA_ARCHITECTURE.md`

**Purpose:** Adds a simulated AI assistant modeled after a mission AI like “HAL” or “EVA.” **ARIA** = **Adaptive Response Intelligence for Astronauts**.

#### Functionality

* Chat-based AI uplink that communicates with the **Gemini 2.0 Flash API**.
* Responds in immersive, sci-fi tone (e.g., `[ARIA UPLINK 07:42 UTC] Oxygen systems nominal.`).
* Handles simulated tasks like:
    * Diagnostics & maintenance reports
    * Crew psychological support
    * Mission command explanations
    * Educational/scientific queries

#### Implementation Details
Modular architecture inspired by CTFBot:

* `ARIA_CONFIG`: stores API endpoint, system prompt, timeout, and max tokens.
* `ariaState`: tracks API key, chat history, and theme.
* `ariaToast`: provides in-browser notifications.
* `sendAriaMessage()`: connects to Gemini API and formats the response.

Uses `localStorage` for:

* `aria_api_key` (user-provided Gemini key)
* `aria_theme` (UI theme persistence)

ARIA functions independently from the main dashboard but shares the same design style and tone.

### 5. 🎨 Design & UX Philosophy
**Defined in:** `styles.css`, `about.html`

* **Dark, OLED-optimized interface** for low power consumption and reduced eye strain.
* **Font: Atkinson Hyperlegible** – chosen for clarity and accessibility.
* **Glass-morphism aesthetic** with translucent layers and soft glows.
* **Color scheme:**
    * Cyan (`#00d4ff`) → calm systems
    * Red (`#ff6b6b`) → critical alerts
    * Green (`#4ecdc4`) → normal operation
* **Responsive layout:** works on desktop and tablets.
* **Minimal animations:** CSS-based pulses, fades, and hovers for visual depth.

---

## 🧠 Technical Summary
| Module | Function | Language | Description |
| :--- | :--- | :--- | :--- |
| `index.html` | Structure | HTML | Core dashboard layout |
| `styles.css` | Styling | CSS | Glass morphism, color system |
| `script.js` | Logic | JavaScript | Simulated sensors, charts, alerts |
| `aria-uplink.js` | AI Assistant | JavaScript | Gemini-powered mission AI |
| `ARIA_ARCHITECTURE.md` | Architecture Doc | Markdown | Internal refactoring notes |
| `about.html` | Aesthetic reasoning | HTML | Design explanation |

---

## 🧬 System Behavior Summary
| Parameter | Source | Range | Alert Trigger |
| :--- | :--- | :--- | :--- |
| **Oxygen** | Simulated (Math + noise) | 18–22 % | < 19 % |
| **Temperature** | Simulated | -10–25 °C | > 25 °C / < 0 °C |
| **Food Inventory** | Simulated | 0–100 % | < 20 % |
| **Power Usage** | Simulated | 0–100 % | > 90 % |
| **Sleep Cycles** | Simulated | 6–9 h | < 6 h |
| **Wellness** | Simulated | Avg. 4–8 | < 5 avg |

---

## 🪞 Vision Statement
A self-contained simulation that reimagines how astronauts could manage environmental systems and crew health with integrated AI assistance — built entirely in the browser using code-based data generation and responsive visualization.

---


* Tarush V Kosgi – Frontend, Charts, Simulation Logic
* Abhinav Boora – AI Integration, Architecture, and Crew Systems
* Dheeraj Chennaboina, Lalith Dasa, and Team – UX, Testing, and Concept Development

**Version 1.0 – November 2025**
**Status:** Functional Simulation Prototype (No API Dependencies)
## Features

### Login Page
- Provides access to the system
- Allows overriding alerts when necessary

### Personal Login Section
- Dedicated area for individual users to log in
- Displays personal statistics for each user

### Crew Chat
- Real-time chat functionality between the 4 crewmates:
  - Abhinav
  - Dheeraj
  - Lalith
  - Tarushv
- Chat history stored locally on the device

### Crew Radar
- Visual radar display showing the positions of crewmates within the habitat
- Indicates distance between crewmates in real-time

### Logging system
- a easy to read downloadable files will be made logging the following:
  - One for all alerts that popped up and the time at which they popped up along with for who. 
  - One for all commands that were sent through the terminal. This should be logged and turned into a docs weekly.
  - Make it simple and easy to read.