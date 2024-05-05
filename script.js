document.addEventListener('DOMContentLoaded', (event) => {
    var uniqueCodeElement = document.getElementById('uniqueCode');
    var uniqueCode = generateUniqueCode();
    uniqueCodeElement.textContent = uniqueCode;
});

function generateUniqueCode() {
    var timestamp = Date.now();
    var yearEndNumber = new Date().getFullYear().toString().substr(-1);
    var mapping = {0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J'};
    var secondChar = mapping[yearEndNumber];
    var randomNum = Math.floor(Math.random() * 10000);
    return 'E' + secondChar + randomNum.toString().padStart(4, '0');
}

window.onbeforeunload = () => window.scrollTo(0, 0);

var firstTabLink = document.getElementsByClassName("tablink")[0];

window.onload = function() {
  toggleView();
  firstTabLink.click();
}

let items = [];
let sortDirection = [];
let selectedItems = new Set();
let isTableView = false;
let headers;
let skuIndex;

document.getElementById('toggleViewButton').addEventListener('click', toggleView);
document.getElementById('clearSelectionButton').addEventListener('click', clearSelection);
document.getElementById('reviewButton').addEventListener('click', reviewSelection);
document.getElementById('exportAndEmailButton').addEventListener('click', exportAndEmail);

fetch('Resources.csv')
    .then(response => response.text())
    .then(csvData => {
        items = csvData.split('\n').filter(row => row.length > 0).map(row => row.split(','));
        headers = items[0];
        skuIndex = headers.indexOf('SKU');
        sortDirection = new Array(items[0].length).fill(1);
        displayTable(items);
    })
    .catch(error => console.error('Error fetching CSV:', error));


function openMenu(evt, menuName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("menu");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-dark-grey", "");
  }
  document.getElementById(menuName).style.display = "block";
  evt.currentTarget.firstElementChild.className += " w3-dark-grey";
}

document.getElementsByClassName("tablink")[0].click();

function displayTable(data) {
    const table = document.getElementById('csvTable');
    table.innerHTML = '';

    // Always add the header row first
    const headerRow = document.createElement('tr');
    items[0].forEach((cell, index) => {
        const th = document.createElement('th');
        th.classList.add('header');
        const span = document.createElement('span');
        span.textContent = cell;
        th.appendChild(span);
        const arrow = document.createElement('span');
        arrow.textContent = ' ↑↓';
        arrow.classList.add('arrow');
        arrow.addEventListener('click', () => sortData(index));
        th.appendChild(arrow);

        // Only add the select element to the 'Category' and 'SubCategory' columns
        if (cell === 'Category' || cell === 'SubCategory') {
            const select = document.createElement('select');
            select.addEventListener('change', () => filterData(index, select.value));
            th.appendChild(select);

            const uniqueValues = [...new Set(items.slice(1).map(row => row[index]))];
            uniqueValues.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.text = value;
                select.appendChild(option);
            });
        }

        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Then add the data rows
    for (let i = 1; i < data.length; i++) {
        const dataRow = document.createElement('tr');
        data[i].forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            if (cellIndex === 0) {
                const img = document.createElement('img');
                img.src = cell;
                img.alt = 'Thumbnail';
                img.classList.add('thumbnail');
                td.appendChild(img);
            } else {
                td.textContent = cell;
            }
            dataRow.appendChild(td);
        });
        if (selectedItems.has(data[i].join(','))) {
            dataRow.classList.add('selected');
        }
        table.appendChild(dataRow);

        dataRow.addEventListener('click', () => {
            if (selectedItems.has(data[i].join(','))) {
                dataRow.classList.remove('selected');
                selectedItems.delete(data[i].join(','));
            } else {
                dataRow.classList.add('selected');
                selectedItems.add(data[i].join(','));
            }
            updateClearSelectionButton();
        });
    }
}

function sortData(columnIndex) {
    const dataToSort = items.slice(1);
    dataToSort.sort((a, b) => {
        const aValue = isNaN(Date.parse(a[columnIndex])) ? a[columnIndex] : new Date(a[columnIndex]);
        const bValue = isNaN(Date.parse(b[columnIndex])) ? b[columnIndex] : new Date(b[columnIndex]);
        if (typeof aValue === 'string') {
            return sortDirection[columnIndex] * aValue.localeCompare(bValue);
        } else {
            return sortDirection[columnIndex] * (aValue - bValue);
        }
    });
    sortDirection[columnIndex] *= -1;
    items = [items[0], ...dataToSort];
    displayTable(items);
}

function reviewSelection() {
    const selectedData = [items[0]];
    for (let i = 1; i < items.length; i++) {
        if (selectedItems.has(items[i].join(','))) {
            selectedData.push(items[i]);
        }
    }
    if (isTableView) {
        displayTable(selectedData);
    } else {
        displayGallery(selectedData);
    }
}

function clearSelection() {
    selectedItems.clear();
    if (isTableView) {
        displayTable(items);
    } else {
        displayGallery(items);
    }
    updateClearSelectionButton();
}

function updateGalleryView() {
    if (!isTableView) {
        displayGallery(items);
    }
}

