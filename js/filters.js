
document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.blog-category-button');
    const articles = document.querySelectorAll('.card-article-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('w--current'));
            // Add active class to clicked button
            this.classList.add('w--current');

            const filterValue = this.textContent.trim();

            articles.forEach(article => {
                const badge = article.querySelector('.badge.card-article');
                const badgeText = badge ? badge.textContent.trim() : '';

                if (filterValue === 'All' || filterValue === badgeText) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    });
});
