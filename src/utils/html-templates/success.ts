export const successHTML = `
<!DOCTYPE html>
<html>
<head>
  <link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet'>
  <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
  <style>
    body {
      background-color: #181A1C;
      color: white;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    
    .container {
      text-align: center;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    .container img {
      width: 70%;
      max-width: 100%;
      margin-top: 300px;
    }
    
    h1 {
      font-family: 'Montserrat';
      margin-top: 100px;
      font-size: 64px;
      line-height: 28px;
      font-weight: 700;
      width: 100%;
    }
    
    p {
      font-family: 'Poppins';
      font-size: 42px;
      line-height: 42px;
      color: #8A8A8A;
      margin-top: 10px;
    }
    
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #181A1C;
      font-family: 'Montserrat';
      font-weight: 700;
      font-size: 64px;
      color: white;
      border: 1px solid white;
      border-radius: 50px;
      padding: 20px 60px;
      margin-top: 20px;
      text-decoration: none;
      position: relative;
    }
    
    .button::after {
      content: ">";
      font-size: 70px;
      margin-left: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://hlyx-dev-s3-bucket.s3.us-west-1.amazonaws.com/Checkmark_success.png" alt="Centered Image">
    <h1>Authorization Successful!</h1>
    <p>Email verification successful.<br>Please return to the HLYX App to<br>finalize the onboarding process.</p>
    <a href="#" class="button">Continue</a>
  </div>
</body>
</html>
`
