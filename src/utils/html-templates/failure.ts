export const failureHTML = `
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
      max-width: 600px; 
      margin-left: auto;
      margin-right: auto;
    }

    .container img {
      margin-top: 100px;
    }
    
    h1 {
      font-family: 'Montserrat';
      font-size: 32px;
      font-weight: 700;
      line-height: 30px;
      margin-top: 20px;
      width: 100%;
    }
    
    p {
      font-family: 'Poppins';
      font-size: 18px;
      color: #8A8A8A;
      margin-top: 10px;
      line-height: 21px;
    }
    
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #181A1C;
      font-family: 'Montserrat';
      font-weight: 700;
      font-size: 16;
      color: white;
      border: 1px solid white;
      border-radius: 50px;
      padding: 10px 21px;
      margin-top: 20px;
      text-decoration: none;
      position: relative;
    }
    
    .button::after {
      content: ">";
      font-size: 24px;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://hlyx-dev-s3-bucket.s3.us-west-1.amazonaws.com/exclamation_failed.png" alt="Centered Image">
    <h1>Authorization Failed</h1>
    <p>Email verification failed.<br>Please try to request another email<br>verification via the HLYX App.</p>
    <a href="#" class="button">Continue</a>
  </div>
</body>
</html>
`
