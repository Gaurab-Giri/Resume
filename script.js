// Tabs functionality with smooth transitions
const tabs = document.querySelectorAll(".tabs li");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs and contents
    tabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((content) => {
      content.classList.remove("active");
    });
    
    // Add active class to clicked tab
    tab.classList.add("active");
    
    // Show corresponding content with animation
    const targetId = tab.getAttribute("data-target");
    const targetContent = document.getElementById(targetId);
    
    // Small delay for smooth transition
    setTimeout(() => {
      targetContent.classList.add("active");
    }, 50);
  });
});

// Music functionality
const bgMusic = document.getElementById("bgMusic");
const playBtn = document.getElementById("playMusicBtn");
const stopBtn = document.getElementById("stopMusicBtn");

let isPlaying = false;

playBtn.addEventListener("click", () => {
  if (!isPlaying) {
    bgMusic.currentTime = 0;
    bgMusic.play();
    isPlaying = true;
    playBtn.style.opacity = "0.7";
    stopBtn.style.opacity = "1";
  }
});

stopBtn.addEventListener("click", () => {
  bgMusic.pause();
  bgMusic.currentTime = 0;
  isPlaying = false;
  playBtn.style.opacity = "1";
  stopBtn.style.opacity = "0.7";
});

// Update button states when music ends
bgMusic.addEventListener("ended", () => {
  isPlaying = false;
  playBtn.style.opacity = "1";
  stopBtn.style.opacity = "0.7";
});

// Location functionality
const locationDisplay = document.getElementById("locationDisplay");
const locationText = locationDisplay ? locationDisplay.querySelector(".location-text") : null;

function updateLocation() {
  if (!locationDisplay || !locationText) return;
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Use reverse geocoding to get address (using a free API)
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
          .then(response => response.json())
          .then(data => {
            const city = data.city || data.locality || '';
            const state = data.principalSubdivision || '';
            const country = data.countryName || '';
            const locationString = [city, state, country].filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            locationText.textContent = locationString;
            locationDisplay.style.animation = "fadeIn 0.5s ease";
          })
          .catch(() => {
            locationText.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          });
      },
      (error) => {
        locationText.textContent = "Unable to retrieve location";
        console.error("Geolocation error:", error);
      }
    );
  } else {
    locationText.textContent = "Geolocation not supported";
  }
}

// Get location on page load
if (locationDisplay) {
  updateLocation();
  
  // Add click interaction to location display
  locationDisplay.addEventListener("click", () => {
    if (locationText) {
      locationText.textContent = "Updating...";
      updateLocation();
    }
  });
}

// Form submission handling
const contactForm = document.querySelector("#contact form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Get form values
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const message = contactForm.querySelector("textarea").value;
    
    // Simple validation
    if (!name || !email || !message) {
      alert("Please fill in all fields!");
      return;
    }
    
    // Show success message (you can replace this with actual form submission)
    const submitBtn = contactForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
      submitBtn.textContent = "Message Sent! ✓";
      submitBtn.style.background = "#4fcf70";
      
      // Reset form
      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = "";
      }, 2000);
    }, 1000);
  });
}

// Add interactive hover effects to skill tags
const skillTags = document.querySelectorAll(".skill-tag");
skillTags.forEach((tag) => {
  tag.addEventListener("mouseenter", () => {
    tag.style.transform = "translateY(-3px) scale(1.08)";
  });
  
  tag.addEventListener("mouseleave", () => {
    tag.style.transform = "translateY(0) scale(1)";
  });
});

// Add parallax effect to profile picture on scroll
let lastScrollY = 0;
window.addEventListener("scroll", () => {
  const profilePic = document.querySelector(".profile-pic");
  if (profilePic) {
    const scrollY = window.scrollY;
    const rotation = (scrollY - lastScrollY) * 0.5;
    profilePic.style.transform += ` rotate(${rotation}deg)`;
    lastScrollY = scrollY;
  }
});

// Add ripple effect to buttons
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}

// Add ripple to all buttons
const allButtons = document.querySelectorAll("button, .download-btn");
allButtons.forEach((button) => {
  button.addEventListener("click", createRipple);
});

// Add CSS for ripple effect dynamically
const style = document.createElement("style");
style.textContent = `
  button, .download-btn {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// Add typing effect to name (optional enhancement) - commented out to preserve original text
// Uncomment if you want typing animation on page load
/*
const nameElement = document.querySelector("h1");
if (nameElement && nameElement.textContent.trim()) {
  const originalText = nameElement.textContent;
  nameElement.textContent = "";
  let i = 0;
  
  function typeWriter() {
    if (i < originalText.length) {
      nameElement.textContent += originalText.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    }
  }
  
  setTimeout(typeWriter, 500);
}
*/

// Add intersection observer for fade-in animations on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll(".experience-card, .project-card, .education-card, .skill-category").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});
