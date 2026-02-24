(function () {
    function updatePricing() {
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                const country = data.country_name;
                const single_price = document.getElementById('single_price');
                const double_price = document.getElementById('double_price');
                const group_price = document.getElementById('group_price');

                if (single_price && double_price && group_price) {
                    if (country === "Lebanon") {
                        single_price.textContent = "$ 2,300";
                        double_price.textContent = "$ 2,200";
                        group_price.textContent = "$ 2,100";
                    } else {
                        single_price.textContent = "$ 3,500";
                        double_price.textContent = "$ 3,400";
                        group_price.textContent = "$ 3,300";
                    }
                }
            })
            .catch(error => console.error('Error fetching location:', error));
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updatePricing);
    } else {
        updatePricing();
    }
})();
