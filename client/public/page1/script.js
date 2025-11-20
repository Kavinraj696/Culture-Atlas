document.addEventListener('DOMContentLoaded', () => {
    const API_ENDPOINT = 'http://localhost:4000/submit'; 

    const form = document.getElementById('festivalForm');
    const messageElement = document.getElementById('message');
    const submitButton = form.querySelector('button[type="submit"]');
    const previewImage = document.getElementById('previewImage');
    const festivalImageInput = document.getElementById('festivalImage');

    // -------------------------
    // Image Preview Handler
    // -------------------------
    festivalImageInput.addEventListener('change', () => {
        const file = festivalImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                previewImage.style.maxWidth = '100%';
                previewImage.style.border = '1px solid #000';
                previewImage.style.marginTop = '10px';
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.src = '';
            previewImage.style.display = 'none';
        }
    });

    // -------------------------
    // Form Submit Handler
    // -------------------------
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Show loading state
        messageElement.textContent = 'Submitting...';
        messageElement.style.color = '#007bff';
        messageElement.style.backgroundColor = '#e0f7fa';
        submitButton.disabled = true;

        const formData = new FormData(form);

        // Basic client-side validation
        const festivalName = formData.get('festival_Name');
        const country = formData.get('country');
        const date = formData.get('date');
        const note = formData.get('Note');

        if (!festivalName || !country || !date || !note) {
            messageElement.textContent = 'Please fill out all required fields!';
            messageElement.style.color = '#d63031';
            messageElement.style.backgroundColor = '#ffe6e6';
            submitButton.disabled = false;
            return;
        }

        try {
            // -------------------------
            // Festival Validity Check (GET)
            // -------------------------
            const verifyUrl = `http://localhost:4000/verify-festival?festival=${encodeURIComponent(festivalName)}&country=${encodeURIComponent(country)}`;
            const verifyResponse = await fetch(verifyUrl);
            const verifyResult = await verifyResponse.json();

            if (!verifyResult) {
                messageElement.textContent = 'Enter a Valid Festival!';
                messageElement.style.color = '#d63031';
                messageElement.style.backgroundColor = '#ffe6e6';
                submitButton.disabled = false;
                return;
            }

            // -------------------------
            // Final Submission
            // -------------------------
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = 'Festival submitted successfully! 🎉';
                messageElement.style.color = 'green';
                messageElement.style.backgroundColor = '#e6fff4';
                form.reset();
                previewImage.src = '';
                previewImage.style.display = 'none';
            } else {
                messageElement.textContent = `Submission failed: ${result.message || 'Server error'}`;
                messageElement.style.color = '#d63031';
                messageElement.style.backgroundColor = '#ffe6e6';
            }
        } catch (err) {
            console.error('Network Error:', err);
            messageElement.textContent = 'Could not connect to server.';
            messageElement.style.color = '#d63031';
            messageElement.style.backgroundColor = '#ffe6e6';
        } finally {
            submitButton.disabled = false;
        }
    });
});
