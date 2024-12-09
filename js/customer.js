function showMenu() {
    var x = document.getElementById("myTopnav");
        if (x.className === "topnav") {
            x.className += " responsive";
        } else {
            x.className = "topnav";
    }
}
  
var addCustomerModal = document.getElementById('addCustomerModal');
function showAddCustomerModal() {
    addCustomerModal.style.display = "flex";
}
function hideAddCustomerModal() {
    addCustomerModal.style.display = "none";
}

function searchCustomer() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("customerTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

// Function to load Customer from localStorage
function loadCustomers() {
    const customersList = JSON.parse(localStorage.getItem('customersList')) || [];
    const tableBody = document.getElementById('customerTable').querySelector('tbody');
  
    // Clear existing table rows
    tableBody.innerHTML = '';
  
    customersList.forEach((customer, index) => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.address}</td>
            <td>
                <button onclick="editCustomer(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
            </td>
            <td>
                <button onclick="delThisData(${index})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(newRow);
    });
}

// Function to edit a product
function editCustomer(index) {
    showAddCustomerModal();
    const customersList = JSON.parse(localStorage.getItem('customersList')) || [];
    const customer = customersList[index];
  
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerAddress').value = customer.address;
  
    // Store index in a hidden input or variable to update later
    document.getElementById('customerIndex').value = index;
}

// confirmation to delete
function delThisData(index) {
    let msg = "This data will permanently removed!";
    if (confirm(msg) == true) {
      deleteProduct(index);
    }
}
  
// Function to delete a product
function deleteProduct(index) {
    let customersList = JSON.parse(localStorage.getItem('customersList')) || [];
    customersList.splice(index, 1); // Remove the product at the index
    localStorage.setItem('customersList', JSON.stringify(customersList)); // Save updated inventory
    loadCustomers(); // Reload the inventory
}

// Event listener for form submission
document.getElementById('customerForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const name = document.getElementById('customerName').value;
    const address = document.getElementById('customerAddress').value;
    const index = document.getElementById('customerIndex').value;
  
    const customer = {
        name,
        address
    };
  
    // Get inventory from localStorage
    let customersList = JSON.parse(localStorage.getItem('customersList')) || [];
  
    if (index) {
        // Update existing customer
        customersList[index] = customer;
    } else {
        // Add new customer
        customersList.push(customer);
    }
  
    // Save updated inventory back to localStorage
    localStorage.setItem('customersList', JSON.stringify(customersList));
  
    // Reset the form and reload inventory
    document.getElementById('customerForm').reset();
    document.getElementById('customerIndex').value = ''; // Clear index
    loadCustomers();
    hideAddCustomerModal();
});

// Function to export customersList as JSON
function exportCustomer() {
    const customersList = localStorage.getItem('customersList') || '[]';
    const blob = new Blob([customersList], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customersList.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to import customersList from JSON file
function importCustomer(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const customersList = JSON.parse(e.target.result);
                localStorage.setItem('customersList', JSON.stringify(customersList));
                loadCustomers();
            } catch (error) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }
}

// Load inventory on page load
window.onload = loadCustomers;