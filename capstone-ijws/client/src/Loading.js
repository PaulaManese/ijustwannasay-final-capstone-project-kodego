import React from "react";
import "./Loading.css";

function Loading() {
  const redirect = () => {
    console.log("Redirection");
    fetch('localhost:3001/checkuser')
      .then(response =>
        response.text()
          .then(text => {
            console.log(text);
            if (text === "No one is logged in")
              return window.open("/login");
            else
              return window.open("/dashboard");
          })
      );
  };

  return (
    <div className="loader" onLoad={() => redirect()}></div>
  );
}

export default Loading;