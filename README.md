# RevAI CRM Dashboard 🎨

A premium, high-performance CRM interface designed for the modern revenue operations team. Built with React and powered by AI insights, this dashboard provides a real-time command center for inventory, sales, and lead management.

## 🚀 Experience the Edge

- **Lucid Intelligence**: Direct integration with the RevAI Backend for AI-powered lead scoring.
- **Visual Excellence**: Dark-mode aesthetic with vivid contrast and glassmorphism effects.
- **Responsive Control**: Optimized for mission-critical operations across all device sizes.

## 🛠 Tech Stack

- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (Modern data visualization)
- **UI Components**: Custom-built accessible components (Shadcn UI style)
- **State Management**: React Context API
- **Networking**: Axios

## ✨ Key Features

### 📦 Inventory Control Center
- **Live Ledger**: Real-time management of product nodes and stock volumes.
- **Predictive Restocking**: Visual alerts for critical stock thresholds.
- **Data Ingestion**: Seamless CSV import/export for bulk product management.

### 📈 Sales & Analytics
- **Dynamic Trendlines**: Time-series visualization of revenue and volume.
- **Performance Tables**: Analysis of best-selling products by quantity and revenue.

### 💼 CRM Hub
- **Salesforce Studio**: Centralized portal for connecting and managing CRM integrations.
- **Lead Health**: Real-time monitoring of lead flow and AI justification scores.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Running instance of the [RevAI Backend](https://github.com/Chahatj23/revai-dashboard-backend)

### Installation

1. Clone the repository:
   ```bash
   git clone [your-frontend-repo-url]
   cd revai-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure Environment:
   - Create a `.env` file in the root.
   - Set the API URL:
   ```env
   REACT_APP_API_URL=https://revai-dashboard-backend.onrender.com/api
   ```

### Execution

Launch the development command center:
```bash
npm start
```

## 🏗 Build for Production

Generate an optimized production bundle:
```bash
npm run build
```

---

Built with ❤️ by Chahatj23
