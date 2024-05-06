// Unique Code Generation
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

// Scroll to Top on Page Refresh
window.onbeforeunload = () => window.scrollTo(0, 0);

// Tab Handling
var firstTabLink = document.getElementsByClassName("tablink")[0];
window.onload = function() {
  toggleView();
  firstTabLink.click();
}

// CSV Data Handling
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

// Menu Handling
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

    // Header row
    const headerRow = createHeaderRow(items);
    table.appendChild(headerRow);

    // Data rows
    addDataRows(data, table);
}
function createHeaderRow(items) {
    const headerRow = document.createElement('tr');
    items[0].forEach((cell, index) => {
        const th = createTableHeader(cell, index);
        headerRow.appendChild(th);
    });
    return headerRow;
}

function createTableHeader(cell, index) {
    const th = document.createElement('th');
    th.classList.add('header');
    th.appendChild(createSpan(cell));
    th.appendChild(createArrow(index));

    if (cell === 'Category' || cell === 'SubCategory') {
        th.appendChild(createSelect(cell, index));
    }

    return th;
}
function createHeaderRow(items) {
    const headerRow = document.createElement('tr');
    items[0].forEach((cell, index) => {
        const th = createTableHeader(cell, index);
        headerRow.appendChild(th);
    });
    return headerRow;
}

function createTableHeader(cell, index) {
    const th = document.createElement('th');
    th.classList.add('header');
    th.appendChild(createSpan(cell));
    th.appendChild(createArrow(index));

    if (cell === 'Category' || cell === 'SubCategory') {
        th.appendChild(createSelect(cell, index));
    }

    return th;
}

function createSpan(text) {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
}

function createArrow(index) {
    const arrow = document.createElement('span');
    arrow.textContent = ' ↑↓';
    arrow.classList.add('arrow');
    arrow.addEventListener('click', () => sortData(index));
    return arrow;
}

function createSelect(cell, index) {
    const select = document.createElement('select');
    select.id = cell + 'Filter';
    select.addEventListener('change', () => filterData(index, select.value));

    // "All" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.text = 'All';
    select.appendChild(allOption);

    // Unique values
    const uniqueValues = [...new Set(items.slice(1).map(row => row[index]))];
    uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.text = value;
        select.appendChild(option);
    });

    return select;
}

function addDataRows(data, table) {
    for (let i = 1; i < data.length; i++) {
        const dataRow = createDataRow(data[i]);
        table.appendChild(dataRow);
    }
}

function createDataRow(dataRowItems) {
    const dataRow = document.createElement('tr');
    dataRow.id = 'row-' + dataRowItems.join(','); // Add this line
    dataRowItems.forEach((cell, cellIndex) => {
        const td = createTableCell(cell, cellIndex);
        dataRow.appendChild(td);
    });

    const itemKey = dataRowItems.join(',');
    handleRowSelection(dataRow, itemKey); // Add this line

    return dataRow;
}

function createTableCell(cell, cellIndex) {
    const td = document.createElement('td');
    if (cellIndex === 0) {
        const img = createImage(cell);
        td.appendChild(img);
    } else {
        td.textContent = cell;
    }
    return td;
}

function createImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Thumbnail';
    img.classList.add('thumbnail');
    return img;
}

function toggleSelection(dataRow, dataRowItems) {
    const itemKey = dataRowItems.join(',');
    if (selectedItems.has(itemKey)) {
        dataRow.classList.remove('selected');
        selectedItems.delete(itemKey);
    } else {
        dataRow.classList.add('selected');
        selectedItems.add(itemKey);
    }
    updateClearSelectionButton();
    updateTableSelections(); // Add this line
    updateGallerySelections(); // Add this line
}

function filterData(columnIndex, filterValue) {
    const dataToFilter = items.slice(1); // Exclude header row
    const filteredData = filterValue ? dataToFilter.filter(row => row[columnIndex] === filterValue) : dataToFilter;
    displayTable([items[0], ...filteredData]); // Include header row in display
}

