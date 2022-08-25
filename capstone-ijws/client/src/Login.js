import React from "react";
import Hearts from "./Hearts";
import "./Login.css";
import Swal from 'sweetalert2';

function Login() {
  const [signUpMode, setSignUpMode] = React.useState("");
  const [isPwHidden, setPwHidden] = React.useState(true);

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const getPwFieldType = isHidden => isHidden ? "password" : "text";
  const getEyeCon = isHidden => isHidden ? "fa-eye" : "fa-eye-slash";

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const trySubmit = () => {
    let invalid = false;
    let swalParams = {
      icon: "error",
      title: "Missing Input",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    };
    if (username === '') {
      invalid = true;
      swalParams.text = "Please enter a username";
    }

    if (!validateEmail(email) && signUpMode !== "") {
      invalid = true;
      swalParams.text = "Please enter a valid email address.";
    }

    if (password.length < 8) {
      invalid = true;
      swalParams.text = "Please enter a valid password consisting of at least 8 characters.";
    }

    if(invalid){
      Swal.fire(swalParams);
    }
    else{
      if(signUpMode !== ""){
        //Sign-up
        fetch(
          '/'
        )
      }
      else{
        //Sign-in
      }
    }
  };

  return (
    <div className={`container ${signUpMode}`}>
      <Hearts />
      <div className="signin-signup">
        <form action="#" className="sign-in-form">
          <h2 className="title">Sign in</h2>
          <div className="input-field">
            <i className="fas fa-user"></i>
            <input type="text" placeholder="Username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="input-field">
            <i className="fas fa-lock"></i>
            <input type={getPwFieldType(isPwHidden)} placeholder="Password" id="userPassword" value={password} onChange={e => setPassword(e.target.value)} />
            <i className={`fa-solid ${getEyeCon(isPwHidden)} eyecon`} id="eyeCon" onClick={() => { setPwHidden(!isPwHidden) }}></i>
          </div>
          <div className="form-link">
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          <input type="submit" value="Login" className="btn" onClick={() => trySubmit()} />
          <p className="social-text">Or Sign in with social</p>
          <div className="social-media">
            <a href="#" className="social-icon">
              <i className="fab fa-facebook"></i> </a><a href="" className="social-icon">
              <i className="fab fa-google"></i> </a>
          </div>
          <p className="account-text">
            Don't have an account yet? <a id="sign-up-btn2" onClick={() => setSignUpMode("sign-up-mode2")}>Sign up</a>
          </p>
        </form>
        <form action="#" className="sign-up-form">
          <h2 className="title">Sign up</h2>
          <div className="input-field">
            <i className="fas fa-user"></i>
            <input type="text" placeholder="Username" id="username2" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="input-field">
            <i className="fas fa-envelope"></i>
            <input type="email" placeholder="Email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-field">
            <i className="fas fa-lock"></i>
            <input type={getPwFieldType(isPwHidden)} placeholder="Password" id="userPassword2" value={password} onChange={e => setPassword(e.target.value)} />
            <i className={`fa-solid ${getEyeCon(isPwHidden)} eyecon`} id="eyeCon2" onClick={() => setPwHidden(!isPwHidden)}></i>
          </div>
          <input type="submit" value="Sign up" className="btn" onClick={() => trySubmit()} />
          <p className="social-text">Or Sign in with social</p>
          <div className="social-media">
            <a href="#" className="social-icon">
              <i className="fab fa-facebook"></i> </a><a href="" className="social-icon">
              <i className="fab fa-google"></i> </a>
          </div>
          <p className="account-text">
            Already have an account? <a id="sign-in-btn2" onClick={() => setSignUpMode("")}>Sign in</a>
          </p>
        </form>
      </div>
      <div className="panels-container">
        <div className="panel left-panel">
          <img src="img/chat.gif" alt="chat" className="image" />
          <div className="content">
            <h3 className="sign-label-margin">Already have an Account?</h3>
            <button className="btn sign-button-margin" id="sign-in-btn" onClick={() => setSignUpMode("")}>Sign in</button>
          </div>
        </div>
        <div className="panel right-panel">
          <img src="img/chat.gif" alt="chat" className="image" />
          <div className="content">
            <h3 className="sign-label-margin">Don't have an account yet?</h3>
            <button className="btn sign-button-margin" id="sign-up-btn" onClick={() => setSignUpMode("sign-up-mode")}>Sign up</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;