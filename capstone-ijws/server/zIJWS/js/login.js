const sign_in_btn = document.querySelector('#sign-in-btn');
const sign_up_btn = document.querySelector('#sign-up-btn');
const sign_in_btn2 = document.querySelector('#sign-in-btn2');
const sign_up_btn2 = document.querySelector('#sign-up-btn2');
const container = document.querySelector('.container');
const submit = document.getElementById('submitForm');

const showErrorMessage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlParams.entries());

  if(params.loginerror){
    let swalParams = {
      icon: "error",
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
    };
    swalParams.title = "Login Failed";
    swalParams.text = params.loginerror;
    Swal.fire(swalParams);
  }

  if(params.signuperror){
    let swalParams = {
      icon: "error",
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
    };
    swalParams.title = "Sign Up Failed";
    swalParams.text = params.signuperror;
    Swal.fire(swalParams);
  }

  if(params.signedup){
    let swalParams = {
      icon: "success",
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
    };
    swalParams.title = "Signed Up Successfully";
    swalParams.text = "Please login using the username and password you provided.";
    Swal.fire(swalParams);
  }
};

// sign_up_btn.addEventListener('click', () => {
//   container.classList.add("sign-up-mode");
// });

// sign_in_btn.addEventListener('click', () => {
//   container.classList.remove("sign-up-mode");
// });

// sign_up_btn2.addEventListener('click', () => {
//   container.classList.add("sign-up-mode2");
// });

// sign_in_btn2.addEventListener('click', () => {
//   container.classList.remove("sign-up-mode2");
// });

const switchToSignup = () => {
  container.classList.add("sign-up-mode");
  container.classList.add("sign-up-mode2");
};
const switchToSignin = () => {
  container.classList.remove("sign-up-mode");
  container.classList.remove("sign-up-mode2");
};

function showPassword(ev) {
  const eyeCon = ev.target;
  const pwField = $(ev.target).siblings("input")[0];
  if (pwField.type === "password") {
    pwField.type = "text";
    eyeCon.classList.remove('fa-eye-slash');
    eyeCon.classList.add('fa-eye');
  } else {
    pwField.type = "password";
    eyeCon.classList.remove('fa-eye');
    eyeCon.classList.add('fa-eye-slash');
  }
}

AOS.init();

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};


function submitForm(ev) {

  const username = document.getElementById('si-username');
  const password = document.getElementById('si-password');

  const usernameValue = username.value;
  const passwordValue = password.value;

  let swalParams = {
    icon: "error",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  };
  let isValid = true;

  if (usernameValue === '') {
    swalParams.title = "Missing Username";
    swalParams.text = "Please set a valid username";
    Swal.fire(swalParams);
    isValid = false;
  }

  if (passwordValue.length < 8) {
    swalParams.title = "Invalid Password";
    swalParams.text = "Please set a valid password of at least 8 characters";
    Swal.fire(swalParams);
    isValid = false;
  }

  return isValid;
}


async function submitForm2(form) {

  const username = document.getElementById('su-username');
  const email = document.getElementById('su-email');
  const password = document.getElementById('su-password');

  const usernameValue = username.value;
  const passwordValue = password.value;
  const emailValue = email.value;

  let swalParams = {
    icon: "error",
    title: "Missing Input",
    text: "Input cannot be empty",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  };

  let isValid = true;
  let isUsernameCheckingDone = true;

  if (usernameValue === '') {
    swalParams.title = "Missing Username";
    swalParams.text = "Please set a valid username";
    Swal.fire(swalParams);
    isValid = false;
  }
  else {
    isUsernameCheckingDone = false;
    await fetch(`/query-username?username=${usernameValue}`).then(value => {
      try {
        value.text().then(userCount => {
          console.log(userCount);
          const count = parseInt(userCount);
          if (count != 0) {
            swalParams.title = "Username Already Taken";
            swalParams.text = "Please set a different username";
            Swal.fire(swalParams);
            isValid = false;
          }
          console.log(isValid);
          if (isValid) {
            $(".sign-up-form")[0].submit();
            console.log("Submitted");
          }
          isUsernameCheckingDone = true;
        });
      } catch (error) {
        swalParams.title = "Error While Checking Username";
        swalParams.text = error;
        Swal.fire(swalParams);
        isValid = false;
        isUsernameCheckingDone = true;
      }
    });
  }

  if (!validateEmail(emailValue)) {
    swalParams.title = "Invalid Email";
    swalParams.text = "Please enter a valid email";
    Swal.fire(swalParams);
    isValid = false;
  }

  if (passwordValue.length < 8) {
    swalParams.title = "Invalid Password";
    swalParams.text = "Please enter a valid password of at least 8 characters";
    Swal.fire(swalParams);
    isValid = false;
  }

  if (isUsernameCheckingDone && !isValid) {
    return isValid;
  }

  if (isUsernameCheckingDone && isValid) {
    $("#sign-up-form").submit();
  }
}