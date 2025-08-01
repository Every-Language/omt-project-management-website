import { useState, useCallback, useMemo } from 'react';

export interface DataTableFilters {
  [key: string]: unknown;
}

export interface DataTableSort {
  field: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface DataTableState {
  filters: DataTableFilters;
  sortField: string | null;
  sortDirection: 'asc' | 'desc' | null;
  selectedItems: Set<string>;
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
}

export interface DataTableActions {
  setFilters: (filters: DataTableFilters | ((prev: DataTableFilters) => DataTableFilters)) => void;
  setSort: (field: string | null, direction?: 'asc' | 'desc' | null) => void;
  setSelectedItems: (items: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  clearFilters: () => void;
  clearSelection: () => void;
  selectAll: (items: string[]) => void;
  selectItem: (id: string, selected: boolean) => void;
  handleSort: (field: string) => void;
  handleFilterChange: (key: string, value: unknown) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
}

export interface UseDataTableStateOptions {
  initialFilters?: DataTableFilters;
  initialSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  initialSearchTerm?: string;
  initialPage?: number;
  initialItemsPerPage?: number;
  onFiltersChange?: (filters: DataTableFilters) => void;
  onSortChange?: (sort: DataTableSort) => void;
  onSelectionChange?: (selectedItems: Set<string>) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function useDataTableState(
  options: UseDataTableStateOptions = {}
): DataTableState & DataTableActions {
  const {
    initialFilters = {},
    initialSort,
    initialSearchTerm = '',
    initialPage = 1,
    initialItemsPerPage = 25,
    onFiltersChange,
    onSortChange,
    onSelectionChange,
    onPageChange,
    onPageSizeChange,
  } = options;

  // State
  const [filters, setFiltersState] = useState<DataTableFilters>(initialFilters);
  const [sortField, setSortField] = useState<string | null>(initialSort?.field || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    initialSort?.direction || null
  );
  const [selectedItems, setSelectedItemsState] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTermState] = useState<string>(initialSearchTerm);
  const [currentPage, setCurrentPageState] = useState<number>(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState<number>(initialItemsPerPage);

  // Actions
  const setFilters = useCallback((
    newFilters: DataTableFilters | ((prev: DataTableFilters) => DataTableFilters)
  ) => {
    setFiltersState(newFilters);
    const finalFilters = typeof newFilters === 'function' ? newFilters(filters) : newFilters;
    onFiltersChange?.(finalFilters);
  }, [filters, onFiltersChange]);

  const setSort = useCallback((
    field: string | null,
    direction: 'asc' | 'desc' | null = 'asc'
  ) => {
    setSortField(field);
    setSortDirection(direction);
    onSortChange?.({ field, direction });
  }, [onSortChange]);

  const setSelectedItems = useCallback((
    items: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => {
    setSelectedItemsState(items);
    const finalItems = typeof items === 'function' ? items(selectedItems) : items;
    onSelectionChange?.(finalItems);
  }, [selectedItems, onSelectionChange]);

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    // Reset to first page when searching
    setCurrentPageState(1);
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
    onPageChange?.(page);
  }, [onPageChange]);

  const setItemsPerPage = useCallback((pageSize: number) => {
    setItemsPerPageState(pageSize);
    // Reset to first page when changing page size
    setCurrentPageState(1);
    onPageSizeChange?.(pageSize);
  }, [onPageSizeChange]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm(initialSearchTerm);
  }, [initialFilters, initialSearchTerm, setFilters, setSearchTerm]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, [setSelectedItems]);

  const selectAll = useCallback((items: string[]) => {
    setSelectedItems(new Set(items));
  }, [setSelectedItems]);

  const selectItem = useCallback((id: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, [setSelectedItems]);

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSort(field, 'desc');
      } else if (sortDirection === 'desc') {
        setSort(null, null);
      } else {
        setSort(field, 'asc');
      }
    } else {
      setSort(field, 'asc');
    }
  }, [sortField, sortDirection, setSort]);

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Handle cascading filters (e.g., reset chapter when book changes)
      if (key === 'bookId') {
        newFilters.chapterId = 'all';
      }
      
      return newFilters;
    });
    
    // Clear selections when filtering and reset to first page
    clearSelection();
    setCurrentPageState(1);
  }, [setFilters, clearSelection]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setItemsPerPage(pageSize);
  }, [setItemsPerPage]);

  // Computed state
  const state = useMemo(() => ({
    filters,
    sortField,
    sortDirection,
    selectedItems,
    searchTerm,
    currentPage,
    itemsPerPage,
  }), [filters, sortField, sortDirection, selectedItems, searchTerm, currentPage, itemsPerPage]);

  return {
    ...state,
    setFilters,
    setSort,
    setSelectedItems,
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    clearFilters,
    clearSelection,
    selectAll,
    selectItem,
    handleSort,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  };
} 