document.addEventListener('DOMContentLoaded', () => {
    // Signup Form Handling
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission

            // Collect form data
            const formData = new FormData(signupForm);
            const data = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            };

            console.log('Data being sent:', data); // Log data being sent

            try {
                // Send POST request to the server
                const response = await fetch('http://localhost:5003/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                // Check if the response is OK
                if (!response.ok) {
                    const errorDetails = await response.text();
                    console.error('Error Details:', errorDetails);

                    // Try parsing error details as JSON if applicable
                    try {
                        const errorJson = JSON.parse(errorDetails);
                        alert(`Signup failed: ${errorJson.message || 'Unknown error'}`);
                    } catch {
                        alert('Signup failed. Please check the console for more details.');
                    }
                    return; // Stop execution after handling error
                }

                // Check if the response is JSON
                const contentType = response.headers.get('Content-Type');
                let result;
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json(); // Parse as JSON
                } else {
                    result = await response.text(); // Parse as text if not JSON
                }

                // Handle success
                alert(result.message || 'Signup successful!'); // Adjust message handling
                window.location.href = 'login.html'; // Redirect to login page
            } catch (error) {
                // Handle fetch or network errors
                console.error('Error:', error);
                alert(`Signup failed due to network error: ${error.message}`);
            }
        });
    }

    // Signin Form Handling
    const signinForm = document.getElementById('signinForm');

    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission

            // Collect form data
            const formData = new FormData(signinForm);
            const data = {
                username: formData.get('username'),
                password: formData.get('password')
            };

            console.log('Data being sent:', data); // Log data being sent

            try {
                // Send POST request to the server
                const response = await fetch('http://localhost:5003/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                // Check if the response is OK
                if (!response.ok) {
                    const errorDetails = await response.text();
                    console.error('Error Details:', errorDetails);

                    // Try parsing error details as JSON if applicable
                    try {
                        const errorJson = JSON.parse(errorDetails);
                        alert(`Login failed: ${errorJson.message || 'Unknown error'}`);
                    } catch {
                        alert('Login failed. Please check the console for more details.');
                    }
                    return; // Stop execution after handling error
                }

                // Check if the response is JSON
                const contentType = response.headers.get('Content-Type');
                let result;
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json(); // Parse as JSON
                } else {
                    result = await response.text(); // Parse as text if not JSON
                }

                // Handle success
                alert(result.message || 'Login successful!');
                console.log('Token:', result.token); // Log token or other data
                localStorage.setItem('token', result.token); // Store token if applicable

                // Redirect or perform additional actions
                window.location.href = 'dashboard.html'; // Redirect to a protected page
            } catch (error) {
                // Handle fetch or network errors
                console.error('Error:', error);
                alert(`Login failed due to network error: ${error.message}`);
            }
        });
    }

    // Google Sign-In Button Handling
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => {
            google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Google Client ID
                callback: handleGoogleSignIn, // Callback to handle the response
            });

            // Render Google button invisibly since we're triggering it manually
            google.accounts.id.prompt();
        });
    }
});

// Callback to handle Google response
async function handleGoogleSignIn(response) {
    console.log('Google Sign-In Response:', response);

    // Send the Google ID token to your server for verification and user authentication
    try {
        const result = await fetch('http://localhost:5003/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: response.credential }), // Sending the ID token to the backend
        });

        if (!result.ok) {
            throw new Error('Google Sign-In failed');
        }

        const data = await result.json();
        alert('Login successful!');
        localStorage.setItem('token', data.token); // Save the token received from server
        window.location.href = 'dashboard.html'; // Redirect upon successful login
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        alert('Login failed. Please try again.');
    }
}
