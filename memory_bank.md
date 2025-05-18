# Memory Bank

## Project Description

"OrgChart" is a web application for displaying and interacting with an organizational chart. It shows an employee's superiors (ancestors) and direct reports. Built with HTML, CSS, and JavaScript.

## Project Architecture

Key files:

*   **`index.html`**:
    *   **Purpose**: Main HTML structure. Contains divs for `#ancestors-chain`, `#focused-employee`, and `#direct-reports`.
    *   **Architecture**: Semantic HTML, links to `style.css` and `script.js`.

*   **`style.css`**:
    *   **Purpose**: Styles the application's layout and appearance.
    *   **Architecture**: Uses CSS selectors and Flexbox. `#ancestors-chain` now uses `flex-direction: column` for vertical display of superiors.

*   **`script.js`**:
    *   **Purpose**: Handles dynamic behavior, data rendering, and user interactions.
    *   **Architecture**: (Assumed) DOM manipulation for UI updates, event handling.

*   **`memory_bank.md`**:
    *   **Purpose**: Project's persistent memory (description, architecture, key decisions).
    *   **Architecture**: Markdown format. Essential for session context.

*   **`.clinerules`**:
    *   **Purpose**: Custom instructions for Cline, including Memory Bank management.
    *   **Architecture**: Defines project-specific AI assistant guidelines.
