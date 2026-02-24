document.addEventListener('DOMContentLoaded', function () {
  // Inject CSS for Loader and Popup
  const style = document.createElement('style');
  style.innerHTML = `
    /* Loader Overlay */
    #form-loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      display: none;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    .spinner {
      border: 8px solid #f3f3f3;
      border-top: 8px solid #3898EC;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    #form-loader-text {
      font-size: 18px;
      color: #333;
      font-weight: bold;
    }

    /* Custom Success Popup */
    #success-popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: none;
      justify-content: center;
      align-items: center;
    }
    .success-popup {
      background: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      position: relative;
    }
    .success-popup h2 {
      color: #3898EC;
      margin-bottom: 15px;
      font-size: 28px;
    }
    .success-popup p {
      color: #555;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 25px;
    }
    .success-popup button {
      background-color: #3898EC;
      color: white;
      border: none;
      padding: 12px 30px;
      font-size: 16px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .success-popup button:hover {
      background-color: #2b7bc0;
    }
    .success-icon {
      font-size: 50px;
      color: #3898EC;
      margin-bottom: 20px;
    }
  `;
  document.head.appendChild(style);

  // Create Loader Elements
  const loaderOverlay = document.createElement('div');
  loaderOverlay.id = 'form-loader-overlay';
  loaderOverlay.innerHTML = `
    <div class="spinner"></div>
    <div id="form-loader-text">Submitting your request...</div>
  `;
  document.body.appendChild(loaderOverlay);

  // Create Popup Elements
  const popupOverlay = document.createElement('div');
  popupOverlay.id = 'success-popup-overlay';
  popupOverlay.innerHTML = `
    <div class="success-popup">
      <div class="success-icon">✓</div>
      <h2>Thank You!</h2>
      <p>Your submission has been received. We will get back to you shortly.</p>
      <button id="close-popup-btn">Close</button>
    </div>
  `;
  document.body.appendChild(popupOverlay);

  // Popup Close Logic
  document.getElementById('close-popup-btn').addEventListener('click', function () {
    popupOverlay.style.display = 'none';
  });

  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent default submission

      // Show Loader
      loaderOverlay.style.display = 'flex';

      const formData = new FormData(form);
      const elements = form.elements;
      const allCapturedData = {};

      // Capture ALL fields
      for (let [key, value] of formData.entries()) {
        if (value) {
          if (allCapturedData[key]) {
            if (Array.isArray(allCapturedData[key])) {
              allCapturedData[key].push(value);
            } else {
              allCapturedData[key] = [allCapturedData[key], value];
            }
          } else {
            allCapturedData[key] = value;
          }
        }
      }

      // Helper function to find values
      const findValue = (possibleNames, fieldType, namePattern) => {
        for (const name of possibleNames) {
          if (allCapturedData[name]) {
            return Array.isArray(allCapturedData[name]) ? allCapturedData[name].join(', ') : allCapturedData[name];
          }
        }
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (!el.name && !el.id) continue;
          const name = (el.name || '').toLowerCase();
          const id = (el.id || '').toLowerCase();
          if (fieldType && el.type === fieldType) return el.value;
          if (namePattern && (name.includes(namePattern) || id.includes(namePattern))) return el.value;
        }
        return '';
      };

      const name = findValue(['name', 'Name', 'full-name', 'Full-Name'], 'text', 'name');
      const email = findValue(['email', 'Email'], 'email', 'email');
      const phone = findValue(['phone', 'Phone', 'PhoneNumber', 'phone-number', 'tel', 'Mobile'], 'tel', 'phone');
      const wpmessage = `Name: ${name}, Email: ${email}, Phone: ${phone}`;
      const messageFieldVal = findValue(['message', 'Message', 'comments', 'Comments'], 'textarea', 'message');
      const serviceFieldVal = findValue(['service', 'Service', 'location', 'Location', 'inquiry', 'Inquiry'], null, 'service');

      let constructedMessage = '';
      if (serviceFieldVal) constructedMessage += `Inquiry/Location: ${serviceFieldVal}\n`;
      const standardKeys = ['name', 'Name', 'email', 'Email', 'phone', 'Phone', 'message', 'Message', 'service', 'Service', 'location', 'Location', 'inquiry', 'Inquiry'];
      for (let key in allCapturedData) {
        const isStandard = standardKeys.some(sk => key.toLowerCase() === sk.toLowerCase() || (sk.length > 3 && key.toLowerCase().includes(sk.toLowerCase())));
        if (!isStandard) {
          const val = Array.isArray(allCapturedData[key]) ? allCapturedData[key].join(', ') : allCapturedData[key];
          constructedMessage += `${key}: ${val}\n`;
        }
      }
      if (messageFieldVal) constructedMessage += `\nMessage: ${messageFieldVal}`;

      const dateTime = new Date().toLocaleString();
      const sourceUrl = window.location.href;

      let htmlRows = '';
      for (let key in allCapturedData) {
        const val = Array.isArray(allCapturedData[key]) ? allCapturedData[key].join(', ') : allCapturedData[key];
        htmlRows += `
          <div class="field">
            <div class="label">${key.replace(/[-_]/g, ' ')}:</div>
            <div class="value">${val}</div>
          </div>
        `;
      }

      const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
          .header { background-color: #1623de; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background-color: #ffffff; padding: 30px 20px; }
          .field { margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px; }
          .field:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #1623de; text-transform: capitalize; font-size: 13px; letter-spacing: 0.5px; }
          .value { margin-top: 8px; white-space: pre-wrap; font-size: 16px; color: #444; }
          .footer { padding: 20px; background-color: #f8f9fa; font-size: 12px; color: #666; border-top: 1px solid #eee; }
          .footer a { color: #1623de; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Form Submission</h1>
          </div>
          <div class="content">
            ${htmlRows}
            <div class="field">
              <div class="label">Submission Date:</div>
              <div class="value">${dateTime}</div>
            </div>
          </div>
          <div class="footer">
            <strong>Source URL:</strong> <a href="${sourceUrl}">${sourceUrl}</a>
          </div>
        </div>
      </body>
      </html>
    `;

      fetch("https://n8n.fixaligner.com/webhook/xfixalignerform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, date: dateTime, message: constructedMessage.trim() || messageFieldVal || "",
          wpmessage, sourceUrl, htmlMessage, allFields: allCapturedData
        }),
      })
        .then(response => {
          loaderOverlay.style.display = 'none'; // Hide Loader
          if (response.ok) {
            form.style.display = 'none'; // Optional: Hide form
            popupOverlay.style.display = 'flex'; // Show Success Popup
            form.reset();
          } else {
            alert("Something went wrong. Please try again.");
          }
        })
        .catch((error) => {
          loaderOverlay.style.display = 'none'; // Hide Loader
          console.error("Webhook error:", error);
          alert("An error occurred. Please check your connection and try again.");
        });
    });
  });
});
