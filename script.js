document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       LOADER SCREEN
    ========================================== */
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        });
        // Fallback if load event takes too long
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 3000);
    }

    /* ==========================================
       MOBILE NAV DRAWER & STICKY HEADER
    ========================================== */
    const header = document.querySelector('header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle scroll class on load check
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // Close menu when clicking ANY link inside the nav menu (including CTA)
        const allNavLinks = navMenu.querySelectorAll('a');
        allNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // Scroll spy link highlighting
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPos = window.scrollY + 150; // offset for sticky menu

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}` || (currentSectionId === 'home' && href === '#')) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================
       SMOOTH SCROLLING PREVENTS JUMP
    ========================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Allow parameter hashes to go through (handled by hashchange observer)
            if (href.startsWith('#booking?')) return;

            e.preventDefault();
            const targetElement = document.querySelector(href === '#' ? 'body' : href);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ==========================================
       PARALLAX HERO EFFECT
    ========================================== */
    const heroBg = document.querySelector('.hero-parallax-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollVal = window.scrollY;
            heroBg.style.transform = `translateY(${scrollVal * 0.35}px)`;
        });
    }

    /* ==========================================
       SCROLL REVEAL INTERSECTION OBSERVER
    ========================================== */
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-slide-left, .reveal-slide-right');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('reveal-active'));
    }

    /* ==========================================
       STATS NUMBER RUNNING ANIMATION
    ========================================== */
    const counters = document.querySelectorAll('.counter-number');
    if ('IntersectionObserver' in window && counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'), 10);
                    const duration = 2000; // 2 seconds
                    const frameDuration = 1000 / 60; // 60fps
                    const totalFrames = Math.round(duration / frameDuration);
                    let frame = 0;

                    const countUp = () => {
                        frame++;
                        const progress = frame / totalFrames;
                        // EaseOutQuad formula
                        const easeProgress = progress * (2 - progress);
                        const currentVal = Math.round(target * easeProgress);
                        counter.textContent = currentVal;

                        if (frame < totalFrames) {
                            requestAnimationFrame(countUp);
                        } else {
                            counter.textContent = target;
                        }
                    };

                    requestAnimationFrame(countUp);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    } else {
        counters.forEach(counter => counter.textContent = counter.getAttribute('data-target'));
    }

    /* ==========================================
       LIVE WEATHER WIDGET (OPEN-METEO API)
    ========================================== */
    const weatherTemp = document.getElementById('weather-temp');
    const weatherDesc = document.getElementById('weather-desc');
    const weatherHumidity = document.getElementById('weather-humidity');
    const weatherWind = document.getElementById('weather-wind');
    const weatherIconBox = document.getElementById('weather-icon-box');

    // Panaji, Goa Coordinates
    const lat = 15.4967;
    const lon = 73.8278;
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&relative_humidity_2m=true`;

    const weatherWmoCodes = {
        0: { desc: 'Sunny & Clear', icon: 'fa-sun' },
        1: { desc: 'Mainly Clear', icon: 'fa-cloud-sun' },
        2: { desc: 'Partly Cloudy', icon: 'fa-cloud-sun' },
        3: { desc: 'Overcast Skies', icon: 'fa-cloud' },
        45: { desc: 'Foggy Weather', icon: 'fa-smog' },
        48: { desc: 'Foggy with Frost', icon: 'fa-smog' },
        51: { desc: 'Light Drizzle', icon: 'fa-cloud-rain' },
        53: { desc: 'Moderate Drizzle', icon: 'fa-cloud-rain' },
        55: { desc: 'Dense Drizzle', icon: 'fa-cloud-showers-heavy' },
        61: { desc: 'Slight Rain', icon: 'fa-cloud-rain' },
        63: { desc: 'Moderate Rain', icon: 'fa-cloud-rain' },
        65: { desc: 'Heavy Rain Showers', icon: 'fa-cloud-showers-heavy' },
        80: { desc: 'Light Showers', icon: 'fa-cloud-showers-water' },
        81: { desc: 'Moderate Showers', icon: 'fa-cloud-showers-water' },
        82: { desc: 'Violent Showers', icon: 'fa-cloud-showers-heavy' },
        95: { desc: 'Thunderstorms', icon: 'fa-cloud-bolt' },
        96: { desc: 'Thunderstorms with Hail', icon: 'fa-cloud-bolt' },
        99: { desc: 'Severe Thunderstorms', icon: 'fa-cloud-bolt' }
    };

    async function fetchGoaWeather() {
        try {
            const response = await fetch(weatherApiUrl);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            
            const current = data.current_weather;
            const temp = Math.round(current.temperature);
            const wind = Math.round(current.windspeed);
            const wmoCode = current.weathercode;
            
            // Open-Meteo returns humidity in details. For current, we fetch relative_humidity_2m if available, or simulate realistic Goan humidity
            const humidity = data.relative_humidity_2m ? data.relative_humidity_2m[0] : 78;

            if (weatherTemp) weatherTemp.textContent = `${temp}°C`;
            if (weatherWind) weatherWind.textContent = `${wind} km/h`;
            if (weatherHumidity) weatherHumidity.textContent = `${humidity}%`;

            const info = weatherWmoCodes[wmoCode] || { desc: 'Warm & Tropical', icon: 'fa-sun' };
            if (weatherDesc) weatherDesc.textContent = info.desc;
            if (weatherIconBox) {
                weatherIconBox.innerHTML = `<i class="fa-solid ${info.icon} weather-icon"></i>`;
            }
        } catch (error) {
            console.error('Weather Fetch Error: ', error);
            // Graceful offline fallback values standard to Goa
            if (weatherTemp) weatherTemp.textContent = `31°C`;
            if (weatherDesc) weatherDesc.textContent = `Sunny & Tropical`;
            if (weatherHumidity) weatherHumidity.textContent = `74%`;
            if (weatherWind) weatherWind.textContent = `10 km/h`;
        }
    }

    fetchGoaWeather();

    /* ==========================================
       TRAVEL INFO INTERACTIVE TABS
    ========================================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            const pane = document.getElementById(targetTab);
            if (pane) pane.classList.add('active');
        });
    });

    /* ==========================================
       PREMIUM FLEET CAROUSEL
    ========================================== */
    const fleetTrack = document.getElementById('fleet-track');
    const fleetSlides = document.querySelectorAll('#fleet-track .carousel-slide');
    const fleetPrevBtn = document.getElementById('fleet-prev');
    const fleetNextBtn = document.getElementById('fleet-next');
    const fleetDots = document.querySelectorAll('#fleet-dots .carousel-indicator');
    const fleetTitle = document.querySelector('.carousel-active-title');
    const fleetCounter = document.getElementById('current-slide-num');
    
    if (fleetTrack && fleetSlides.length > 0) {
        let currentFleetIndex = 0;
        let fleetAutoPlayTimer;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;

        const vehicleTitles = [
            'Premium SUV',
            'Luxury Sedan',
            'Luxury Mini Coach',
            'Premium Hatchback',
            'Tata Winger',
            'Force Urbania',
            'Toyota Rumion'
        ];

        function setTrackPosition() {
            fleetTrack.style.transform = `translateX(${currentTranslate}%)`;
        }

        function updateFleetCarousel() {
            prevTranslate = currentFleetIndex * -100;
            currentTranslate = prevTranslate;
            setTrackPosition();
            
            fleetDots.forEach((dot, index) => {
                dot.classList.toggle('current-indicator', index === currentFleetIndex);
            });
            
            if (fleetCounter) {
                fleetCounter.textContent = String(currentFleetIndex + 1).padStart(2, '0');
            }
            
            if (fleetTitle && vehicleTitles[currentFleetIndex]) {
                fleetTitle.textContent = vehicleTitles[currentFleetIndex];
            }
        }

        function nextFleetSlide() {
            currentFleetIndex = (currentFleetIndex + 1) % fleetSlides.length;
            updateFleetCarousel();
        }

        function prevFleetSlide() {
            currentFleetIndex = (currentFleetIndex - 1 + fleetSlides.length) % fleetSlides.length;
            updateFleetCarousel();
        }

        if (fleetNextBtn) {
            fleetNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fleetTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                nextFleetSlide();
                resetFleetAutoPlay();
                startFleetAutoPlay(); // Restart timer after manual click
            });
        }

        if (fleetPrevBtn) {
            fleetPrevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fleetTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                prevFleetSlide();
                resetFleetAutoPlay();
                startFleetAutoPlay();
            });
        }

        fleetDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                fleetTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                currentFleetIndex = index;
                updateFleetCarousel();
                resetFleetAutoPlay();
                startFleetAutoPlay();
            });
        });

        function touchStart(event) {
            isDragging = true;
            startPos = getPositionX(event);
            animationID = requestAnimationFrame(animation);
            fleetTrack.style.transition = 'none'; 
            resetFleetAutoPlay();
        }

        function touchMove(event) {
            if (isDragging) {
                const currentPosition = getPositionX(event);
                const diff = currentPosition - startPos;
                const viewportWidth = document.querySelector('.premium-fleet-carousel').clientWidth;
                const movePercentage = (diff / viewportWidth) * 100;
                currentTranslate = prevTranslate + movePercentage;
            }
        }

        function touchEnd() {
            isDragging = false;
            cancelAnimationFrame(animationID);
            fleetTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

            const movedBy = currentTranslate - prevTranslate;

            if (movedBy < -15 && currentFleetIndex < fleetSlides.length - 1) currentFleetIndex += 1;
            if (movedBy > 15 && currentFleetIndex > 0) currentFleetIndex -= 1;
            
            if (movedBy < -15 && currentFleetIndex === fleetSlides.length - 1 && movedBy < -40) {
                 currentFleetIndex = 0;
            }
            if (movedBy > 15 && currentFleetIndex === 0 && movedBy > 40) {
                currentFleetIndex = fleetSlides.length - 1;
            }

            updateFleetCarousel();
            startFleetAutoPlay();
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        function animation() {
            if (isDragging) {
                setTrackPosition();
                requestAnimationFrame(animation);
            }
        }

        fleetTrack.addEventListener('touchstart', touchStart, {passive: true});
        fleetTrack.addEventListener('touchend', touchEnd);
        fleetTrack.addEventListener('touchmove', touchMove, {passive: true});

        fleetTrack.addEventListener('mousedown', touchStart);
        fleetTrack.addEventListener('mouseup', touchEnd);
        fleetTrack.addEventListener('mouseleave', () => {
            if(isDragging) touchEnd();
        });
        fleetTrack.addEventListener('mousemove', touchMove);

        function startFleetAutoPlay() {
            if (!fleetAutoPlayTimer) {
                fleetAutoPlayTimer = setInterval(() => {
                    fleetTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                    nextFleetSlide();
                }, 5000);
            }
        }

        function resetFleetAutoPlay() {
            clearInterval(fleetAutoPlayTimer);
            fleetAutoPlayTimer = null;
        }

        const carouselContainer = document.querySelector('.premium-fleet-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', resetFleetAutoPlay);
            carouselContainer.addEventListener('mouseleave', startFleetAutoPlay);
            carouselContainer.addEventListener('touchstart', resetFleetAutoPlay, {passive: true});
        }

        startFleetAutoPlay();
    }

    /* ==========================================
       CUSTOMER REVIEWS CAROUSEL
    ========================================== */
    const wrapper = document.querySelector('.carousel-wrapper');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-control-btn.prev');
    const nextBtn = document.querySelector('.carousel-control-btn.next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    if (wrapper && slides.length > 0) {
        let slideIndex = 0;
        const totalSlides = slides.length;
        let sliderTimer;

        // Build dots
        slides.forEach((_, idx) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                slideIndex = idx;
                updateSlider();
                resetTimer();
            });
            indicatorsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.carousel-dot');

        function updateSlider() {
            wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === slideIndex);
            });
        }

        function showNextSlide() {
            slideIndex = (slideIndex + 1) % totalSlides;
            updateSlider();
        }

        function showPrevSlide() {
            slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showNextSlide();
                resetTimer();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showPrevSlide();
                resetTimer();
            });
        }

        function startTimer() {
            sliderTimer = setInterval(showNextSlide, 6000);
        }

        function resetTimer() {
            clearInterval(sliderTimer);
            startTimer();
        }

        startTimer();
    }

    /* ==========================================
       GALLERY FILTERS & LIGHTBOX
    ========================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    // Gallery Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterVal = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterVal === 'all' || category === filterVal) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Lightbox modal trigger
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const caption = item.querySelector('.gallery-overlay h4');
            if (lightbox && lightboxImg && img) {
                lightboxImg.src = img.src;
                if (lightboxCaption && caption) {
                    lightboxCaption.textContent = caption.textContent;
                }
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // block page scroll
            }
        });
    });

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightboxClose) {
                closeLightbox();
            }
        });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    /* ==========================================
       FAQ ACCORDION DROPDOWN TOGGLES
    ========================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const faqItem = btn.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const ans = item.querySelector('.faq-answer');
                if (ans) ans.style.maxHeight = null;
            });

            // Open clicked if it wasn't already open
            if (!isActive) {
                faqItem.classList.add('active');
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            }
        });
    });

    /* ==========================================
       AUTO FILL FROM URL SEARCH & HASH
    ========================================== */
    function autoFillFromUrl() {
        const rawHash = window.location.hash;
        if (!rawHash) return;

        // Extract parameters from hash link such as: #booking?package=North%20Goa%20Sightseeing
        const hashParts = rawHash.split('?');
        const sectionId = hashParts[0];
        
        if (sectionId === '#booking' && hashParts[1]) {
            const hashParams = new URLSearchParams(hashParts[1]);
            const item = hashParams.get('item');
            const pkg = hashParams.get('package');
            const vehicle = hashParams.get('vehicle');
            const corp = hashParams.get('corp');
            const service = hashParams.get('service');

            const pkgSelect = document.getElementById('bk-package');
            const vehicleSelect = document.getElementById('bk-vehicle');
            const messageTextarea = document.getElementById('bk-message');

            // Reset dropdowns
            if (pkgSelect) pkgSelect.value = 'None';
            if (vehicleSelect) vehicleSelect.value = 'None';
            if (messageTextarea) messageTextarea.value = '';

            if (pkg) {
                if (pkgSelect) pkgSelect.value = pkg;
                if (messageTextarea) messageTextarea.value = `I am interested in booking the tour package: ${pkg}. Please provide a customized quote.`;
            }
            if (vehicle) {
                if (vehicleSelect) vehicleSelect.value = vehicle;
                if (messageTextarea) messageTextarea.value = `I want to inquire about custom pricing for the vehicle: ${vehicle}.`;
            }
            if (item) {
                if (messageTextarea) messageTextarea.value = `I want to request a customized quote for the adventure activity: ${item}. Please suggest the best options based on my budget and group size.`;
            }
            if (corp) {
                if (messageTextarea) messageTextarea.value = `I want to inquire about a customized Corporate team outing: ${corp}. Please share itinerary details.`;
            }
            if (service) {
                if (messageTextarea) messageTextarea.value = `I am interested in planning a trip with the service: ${service}. Please contact me with details.`;
            }

            // Smooth scroll to booking
            const targetSection = document.getElementById('booking');
            if (targetSection) {
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }

    // Call on load and on hashchange
    autoFillFromUrl();
    window.addEventListener('hashchange', autoFillFromUrl);

    /* ==========================================
       FORM VALIDATION & WHATSAPP REDIRECT
    ========================================== */
    const bookingForm = document.getElementById('booking-form');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;

            const nameInput = document.getElementById('bk-name');
            const phoneInput = document.getElementById('bk-phone');
            const emailInput = document.getElementById('bk-email');
            const dateInput = document.getElementById('bk-date');
            const pickupInput = document.getElementById('bk-pickup');
            const dropInput = document.getElementById('bk-drop');
            const vehicleSelect = document.getElementById('bk-vehicle');
            const packageSelect = document.getElementById('bk-package');
            const passengersInput = document.getElementById('bk-passengers');
            const messageInput = document.getElementById('bk-message');

            // Reset validation states
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('invalid');
            });

            // Name check
            if (!nameInput.value.trim()) {
                nameInput.parentElement.classList.add('invalid');
                isValid = false;
            }

            // Phone check
            const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
            if (!phoneInput.value.trim() || !phoneRegex.test(phoneInput.value.trim())) {
                phoneInput.parentElement.classList.add('invalid');
                isValid = false;
            }

            // Email check (optional, but must be valid if entered)
            if (emailInput.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value.trim())) {
                    emailInput.parentElement.classList.add('invalid');
                    isValid = false;
                }
            }

            // Date check
            if (!dateInput.value) {
                dateInput.parentElement.classList.add('invalid');
                isValid = false;
            }

            // Pickup check
            if (!pickupInput.value.trim()) {
                pickupInput.parentElement.classList.add('invalid');
                isValid = false;
            }

            // Drop check
            if (!dropInput.value.trim()) {
                dropInput.parentElement.classList.add('invalid');
                isValid = false;
            }

            // Passengers check
            if (!passengersInput.value || parseInt(passengersInput.value, 10) < 1) {
                passengersInput.parentElement.classList.add('invalid');
                isValid = false;
            }

            if (isValid) {
                // Compile WhatsApp message layout
                const name = nameInput.value.trim();
                const phone = phoneInput.value.trim();
                const email = emailInput.value.trim() || 'Not Provided';
                const travelDate = dateInput.value;
                const pickup = pickupInput.value.trim();
                const drop = dropInput.value.trim();
                const vehicle = vehicleSelect.value;
                const tourPackage = packageSelect.value;
                const passengers = passengersInput.value;
                const specMsg = messageInput.value.trim() || 'No special requests';

                const formattedMsg = 
`*Goa Tour Booking - Seashine Travels*
---------------------------------------
*Name:* ${name}
*Phone:* ${phone}
*Email:* ${email}
*Date:* ${travelDate}
*Pickup:* ${pickup}
*Drop:* ${drop}
*Vehicle Choice:* ${vehicle}
*Tour Package:* ${tourPackage}
*Passengers:* ${passengers}
*Special Requests:* ${specMsg}
---------------------------------------
_Sent via website booking form._`;

                // URL encode & navigate to WhatsApp api
                const waPhone = '917620306718';
                const whatsappUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(formattedMsg)}`;
                
                window.open(whatsappUrl, '_blank');
            } else {
                // Scroll to the first validation error
                const firstError = document.querySelector('.form-group.invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    /* ==========================================
       BACK TO TOP SCROLL VISIBILITY
    ========================================== */
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* ==========================================
       INTERACTIVE ENQUIRY MODAL (12s TIMER)
    ========================================== */
    const enquiryModal = document.getElementById('enquiry-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const popupForm = document.getElementById('popup-form');

    if (enquiryModal && !sessionStorage.getItem('enquiryModalShown')) {
        setTimeout(() => {
            enquiryModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }, 12000); // 12 seconds trigger
    }

    function closeEnquiryModal() {
        if (enquiryModal) {
            enquiryModal.classList.remove('active');
            document.body.style.overflow = '';
            sessionStorage.setItem('enquiryModalShown', 'true');
        }
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeEnquiryModal);
    }

    if (enquiryModal) {
        enquiryModal.addEventListener('click', (e) => {
            if (e.target === enquiryModal) {
                closeEnquiryModal();
            }
        });
    }

    // Modal Form Submission to WhatsApp
    if (popupForm) {
        popupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameField = document.getElementById('pop-name');
            const phoneField = document.getElementById('pop-phone');
            const interestField = document.getElementById('pop-interest');

            let isPopupValid = true;

            // Reset errors
            nameField.parentElement.classList.remove('invalid');
            phoneField.parentElement.classList.remove('invalid');

            if (!nameField.value.trim()) {
                nameField.parentElement.classList.add('invalid');
                isPopupValid = false;
            }

            const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
            if (!phoneField.value.trim() || !phoneRegex.test(phoneField.value.trim())) {
                phoneField.parentElement.classList.add('invalid');
                isPopupValid = false;
            }

            if (isPopupValid) {
                const name = nameField.value.trim();
                const phone = phoneField.value.trim();
                const interest = interestField.value;

                const popupMsg = 
`*New Custom Quote Enquiry - Seashine Travels*
---------------------------------------
*Name:* ${name}
*WhatsApp Phone:* ${phone}
*Interested In:* ${interest}
---------------------------------------
_Requesting local expert trip planning assistance._`;

                const waPhone = '917620306718';
                const whatsappUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(popupMsg)}`;

                closeEnquiryModal();
                window.open(whatsappUrl, '_blank');
            }
        });
    }
});
