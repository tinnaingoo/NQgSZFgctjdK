document.addEventListener('DOMContentLoaded', () => {
    // Feature Slider အတွက် DOM elements တွေကို ရွေးပါ
    const slidesContainer = document.querySelector('.feature .slides');
    const indicatorsContainer = document.querySelector('.feature .indicators');
    const prevBtn = document.querySelector('.feature .prev');
    const nextBtn = document.querySelector('.feature .next');
    const slider = document.querySelector('.feature .auto-slider');

    // လိုအပ်တဲ့ elements တွေ မရှိရင် အလုပ်မလုပ်တော့ပါ
    if (!slidesContainer || !indicatorsContainer || !prevBtn || !nextBtn || !slider) {
        console.warn('Feature slider DOM elements not found. This script is for the main feature slider.');
        return;
    }

    const postsToShow = 5; // Slider မှာ ဘယ်နှခု ပြမလဲ (ဥပမာ ၅ ခု)
    let currentSlide = 0;
    let slideInterval;
    let slides = [];
    let dots = [];
    
    /**
     * post-data.json ကို fetch လုပ်ပြီး slider ကို တည်ဆောက်မယ်
     */
    async function fetchAndBuildSlider() {
        try {
            const response = await fetch('/home/post-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const allPosts = await response.json();

            // Posts တွေထဲကနေ random ရွေးမယ်
            const randomPosts = getRandomPosts(allPosts, postsToShow);

            if (randomPosts.length === 0) {
                slidesContainer.innerHTML = '<figure class="slide active"><div class="overlay"></div><figcaption class="caption">No featured posts available.</figcaption></figure>';
                indicatorsContainer.style.display = 'none'; // Dots တွေကို ဖျောက်ထားမယ်
                prevBtn.style.display = 'none'; // Prev/Next ကို ဖျောက်ထားမယ်
                nextBtn.style.display = 'none';
                return;
            }

            // HTML တွေကို တည်ဆောက်မယ်
            let slidesHTML = '';
            let dotsHTML = '';

            randomPosts.forEach((post, index) => {
                const isActive = index === 0 ? 'active' : '';
                
                // Slide (figure) HTML
                slidesHTML += `
                    <figure class="slide ${isActive}" 
                            style="background-image: url('${post.ImageUrl}');"
                            data-url="${post.PostUrl}.html">
                        <div class="overlay"></div>
                        <figcaption class="caption">
                            <a href="${post.PostUrl}.html">${post.title}</a>
                        </figcaption>
                    </figure>
                `;
                
                // Indicator (dot) HTML
                dotsHTML += `<span class="dot ${isActive}" aria-label="Slide ${index + 1}" data-slide-to="${index}"></span>`;
            });

            // တည်ဆောက်ထားတဲ့ HTML တွေကို DOM ထဲ ထည့်မယ်
            slidesContainer.innerHTML = slidesHTML;
            indicatorsContainer.innerHTML = dotsHTML;

            // Slider logic ကို စတင် အလုပ်လုပ်ခိုင်းမယ်
            initializeFeatureSlider(randomPosts.length);

        } catch (error) {
            console.error('Error building feature slider:', error);
            slidesContainer.innerHTML = `<figure class="slide active"><div class="overlay"></div><figcaption class="caption">Could not load featured posts. Error: ${error.message}</figcaption></figure>`;
            indicatorsContainer.style.display = 'none';
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }

    /**
     * Array တစ်ခုထဲကနေ random items တွေ ရွေးထုတ်တဲ့ function
     */
    function getRandomPosts(posts, num) {
        // array ကို မွှေနှောက်ပြီး ပထမဆုံး (num) အရေအတွက်ကို ယူပါ
        const shuffled = [...posts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    /**
     * Feature Slider (Next/Prev/Dots/Auto-play) logic တွေကို သတ်မှတ်မယ်
     */
    function initializeFeatureSlider(slideCount) {
        if (slideCount <= 1) { // slide တစ်ခုပဲ (သို့) မရှိရင်
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            indicatorsContainer.style.display = 'none';
            return; // ကျန်တဲ့ logic တွေ မလုပ်တော့ဘူး
        }

        // DOM elements တွေကို ပြန်ရွေး (HTML ထည့်ပြီးမှ)
        slides = document.querySelectorAll('.feature .slide');
        dots = document.querySelectorAll('.feature .dot');

        // Slide ပြောင်းတဲ့ function
        function showSlide(index) {
            // အားလုံးက 'active' class ဖြုတ်
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            // လက်ရှိ slide/dot မှာ 'active' class ထည့်
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            
            currentSlide = index;
            
            // Auto-play ကို reset လုပ်
            resetInterval();
        }

        // Next slide
        function next() {
            let newIndex = (currentSlide + 1) % slideCount;
            showSlide(newIndex);
        }

        // Previous slide
        function prev() {
            let newIndex = (currentSlide - 1 + slideCount) % slideCount;
            showSlide(newIndex);
        }

        // Auto-play interval ကို reset လုပ်
        function resetInterval() {
            clearInterval(slideInterval); // ရှိပြီးသား interval ကို ဖျက်
            slideInterval = setInterval(next, 5000); // 5 စက္ကန့်တိုင်း next ခေါ်
        }

        // --- Event Listeners ---

        // Next/Prev Buttons
        nextBtn.addEventListener('click', next);
        prevBtn.addEventListener('click', prev);

        // Dots တွေကို နှိပ်ရင်
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-slide-to'));
                showSlide(index);
            });
        });
        
        // Slides တွေကို နှိပ်ရင် (ခေါင်းစဉ်က <a> ကို မနှိပ်မိရင်)
        slides.forEach(slide => {
            slide.addEventListener('click', (e) => {
                // <a> tag (caption) ကို နှိပ်မိရင် ဒီ function အလုပ်မလုပ်ဘူး
                if (e.target.tagName === 'A') {
                    return;
                }
                
                // slide မှာ သိမ်းထားတဲ့ data-url ကို ယူပြီး သွားမယ်
                const url = slide.getAttribute('data-url');
                if (url) {
                    window.location.href = url;
                }
            });
            // နှိပ်လို့ရမှန်းသိအောင် cursor ပြောင်းပေးထား
            slide.style.cursor = 'pointer';
        });

        // Auto-play စတင်
        resetInterval();
    }

    // Script စ run တာနဲ့ slider ကို တည်ဆောက်ဖို့ ခေါ်လိုက်ပါ
    fetchAndBuildSlider();
});