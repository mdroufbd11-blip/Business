document.getElementById('item-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('item-name').value;
    const qty = document.getElementById('item-qty').value;
    const price = document.getElementById('item-price').value;

    const tableBody = document.getElementById('table-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = 
        <td>${name}</td>
        <td>${qty}</td>
        <td>${price} টাকা</td>
        <td><button class="delete-btn" onclick="deleteRow(this)">মুছুন</button></td>
    ;

    tableBody.appendChild(newRow);

    // ফর্ম রিসেট
    document.getElementById('item-form').reset();
    updateStats();
});

function deleteRow(button) {
    button.closest('tr').remove();
    updateStats();
}

function updateStats() {
    const tableBody = document.getElementById('table-body');
    const rows = tableBody.getElementsByTagName('tr');
    
    document.getElementById('total-items').innerText = rows.length;

    let totalCost = 0;
    for (let row of rows) {
        const priceText = row.cells[2].innerText;
        // শুধুমাত্র সংখ্যাগুলো আলাদা করে যোগ করার জন্য
        const price = parseFloat(priceText.replace(' টাকা', '')) || 0;
        totalCost += price;
    }

    document.getElementById('total-cost').innerText = totalCost + ' টাকা';
}
