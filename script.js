document.addEventListener('DOMContentLoaded', function() {
    // Initialize payment days dropdown
    const paymentDaySelect = document.getElementById('paymentDay');
    for (let i = 1; i <= 28; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        paymentDaySelect.appendChild(option);
    }

    // Format number with spaces as thousand separators
    function formatNumber(number) {
        return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Parse number by removing spaces
    function parseFormattedNumber(str) {
        return parseInt(str.replace(/\s/g, '')) || 0;
    }

    // Format loan amount input
    const loanAmountInput = document.getElementById('loanAmount');
    loanAmountInput.value = formatNumber(loanAmountInput.value);

    loanAmountInput.addEventListener('input', function(e) {
        // Remove any non-digit characters
        let value = this.value.replace(/\D/g, '');
        // Format the number
        this.value = formatNumber(value);
        // Recalculate monthly payment
        calculateMonthlyPayment();
    });

    // Duration selector functionality
    const durationButtons = document.querySelectorAll('.duration-button');
    let currentDuration = 1; // Default duration (1 year)

    durationButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            durationButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current duration
            currentDuration = parseFloat(this.dataset.value);
            // Recalculate monthly payment
            calculateMonthlyPayment();
        });
    });

    // Insurance toggle functionality
    const insuranceToggle = document.getElementById('insuranceToggle');
    const insuranceInfo = document.getElementById('insuranceInfo');

    insuranceToggle.addEventListener('change', function() {
        insuranceInfo.style.display = this.checked ? 'block' : 'none';
        calculateMonthlyPayment();
    });

    // Calculate insurance premium using iterative formula
    function calculateInsurancePremium(baseAmount, years) {
        const INSURANCE_RATE = 0.004; // R = 0.4%
        const INSURANCE_COEFFICIENT = 1.3; // M = 130%
        const EPSILON = 1; // ε = 1 sum threshold

        let K_u_old = baseAmount;
        let K_u_new = baseAmount;
        let iterations = 0;
        
        do {
            K_u_old = K_u_new;
            
            // Calculate insurance payment
            const S_T = INSURANCE_COEFFICIENT * K_u_old;
            
            // Calculate insurance premium
            const S_M = S_T * INSURANCE_RATE * years;
            
            // Calculate new loan amount
            K_u_new = baseAmount + S_M;
            
            iterations++;
            
            // For development purposes, prevent infinite loops
            if (iterations > 100) break;
            
        } while (Math.abs(K_u_new - K_u_old) >= EPSILON);

        return {
            insurancePremium: K_u_new - baseAmount,
            totalAmount: K_u_new,
            iterations: iterations
        };
    }

    // Calculate monthly payment
    function calculateMonthlyPayment() {
        const baseAmount = parseFormattedNumber(loanAmountInput.value);
        let totalAmount = baseAmount;
        let insurancePremium = 0;

        if (insuranceToggle.checked) {
            const result = calculateInsurancePremium(baseAmount, currentDuration);
            totalAmount = result.totalAmount;
            insurancePremium = result.insurancePremium;
            
            // Update insurance premium display
            const insurancePremiumElement = document.getElementById('insurancePremium');
            insurancePremiumElement.textContent = formatNumber(insurancePremium);
            
            // For development purposes, log the number of iterations
            console.log('Calculation iterations:', result.iterations);
        }

        // Calculate monthly payment
        const monthlyPayment = totalAmount / (currentDuration * 12);
        
        // Update the display
        const monthlyPaymentElement = document.getElementById('monthlyPaymentAmount');
        monthlyPaymentElement.textContent = formatNumber(monthlyPayment) + ' сум';

if (insuranceToggle.checked) {
    const result = calculateInsurancePremium(baseAmount, currentDuration);
    totalAmount = result.totalAmount;
    insurancePremium = result.insurancePremium;

    // Sug‘urta limiti tekshirilmoqda
    if (totalAmount > 50000000) {
        insuranceToggle.checked = false;
        insuranceInfo.style.display = 'none';
        totalAmount = baseAmount;
        insurancePremium = 0;
    }
}

// Agar umumiy summa 50 000 000 dan kichik bo‘lsa, sug‘urtani yana yoqish
if (!insuranceToggle.checked && totalAmount < 50000000) {
    insuranceToggle.checked = true;
    insuranceInfo.style.display = 'block';
    
    // Sug‘urtani qayta hisoblash
    const result = calculateInsurancePremium(baseAmount, currentDuration);
    totalAmount = result.totalAmount;
    insurancePremium = result.insurancePremium;
}

// Update insurance premium display
const insurancePremiumElement = document.getElementById('insurancePremium');
insurancePremiumElement.textContent = formatNumber(insurancePremium);

// For development purposes, log the number of iterations
console.log('Calculation iterations:', result ? result.iterations : 'N/A');

        
        // Save current state
        const loanData = {
            baseAmount: formatNumber(baseAmount) + ' сум',
            insuranceAmount: formatNumber(insurancePremium) + ' сум',
            duration: currentDuration,
            monthlyPayment: formatNumber(monthlyPayment) + ' сум',
            totalAmount: formatNumber(totalAmount) + ' сум'
        };
        localStorage.setItem('loanData', JSON.stringify(loanData));
    }

    // Initial calculation
    calculateMonthlyPayment();

    // Handle continue button click
    document.querySelector('.continue-button').addEventListener('click', function() {
        const baseAmount = parseFormattedNumber(loanAmountInput.value);
        
        if (baseAmount <= 499999) {
            alert('Минимальная сумма кредита должна быть больше 500 000 сум');
            return;
        }

        // If amount is valid, proceed to scoring page
        window.location.href = 'scoring.html';
    });
});
