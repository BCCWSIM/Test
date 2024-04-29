window.onbeforeunload = () => window.scrollTo(0, 0);
window.onload = function() {
  toggleView();
  var uniqueCode = new Date().getTime();
  uniqueCode = String(uniqueCode).substr(-5); // get the last 5 digits
  document.getElementById('uniqueCode').textContent = uniqueCode;
}

let items = [];
let sortDirection = [];
let selectedItems = new Set();
let isTableView = false;
let headers; // We'll define this after fetching the CSV data
let skuIndex; // We'll define this after fetching the CSV data

document.getElementById('toggleViewButton').addEventListener('click', toggleView);
document.getElementById('clearSelectionButton').addEventListener('click', clearSelection);
document.getElementById('reviewButton').addEventListener('click', reviewSelection);
// Add event listener to your button
document.getElementById('exportAndEmailButton').addEventListener('click', exportAndEmail);

fetch('Resources.csv')
    .then(response => response.text())
    .then(csvData => {
        items = csvData.split('\n').map(row => row.split(','));
        headers = items[0]; // Now we can define 'headers'
        skuIndex = headers.indexOf('SKU'); // Now we can define 'skuIndex'
        sortDirection = new Array(items[0].length).fill(1);
        displayTable(items);
    })
    .catch(error => console.error('Error fetching CSV:', error));

// Rest of your code...

function exportAndEmail() {
    // Get selected items and unique ID
    const selectedData = [items[0]]; // include headers
    let uniqueCode = document.getElementById('uniqueCode').textContent;
    for (let i = 1; i < items.length; i++) {
        if (selectedItems.has(items[i].join(','))) {
            selectedData.push(items[i]);
        }
    }
    // Add unique number to the data
    selectedData.push(['Unique Number', uniqueCode]);

    // Create CSV
    let csv = Papa.unparse(selectedData);

    // Create PDF
    let doc = new jsPDF();
    doc.autoTable({
        head: [selectedData[0]], // headers
        body: selectedData.slice(1), // data
    });
    let pdf = doc.output('datauristring'); // Output as Data URI string

    // Create download links
    let csvLink = document.createElement('a');
    csvLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    csvLink.download = 'data.csv';
    csvLink.click(); // This will start the download

    let pdfLink = document.createElement('a');
    pdfLink.href = pdf;
    pdfLink.download = 'data.pdf';
    pdfLink.click(); // This will start the download

    // Send email
    let subject = encodeURIComponent('New Event');
    let body = encodeURIComponent('Unique ID: ' + uniqueCode + '\n\n' + csv);
    window.location.href = 'mailto:cw@cw.ca?subject=' + subject + '&body=' + body;
}
