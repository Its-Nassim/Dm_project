export const DEFAULT_CLASSES = [
  { id: 0, name: 'Cheaper than average', token: '--color-success', icon: 'down' },
  { id: 1, name: 'Reasonable price', token: '--color-accent', icon: 'equal' },
  { id: 2, name: 'Over priced', token: '--color-accent-2', icon: 'up' },
  { id: 3, name: 'Too over priced', token: '--color-error', icon: 'double-up' },
]

export function getClassById(id, customLabels) {
  const numericId = Number(id)
  const defaultItem = DEFAULT_CLASSES.find((c) => c.id === numericId) || {
    id: numericId,
    name: `Class ${numericId}`,
    token: '--color-muted',
    icon: 'equal',
  }
  if (customLabels && customLabels[numericId] !== undefined) {
    return { ...defaultItem, name: customLabels[numericId] }
  }
  return defaultItem
}
