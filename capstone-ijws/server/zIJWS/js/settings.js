const loadProfile = () => {
  console.log("Hello");
  fetch("/checkuser").then(
    response => {
      response.text().then(
        userJSON => {
          const userObj = JSON.parse(userJSON);
          
          $("#username").val(userObj.username);
          $("#first-name").val(userObj["first-name"]);
          $("#last-name").val(userObj["last-name"]);
        }
      );
    }
  );
};