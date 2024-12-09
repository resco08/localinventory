function showMenu() {
  var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
  }
}

var addProductModal = document.getElementById('addProductModal');
function showAddProductModal() {
  addProductModal.style.display = "flex";
}
function hideAddProductModal() {
  addProductModal.style.display = "none";
}

function searchProduct() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("productTable");
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

// Function to load inventory from localStorage
function loadInventory() {
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  const tableBody = document.getElementById('productTable').querySelector('tbody');

  // Clear existing table rows
  tableBody.innerHTML = '';

  inventory.forEach((product, index) => {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
          <td>${product.name}</td>
          <td>${product.description}</td>
          <td>${product.quantity}</td>
          <td>${product.price.toFixed(2)}</td>
          <td>
              <button onclick="editProduct(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
          </td>
          <td>
              <button onclick="delThisData(${index})"><i class="fa-solid fa-trash"></i></button>
          </td>
      `;
      tableBody.appendChild(newRow);
  });
}

// Function to edit a product
function editProduct(index) {
  showAddProductModal();
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  const product = inventory[index];

  document.getElementById('productName').value = product.name;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productQuantity').value = product.quantity;
  document.getElementById('productPrice').value = product.price;

  // Store index in a hidden input or variable to update later
  document.getElementById('productIndex').value = index;
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
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  inventory.splice(index, 1); // Remove the product at the index
  localStorage.setItem('inventory', JSON.stringify(inventory)); // Save updated inventory
  loadInventory(); // Reload the inventory
}

// Event listener for form submission
document.getElementById('inventoryForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const quantity = document.getElementById('productQuantity').value;
  const price = document.getElementById('productPrice').value;
  const index = document.getElementById('productIndex').value;

  const product = {
      name,
      description,
      quantity: parseInt(quantity),
      price: parseFloat(price)
  };

  // Get inventory from localStorage
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  if (index) {
      // Update existing product
      inventory[index] = product;
  } else {
      // Add new product
      inventory.push(product);
  }

  // Save updated inventory back to localStorage
  localStorage.setItem('inventory', JSON.stringify(inventory));

  // Reset the form and reload inventory
  document.getElementById('inventoryForm').reset();
  document.getElementById('productIndex').value = ''; // Clear index
  loadInventory();
  hideAddProductModal();
});

// Function to export inventory as JSON
function exportInventory() {
  const inventory = localStorage.getItem('inventory') || '[]';
  const blob = new Blob([inventory], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to import inventory from JSON file
function importInventory(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          try {
              const inventory = JSON.parse(e.target.result);
              localStorage.setItem('inventory', JSON.stringify(inventory));
              loadInventory();
          } catch (error) {
              alert('Invalid JSON file');
          }
      };
      reader.readAsText(file);
  }
}

// Load inventory on page load
window.onload = loadInventory;