import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import reportWebVitals from './reportWebVitals';
import Login from './Login';
import Dashboard from './Dashboard';
import Loading from './Loading';

const root = ReactDOM.createRoot(document.getElementById('root'));

function checkIfLoggedIn(nextState, replace, next) {
  fetch('/checkuser')
    .then(response =>
      response.text()
        .then(text => {
          console.log(text);
          if (text === "No one is logged in")
            replace({
              pathname: "/login",
              state: { nextPathname: nextState.location.pathname }
            });
          else
            next();
        })
    )
    .catch(error => console.log(error));
}

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} onEnter={checkIfLoggedIn} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
