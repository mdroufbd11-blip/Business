document.addEventListener('DOMContentLoaded', () => {
    const salesForm = document.getElementById('sales-form');
    const customerNameInput = document.getElementById('customer-name');
    const productSelect = document.getElementById('product-select');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price');
    const tableBody = document.getElementById('table-body');
    const totalItemsElem = document.getElementById('total-items');
    const totalCostElem = document.getElementById('total-cost');

    let salesData = JSON.parse(localStorage.getItem('salesData')) || [];

    function updateUI() {
        tableBody.innerHTML = '';
        let totalCost = 0;
        let totalItems = salesData.length;

        salesData.forEach((item, index) => {
            totalCost += Number(item.price);

            const row = document.createElement('tr');
            row.innerHTML = 
                <td>${item.product} (${item.customer})</td>
                <td>${item.quantity}</td>
                <td>${item.price} টাকা</td>
                <td><button class="delete-btn" onclick="deleteItem(${index})">মুছে ফেলুন</button></td>
            ;
            tableBody.appendChild(row);
        });

        totalItemsElem.textContent = totalItems;
        totalCostElem.textContent = totalCost + ' টাকা';
        localStorage.setItem('salesData', JSON.stringify(salesData));
    }

    salesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newItem = {
            customer: customerNameInput.value,
            product: productSelect.value,
            quantity: quantityInput.value,
            price: priceInput.value
        };

        salesData.push(newItem);
        updateUI();
        salesForm.reset();
    });

    window.deleteItem = function(index) {
        salesData.splice(index, 1);
        updateUI();
    };

    updateUI();
});
