# BugCrate 

A simple and intuitive bug tracking application built with Next.js and React. Perfect for small teams to manage tasks, track bugs, and monitor project progress.

## 📋 Table of Contents

- [About BugCrate](#about-bugcrate)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)

## About BugCrate

BugCrate is a lightweight bug tracking and task management application designed for development teams. It provides an easy-to-use interface for creating, assigning, and tracking bugs and tasks throughout the development lifecycle.

### Key Benefits:
- **Role-Based Access**: Separate views for developers and managers
- **Time Tracking**: Built-in time logging for better project estimation
- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Real-time Updates**: Stay synchronized with your team's progress

## Features

### For Developers:
- View assigned tasks and bugs
- Update task status (Open → In Progress → Pending Approval)
- Log time spent on tasks
- Add comments and updates
- Track personal performance metrics

### For Managers:
- Create and assign tasks to team members
- Approve or reject completed tasks
- View team performance dashboard
- Generate reports and export data
- Manage system settings and user permissions

### General Features:
- Dark/Light theme support
- Responsive design for mobile and desktop
- Advanced search and filtering
- Interactive charts and analytics
- Task tagging and categorization
- Due date tracking and notifications

## Demo

### Live Demo
[View Live Demo][https://your-demo-link.vercel.app](https://bug-crate-two.vercel.app/login)

### Demo Video
[Watch Demo Video][(https://your-video-link.com) ](https://drive.google.com/file/d/1a6jAkN96Ct4YTz9EAhfWfin68zyVuwva/view?usp=sharing)

### Demo Credentials
```
Developer Account:
Email: yuvi@company.com
Password: password

Manager Account:
Email: suraj@company.com
Password: password
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yuvraj1016/BugCrate.git](https://github.com/yuvraj1016/BugCrate.git)
   cd BugCrate
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📖 Usage

### First Time Setup

1. **Access the Application**
   - Open your browser and go to `http://localhost:3000`
   - You'll be redirected to the login page

2. **Login with Demo Credentials**
   - Use the demo credentials provided above
   - Or create your own user accounts by modifying `lib/auth.ts`

3. **Explore the Features**
   - **Dashboard**: Overview of tasks and metrics
   - **Tasks**: Detailed task management with filters
   - **Kanban**: Visual board for task workflow
   - **Approvals**: Manager-only section for task approvals

### Creating Your First Task

1. Navigate to the **Tasks** page
2. Click the **"New Task"** button
3. Fill in the task details:
   - Title and description
   - Priority level
   - Assign to a team member
   - Set due date (optional)
   - Add relevant tags
4. Click **"Create Task"**

### Managing Tasks

- **Update Status**: Use the dropdown menu or Kanban board
- **Log Time**: Click on a task and use the "Log Time" button
- **Add Comments**: Use the Comments tab in task details
- **Filter Tasks**: Use the search and filter options

## 📁 Project Structure

```
bugcrate/
├── app/                     # Next.js app directory
│   ├── approvals/           # Manager approvals page
│   ├── dashboard/           # Dashboard page
│   ├── kanban/              # Kanban board page
│   ├── login/               # Authentication page
│   ├── tasks/               # Tasks management page
│   └── layout.tsx           # Root layout
├── components/              # Reusable React components
│   ├── auth/                # Authentication components
│   ├── dashboard/           # Dashboard components
│   ├── layout/              # Layout components
│   ├── tasks/               # Task-related components
│   └── ui/                  # Basic UI components
├── contexts/                # React context providers
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and data
│   ├── auth.ts              # Authentication logic
│   ├── data.ts              # Data management
│   └── utils.ts             # Helper functions
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
└── README.md                # Project documentation
```


## 🛠️ Technologies Used

- **Frontend Framework**: [Next.js 14](https://nextjs.org/)
- **UI Library**: [React 18](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🎨 Customization

### Adding New Users

Edit `lib/auth.ts` to add new users:

```typescript
const MOCK_USERS: User[] = [
  {
    id: "4",
    email: "newuser@company.com",
    name: "New User",
    role: "developer", // or "manager"
  },
  // ... existing users
]
```

### Modifying Task Statuses

Update the `TaskStatus` type in `types/index.ts`:

```typescript
export type TaskStatus = "open" | "in-progress" | "pending-approval" | "closed" | "your-new-status"
```

## Assumptions
- "The application relies on static data for functionalities such as task details, user authentication, and personal information."


