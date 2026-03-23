// Stars Animation
function createStars() {
    const stars = document.getElementById('stars');
    for(let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = star.style.height = (Math.random() * 3 + 1) + 'px';
        star.style.animationDelay = Math.random() * 2 + 's';
        stars.appendChild(star);
    }
}

// Page Navigation
function nextPage(pageNum) {
    document.querySelectorAll('.page').forEach((page, index) => {
        page.classList.toggle('active', index + 1 === pageNum);
    });
    // Auto scroll to top on page change (mobile)
    window.scrollTo(0, 0);
}

// Character Counter
const letterTextarea = document.getElementById('loveLetter');
const charCount = document.getElementById('charCount');
letterTextarea.addEventListener('input', function() {
    const length = this.value.length;
    charCount.textContent = `${length}/2500`;
    charCount.style.color = length > 2400 ? '#ff4757' : '#8b4513';
});

// Prevent zoom on iOS input
letterTextarea.addEventListener('focus', function() {
    this.style.fontSize = '16px';
});
letterTextarea.addEventListener('blur', function() {
    this.style.fontSize = '';
});

// Drawing Canvas
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let tool = 'brush';
let currentColor = '#ff69b4';
let brushSize = 8;

// Canvas Setup
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.lineWidth = brushSize;
ctx.fillStyle = '#fff8f8';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Resize canvas on mobile orientation change
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.fillStyle = '#fff8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Mouse Events (Desktop)
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch Events (Mobile - PREVENTED DEFAULT)
let lastTouch = null;
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

// Orientation change handler
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

function startDrawing(e) {
    e.preventDefault();
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX || lastTouch?.x) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY || lastTouch?.y) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    lastTouch = { x, y };
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = tool === 'eraser' ? 25 : brushSize + (window.innerWidth < 768 ? 2 : 0);
    ctx.strokeStyle = tool === 'eraser' ? '#fff8f8' : currentColor;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing(e) {
    drawing = false;
    lastTouch = null;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
        lastTouch = {
            x: touch.clientX,
            y: touch.clientY
        };
    }
    const mouseEvent = new MouseEvent(
        e.type.replace('touch', 'mouse'),
        { 
            clientX: touch?.clientX || 0, 
            clientY: touch?.clientY || 0 
        }
    );
    canvas.dispatchEvent(mouseEvent);
}

// Tools
function setTool(newTool) {
    tool = newTool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    canvas.style.cursor = newTool === 'eraser' ? 'grab' : 'crosshair';
}

function setColor(color) {
    currentColor = color;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// SHORT URL COMPRESSION
function generateShareLink() {
    // Compress canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    const canvasData = tempCanvas.toDataURL('image/png', 0.6).split(',')[1];
    
    // Short data
    const data = {
        t: letterTextarea.value.slice(0, 2500),
        c: canvasData,
        s: Date.now()
    };
    
    // Minify + encode
    const jsonMin = JSON.stringify(data).replace(/"/g, "'");
    let encoded = btoa(unescape(encodeURIComponent(jsonMin)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    // Truncate if too long (max 120 chars)
    encoded = encoded.substring(0, 120);
    const shareUrl = `${window.location.origin}${window.location.pathname}?l=${encoded}`;
    
    document.getElementById('shareLink').value = shareUrl;
    nextPage(4);
}

function copyLink() {
    const linkInput = document.getElementById('shareLink');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(linkInput.value).then(() => {
            showToast('✅ Link dicopy!');
        });
    } else {
        linkInput.select();
        linkInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        showToast('✅ Link dicopy!');
    }
}

// Toast notification (mobile friendly)
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: rgba(0,0,0,0.8); color: white; 
        padding: 15px 25px; border-radius: 25px; 
        font-size: 16px; z-index: 9999; 
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2500);
}

// Add CSS for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Load Shared Data
window.addEventListener('load', function() {
    createStars();
    resizeCanvas();
    
    // Focus textarea on load (desktop)
    if (window.innerWidth > 768) {
        letterTextarea.focus();
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('l');
    
    if (linkId) {
        try {
            const decoded = decodeURIComponent(escape(atob(linkId.replace(/-/g, '+').replace(/_/g, '/'))));
            const data = JSON.parse(decoded.replace(/'/g, '"'));
            
            letterTextarea.value = data.t || '';
            charCount.textContent = `${data.t?.length || 0}/2500`;
            
            if (data.c) {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    resizeCanvas();
                };
                img.src = 'data:image/png;base64,' + data.c;
            }
            
            setTimeout(() => nextPage(3), 1500);
        } catch(e) {
            console.log('Invalid link');
        }
    }
});

// Prevent context menu on canvas (mobile)
canvas.addEventListener('contextmenu', e => e.preventDefault());
