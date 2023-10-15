import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home.jsx";
import Login from "./routes/Login.jsx";
import Profile from "./routes/Profile.jsx";
import Forgot from "./routes/Forgot.jsx";
import Verify from "./routes/Verify.jsx";
import "./index.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/profile",
        element: <Profile />,
    },
    {
        path: "/forgotPassword",
        element: <Forgot />,
    },
    {
        path: "/confirm",
        element: <Verify />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
