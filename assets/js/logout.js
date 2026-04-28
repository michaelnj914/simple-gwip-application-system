// Get the logout button element from the page
const btnLogout = document.getElementById("btnLogout");

// Check if the button exists before attaching an event
if (btnLogout) {
  // Add a click event listener to the logout button
  btnLogout.addEventListener("click", async function () {

    // Disable the button to prevent multiple clicks
    btnLogout.disabled = true;
    // Change the button text to indicate the logout process
    btnLogout.textContent = "Logging Out...";

    // Send a POST request to the server to perform logout
    const response = await fetch("api/users_service.php", {
      method: "POST",
      headers: {
        "API-COMMAND": "logout", // Custom header telling the API to run the logout command
      },
    });

    // Convert the server response to JSON
    const data = await response.json();

    // If logout was successful
    if (data.success) {
      // Clear the loggedInUser from localStorage
      localStorage.removeItem("loggedInUser");
      // Redirect the user to the login page
      window.location.href = "index.html";
    } else {
      // If logout fails, notify the user
      alert("Logout failed");

      // Re-enable the button so the user can try again
      btnLogout.disabled = false;
      // Restore the original button text
      btnLogout.textContent = "Logout";
    }
  });
}

