const sdlcItems=document.querySelectorAll('.sdlc-item');const displayImage=document.getElementById('sdlc-image');const sdlcWrapper=document.querySelector('.sdlc-list-wrapper');sdlcItems.forEach(item=>{item.addEventListener('mouseover',()=>{const imageSrc=item.getAttribute('data-image');displayImage.src=imageSrc;displayImage.alt=item.querySelector('h3').innerText})});sdlcItems.forEach(item=>{item.addEventListener('mouseover',()=>{const imageSrc=item.getAttribute('data-image');displayImage.src=imageSrc;displayImage.alt=item.querySelector('h3').innerText;sdlcItems.forEach(i=>i.setAttribute('aria-expanded','false'));item.setAttribute('aria-expanded','true')})});window.addEventListener('scroll',function(){const navbar=document.querySelector('.navbar');const logoPosition=document.querySelector('.logo-container').offsetHeight;if(window.scrollY>logoPosition){navbar.classList.remove('hidden')}else{navbar.classList.add('hidden')}});function toggleMobileMenu(){const burgerMenu=document.querySelector('.burger-menu');const mobileMenu=document.querySelector('.mobile-menu');const isExpanded=burgerMenu.getAttribute('aria-expanded')==='true';burgerMenu.setAttribute('aria-expanded',!isExpanded);mobileMenu.classList.toggle('show')}
document.querySelector('.burger-menu').addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleMobileMenu()}});function closeMobileMenu(){const burgerMenu=document.querySelector('.burger-menu');const mobileMenu=document.querySelector('.mobile-menu');burgerMenu.setAttribute('aria-expanded','false');mobileMenu.classList.remove('show')}
window.addEventListener('resize',()=>{const mobileMenu=document.querySelector('.mobile-menu');if(window.innerWidth>=769&&mobileMenu.classList.contains('show')){mobileMenu.classList.remove('show')}});let currentIndex=0;function updateImageAndActiveClass(){const activeItem=sdlcItems[currentIndex];const imageSrc=activeItem.getAttribute('data-image');displayImage.src=imageSrc;displayImage.alt=activeItem.querySelector('h3').innerText;sdlcItems.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-expanded','false');item.setAttribute('aria-selected','false')});activeItem.classList.add('active');activeItem.setAttribute('aria-expanded','true');activeItem.setAttribute('aria-selected','true')}
updateImageAndActiveClass();const nextIcon=document.getElementById('nextIcon');function updateNextButtonState(){const isLastItem=currentIndex===sdlcItems.length-1;nextIcon.setAttribute('aria-disabled',isLastItem.toString())}
function goToNextItem(){currentIndex=(currentIndex+1)%sdlcItems.length;updateImageAndActiveClass();updateNextButtonState()}
nextIcon.addEventListener('click',goToNextItem);sdlcItems.forEach(item=>{item.addEventListener('click',()=>{if(window.innerWidth<=768){goToNextItem()}})});const comingSoonModal=document.getElementById('comingSoonModal');const closeModal=document.getElementById('closeModal');function openModal(){comingSoonModal.style.display='flex'}
function closeModalHandler(){comingSoonModal.style.display='none'}
closeModal.addEventListener('click',closeModalHandler);window.addEventListener('click',(event)=>{if(event.target===comingSoonModal){closeModalHandler()}});document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(anchor=>{anchor.addEventListener('click',function(e){e.preventDefault();const targetId=this.getAttribute('href').substring(1);const targetSection=document.getElementById(targetId);if(targetSection){window.scrollTo({top:targetSection.offsetTop-50,behavior:'smooth'})}
const mobileMenu=document.querySelector('.mobile-menu');if(mobileMenu.classList.contains('show')){mobileMenu.classList.remove('show')}})});document.addEventListener('click',(event)=>{const mobileMenu=document.querySelector('.mobile-menu');const burgerMenu=document.querySelector('.burger-menu');if(!mobileMenu.contains(event.target)&&!burgerMenu.contains(event.target)){closeMobileMenu()}});document.addEventListener('keydown',(event)=>{if(event.key==='Escape'){closeMobileMenu()}});function copyEmail(){const email="sjr.dev@protonmail.com";navigator.clipboard.writeText(email).then(()=>{alert("Email address copied to clipboard!")}).catch(err=>{console.error("Failed to copy email address: ",err)})}