document.addEventListener('DOMContentLoaded', () => {
    // --- DATA SETUP (Replace with your actual data) ---
    const employeeMap = {
        1: { id: 1, name: "Alice Wonderland", title: "CEO", supervisor_id: 0 },
        2: { id: 2, name: "Bob The Builder", title: "CTO", supervisor_id: 1 },
        3: { id: 3, name: "Carol Danvers", title: "CFO", supervisor_id: 1 },
        4: { id: 4, name: "David Copperfield", title: "Lead Engineer", supervisor_id: 2 },
        5: { id: 5, name: "Eve Moneypenny", title: "Lead Accountant", supervisor_id: 3 },
        6: { id: 6, name: "Frank N. Stein", title: "DevOps", supervisor_id: 4 },
        7: { id: 7, name: "Grace Hopper", title: "Senior Engineer", supervisor_id: 2 },
        8: { id: 8, name: "Isaac Newton", title: "Intern", supervisor_id: 7 },
        9: { id: 9, name: "Julia Child", title: "Recruiter", supervisor_id: 3 },
        10: { id: 10, name: "Kevin McCallister", title: "Security", supervisor_id: 9},
    };

    // --- PRE-PROCESSING: Build a map of direct reports for faster lookup ---
    const reportsMap = {}; // Key: supervisor_id, Value: array of report employee_ids
    for (const id in employeeMap) {
        const employee = employeeMap[id];
        if (employee.supervisor_id && employeeMap[employee.supervisor_id]) {
            if (!reportsMap[employee.supervisor_id]) {
                reportsMap[employee.supervisor_id] = [];
            }
            reportsMap[employee.supervisor_id].push(employee.id);
        }
    }

    // --- DOM ELEMENTS ---
    const ancestorsContainer = document.getElementById('ancestors-chain');
    const focusedContainer = document.getElementById('focused-employee');
    const reportsContainer = document.getElementById('direct-reports');

    // --- HELPER FUNCTIONS ---

    function getAncestorPath(employeeId) {
        const path = [];
        let currentId = employeeMap[employeeId]?.supervisor_id;
        while (currentId && employeeMap[currentId]) {
            path.unshift(employeeMap[currentId]); // Add to beginning to keep order (CEO at start)
            currentId = employeeMap[currentId].supervisor_id;
        }
        return path;
    }

    function getDirectReports(employeeId) {
        const reportIds = reportsMap[employeeId] || [];
        return reportIds.map(id => employeeMap[id]);
    }

    function getTotalReportCount(employeeId, visited = new Set()) {
        if (visited.has(employeeId)) return 0; // Cycle detection
        visited.add(employeeId);

        const directReportObjects = getDirectReports(employeeId);
        let count = directReportObjects.length;

        for (const report of directReportObjects) {
            count += getTotalReportCount(report.id, visited);
        }
        // Note: For strict tree, 'visited' reset per top-level call isn't strictly needed here
        // but good for general recursive graph traversals. Here we let it be.
        return count;
    }

    function createEmployeeCard(employee, isFocused = false, totalSubReports = null) {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.dataset.employeeId = employee.id;

        const nameEl = document.createElement('h3');
        nameEl.textContent = employee.name;
        card.appendChild(nameEl);

        const titleEl = document.createElement('p');
        titleEl.textContent = employee.title || 'N/A';
        card.appendChild(titleEl);

        if (totalSubReports !== null) {
            const reportsEl = document.createElement('p');
            reportsEl.className = 'report-count';
            reportsEl.textContent = `Manages: ${totalSubReports}`;
            card.appendChild(reportsEl);
        }

        card.addEventListener('click', handleEmployeeClick);
        return card;
    }

    function updateView(selectedEmployeeId) {
        // Clear previous content
        ancestorsContainer.innerHTML = '';
        focusedContainer.innerHTML = '';
        reportsContainer.innerHTML = '';

        const focusedEmployee = employeeMap[selectedEmployeeId];
        if (!focusedEmployee) {
            focusedContainer.innerHTML = '<p>Employee not found.</p>';
            return;
        }

        // 1. Display Focused Employee
        focusedContainer.appendChild(createEmployeeCard(focusedEmployee, true));

        // 2. Display Ancestors (path to top)
        const ancestors = getAncestorPath(selectedEmployeeId);
        // Ancestors are returned CEO first, so we iterate normally.
        // CSS flex-direction: column-reverse on #ancestors-chain can be used
        // if you want visual stacking "upwards" but DOM order top-down.
        // Or reverse here before appending if CSS doesn't handle it as desired.
        ancestors.forEach(ancestor => {
            ancestorsContainer.appendChild(createEmployeeCard(ancestor));
        });


        // 3. Display Direct Reports
        const directReportObjects = getDirectReports(selectedEmployeeId);
        directReportObjects.forEach(report => {
            const totalSubReports = getTotalReportCount(report.id, new Set()); // Pass new Set for each top-level direct report
            reportsContainer.appendChild(createEmployeeCard(report, false, totalSubReports));
        });

        // Update URL for deep linking
        const url = new URL(window.location);
        url.searchParams.set('employeeId', selectedEmployeeId);
        window.history.pushState({ employeeId: selectedEmployeeId }, '', url);
    }

    function handleEmployeeClick(event) {
        let targetCard = event.target;
        while (targetCard && !targetCard.dataset.employeeId) {
            targetCard = targetCard.parentElement;
        }
        if (targetCard && targetCard.dataset.employeeId) {
            const newSelectedId = parseInt(targetCard.dataset.employeeId);
            // Check if it's different from current to avoid redundant updates if needed
            // const currentFocusedId = parseInt(focusedContainer.firstChild?.dataset?.employeeId);
            // if (newSelectedId !== currentFocusedId) {
            updateView(newSelectedId);
            // }
        }
    }

    function initialize() {
        const urlParams = new URLSearchParams(window.location.search);
        let initialEmployeeId = parseInt(urlParams.get('employeeId'));

        if (!initialEmployeeId || !employeeMap[initialEmployeeId]) {
            // Default to a top-level employee or first if no valid ID
            const topLevelEmployee = Object.values(employeeMap).find(emp => emp.supervisor_id === 0 || emp.supervisor_id === null);
            initialEmployeeId = topLevelEmployee ? topLevelEmployee.id : parseInt(Object.keys(employeeMap)[0]);
        }

        if (initialEmployeeId) {
            updateView(initialEmployeeId);
        } else {
            document.getElementById('org-chart-container').innerHTML = "<p>No employees to display or invalid initial ID.</p>";
        }

        window.addEventListener('popstate', (event) => {
            let employeeIdFromState = event.state?.employeeId;
            if (employeeIdFromState && employeeMap[employeeIdFromState]) {
                updateView(employeeIdFromState);
            } else {
                // Fallback if state is missing or invalid, try URL again
                const params = new URLSearchParams(window.location.search);
                const idFromUrl = parseInt(params.get('employeeId'));
                if (idFromUrl && employeeMap[idFromUrl]) {
                    updateView(idFromUrl);
                } else {
                     // Final fallback: load a default employee
                    const topLevelEmployee = Object.values(employeeMap).find(emp => emp.supervisor_id === 0 || emp.supervisor_id === null);
                    const defaultId = topLevelEmployee ? topLevelEmployee.id : parseInt(Object.keys(employeeMap)[0]);
                    if(defaultId) updateView(defaultId);
                }
            }
        });
    }

    // --- START THE APP ---
    initialize();
});