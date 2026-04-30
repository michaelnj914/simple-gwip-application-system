// Get the login button element from the page
const btnLogin = document.getElementById("btnLogin");

// Check if the login button exists before attaching the event listener
if (btnLogin) {
  // Add a click event listener to the login button
  btnLogin.addEventListener("click", async function (e) {
    e.preventDefault(); // stop normal form submission
    // Get the values entered in the username and password fields
    // trim() removes extra spaces before and after the text
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate input: make sure both username and password are provided
    if (!username || !password) {
      alert("Please enter username and password"); 
      return; // Stop execution if fields are empty
    }

    // Disable the login button to prevent multiple clicks
    btnLogin.disabled = true;

    // Change button text to show the login process is happening
    btnLogin.textContent = "Logging in...";

    // Create a FormData object to send login data to the server
    const formData = new FormData();
    formData.append("username", username); // attach username
    formData.append("password", password); // attach password

    // Custom header used by the API to determine the command (login)
    const myHeaders = {
      "api-command": "login",
    };
    
    // Send a POST request to the API with the login data
    const response = await fetch("api/users_service.php", {
      method: "POST",
      body: formData,
      headers: myHeaders,
    });

    // Convert the server response into JSON format
    const data = await response.json();

    // If login is successful
    if (data.success) {
      //save the loggedInUser to the localStorage
      localStorage.setItem("loggedInUser", JSON.stringify(data.result)); // Save the logged-in user information in localStorage as a stringified JSON object (data.result);
      // Redirect the user to the dashboard page
      window.location.href = "dashboard.php";
    } else {
      // If login fails, show the error message from the server
      alert(data.message);
    }
    // Re-enable the login button after the request finishes
    btnLogin.disabled = false;
    // Restore the original button text
    btnLogin.textContent = "LOGIN";
  });
}
