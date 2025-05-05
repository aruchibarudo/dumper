export const searchSortOptions = [
  { label: 'Сначала новые', value: 'newest' },
  { label: 'Сначала старые', value: 'oldest' },
  { label: 'Имя файла А-Я', value: 'filename_asc' },
  { label: 'Имя файла Я-А', value: 'filename_desc' },
]

export const highlightSearchText = (text: string, highlight: string) => {
  if (!highlight) {
    return text
  }

  const regex = new RegExp(`(${highlight})`, 'gi')
  return text.replace(regex, '<span class="font-bold">$1</span>')
}
