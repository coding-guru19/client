// Theme toggle (persists)
const root = document.documentElement;
document.querySelectorAll('.theme-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    root.classList.toggle('light');
    localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  });
});
if (localStorage.getItem('theme') === 'light') root.classList.add('light');

// Mobile nav toggle
const toggle = document.querySelector('.nav__toggle');
const links  = document.querySelector('.nav__links');
if (toggle && links){
  toggle.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('open');
  });
}



// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }});
},{threshold:0.14});
document.querySelectorAll('.reveal, .reveal-from-bottom').forEach(el=>io.observe(el));

// Counters
document.querySelectorAll('[data-counter]').forEach(el=>{
  const target = Number(el.dataset.counter || 0);
  const d = 1300; const s = performance.now();
  const step = (t)=>{ 
    const p = Math.min(1, (t-s)/d); 
    // Uses a smoother acceleration/deceleration curve: p * (2 - p)
    el.textContent = Math.floor(target * (p*(2-p))); 
    if (p<1) requestAnimationFrame(step); 
  };
  requestAnimationFrame(step);
});

// Parallax image
const par = document.querySelector('.strip .parallax');
if (par){ 
  window.addEventListener('scroll', ()=>{ 
    const y = par.getBoundingClientRect().top/12; 
    // FIX: Using template literal for transform style
    par.style.transform = `translateY(${y}px)`; 
  }); 
}

// 3D tilt + spinning cube
const tilt = document.querySelector('.tilt3d');
if (tilt){
  tilt.addEventListener('pointermove', (e)=>{
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - .5;
    const y = (e.clientY - r.top)/r.height - .5;
    // FIX: Using template literal for complex transform style
    tilt.style.transform = `perspective(900px) rotateX(${(-y*8).toFixed(1)}deg) rotateY(${(x*8).toFixed(1)}deg)`;
  });
  tilt.addEventListener('pointerleave', ()=> tilt.style.transform = 'perspective(900px) rotateX(0) rotateY(0)');
}

// Particle canvas in hero
(function(){
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w,h,p=[];
  const rnd=(a,b)=>Math.random()*(b-a)+a;
  const spawn=()=>({x:rnd(0,w),y:rnd(0,h),r:rnd(.6,2),vx:rnd(-.2,.2),vy:rnd(-.3,.3),a:rnd(.15,.45)});
  function resize(){ 
    w=canvas.width=canvas.offsetWidth; 
    h=canvas.height=canvas.offsetHeight;
    p = Array.from({length: Math.max(60, Math.floor(w*h/18000))}, spawn); 
  }
  function step(){
    ctx.clearRect(0,0,w,h); 
    ctx.fillStyle='#fff';
    p.forEach(o=>{ 
      o.x+=o.vx; 
      o.y+=o.vy; 
      if(o.x<0||o.x>w||o.y<0||o.y>h) Object.assign(o, spawn());
      ctx.globalAlpha=o.a; 
      ctx.beginPath(); 
      ctx.arc(o.x,o.y,o.r,0,Math.PI*2); 
      ctx.fill(); 
    });
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize); 
  resize(); 
  step();
})();

// Contact form (EmailJS + fallback)
const form = document.getElementById('contactForm');
if (form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // <<< CRITICAL FIX: Missing closing parenthesis (was: e.preventDefault())
    const hp = form.querySelector('input[name="_honeypot"]');
    if (hp && hp.value) return; // spam bot
    const data = Object.fromEntries(new FormData(form).entries());
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true; 
    btn.textContent = 'Sending...';
    try{
      if (window.emailjs && emailjs.send){
        await emailjs.send('YOUR_SERVICE_ID','YOUR_TEMPLATE_ID', data); // ← set yours
        alert('Thanks! Your message has been sent.');
        form.reset();
      } else {
        // fallback to user's email app
        // FIX: Using template literal to correctly encode the body data
        window.location.href = `mailto:machatepa33@gmail.com?subject=Quote%20Request&body=${encodeURIComponent(JSON.stringify(data,null,2))}`;
      }
    }catch(err){
      console.error(err);
      alert('Sorry, sending failed. Try the Email app option.');
    }finally{
      btn.disabled = false; 
      btn.textContent = original;
    }
  });
}

// Prevent sticky bottom bar from covering content on small screens
(function(){
  const mq = window.matchMedia('(max-width:760px)');
  const setPad = () => { document.body.style.paddingBottom = mq.matches ? '84px' : '0'; };
  setPad();
  (mq.addEventListener ? mq.addEventListener('change', setPad) : mq.addListener(setPad));
})();