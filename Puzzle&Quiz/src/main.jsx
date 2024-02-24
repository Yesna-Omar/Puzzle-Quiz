import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import App from './App.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Navbar />
//   },
// ]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
        <App />
  </React.StrictMode>,
)
