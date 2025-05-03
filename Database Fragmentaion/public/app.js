   // Global variables to store fragments and current fragment
   let savedFragments = [];
   let currentFragment = null;
   
   // DOM elements
   const initDbBtn = document.getElementById('initDbBtn');
   const initDbResult = document.getElementById('initDbResult');
   const horizontalForm = document.getElementById('horizontalForm');
   const verticalForm = document.getElementById('verticalForm');
   const derivedForm = document.getElementById('derivedForm');
   const fragmentResult = document.getElementById('fragmentResult');
   const saveFragmentBtn = document.getElementById('saveFragmentBtn');
   const discardFragmentBtn = document.getElementById('discardFragmentBtn');
   const savedFragmentsContainer = document.getElementById('savedFragments');
   const reconstructForm = document.getElementById('reconstructForm');
   const reconstructBtn = document.getElementById('reconstructBtn');
   const reconstructResult = document.getElementById('reconstructResult');
   
   // Initialize database
   initDbBtn.addEventListener('click', async () => {
       try {
           initDbResult.innerHTML = '<div class="alert alert-info">Initializing database...</div>';
           
           const response = await fetch('/api/init-db', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               }
           });
           
           const data = await response.json();
           
           if (data.success) {
               initDbResult.innerHTML = '<div class="alert alert-success">Database initialized successfully!</div>';
           } else {
               initDbResult.innerHTML = `<div class="alert alert-danger">Error: ${data.message}</div>`;
           }
       } catch (error) {
           console.error('Error:', error);
           initDbResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
       }
   });
   
   // Horizontal fragmentation
   horizontalForm.addEventListener('submit', async (e) => {
       e.preventDefault();
       
       const condition = document.getElementById('horizontalCondition').value.trim();
       
       if (!condition) {
           fragmentResult.innerHTML = '<div class="alert alert-danger">Please enter a condition.</div>';
           return;
       }
       
       try {
           fragmentResult.innerHTML = '<div class="alert alert-info">Processing...</div>';
           
           const response = await fetch('/api/fragment/horizontal', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ condition })
           });
           
           const data = await response.json();
           
           if (data.success) {
               currentFragment = data;
               displayFragmentResults(data);
               saveFragmentBtn.disabled = false;
               discardFragmentBtn.disabled = false;
           } else {
               fragmentResult.innerHTML = `<div class="alert alert-danger">Error: ${data.message}</div>`;
               saveFragmentBtn.disabled = true;
               discardFragmentBtn.disabled = true;
           }
       } catch (error) {
           console.error('Error:', error);
           fragmentResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
           saveFragmentBtn.disabled = true;
           discardFragmentBtn.disabled = true;
       }
   });
   
   // Vertical fragmentation
   verticalForm.addEventListener('submit', async (e) => {
       e.preventDefault();
       
       const checkboxes = document.querySelectorAll('#verticalForm input[type="checkbox"]:checked');
       const columns = Array.from(checkboxes).map(cb => cb.value);
       
       if (columns.length <= 1) { // Only id is selected
           fragmentResult.innerHTML = '<div class="alert alert-danger">Please select at least one column besides the primary key.</div>';
           return;
       }
       
       try {
           fragmentResult.innerHTML = '<div class="alert alert-info">Processing...</div>';
           
           const response = await fetch('/api/fragment/vertical', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ columns })
           });
           
           const data = await response.json();
           
           if (data.success) {
               currentFragment = data;
               displayFragmentResults(data);
               saveFragmentBtn.disabled = false;
               discardFragmentBtn.disabled = false;
           } else {
               fragmentResult.innerHTML = `<div class="alert alert-danger">Error: ${data.message}</div>`;
               saveFragmentBtn.disabled = true;
               discardFragmentBtn.disabled = true;
           }
       } catch (error) {
           console.error('Error:', error);
           fragmentResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
           saveFragmentBtn.disabled = true;
           discardFragmentBtn.disabled = true;
       }
   });
   
   // Derived fragmentation
   derivedForm.addEventListener('submit', async (e) => {
       e.preventDefault();
       
       const parentCondition = document.getElementById('parentCondition').value.trim();
       const childCondition = document.getElementById('childCondition').value.trim();
       
       if (!parentCondition || !childCondition) {
           fragmentResult.innerHTML = '<div class="alert alert-danger">Please enter both parent and child conditions.</div>';
           return;
       }
       
       try {
           fragmentResult.innerHTML = '<div class="alert alert-info">Processing...</div>';
           
           const response = await fetch('/api/fragment/derived', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ parentCondition, childCondition })
           });
           
           const data = await response.json();
           
           if (data.success) {
               currentFragment = data;
               displayFragmentResults(data);
               saveFragmentBtn.disabled = false;
               discardFragmentBtn.disabled = false;
           } else {
               fragmentResult.innerHTML = `<div class="alert alert-danger">Error: ${data.message}</div>`;
               saveFragmentBtn.disabled = true;
               discardFragmentBtn.disabled = true;
           }
       } catch (error) {
           console.error('Error:', error);
           fragmentResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
           saveFragmentBtn.disabled = true;
           discardFragmentBtn.disabled = true;
       }
   });
   
   // Save fragment
   saveFragmentBtn.addEventListener('click', () => {
       if (currentFragment) {
           // Add an ID to the fragment
           const fragmentId = `fragment-${Date.now()}`;
           const fragmentToSave = { ...currentFragment, id: fragmentId };
           
           // Add to saved fragments
           savedFragments.push(fragmentToSave);
           
           // Update UI
           updateSavedFragmentsUI();
           
           // Enable reconstruction button if we have at least 2 fragments
           reconstructBtn.disabled = savedFragments.length < 2;
       }
   });
   
   // Discard fragment
   discardFragmentBtn.addEventListener('click', () => {
       // Clear current fragment
       currentFragment = null;
       
       // Clear fragment result display
       fragmentResult.innerHTML = '<p class="text-muted">Apply fragmentation to see results here.</p>';
       
       // Disable buttons
       saveFragmentBtn.disabled = true;
       discardFragmentBtn.disabled = true;
   });
   
   // Reconstruction
   reconstructForm.addEventListener('submit', async (e) => {
       e.preventDefault();
       
       // Get selected fragments
       const selectedFragmentIds = Array.from(
           document.querySelectorAll('.fragment-checkbox:checked')
       ).map(cb => cb.value);
       
       if (selectedFragmentIds.length < 2) {
           reconstructResult.innerHTML = '<div class="alert alert-danger">Please select at least two fragments for reconstruction.</div>';
           return;
       }
       
       // Get selected fragments data
       const selectedFragments = savedFragments.filter(f => selectedFragmentIds.includes(f.id));
       
       // Get reconstruction type
       const reconstructType = document.querySelector('input[name="reconstructType"]:checked').value;
       
       try {
           reconstructResult.innerHTML = '<div class="alert alert-info">Processing reconstruction...</div>';
           
           const response = await fetch('/api/reconstruct', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   fragments: selectedFragments,
                   type: reconstructType
               })
           });
           
           const data = await response.json();
           
           if (data.success) {
               displayReconstructionResults(data);
           } else {
               reconstructResult.innerHTML = `<div class="alert alert-danger">Error: ${data.message}</div>`;
           }
       } catch (error) {
           console.error('Error:', error);
           reconstructResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
       }
   });
   
   // Helper function to display fragment results
   function displayFragmentResults(data) {
       if (!data.data || data.data.length === 0) {
           fragmentResult.innerHTML = '<div class="alert alert-warning">No data found for this fragmentation.</div>';
           return;
       }
       
       // Create table
       let html = `<h5>${data.fragmentType} Fragmentation Result</h5>`;
       
       // Add conditions if available
       if (data.condition) {
           html += `<p><strong>Condition:</strong> ${data.condition}</p>`;
       }
       if (data.columns) {
           html += `<p><strong>Columns:</strong> ${data.columns.join(', ')}</p>`;
       }
       if (data.parentCondition) {
           html += `<p><strong>Parent Condition:</strong> ${data.parentCondition}</p>`;
           html += `<p><strong>Child Condition:</strong> ${data.childCondition}</p>`;
       }
       
       // Create table
       html += '<table class="table table-striped table-bordered">';
       
       // Table header
       html += '<thead><tr>';
       const columns = Object.keys(data.data[0]);
       columns.forEach(column => {
           html += `<th>${column}</th>`;
       });
       html += '</tr></thead>';
       
       // Table body
       html += '<tbody>';
       data.data.forEach(row => {
           html += '<tr>';
           columns.forEach(column => {
               html += `<td>${row[column] !== null ? row[column] : ''}</td>`;
           });
           html += '</tr>';
       });
       html += '</tbody></table>';
       
       fragmentResult.innerHTML = html;
   }
   
   // Helper function to update saved fragments UI
   function updateSavedFragmentsUI() {
       if (savedFragments.length === 0) {
           savedFragmentsContainer.innerHTML = '<p class="text-muted">No fragments saved yet.</p>';
           return;
       }
       
       let html = '';
       
       savedFragments.forEach(fragment => {
           html += `<div class="fragment-container">`;
           html += `<div class="form-check">
               <input class="form-check-input fragment-checkbox" type="checkbox" value="${fragment.id}" id="${fragment.id}">
               <label class="form-check-label fragment-header" for="${fragment.id}">
                   ${fragment.fragmentType} Fragment
               </label>
           </div>`;
           
           // Add details based on fragment type
           if (fragment.condition) {
               html += `<p><small><strong>Condition:</strong> ${fragment.condition}</small></p>`;
           }
           if (fragment.columns) {
               html += `<p><small><strong>Columns:</strong> ${fragment.columns.join(', ')}</small></p>`;
           }
           if (fragment.parentCondition) {
               html += `<p><small><strong>Parent:</strong> ${fragment.parentCondition}</small></p>`;
               html += `<p><small><strong>Child:</strong> ${fragment.childCondition}</small></p>`;
           }
           
           html += `<p><small><strong>Rows:</strong> ${fragment.data.length}</small></p>`;
           html += '</div>';
       });
       
       savedFragmentsContainer.innerHTML = html;
   }
   
   // Helper function to display reconstruction results
   function displayReconstructionResults(data) {
       if (!data.data || data.data.length === 0) {
           reconstructResult.innerHTML = '<div class="alert alert-warning">No data found after reconstruction.</div>';
           return;
       }
       
       // Create table
       let html = `<h5>Reconstruction Result (${data.reconstructionType})</h5>`;
       html += `<p><strong>Total Rows:</strong> ${data.data.length}</p>`;
       
       // Create table
       html += '<table class="table table-striped table-bordered">';
       
       // Table header
       html += '<thead><tr>';
       const columns = Object.keys(data.data[0]);
       columns.forEach(column => {
           html += `<th>${column}</th>`;
       });
       html += '</tr></thead>';
       
       // Table body
       html += '<tbody>';
       data.data.forEach(row => {
           html += '<tr>';
           columns.forEach(column => {
               html += `<td>${row[column] !== null ? row[column] : ''}</td>`;
           });
           html += '</tr>';
       });
       html += '</tbody></table>';
       
       reconstructResult.innerHTML = html;
   }