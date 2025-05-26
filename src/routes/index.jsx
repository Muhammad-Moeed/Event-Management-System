import Signup from '../pages/SignUp.jsx';
import Login from '../pages/LogIn.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import MyEventRequest from '../pages/MyEventRequest.jsx';
import NewEvent from '../pages/NewEvent.jsx';
import Profile from '../pages/Profile';
import ErrorPage from '../pages/ErrorPage';
import LandingPage from '../pages/LandingPage.jsx';
import PrivateRoute from '../components/PrivateRoute';
import EventDetail from '../pages/EventDetail.jsx';
import CompleteProfile from '../pages/CompleteProfile.jsx';
import VerifyEmail from '../pages/VerifyEmail.jsx';
import AdminDashboard from '../pages/Admin/Dashboard.jsx';
import UserManagement from '../pages/Admin/UserManagement.jsx';



const routes = [
  {
    path: '/',
    element: <LandingPage />,
    showInSidebar: false,
    layout: false,
  },
  {
    path: '/signup',
    element: <Signup />,
    showInSidebar: false,
    layout: false,
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
    showInSidebar: false,
    layout: false,
  },
  {
    path: '/complete-profile',
    element: <CompleteProfile />,
    showInSidebar: false,
    layout: false
  },
  {
    path: '/login',
    element: <Login />,
    showInSidebar: false,
    layout: false,
  },

  {
    path: '/admin',
    element: (
      <PrivateRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </PrivateRoute>
    ),
    showInSidebar: true,
    sidebarIcon: 'dashboard',
    sidebarText: 'Admin Dashboard',
    adminOnly: true
  },
   {
    path: '/admin/users',
    element:(
      <PrivateRoute allowedRoles={['admin']}>
      <UserManagement />
      </PrivateRoute>),
    showInSidebar: true,
    sidebarText: 'Manage Users',
    sidebarIcon: 'users', 
    adminOnly: true
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute allowedRoles={['user']}>
        <Dashboard />
      </PrivateRoute>
    ),
    showInSidebar: true,
    sidebarText: 'Dashboard',
    sidebarIcon: 'dashboard',
    layout: true,
  },
  {
    path: '/my-event-request',
    element: (
      <PrivateRoute allowedRoles={['user']}>
        <MyEventRequest />
      </PrivateRoute>
    ),
    showInSidebar: true,
    sidebarText: 'My Event Request',
    sidebarIcon: 'request',
    layout: true,
  },
  {
    path: '/new-event',
    element: (
      <PrivateRoute  allowedRoles={['user']}>
        <NewEvent />
      </PrivateRoute>
    ),
    showInSidebar: true,
    sidebarText: 'New Event',
    sidebarIcon: 'loan',
    layout: true,
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute >
        <Profile />
      </PrivateRoute>
    ),
    showInSidebar: true,
    sidebarText: 'My Profile',
    sidebarIcon: 'profile',
    layout: true,
  },
  {
    path: '/event-detail/:id',
    element: (
      <PrivateRoute allowedRoles={['user']}>
        <EventDetail />
      </PrivateRoute>
    ),
    showInSidebar: false,
    layout: true,
  },
  {
    path : '/admin/event-detail/:id',
    element: (
      <PrivateRoute allowedRoles={['admin']}>
        <EventDetail />
      </PrivateRoute>
    ),
    showInSidebar: false,
    layout: true,
  },
  {
    path: '*',
    element: <ErrorPage />,
    showInSidebar: false,
    layout: false
  }
];

export default routes;
