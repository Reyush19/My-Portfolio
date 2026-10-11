// ============================================
// 1. IMAGE SLIDER CLASS
// Controls all image slider functions.
// ============================================

class ImageSlider {
    constructor(slider) {
        this.slider = slider;

        // Find the slider elements.
        this.track = slider.querySelector(".slides");
        this.prevButton = slider.querySelector(".previous");
        this.nextButton = slider.querySelector(".next");
        this.dotsContainer = slider.querySelector(".slider-dots");
        this.viewport = slider.querySelector(".slider-viewport");

        // Get all original images.
        this.slides = this.track
            ? [...this.track.querySelectorAll(".slide")]
            : [];

        this.total = this.slides.length;

        // Store the current image and position.
        this.current = 0;
        this.position = this.total > 1 ? 1 : 0;

        // Store animation and timer information.
        this.animating = false;
        this.timer = null;
        this.dotTimer = null;
        this.dots = [];
        this.mouseOver = false;

        if (!this.track || this.total === 0) {
            return;
        }

  
        this.addClones();
        this.addDots();
        this.addEvents();
        this.setPosition(this.position, false);
        this.updateDots();
        this.startAutoplay();
    }


    // ============================================
    // 2. CREATE CLONES FOR INFINITE LOOPING
    // Copies the first and last images so the
    // slider can loop continuously.
    // ============================================

    addClones() {
        if (this.total < 2) {
            return;
        }

        const first = this.slides[0].cloneNode(true);
        const last = this.slides[this.total - 1].cloneNode(true);

        first.classList.add("slide--clone");
        last.classList.add("slide--clone");

        first.setAttribute("aria-hidden", "true");
        last.setAttribute("aria-hidden", "true");

        this.track.append(first);
        this.track.prepend(last);
    }


    // ============================================
    // 3. CREATE NAVIGATION DOTS
    // Creates one dot for every original image.
    // Clicking a dot selects that image.
    // ============================================

    addDots() {
        if (!this.dotsContainer) {
            return;
        }

        this.dotsContainer.innerHTML = "";

        this.dots = this.slides.map((slide, index) => {
            const dot = document.createElement("button");

            dot.className = "dot";
            dot.type = "button";
            dot.setAttribute(
                "aria-label",
                `Show image ${index + 1}`
            );

            dot.addEventListener("click", () => {
                this.goToSlide(index);
                this.resetAutoplay();
            });

            this.dotsContainer.append(dot);

            return dot;
        });
    }


    // ============================================
    // 4. HANDLE BUTTONS AND MOUSE EVENTS
    // Connects the previous and next buttons.
    // Pauses autoplay when the mouse enters the
    // image and resumes when the mouse leaves.
    // ============================================

    addEvents() {
        if (this.prevButton) {
            this.prevButton.addEventListener("click", () => {
                this.move(-1);
                this.resetAutoplay();
            });
        }

        if (this.nextButton) {
            this.nextButton.addEventListener("click", () => {
                this.move(1);
                this.resetAutoplay();
            });
        }

        if (this.viewport) {
            this.viewport.addEventListener("pointerenter", () => {
                this.mouseOver = true;
                this.stopAutoplay();
            });

            this.viewport.addEventListener("pointerleave", () => {
                this.mouseOver = false;
                this.startAutoplay();
            });
        }

        // Detect when the image movement finishes.
        this.track.addEventListener("transitionend", (event) => {
            if (event.target === this.track) {
                this.finishTransition();
            }
        });
    }


    // ============================================
    // 5. MOVE TO THE NEXT OR PREVIOUS IMAGE
    // Direction 1 moves forward.
    // Direction -1 moves backward.
    // ============================================

    move(direction) {
        if (this.total < 2 || this.animating) {
            return;
        }

        this.animating = true;

        // Change the slide position.
        this.position += direction;

        // Calculate the current image number.
        this.current =
            (this.current + direction + this.total) % this.total;

        // Schedule the active dot colour update.
        this.updateDots();

        // Move the image track.
        this.setPosition(this.position);
    }


    // ============================================
    // 6. SELECT AN IMAGE USING A DOT
    // Opens the image connected to the clicked dot.
    // ============================================

    goToSlide(index) {
        if (
            this.total < 2 ||
            this.animating ||
            index < 0 ||
            index >= this.total ||
            index === this.current
        ) {
            return;
        }

        this.animating = true;
        this.current = index;

        // Add one because a clone is before the first image.
        this.position = index + 1;

        this.updateDots();
        this.setPosition(this.position);
    }


    // ============================================
    // 7. FINISH THE INFINITE LOOP
    // Jumps from a clone to the matching original
    // image without showing a visible jump.
    // ============================================

    finishTransition() {
        if (this.total < 2) {
            this.animating = false;
            return;
        }

        // Move from the last-image clone to the real last image.
        if (this.position === 0) {
            this.position = this.total;
            this.setPosition(this.position, false);
        }

        // Move from the first-image clone to the real first image.
        if (this.position === this.total + 1) {
            this.position = 1;
            this.setPosition(this.position, false);
        }

        this.animating = false;
    }


    // ============================================
    // 8. POSITION THE IMAGE TRACK
    // Uses CSS transform to move the images.
    // Animation can be disabled for instant jumps.
    // ============================================

    setPosition(position, animate = true) {
        this.track.style.transition = animate ? "" : "none";

        this.track.style.transform =
            `translate3d(-${position * 100}%, 0, 0)`;

        // Refresh layout when animation is disabled.
        if (!animate) {
            this.track.offsetHeight;
        }
    }


    // ============================================
    // 9. UPDATE DOT COLOUR AFTER 0.3 SECONDS
    // Waits 300 milliseconds before highlighting
    // the dot for the currently selected image.
    // ============================================

    updateDots() {
        clearTimeout(this.dotTimer);

        this.dotTimer = setTimeout(() => {
            this.dots.forEach((dot, index) => {
                const active = index === this.current;

                dot.classList.toggle("is-active", active);
                dot.toggleAttribute("aria-current", active);
            });
        }, 300);
    }


    // ============================================
    // 10. START AUTOMATIC SLIDING
    // Changes to the next image every 3 seconds.
    // Runs only when the mouse is not over the image.
    // ============================================

    startAutoplay() {
        this.stopAutoplay();

        if (this.total > 1 && !this.mouseOver) {
            this.timer = setInterval(() => {
                this.move(1);
            }, 3000);
        }
    }


    stopAutoplay() {
        clearInterval(this.timer);
    }

    resetAutoplay() {
        this.startAutoplay();
    }
}


// ============================================
// 13. START THE IMAGE SLIDER
// Finds all elements with the data-slider
// attribute and activates each slider.
// ============================================

document.querySelectorAll("[data-slider]").forEach((slider) => {
    new ImageSlider(slider);
});