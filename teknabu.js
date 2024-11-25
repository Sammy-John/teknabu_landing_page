// Select SDLC list and cards
const sdlcItems = document.querySelectorAll('.sdlc-item');
const displayImage = document.getElementById('sdlc-image');
const sdlcWrapper = document.querySelector('.sdlc-list-wrapper');

// Desktop: Change image on hover
sdlcItems.forEach(item => {
    item.addEventListener('mouseover', () => {
        const imageSrc = item.getAttribute('data-image');
        displayImage.src = imageSrc;
        displayImage.alt = item.querySelector('h3').innerText; // Update alt text
    });
});

// Desktop: Update ARIA attributes on hover
sdlcItems.forEach(item => {
    item.addEventListener('mouseover', () => {
        const imageSrc = item.getAttribute('data-image');
        displayImage.src = imageSrc;
        displayImage.alt = item.querySelector('h3').innerText;

        // Update ARIA-expanded for hover
        sdlcItems.forEach(i => i.setAttribute('aria-expanded', 'false'));
        item.setAttribute('aria-expanded', 'true');
    });
});


// Show the navbar on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const logoPosition = document.querySelector('.logo-container').offsetHeight;

    if (window.scrollY > logoPosition) {
        navbar.classList.remove('hidden');
    } else {
        navbar.classList.add('hidden');
    }
});

function toggleMobileMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const isExpanded = burgerMenu.getAttribute('aria-expanded') === 'true';

    // Toggle menu visibility and ARIA attribute
    burgerMenu.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('show');
}

// Event listener for burger menu to handle `Enter` and `Space`
document.querySelector('.burger-menu').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { // Check for Enter or Space
        event.preventDefault(); // Prevent default scrolling for Space
        toggleMobileMenu();
    }
});


function closeMobileMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');

    burgerMenu.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('show');
}

// Listen for resize events and reset menu state
window.addEventListener('resize', () => {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (window.innerWidth >= 769 && mobileMenu.classList.contains('show')) {
        mobileMenu.classList.remove('show'); // Hide the menu on larger screens
    }
});


let currentIndex = 0;

function updateImageAndActiveClass() {
    const activeItem = sdlcItems[currentIndex];
    const imageSrc = activeItem.getAttribute('data-image');
    displayImage.src = imageSrc;
    displayImage.alt = activeItem.querySelector('h3').innerText;

    // Update ARIA attributes for active and inactive items
    sdlcItems.forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-expanded', 'false');
        item.setAttribute('aria-selected', 'false');
    });

    activeItem.classList.add('active');
    activeItem.setAttribute('aria-expanded', 'true');
    activeItem.setAttribute('aria-selected', 'true');
}


// Initial setup: Display the first item and image
updateImageAndActiveClass();

const nextIcon = document.getElementById('nextIcon');

function updateNextButtonState() {
    // Example: If circular navigation is disabled, set aria-disabled when on the last item
    const isLastItem = currentIndex === sdlcItems.length - 1;
    nextIcon.setAttribute('aria-disabled', isLastItem.toString());
}


// Function to go to the next item
function goToNextItem() {
    currentIndex = (currentIndex + 1) % sdlcItems.length;
    updateImageAndActiveClass();
    updateNextButtonState();
}

// Click event for the next arrow icon (mobile only)
nextIcon.addEventListener('click', goToNextItem);


// Make the entire item clickable on mobile
sdlcItems.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) { // Only apply on mobile
            goToNextItem();
        }
    });
});

// Select the modal and close button
const comingSoonModal = document.getElementById('comingSoonModal');
const closeModal = document.getElementById('closeModal');

// Function to open the modal
function openModal() {
    comingSoonModal.style.display = 'flex';
}

// Function to close the modal
function closeModalHandler() {
    comingSoonModal.style.display = 'none';
}

// Add event listener to close button
closeModal.addEventListener('click', closeModalHandler);

// Close the modal when clicking outside of the content
window.addEventListener('click', (event) => {
    if (event.target === comingSoonModal) {
        closeModalHandler();
    }
});

// Smooth scroll to sections when clicking nav links and close burger menu
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 50, // Adjust for fixed navbar height if needed
                behavior: 'smooth'
            });
        }

        // Close the burger menu if it's open
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu.classList.contains('show')) {
            mobileMenu.classList.remove('show');
        }
    });
});

// Close on outside click
document.addEventListener('click', (event) => {
    const mobileMenu = document.querySelector('.mobile-menu');
    const burgerMenu = document.querySelector('.burger-menu');
    if (!mobileMenu.contains(event.target) && !burgerMenu.contains(event.target)) {
        closeMobileMenu();
    }
});

// Close on Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
});

function copyEmail() {
    const email = "sjr.dev@protonmail.com";
    navigator.clipboard.writeText(email).then(() => {
        alert("Email address copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy email address: ", err);
    });
}
