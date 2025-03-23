export const getPreLaunchEmailHtml = () => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .benefits {
        padding-left: 20px;
      }
      .insider-benefits {
        padding-left: 20px;
      }
    </style>
  </head>
  <body>
    <p>Welcome to HTS Hero! 🚀</p>

    <p>
      <strong>
        You've successfully signed up for our pre-launch deal, which
        includes:</strong
      >
    </p>
    <ul class="benefits">
      <li>A 50% discount on any plan during launch week</li>
      <li>Early access to the product -- we'll notify you about this soon</li>
      <li>Updates and announcements about the platform</li>
    </ul>

    <p>
      You're also now approved to join the insider group to unlock even more
      exclusive benefits:
    </p>
    <ul class="insider-benefits">
      <li><strong>Sneak peeks</strong> at what's coming next to the product</li>
      <li>
        <strong>Direct access</strong> to ask questions, give feedback, and
        request features
      </li>
      <li>
        <strong>A growing network</strong> of customs brokers, freight
        forwarders, and others in the industry
      </li>
    </ul>

    <p>
      <strong>
        👉
        <a href="https://www.facebook.com/groups/661021869759082"
          >Join the HTS Hero Insider Group Now</a
        >
      </strong>
    </p>

    <p>Faster classifications are just around the corner!</p>

    <div>
      <p>
        Best,<br /><br />
        Brendan<br />
        Founder |
        <a href="https://htshero.com/about">HTS Hero</a>
      </p>
    </div>
  </body>
</html>`;
};

export const getPreLaunchEmailText = () => {
  return `
  Welcome to HTS Hero!
  
  You've successfully registered for the pre-launch deal, which includes:
  * A 50% discount during our launch week
  * Early access to try out the product -- we'll notify you about this soon
  * An invitation to HTS Hero Insider -- see more below
  * Updates and announcements about the platform

  You're also now approved to join the insider group to unlock even more exclusive benefits:
  * Sneak peeks at what's coming next to the product
  * Direct access to ask questions, give feedback, and request features
  * A growing network of customs brokers, freight forwarders, and others in the industry
  
  Join the HTS Hero Insider Group by clicking here:
  https://www.facebook.com/groups/661021869759082

  Faster classifications are just around the corner!
  
  Best,

  Brendan
  Founder | HTS Hero (https://htshero.com/about)
  `;
};
