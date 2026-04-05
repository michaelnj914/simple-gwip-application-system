

//set the file date on the form to thecurrent date
document.getElementById("file-date").textContent = new Date().toLocaleDateString(); 

$(document).ready(function () {

  //submit application
  $("#applicationForm").on("submit", function (e) {
    e.preventDefault(); // stop normal form submission

    let firstName = $("input[name='firstName']").val();
    let lastName = $("input[name='lastName']").val();
    const name = firstName.toUpperCase() + " " + lastName.toUpperCase(); //will use this later

    // Disable button while submitting
    $("#submitBtn").prop("disabled", true).text("Submitting...");

    document.getElementById("responseMessage").textContent = "Submitting your application...";

    $.post($(this).attr('action'), $(this).serialize(), function (response) {
      const data = JSON.parse(response); // Parse JSON response to an object
      if (data.success) {
      
        document.getElementById("responseMessage").textContent = "";
        document.getElementById("success-dialog").showModal();//show modal dialog
        document.getElementById("success-message").textContent = name + ", your application was submitted successfully!";
        setTimeout(() => { //delay for 5 seconds
          document.getElementById("success-dialog").close();//remove modal dialog
          window.location.href = "index.php"; // back to the landing page

        }, 5000);
     
      }else {
        // Handle error response
        document.getElementById("responseMessage").textContent = data.message;
        $("#submitBtn").prop("disabled", false).text("Submit");
      }
    });
  });
});


    // $.ajax({
    //   url: "api/application.php",
    //   type: "POST",
    //   data: formData,
    //   processData: false, // REQUIRED for FormData
    //   contentType: 'application/form-data',// false, // REQUIRED for FormData

    //   success: function (response) {
    //     const data = JSON.parse(response); // Parse JSON response to an object
    //     if (data.success) {
    //       //if we are successful and a photo was chosen, uploasd it
    //       if (data.photo) {
    //         //upload photo
    //         const photo = data.photo;
    //         $.post("api/upload.php", { photo: photo }, function (response) {
    //           console.log(response);
    //         });
    //       }

    //       $("#success-dialog").showModal();
    //       $("#success-message").text(name + ", your application was submitted successfully!"); 

    //       // $("#responseMessage").html(
    //       //   `<p style="color:green; font-weight:bold;">
    //       //     Thank you, ${name}! Your application was submitted successfully.
    //       //   </p>`,
    //       // );
    //     }

    //     // // Clean response
    // response = response.trim();

    // if (response === "success") {
    //   $("#responseMessage").html(
    //     `<p style="color:green; font-weight:bold;">
    //       Thank you, ${firstName}! Your application was submitted successfully.
    //     </p>`,
    //   );

    //   // Redirect after 3 seconds
    //   setTimeout(function () {
    //     window.location.href = "index.html"; // your landing page
    //   }, 3000);
    // } else {
    //   $("#responseMessage").html(
    //     `<p style="color:red; font-weight:bold;">
    //       Application failed. Please try again.
    //     </p>`,
    //   );

    //   $("#submitBtn").prop("disabled", false).text("Submit Application");
    //       // }
    //     },

    //     error: function () {
    //       $("#responseMessage").html(
    //         `<p style="color:red; font-weight:bold;">
    //           Something went wrong. Please try again.
    //         </p>`,
    //       );

    //       $("#submitBtn").prop("disabled", false).text("Submit Application");
    //     },
    //   });

