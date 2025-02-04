import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdSupervisorAccount,
  MdQrCode,
} from "react-icons/md";

// Admin Imports
import MainDashboard from "views/admin/default";
import ModDashboard from "views/moderator/default";
import studentManager from "views/moderator/students";
import NFTMarketplace from "views/admin/marketplace";
import attendance from "views/moderator/attendance";
import Profile from "views/admin/profile";
import SearchedProfile from "views/admin/studentProfile";
import subjects from "views/admin/subjects/";
import SearchedModProfile from "views/moderator/studentProfile";
import posts from "views/moderator/posts";
import DataTables from "views/admin/dataTables";
// import RTL from "views/admin/rtl";

// Auth Imports
import SignInCentered from "views/auth/signIn";
import RegistrationPage from "views/reg/register";
import TokenPage from "views/reg/token";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: MainDashboard,
  },
  {
    name: "Moderator Dashboard",
    layout: "/moderator",
    path: "/default",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: ModDashboard,
  },
  {
    name: "Student Management",
    layout: "/moderator",
    path: "/student",
    icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
    component: studentManager,
  },
  {
    name: "Attendance",
    layout: "/moderator",
    path: "/attendance",
    icon: <Icon as={MdQrCode} width='20px' height='20px' color='inherit' />,
    component: attendance,
  },
  {
    name: "Router",
    layout: "/",
    path: "/register",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: RegistrationPage,
  },
  {
    name: "Token Display",
    layout: "/",
    path: "/token",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: TokenPage,
  },
  {
    name: "Staff Management",
    layout: "/admin",
    path: "/staff",
    icon: (
      <Icon
        as={MdSupervisorAccount}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: NFTMarketplace,
    secondary: true,
  },
  {
    name: "Student Management",
    layout: "/admin",
    icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
    path: "/students",
    component: DataTables,
  },
  {
    name: "Subject Management",
    layout: "/admin",
    icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
    path: "/subjects",
    component: subjects,
  },
  {
    name: "Search Result",
    layout: "/admin",
    path: "/search/result/:userType/:id", // Dynamic path parameter for profile ID
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    component: SearchedProfile,
    hidden:true
  },
  {
    name: "Search Result",
    layout: "/moderator",
    path: "/search/result/:userType/:id", // Dynamic path parameter for profile ID
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    component: SearchedModProfile,
    hidden:true
  },
  {
    name: "Posts",
    layout: "/moderator",
    path: "/posts", // Dynamic path parameter for profile ID
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    component: posts,
    
  },
  {
    name: "Profile",
    layout: "/admin",
    path: "/profile",
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    component: Profile,
  },
  {
    name: "Sign Out",
    layout: "/auth",
    path: "/sign-in",
    icon: <Icon as={MdLock} width='20px' height='20px' color='inherit' />,
    component: SignInCentered,
  },
  // {
  //   name: "RTL Admin",
  //   layout: "/rtl",
  //   path: "/rtl-default",
  //   icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
  //   component: RTL,
  // },
];

export default routes;
