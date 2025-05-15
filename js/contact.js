/**
 * Contact Form handling
 */
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('connection-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form inputs
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Would typically send this data to a server endpoint
            // For demo purposes, we'll just simulate a successful submission
            console.log('Form submission:', { name, email, subject, message });
            
            // Show success message (in a real application, this would happen after successful AJAX call)
            const successMessage = document.querySelector('.status-success');
            const errorMessage = document.querySelector('.status-error');
            
            // Simulate server processing
            const formSubmitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = formSubmitBtn.textContent;
            formSubmitBtn.textContent = '[ PROCESSING... ]';
            formSubmitBtn.disabled = true;
            
            setTimeout(function() {
                // Simulate successful submission (You would check for actual success in a real app)
                const success = Math.random() > 0.1; // 90% success rate for demo
                
                if (success) {
                    // Success path
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Hide success message after a delay
                    setTimeout(function() {
                        successMessage.style.display = 'none';
                    }, 5000);
                } else {
                    // Error path
                    successMessage.style.display = 'none';
                    errorMessage.style.display = 'block';
                    
                    // Hide error message after a delay
                    setTimeout(function() {
                        errorMessage.style.display = 'none';
                    }, 5000);
                }
                
                // Re-enable button
                formSubmitBtn.textContent = originalText;
                formSubmitBtn.disabled = false;
            }, 1500);
        });
    }
});
