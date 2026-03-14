export function statusBadge(status) {
  const cls = (status || '').toLowerCase();
  return `<span class="badge badge-${cls}">${status}</span>`;
}