function liveSearch() {
    const input = document.getElementById("myInput");
    const filter = input.value.toUpperCase();
    const table = document.getElementById("csvTable");
    const tr = table.getElementsByTagName("tr");

    input.onclick = function() {
      this.value = '';
    };

    const skuIndex = items[0].indexOf('SKU');
    const titleIndex = items[0].indexOf('Title');

    let filteredItems = [items[0]]; // Include header row in filtered items

    for (let i = 0; i < tr.length; i++) {
      let tdSku = tr[i].getElementsByTagName("td")[skuIndex];
      let tdTitle = tr[i].getElementsByTagName("td")[titleIndex];
      if (tdSku && tdTitle) {
        let txtValueSku = tdSku.textContent || tdSku.innerText;
        let txtValueTitle = tdTitle.textContent || tdTitle.innerText;
        if (txtValueSku.toUpperCase().indexOf(filter) > -1 || txtValueTitle.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
          filteredItems.push(items[i]);
        } else {
          tr[i].style.display = "none";
        }
      }       
    }

    // Update gallery view
    if (!isTableView) {
        displayGallery(filteredItems);
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

function handleRowSelection(rowElement, itemKey) {
    rowElement.addEventListener('click', function() {
        toggleSelection(rowElement, itemKey);
    });
}

function updateTableSelections() {
    const table = document.getElementById('csvTable');
    const rows = table.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const itemKey = row.id.substring(4); // Remove the 'row-' prefix
        if (selectedItems.has(itemKey)) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    }
}

function updateGallerySelections() {
    const gallery = document.getElementById('csvGallery');
    const cards = gallery.getElementsByClassName('card');
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const itemKey = card.id.substring(5); // Remove the 'card-' prefix
        if (selectedItems.has(itemKey)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }
}

// Buttons that clear or filter selection or toggle AREA
function reviewSelection() {
    const selectedData = [items[0]];
    for (let i = 1; i < items.length; i++) {
        if (selectedItems.has(items[i].join(','))) {
            selectedData.push(items[i]);
        }
    }
    isTableView ? displayTable(selectedData) : displayGallery(selectedData);
}

function clearSelection() {
    selectedItems.clear();
    isTableView ? displayTable(items) : displayGallery(items);
    updateClearSelectionButton();
}

function updateGalleryView() {
    if (!isTableView) displayGallery(items);
}

function updateClearSelectionButton() {
    const clearSelectionButton = document.getElementById('clearSelectionButton');
    clearSelectionButton.innerHTML = `CLEAR (${selectedItems.size})`;
    selectedItems.size > 0 ? clearSelectionButton.classList.add('amber') : clearSelectionButton.classList.remove('amber');
}
// GALLERY CARD VIEW AREA
function toggleView() {
    isTableView = !isTableView;
    document.getElementById('csvTable').style.display = isTableView ? '' : 'none';
    document.getElementById('csvGallery').style.display = isTableView ? 'none' : '';
    isTableView ? displayTable(items) : displayGallery(items);
    updateTableSelections(); // Update table selections
    updateGallerySelections(); // Update gallery selections
}
function displayGallery(data) {
    const gallery = document.getElementById('csvGallery');
    gallery.innerHTML = '';
    for (let i = 1; i < data.length; i++) {
        const div = createCard(data[i]);
        gallery.appendChild(div);
    }
    updateGallerySelections(); // Update gallery selections
}


function createCard(dataRowItems) {
    const div = document.createElement('div');
    div.classList.add('card');
    const itemKey = dataRowItems.join(',');
    if (selectedItems.has(itemKey)) {
        div.classList.add('selected');
    }
    div.addEventListener('click', function() {
        toggleSelection(div, itemKey);
    });
    const contentDiv = createContentDiv(dataRowItems);
    div.appendChild(contentDiv);

    // Add quantity input
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.max = '99';
    quantityInput.value = '1';
    quantityInput.classList.add('quantity-input');
    quantityInput.style.display = 'none'; // Hide the input by default

    // Add a data-id attribute to the quantity input
    let id = itemKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    quantityInput.setAttribute('data-id', id);

    // Prevent click event from bubbling up to the card
    quantityInput.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    div.appendChild(quantityInput);

    return div;
}


function toggleSelection(element, itemKey) {
    if (selectedItems.has(itemKey)) {
        selectedItems.delete(itemKey);
        element.classList.remove('selected');
    } else {
        selectedItems.add(itemKey);
        element.classList.add('selected');
    }

    // Show or hide quantity input
    const quantityInput = element.querySelector('.quantity-input');
    if (element.classList.contains('selected')) {
        quantityInput.style.display = 'block'; // Show the input
    } else {
        quantityInput.style.display = 'none'; // Hide the input
    }

    updateClearSelectionButton();
    updateTableSelections(); // Add this line
}

function createContentDiv(dataRowItems) {
    const contentDiv = document.createElement('div');
    dataRowItems.forEach((cell, cellIndex) => {
        if (cellIndex === 0) {
            const img = createImage(cell);
            contentDiv.appendChild(img);
        } else {
            const p = createParagraph(cell, cellIndex, dataRowItems);
            contentDiv.appendChild(p);
        }
    });
    return contentDiv;
}
function createImage(cell) {
    const img = document.createElement('img');
    img.src = cell;
    img.alt = 'Thumbnail';
    img.classList.add('thumbnail');
    return img;
}
function createParagraph(cell, cellIndex, dataRowItems) {
    const p = document.createElement('p');
    const span = document.createElement('span');
    span.style.fontWeight = 'bold';
    if (items[0][cellIndex] === 'Title') {
        p.textContent = cell;
        p.classList.add('title');
    } else if (['SKU', 'ID'].includes(items[0][cellIndex])) {
        p.textContent = cell; // Only include the number
        p.classList.add('sku');
    } else if (items[0][cellIndex] === 'Quantity') {
        const quantityContainer = document.createElement('div');
        quantityContainer.classList.add('quantity-container');
        const quantity = document.createElement('p');
        quantity.textContent = cell;
        quantity.style.fontSize = '1.5em';
        quantity.classList.add('quantity');
        const availability = document.createElement('p');
        availability.textContent = 'Available';
        availability.classList.add('availability');
        quantityContainer.appendChild(quantity);
        quantityContainer.appendChild(availability);
        p.appendChild(quantityContainer);
    }
    return p;
}

// DATA SUBMISSION AREA
function exportAndEmail() {
    const selectedData = getSelectedData();
    const filteredData = filterDataBySKUAndTitle(selectedData);
    const table = formatDataForEmail(filteredData);
    sendEmail(table);
}

function getSelectedData() {
    const selectedData = [];
    for (let i = 1; i < items.length; i++) {
        if (selectedItems.has(items[i].join(','))) {
            let id = items[i].join(',').replace(/[^a-zA-Z0-9_-]/g, '_');
            let quantityInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
            let quantity = quantityInput ? quantityInput.value : '1'; // Default to '1' if the quantity input does not exist
            selectedData.push([...items[i], quantity]);
        }
    }
    return selectedData;
}

function filterDataBySKUAndTitle(selectedData) {
    const titleIndex = headers.indexOf('Title');
    const skuIndex = headers.indexOf('SKU');
    const quantityIndex = headers.length; // Assuming quantity is the last element in the row
    return selectedData.map(row => [row[skuIndex], row[quantityIndex], row[titleIndex]]);
}

function formatDataForEmail(filteredData) {
    let table = '';
    filteredData.forEach(row => {
        table += `${row[0]}\t${row[1]}\t${row[2]}\n`; // Include quantity in the table
    });
    return table;
}
function sendEmail(table) {
    let uniqueCode = document.getElementById('uniqueCode').textContent;
    let subject = encodeURIComponent('Event: ' + uniqueCode);
    let body = encodeURIComponent('ID: ' + uniqueCode + '\n\n' + table);
    window.open('mailto:cwsimulation@cw.bc.ca?subject=' + subject + '&body=' + body);
}
