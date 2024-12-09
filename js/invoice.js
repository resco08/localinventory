function showMenu() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

const now = new Date();
const year = now.getFullYear();                  // Current year
const month = String(now.getMonth() + 1).padStart(2, '0'); // Current month (01-12)
const day = String(now.getDate()).padStart(2, '0');         // Current day (01-31)
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;
const date = document.getElementById('date').value=formattedDate;

function loadProductSelect(selectElement) {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    // Clear existing options
    selectElement.innerHTML = '';

    // Create a default empty option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '';
    selectElement.appendChild(defaultOption);

    // Append each product name as an option
    inventory.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name; // or any unique identifier
        option.textContent = product.name; // display name
        selectElement.appendChild(option);
    });
}

// Add an event listener for dynamically added selects using event delegation
document.getElementById('productsContainer').addEventListener('change', function(event) {
    // Check if the change event comes from a product select
    if (event.target.classList.contains('product-name')) {
        const selectElement = event.target;
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        const selectedProductName = selectElement.value;

        const selectedProduct = inventory.find(product => product.name === selectedProductName);
        const priceInput = selectElement.closest('.product').querySelector('.product-price');

        if (selectedProduct) {
            priceInput.value = selectedProduct.price.toFixed(2); // Auto-fill price with 2 decimals
        } else {
            priceInput.value = ''; // Clear price if no product is selected
        }
    }
});

function loadCustomerSelect(selectElement) {
    const customerList = JSON.parse(localStorage.getItem('customersList')) || [];
    
    // Clear existing options
    selectElement.innerHTML = '';

    // Create a default empty option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '';
    selectElement.appendChild(defaultOption);

    // Append each customer name as an option
    customerList.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.name; // or any unique identifier
        option.textContent = customer.name; // display name
        selectElement.appendChild(option);
    });

    // Add an event listener to auto-fill the address field when a customer is selected
    selectElement.addEventListener('change', function () {
        const selectedCustomerName = selectElement.value;

        // Find the customer in the list based on the selected name
        const selectedCustomer = customerList.find(customer => customer.name === selectedCustomerName);

        // If the customer is found, auto-fill the address
        if (selectedCustomer) {
            document.getElementById('address').value = selectedCustomer.address; // auto-fill address
        } else {
            document.getElementById('address').value = ''; // clear address if no customer selected
        }
    });
}

// Call these functions on page load
window.onload = function() {
    const productSelects = document.querySelectorAll('.product-name');
    productSelects.forEach(select => loadProductSelect(select));
    
    const customerSelects = document.querySelectorAll('.customer-name'); // Make sure this matches your HTML class
    customerSelects.forEach(select => loadCustomerSelect(select));
};

// Modify your existing event listener
document.getElementById('addProductButton').addEventListener('click', function () {
    const productsContainer = document.getElementById('productsContainer');
    const newProductDiv = document.createElement('div');
    newProductDiv.classList.add('product');

    const productSelect = document.createElement('select');
    productSelect.classList.add('product-name');
    productSelect.id = 'productList_' + Date.now(); // Ensure each select has a unique ID

    // Initially populate the product select with existing inventory
    loadProductSelect(productSelect);  // Load product options

    // Creating the rest of the form fields
    newProductDiv.innerHTML = `
        <div class="form-group" id="pdName">
            <label for="product">Product Name:</label>
        </div>
    `;
    newProductDiv.querySelector('#pdName').appendChild(productSelect);

    newProductDiv.innerHTML += `
        <div class="form-group">
            <label for="quantity">Qty:</label>
            <input type="number" class="product-quantity" required min="1">
        </div>

        <div class="form-group">
            <label for="discount">Dc:</label>
            <input type="number" class="product-discount">
        </div>

        <div class="form-group">
            <label for="deposit">Dep:</label>
            <input type="number" class="product-deposit">
        </div>

        <div class="form-group">
            <label for="refund">Refd:</label>
            <input type="number" class="product-refund">
        </div>

        <div class="form-group">
            <label for="price">Price:</label>
            <input type="number" class="product-price" required min="0" step="0.01">
        </div>

        <button type="button" class="delete-button" onclick="removeProduct(this)"><i class="fa-solid fa-trash"></i></button>
    `;

    // Append the new product div to the container
    productsContainer.appendChild(newProductDiv);

    // We no longer need to call loadProductSelect here, as the event listener is handled by the parent
});

