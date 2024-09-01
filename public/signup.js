document.addEventListener('DOMContentLoaded', () => {
    // Initialize Google Sign-In
    google.accounts.id.initialize({
        client_id: '378796749007-4gvk6fot4hhn6g4mkei5oj35odbead4f.apps.googleusercontent.com',
        callback: handleCredentialResponse
    });

    // Add click event to custom button
    document.getElementById('googleSignInBtn').addEventListener('click', () => {
        google.accounts.id.prompt(); // Show the One Tap UI or Sign-In flow
    });
});

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const credential = response.credential;

    // Send the credential to your server for verification
    fetch('http://localhost:5003/auth/google/callback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_token: credential })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Signup successful; handle accordingly
            alert('Google sign-up successful!');
            window.location.href = 'welcome.html'; // Redirect to a welcome page or another page after successful signup
        } else {
            alert('Google sign-up failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Google sign-up failed. Please try again.');
    });
}
