/**
 * @param {Array<{key:string, label:string, render?:Function}>} columns
 * @param {Array<Object>} data
 * @param {Function|null} actions  (row) => HTML string for the actions column
 */
export function renderTable(columns, data, actions = null) {
  if (!data || data.length === 0) {
    return '<div class="empty-state">No records found</div>';
  }

  const ths = columns.map(c => `<th>${c.label}</th>`).join('')
    + (actions ? '<th>Actions</th>' : '');

  const rows = data.map(row => {
    const tds = columns.map(c => {
      const val = c.render ? c.render(row) : (row[c.key] ?? '');
      return `<td>${val}</td>`;
    }).join('');
    const actionTd = actions ? `<td>${actions(row)}</td>` : '';
    return `<tr>${tds}${actionTd}</tr>`;
  }).join('');

  return `<table class="data-table"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
}