function removeProduct(button) {
    const productDiv = button.parentElement;
    productDiv.remove();
}

document.getElementById('invoiceForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;

    const products = Array.from(document.querySelectorAll('.product')).map(product => {
        const productName = product.querySelector('.product-name').value;
        const quantity = parseInt(product.querySelector('.product-quantity').value) || 0; // Default to 0
        const price = parseFloat(product.querySelector('.product-price').value) || 0; // Default to 0
        const discount = parseFloat(product.querySelector('.product-discount').value) || 0; // Default to 0
        const deposit = parseFloat(product.querySelector('.product-deposit').value) || 0; // Capture deposit
        const refund = parseFloat(product.querySelector('.product-refund').value) || 0; // Capture refund

        const partialAmount = quantity * price;
        const withDiscount = discount * quantity; // Calculate total discount
        const amountWithDiscount = partialAmount - withDiscount; // Total amount after discount
        const amountWithDeposit = amountWithDiscount + deposit;
        const amountWithRefund = amountWithDeposit - refund;

        return { productName, quantity, price, discount: withDiscount, deposit, refund, amountWithDeposit, amountWithRefund }; // Include deposit in the returned object
    });

    const lessDiscount = products.reduce((total, product) => total + product.discount, 0);
    const totalAmount = products.reduce((total, product) => total + product.amountWithRefund, 0);
    const totalDeposit = products.reduce((total, product) => total + product.deposit, 0); // Sum of deposits
    const totalRefund = products.reduce((total, product) => total + product.refund, 0); // Sum of refund

    const invoice = {
        date: new Date().toLocaleDateString(),
        name,
        address,
        products,
        totalAmount,
        lessDiscount,
        totalDeposit, // Include total deposit in the invoice
        totalRefund, // Include total deposit in the invoice
    };

    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    displayInvoice(invoice);
});

function displayInvoice(invoice) {
    const invoiceNum = `A${month}${day}${hours}${minutes}${seconds}`;
    const invoiceOutput = document.getElementById('invoiceOutput');
    const invoiceOutputDealerCopy = document.getElementById('invoiceOutputDealerCopy');

    const commonInvoiceDetails = `
        <hr>
        <h3>Digital Invoice</h3>
        <hr>
        <p>Invoice No: ${invoiceNum}</p>
        <p>Date: ${invoice.date}</p>
        <p>Name: ${invoice.name}</p>
        <p>Address: ${invoice.address}</p>
        <hr>
        <h4>Products</h4>
        <hr>
        <div class="table-container">
            <table cellspacing="0">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.products.map(product => `
                        <tr>
                            <td>${product.productName}</td>
                            <td>${product.quantity}</td>
                            <td>₱${product.price.toFixed(2)}</td>
                            <td>₱${product.discount.toFixed(2)}</td>
                            <td>₱${product.amountWithRefund.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <hr>
        <p>Less Discount: ₱${invoice.lessDiscount.toFixed(2)}</p>
        <p>Total Deposit: ₱${invoice.totalDeposit.toFixed(2)}</p> <!-- Display Total Deposit -->
        <p>Less Refund: ₱${invoice.totalRefund.toFixed(2)}</p> <!-- Display Total Refund -->
        <hr>
        <h4>Final Amount: ₱${invoice.totalAmount.toFixed(2)}</h4> <!-- Display Final Amount -->
        <hr>
        <p>Received by:</p>
        <hr>
    `;

    invoiceOutput.innerHTML = commonInvoiceDetails + `
        <p class="receipt-part"><i>Customer's Copy</i></p>
        <p class="receipt-note"><i><b>Note:</b> This receipt is not Official, this is for company use only. Please ask for the Official Receipt!</i></p>
        <div class="cut-line">
            <i class="fa-solid fa-scissors"></i>
            <hr class="cut">
        </div>
    `;

    invoiceOutputDealerCopy.innerHTML = commonInvoiceDetails + `
        <p class="receipt-part"><i>Company's Copy</i></p>
        <p class="receipt-note"><i><b>Note:</b> This receipt is not Official, this is for company use only. Please ask for the Official Receipt!</i></p>
        <div class="btn-container">
            <button type="button" onclick="print()">Print</button>
            <button type="button" class="resetBtn" onclick="reload()">Reset</button>
        </div>
    `;
}

function reload() {
    location.reload();
}