function updateClearSelectionButton() {
    const clearSelectionButton = document.getElementById('clearSelectionButton');
    clearSelectionButton.innerHTML = `CLEAR (${selectedItems.size})`;
    if (selectedItems.size > 0) {
        clearSelectionButton.classList.add('amber');
    } else {
        clearSelectionButton.classList.remove('amber');
    }
}

function toggleView() {
    isTableView = !isTableView;
    if (isTableView) {
        document.getElementById('csvTable').style.display = '';
        document.getElementById('csvGallery').style.display = 'none';
        displayTable(items);
    } else {
        document.getElementById('csvTable').style.display = 'none';
        document.getElementById('csvGallery').style.display = '';
        displayGallery(items);
    }
}

function filterData(columnIndex, filterValue) {
    // Include the header row, then filter the rest of the data
    const filteredData = [items[0]].concat(filterValue ? items.slice(1).filter(row => row[columnIndex] === filterValue) : items.slice(1));
    displayTable(filteredData);
}

function displayGallery(data) {
    const gallery = document.getElementById('csvGallery');
    gallery.innerHTML = '';

    for (let i = 1; i < data.length; i++) {
        const div = document.createElement('div');
        div.classList.add('card');

        // Check if the item is selected
        const itemKey = data[i].join(',');
        if (selectedItems.has(itemKey)) {
            div.classList.add('selected'); // Add the 'selected' class
        }

        // Add a click event listener to the card
        div.addEventListener('click', function() {
            if (selectedItems.has(itemKey)) {
                selectedItems.delete(itemKey);
                div.classList.remove('selected'); // Remove the 'selected' class
            } else {
                selectedItems.add(itemKey);
                div.classList.add('selected'); // Add the 'selected' class
            }
            updateClearSelectionButton();
        });

        const contentDiv = document.createElement('div'); // Create a new div for the content
        data[i].forEach((cell, cellIndex) => {
            const p = document.createElement('p');
            const span = document.createElement('span');
            span.style.fontWeight = 'bold'; // Make the header label bold

            // Display the header label and the cell data based on the column
            if (data[0][cellIndex] === 'Title') {
                p.textContent = cell; // Display only the cell data
            } else if (data[0][cellIndex] === 'SKU' || data[0][cellIndex] === 'ID') {
                span.textContent = data[0][cellIndex] + ': '; // Display the header label
                p.appendChild(span);
                p.appendChild(document.createTextNode(cell)); // Display the cell data
            } else if (data[0][cellIndex] === 'Quantity') {
                p.textContent = cell; // Display only the cell data
                p.style.fontSize = '1.5em'; // Format the cell data
            }

            if (cellIndex === 0) {
                const img = document.createElement('img');
                img.src = cell;
                img.alt = 'Thumbnail';
                img.classList.add('thumbnail');
                contentDiv.appendChild(img);
            } else {
                contentDiv.appendChild(p);
            }
        });
        div.appendChild(contentDiv); // Append the content div to the card div
        gallery.appendChild(div);
    }
}

function filterData(columnIndex, filterValue) {
    const filteredData = filterValue ? items.filter(row => row[columnIndex] === filterValue) : items;
    displayTable(filteredData);
}

function liveSearch() {
    var input, filter, table, tr, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("csvTable");
    tr = table.getElementsByTagName("tr");
  
    // Add an onclick event to the input element
    input.onclick = function() {
      this.value = '';
    };
  
    // Define the indices for SKU and Title columns
    var skuIndex = items[0].indexOf('SKU'); // replace 'SKU' with the actual SKU column header
    var titleIndex = items[0].indexOf('Title'); // replace 'Title' with the actual Title column header
  
    for (i = 0; i < tr.length; i++) {
      let tdSku = tr[i].getElementsByTagName("td")[skuIndex];
      let tdTitle = tr[i].getElementsByTagName("td")[titleIndex];
      if (tdSku && tdTitle) {
        let txtValueSku = tdSku.textContent || tdSku.innerText;
        let txtValueTitle = tdTitle.textContent || tdTitle.innerText;
        if (txtValueSku.toUpperCase().indexOf(filter) > -1 || txtValueTitle.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
  }
  
function exportAndEmail() {
    // Get selected items and unique ID
    const selectedData = []; // Don't include headers here
    let uniqueCode = document.getElementById('uniqueCode').textContent;
    for (let i = 1; i < items.length; i++) { // Start from 1 to exclude headers
        if (selectedItems.has(items[i].join(','))) {
            selectedData.push(items[i]);
        }
    }

    // Filter out only SKU and Title columns
    const titleIndex = headers.indexOf('Title');
    const skuIndex = headers.indexOf('SKU');
    const filteredData = selectedData.map(row => [row[skuIndex], row[titleIndex]]); // SKU first, then Title

    // Format CSV as plain text table for email body
    let table = '';
    filteredData.forEach(row => {
        table += `${row[0]}\t${row[1]}\n`; // SKU first, then Title
    });

    // Send email
    let subject = encodeURIComponent('Event: ' + uniqueCode);
    let body = encodeURIComponent('ID: ' + uniqueCode + '\n\n' + table);
    let startTime = '20240101T080000Z'; // Replace with your start time
    let endTime = '20240101T090000Z'; // Replace with your end time
    window.open('mailto:cwsimulation@cw.bc.ca?subject=' + subject + '&body=' + body + '&start=' + startTime + '&end=' + endTime);
}

