document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Hero Slider
  const sliderWrapper = document.querySelector('.slider-wrapper');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-control-prev');
  const nextBtn = document.querySelector('.slider-control-next');
  const dotsContainer = document.querySelector('.slider-indicators');

  if (sliderWrapper && slides.length > 0) {
    let currentSlide = 0;
    const slideCount = slides.length;
    let slideInterval;

    // Create dots dynamically if container exists
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        if (idx === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(idx);
          resetInterval();
        });
        dotsContainer.appendChild(dot);
      });
    }

    const dots = document.querySelectorAll('.slider-dot');

    function updateSlider() {
      // Move wrapper
      sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      // Update active states
      slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      // Update active dots
      if (dots.length > 0) {
        dots.forEach((dot, idx) => {
          if (idx === currentSlide) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slideCount;
      updateSlider();
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + slideCount) % slideCount;
      updateSlider();
    }

    function goToSlide(idx) {
      currentSlide = idx;
      updateSlider();
    }

    function startInterval() {
      slideInterval = setInterval(nextSlide, 4000);
    }

    function resetInterval() {
      clearInterval(slideInterval);
      startInterval();
    }

    // Event listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
      });
    }

    // Initialize
    updateSlider();
    startInterval();
  }

  // 3. Scroll Reveal Effect
  const revealElements = document.querySelectorAll('.reveal-up');
  
  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;
    
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < triggerBottom) {
        element.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  // Initial check
  revealOnScroll();
});

const loginBtn=document.querySelectorAll(".btn-login").forEach(btn =>{
    btn.addEventListener("click",()=>{
      window.location.href="/login"
    })
})