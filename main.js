import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitType from 'split-type';
import VanillaTilt from 'vanilla-tilt';
import { tsParticles } from '@tsparticles/engine';
import { loadFull } from 'tsparticles';

gsap.registerPlugin(ScrollTrigger);

// 1. Smooth Scrolling with Lenis
const lenis = new Lenis({
  lerp: 0.05,
  smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// 2. Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const magnetics = document.querySelectorAll('.magnetic');

window.addEventListener('mousemove', (e) => {
  const posX = e.clientX;
  const posY = e.clientY;
  
  // Dot follows instantly
  gsap.set(cursorDot, {
    x: posX,
    y: posY
  });

  // Outline has a slight lag
  gsap.to(cursorOutline, {
    x: posX,
    y: posY,
    duration: 0.15,
    ease: "power2.out"
  });
});

magnetics.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorOutline.classList.add('hover');
    gsap.to(el, { scale: 1.1, duration: 0.3, ease: 'power2.out' });
  });
  
  el.addEventListener('mouseleave', () => {
    cursorOutline.classList.remove('hover');
    gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' });
  });
});

// 3. Navigation Scroll Effect
const nav = document.querySelector('.main-nav');
const progressBar = document.querySelector('.progress-bar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// NavBar progress
gsap.to(progressBar, {
  scaleX: 1,
  transformOrigin: "left center",
  ease: "none",
  scrollTrigger: {
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});

// 4. Hero Section tsParticles
loadFull(tsParticles).then(() => {
  tsParticles.load({
    id: "tsparticles",
    options: {
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    color: { value: ["#E8A020", "#2E4A6B", "#FFFFFF"] },
    links: { enable: false },
    move: {
      enable: true,
      direction: "none",
      outModes: { default: "out" },
      random: true,
      speed: 0.5,
      straight: false
    },
    number: {
      density: { enable: true, area: 800 },
      value: 100
    },
    opacity: {
      animation: { enable: true, speed: 1, sync: false },
      value: { min: 0.1, max: 0.8 }
    },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 3 } }
  },
  detectRetina: true
    }
  });
});

// 5. Hero Animations
const heroTitle = new SplitType('.hero-title', { types: 'chars' });

const tlHero = gsap.timeline();
tlHero
  .from(heroTitle.chars, {
    y: 100,
    opacity: 0,
    stagger: 0.05,
    duration: 1,
    ease: "power4.out",
    delay: 0.2
  })
  .to('.hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out"
  }, "-=0.5");

// Parallax shapes
gsap.utils.toArray('.floating-shape').forEach(shape => {
  const speed = shape.getAttribute('data-speed');
  gsap.to(shape, {
    y: () => (ScrollTrigger.maxScroll(window) * speed),
    ease: "none",
    scrollTrigger: {
      trigger: '.hero-section',
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
});

// 6. About Section - Word reveal & Count Up
const aboutText = new SplitType('.about-text h2.split-text', { types: 'words, chars' });

gsap.from(aboutText.chars, {
  scrollTrigger: {
    trigger: '.about-section',
    start: "top 70%",
    end: "top 30%",
    scrub: 1
  },
  opacity: 0,
  y: 20,
  stagger: 0.1
});

gsap.utils.toArray('.fade-up-text').forEach(text => {
  gsap.to(text, {
    scrollTrigger: {
      trigger: text,
      start: "top 85%"
    },
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out"
  });
});

// Stat counting
const stats = document.querySelectorAll('.count-up');
stats.forEach(stat => {
  const target = parseInt(stat.getAttribute('data-target'));
  gsap.to(stat, {
    scrollTrigger: {
      trigger: '.stats-container',
      start: "top 80%"
    },
    innerHTML: target,
    duration: 2,
    snap: { innerHTML: 1 },
    ease: "power1.out"
  });
});

// 7. Projects Horizontal Scroll
const projectsContainer = document.querySelector('.horizontal-container');
const projectsWrapper = document.querySelector('.horizontal-wrapper');

let projectsWidth = projectsContainer.offsetWidth;
let amountToScroll = projectsWidth - window.innerWidth + (window.innerWidth * 0.2); // Adding padding buffer

const projectsTween = gsap.to(projectsContainer, {
  x: -amountToScroll,
  ease: "none"
});

ScrollTrigger.create({
  trigger: '.projects-section',
  start: "top top",
  end: () => `+=${amountToScroll}`,
  pin: true,
  animation: projectsTween,
  scrub: 1
});

// Initialize Vanilla Tilt
VanillaTilt.init(document.querySelectorAll(".project-card"), {
  max: 10,
  speed: 400,
  glare: true,
  "max-glare": 0.2,
});

// 8. Interactive IDE snippet simulation
const codeStr = `import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const initParallax = () => {
  const elements = document.querySelectorAll('.parallax');
  
  elements.forEach(el => {
    gsap.to(el, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
};`;

const codeOutput = document.getElementById('code-output');

ScrollTrigger.create({
  trigger: '.ide-container',
  start: "top 75%",
  once: true,
  onEnter: () => {
    let i = 0;
    codeOutput.innerHTML = '';
    const typing = setInterval(() => {
      if(i < codeStr.length) {
        codeOutput.innerHTML += codeStr.charAt(i);
        i++;
      } else {
        clearInterval(typing);
      }
    }, 20);
  }
});
