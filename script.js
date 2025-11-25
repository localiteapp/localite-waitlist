// --- Carousel Data ---
const places = [
    { title: "Vintage Restaurant", type: "large", img: "assets/img1.png" },
    { title: "Bowling Alley", type: "small", img: "assets/img2.png" },
    { title: "Brunch Spot", type: "large", img: "assets/img3.png" },
    { title: "Tennis Court", type: "small", img: "assets/img4.png" },
    { title: "Aesthetic Cafe", type: "large", img: "assets/img5.png" }
];

const track = document.getElementById('track');

// Function to create cards
function createCard(place) {
    const card = document.createElement('div');
    card.className = `card ${place.type}`;
    card.innerHTML = `
        <div class="card-img">
            <img src="${place.img}" alt="${place.title}" onerror="this.style.display='none'"> 
        </div>
        <div class="card-footer">
            <div class="pill-icon"><div class="orange-dot"></div></div>
            <span class="card-text">${place.title}</span>
        </div>
    `;
    return card;
}

// Populate Carousel
const allPlaces = [...places, ...places, ...places, ...places];
allPlaces.forEach(place => track.appendChild(createCard(place)));

// --- Magic Text Animation Logic (FIXED FOR ALIGNMENT) ---
document.addEventListener("DOMContentLoaded", () => {
    const headline = document.getElementById("magic-headline");
    
    function wrapLetters(element) {
        const nodes = Array.from(element.childNodes);
        element.innerHTML = ''; 
        
        nodes.forEach(node => {
            if (node.nodeType === 3) { // Text Node
                let text = node.textContent;
                
                // 1. Convert newlines and tabs to single spaces
                text = text.replace(/[\n\t]+/g, ' '); 
                
                // 2. Fix: Remove leading space if this is the First node 
                //    (Removes indentation before "Your")
                if (node === element.firstChild) {
                    text = text.trimStart();
                }

                // 3. Fix: Remove leading space if following a <br> 
                //    (Removes indentation before "Just")
                if (node.previousSibling && node.previousSibling.tagName === 'BR') {
                    text = text.trimStart();
                }

                const html = text.split('').map(char => {
                    if (char === ' ') return '<span class="space-char">&nbsp;</span>';
                    return `<span class="magic-letter">${char}</span>`;
                }).join('');
                
                const span = document.createElement('span');
                span.innerHTML = html;
                element.appendChild(span);
            } 
            else if (node.nodeType === 1) { // HTML Element
                if (node.tagName === 'BR') {
                    element.appendChild(node);
                } else {
                    wrapLetters(node);
                    element.appendChild(node);
                }
            }
        });
    }

    wrapLetters(headline);

    // Stagger animation
    const letters = document.querySelectorAll('.magic-letter');
    letters.forEach((letter, index) => {
        letter.style.animationDelay = `${index * 0.05}s`; 
    });
});

// --- Form Logic ---
const form = document.getElementById('waitlistForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const btn = form.querySelector('button');
    btn.textContent = "Joining...";
    btn.disabled = true;

    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (response.ok) {
            message.textContent = "You're on the list!";
            message.classList.remove('hidden');
            form.reset();
        } else {
            message.textContent = "Something went wrong.";
            message.classList.remove('hidden');
        }
    } catch (error) {
        message.textContent = "Check console (Backend not connected)"; 
        message.classList.remove('hidden');
    } finally {
        btn.textContent = "Join Wait List";
        btn.disabled = false;
    }
});