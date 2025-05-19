const timelineItems = document.querySelectorAll('.timeline-item');

  timelineItems.forEach((item, index) => {
    const delay = index * 1000;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(item);
  });