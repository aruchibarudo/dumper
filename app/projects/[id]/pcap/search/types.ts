export type SearchModalProps = {
  onSelectPcap: (pcapId: string, label: string) => void
}

export type SearchSortOption =
  | 'newest'
  | 'oldest'
  | 'filename_asc'
  | 'filename_desc'
