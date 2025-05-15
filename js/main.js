/**
 * Main JavaScript file
 * This file includes all common functionality and initializes components
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Ignore empty anchors
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Offset for fixed navbar
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form fields
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            const subjectField = document.getElementById('subject');
            const messageField = document.getElementById('message');
            const formStatus = document.querySelector('.form-status-message');
            
            // Simple validation
            if (!nameField.value || !emailField.value || !subjectField.value || !messageField.value) {
                formStatus.textContent = 'ERROR: All fields are required.';
                formStatus.classList.add('error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                formStatus.textContent = 'ERROR: Please enter a valid email address.';
                formStatus.classList.add('error');
                return;
            }
            
            // Simulate form submission (in a real application, you would send data to a server)
            // Display success message
            formStatus.textContent = 'MESSAGE TRANSMITTED SUCCESSFULLY. STATUS: AWAITING RESPONSE.';
            formStatus.classList.remove('error');
            formStatus.classList.add('success');
            
            // Reset form
            contactForm.reset();
            
            // Reset status message after 5 seconds
            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.classList.remove('success', 'error');
            }, 5000);
        });
    }
});
