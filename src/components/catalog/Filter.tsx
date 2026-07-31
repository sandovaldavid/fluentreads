import { useEffect, useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { BookLevel } from '@app-types/book';
import { ExamType } from '@app-types/exam';
import {
  DEFAULT_EXAM_TYPE,
  DEFAULT_FORMAT,
  DEFAULT_LEVEL,
  DEFAULT_RESOURCE_TYPE,
  DEFAULT_SORT,
  parseCatalogParams,
} from '@utils/catalogFilters';

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
      clipRule="evenodd"
    />
  </svg>
);

const SortIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);

const ClearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const levelLabels: Record<string, string> = {
  [BookLevel.BASIC]: 'Básico',
  [BookLevel.INTERMEDIATE]: 'Intermedio',
  [BookLevel.ADVANCED]: 'Avanzado',
  [BookLevel.PROFESSIONAL]: 'Profesional',
  [BookLevel.ALL_LEVELS]: 'Multi-nivel',
  [BookLevel.INTERNATIONAL_EXAM]: 'Examen Internacional',
};

const formatLabels: Record<string, string> = {
  pdf: 'PDF',
  workbook: 'Workbook',
  audio: 'Audio',
  video: 'Video',
  software: 'Software',
  exams: 'Exámenes',
};

const examTypeLabels: Record<string, string> = {
  [ExamType.IELTS]: 'IELTS',
  [ExamType.TOEFL]: 'TOEFL',
  [ExamType.CAMBRIDGE]: 'Cambridge',
  [ExamType.SAT]: 'SAT',
  [ExamType.PTE]: 'PTE',
  [ExamType.FCE]: 'FCE',
  [ExamType.CPE]: 'CPE',
  [ExamType.GRE]: 'GRE',
  [ExamType.OTHER]: 'Otros',
};

const levelOptions = [
  { value: DEFAULT_LEVEL, label: 'Todos los niveles' },
  ...Object.values(BookLevel).map((value) => ({ value, label: levelLabels[value] || value })),
];

const formatOptions = [
  { value: DEFAULT_FORMAT, label: 'Todos los formatos' },
  ...Object.keys(formatLabels).map((value) => ({ value, label: formatLabels[value] })),
];

const examTypeOptions = [
  { value: DEFAULT_EXAM_TYPE, label: 'Todos los tipos de examen' },
  ...Object.values(ExamType).map((value) => ({ value, label: examTypeLabels[value] || value })),
];

const resourceTypeOptions = [
  { value: DEFAULT_RESOURCE_TYPE, label: 'Todos los tipos' },
  { value: 'book', label: 'Libros' },
  { value: 'pack', label: 'Packs' },
  { value: 'exam', label: 'Exámenes' },
];

const sortOptions = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price-low', label: 'Precio: menor a mayor' },
  { value: 'price-high', label: 'Precio: mayor a menor' },
  { value: 'bestseller', label: 'Más vendidos' },
];

interface ActiveTag {
  name: 'search' | 'level' | 'format' | 'examType' | 'resourceType';
  value: string;
  label: string;
  displayName: string;
}

export interface CatalogFilterChangeDetail {
  level: string;
  format: string;
  examType: string;
  sort: string;
  resourceType: string;
  search: string;
}

interface Props {
  initialLevel?: string;
  initialFormat?: string;
  initialExamType?: string;
  initialSort?: string;
  initialResourceType?: string;
  initialSearch?: string;
  enableResourceTypeFilter?: boolean;
  enableExamTypeFilter?: boolean;
  productType?: string;
  productCount?: number;
  className?: string;
}

const CatalogFilter = ({
  initialLevel = DEFAULT_LEVEL,
  initialFormat = DEFAULT_FORMAT,
  initialExamType = DEFAULT_EXAM_TYPE,
  initialSort = DEFAULT_SORT,
  initialResourceType = DEFAULT_RESOURCE_TYPE,
  initialSearch = '',
  enableResourceTypeFilter = false,
  enableExamTypeFilter = false,
  productType = 'book',
  productCount = 0,
  className = '',
}: Props) => {
  const idPrefix = useId();
  const mobileLevelId = `${idPrefix}-mobile-level`;
  const mobileFormatId = `${idPrefix}-mobile-format`;
  const mobileExamTypeId = `${idPrefix}-mobile-exam-type`;
  const mobileResourceTypeId = `${idPrefix}-mobile-resource-type`;
  const mobileSortId = `${idPrefix}-mobile-sort`;

  const [level, setLevel] = useState(initialLevel);
  const [format, setFormat] = useState(initialFormat);
  const [examType, setExamType] = useState(initialExamType);
  const [sort, setSort] = useState(initialSort);
  const [resourceType, setResourceType] = useState(initialResourceType);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [activeTags, setActiveTags] = useState<ActiveTag[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [displayedProductCount, setDisplayedProductCount] = useState(productCount);

  // Sync with URL parameters on mount — same param vocabulary every catalog
  // page writes (see src/utils/catalogFilters.ts), so this works identically
  // regardless of which container hosts this component.
  useEffect(() => {
    const parsed = parseCatalogParams(new URLSearchParams(window.location.search));
    setSearchTerm(parsed.search ?? '');
    setLevel(parsed.level ?? DEFAULT_LEVEL);
    setFormat(parsed.format ?? DEFAULT_FORMAT);
    setExamType(parsed.examType ?? DEFAULT_EXAM_TYPE);
    setSort(parsed.sort ?? DEFAULT_SORT);
    if (enableResourceTypeFilter) {
      setResourceType(parsed.resourceType ?? DEFAULT_RESOURCE_TYPE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleProductCountUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ count: number }>).detail;
      if (detail && typeof detail.count === 'number') {
        setDisplayedProductCount(detail.count);
      }
    };

    window.addEventListener('updateFilterCount', handleProductCountUpdate);
    return () => window.removeEventListener('updateFilterCount', handleProductCountUpdate);
  }, []);

  const filterLabels: Record<ActiveTag['name'], string> = {
    level: 'Nivel',
    format: 'Formato',
    examType: 'Tipo de examen',
    search: 'Búsqueda',
    resourceType: 'Tipo',
  };

  const activeFilterCount = [
    level !== DEFAULT_LEVEL ? 1 : 0,
    format !== DEFAULT_FORMAT ? 1 : 0,
    enableExamTypeFilter && examType !== DEFAULT_EXAM_TYPE ? 1 : 0,
    searchTerm ? 1 : 0,
    enableResourceTypeFilter && resourceType !== DEFAULT_RESOURCE_TYPE ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  useEffect(() => {
    const newTags: ActiveTag[] = [];

    if (searchTerm) {
      newTags.push({
        name: 'search',
        value: searchTerm,
        label: `"${searchTerm}"`,
        displayName: filterLabels.search,
      });
    }

    if (level !== DEFAULT_LEVEL) {
      const option = levelOptions.find((opt) => opt.value === level);
      if (option) {
        newTags.push({
          name: 'level',
          value: level,
          label: option.label,
          displayName: filterLabels.level,
        });
      }
    }

    if (format !== DEFAULT_FORMAT) {
      const option = formatOptions.find((opt) => opt.value === format);
      if (option) {
        newTags.push({
          name: 'format',
          value: format,
          label: option.label,
          displayName: filterLabels.format,
        });
      }
    }

    if (enableExamTypeFilter && examType !== DEFAULT_EXAM_TYPE) {
      const option = examTypeOptions.find((opt) => opt.value === examType);
      if (option) {
        newTags.push({
          name: 'examType',
          value: examType,
          label: option.label,
          displayName: filterLabels.examType,
        });
      }
    }

    if (enableResourceTypeFilter && resourceType !== DEFAULT_RESOURCE_TYPE) {
      const option = resourceTypeOptions.find((opt) => opt.value === resourceType);
      if (option) {
        newTags.push({
          name: 'resourceType',
          value: resourceType,
          label: option.label,
          displayName: filterLabels.resourceType,
        });
      }
    }

    setActiveTags(newTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, format, examType, searchTerm, resourceType]);

  useEffect(() => {
    const handleResetFilters = () => {
      setLevel(DEFAULT_LEVEL);
      setFormat(DEFAULT_FORMAT);
      setExamType(DEFAULT_EXAM_TYPE);
      setSort(DEFAULT_SORT);
      setSearchTerm('');
      if (enableResourceTypeFilter) setResourceType(DEFAULT_RESOURCE_TYPE);
      applyFilters(
        DEFAULT_LEVEL,
        DEFAULT_FORMAT,
        DEFAULT_EXAM_TYPE,
        DEFAULT_SORT,
        DEFAULT_RESOURCE_TYPE,
        ''
      );
    };

    document.addEventListener('resetFilters', handleResetFilters);
    return () => document.removeEventListener('resetFilters', handleResetFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableResourceTypeFilter]);

  const handleFilterChange = (name: 'level' | 'format' | 'examType' | 'sort', value: string) => {
    if (name === 'level') setLevel(value);
    if (name === 'format') setFormat(value);
    if (name === 'examType') setExamType(value);
    if (name === 'sort') setSort(value);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    applyFilters(level, format, examType, sort, resourceType, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    applyFilters(level, format, examType, sort, resourceType, '');
  };

  const applyFilters = (
    currentLevel = level,
    currentFormat = format,
    currentExamType = examType,
    currentSort = sort,
    currentResourceType = resourceType,
    currentSearchTerm = searchTerm
  ) => {
    setMobileFiltersVisible(false);

    const detail: CatalogFilterChangeDetail = {
      level: currentLevel,
      format: currentFormat,
      examType: enableExamTypeFilter ? currentExamType : DEFAULT_EXAM_TYPE,
      sort: currentSort,
      resourceType: enableResourceTypeFilter ? currentResourceType : DEFAULT_RESOURCE_TYPE,
      search: currentSearchTerm,
    };

    window.dispatchEvent(new CustomEvent<CatalogFilterChangeDetail>('filterChange', { detail }));
  };

  const clearFilters = () => {
    setLevel(DEFAULT_LEVEL);
    setFormat(DEFAULT_FORMAT);
    setExamType(DEFAULT_EXAM_TYPE);
    setSort(DEFAULT_SORT);
    setSearchTerm('');
    if (enableResourceTypeFilter) setResourceType(DEFAULT_RESOURCE_TYPE);

    applyFilters(
      DEFAULT_LEVEL,
      DEFAULT_FORMAT,
      DEFAULT_EXAM_TYPE,
      DEFAULT_SORT,
      DEFAULT_RESOURCE_TYPE,
      ''
    );
  };

  const removeFilterTag = (name: ActiveTag['name']) => {
    const newLevel = name === 'level' ? DEFAULT_LEVEL : level;
    const newFormat = name === 'format' ? DEFAULT_FORMAT : format;
    const newExamType = name === 'examType' ? DEFAULT_EXAM_TYPE : examType;
    const newSearchTerm = name === 'search' ? '' : searchTerm;
    const newResourceType = name === 'resourceType' ? DEFAULT_RESOURCE_TYPE : resourceType;

    if (name === 'level') setLevel(DEFAULT_LEVEL);
    if (name === 'format') setFormat(DEFAULT_FORMAT);
    if (name === 'examType') setExamType(DEFAULT_EXAM_TYPE);
    if (name === 'search') setSearchTerm('');
    if (name === 'resourceType') setResourceType(DEFAULT_RESOURCE_TYPE);

    applyFilters(newLevel, newFormat, newExamType, sort, newResourceType, newSearchTerm);
  };

  const toggleMobileFilters = () => setMobileFiltersVisible(!mobileFiltersVisible);

  return (
    <div
      id="catalog-filters"
      data-product-type={productType}
      className={`filter-container mb-8 min-w-full rounded-xl bg-white p-4 shadow-md md:min-w-[600px] md:p-6 ${className}`}
    >
      <form id="filter-form" className="filter-form" onSubmit={handleSearchSubmit}>
        <div className="mb-4 px-4 md:mb-6 md:px-8">
          <div
            className={`relative transition-all duration-300 ${isSearchFocused ? 'ring-primary ring-2' : ''}`}
          >
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="min-h-11 w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pr-24 pl-10 text-sm transition-all duration-300 hover:bg-white focus:outline-none"
              aria-label="Buscar"
            />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            {searchTerm && (
              <button
                type="button"
                className="absolute inset-y-0 right-11 flex w-11 items-center justify-center text-gray-500 transition-colors hover:text-gray-700"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              >
                <ClearIcon />
              </button>
            )}
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-white transition-colors"
              aria-label="Buscar"
            >
              <ArrowRightIcon />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <span>
                {displayedProductCount} {displayedProductCount === 1 ? 'resultado' : 'resultados'}
              </span>
              {activeFilterCount > 0 && (
                <span className="ml-2">
                  • {activeFilterCount} filtro
                  {activeFilterCount !== 1 && 's'} aplicado
                  {activeFilterCount !== 1 && 's'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 md:flex-row md:items-center md:gap-6 md:px-8">
          <button
            type="button"
            className="bg-neutral-light text-primary-dark filter-toggle relative flex w-full items-center justify-between rounded-lg px-4 py-3 font-medium md:hidden"
            aria-expanded={mobileFiltersVisible ? 'true' : 'false'}
            aria-controls="mobile-filters"
            onClick={toggleMobileFilters}
          >
            <span className="flex items-center">
              <FilterIcon />
              <span className="ml-2">Filtrar y ordenar</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary filter-count-badge ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <span
              className={`transition-transform duration-300 ${mobileFiltersVisible ? 'rotate-180' : ''}`}
            >
              <ArrowDownIcon />
            </span>
          </button>

          {mobileFiltersVisible && (
            <div
              id="mobile-filters"
              className="animate-fade-in w-full space-y-4 rounded-lg bg-white p-4 shadow-inner md:hidden"
            >
              <div className="space-y-2">
                <label htmlFor={mobileLevelId} className="block text-sm font-medium text-gray-700">
                  Nivel
                </label>
                <div className="relative">
                  <select
                    id={mobileLevelId}
                    name="level"
                    value={level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    className="bg-neutral-light text-primary-dark focus:ring-primary mobile-filter-select min-h-11 w-full appearance-none rounded-lg border-gray-300 px-4 py-2.5 shadow-sm focus:ring-2 focus:outline-none"
                  >
                    {levelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-primary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    <ArrowDownIcon />
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor={mobileFormatId} className="block text-sm font-medium text-gray-700">
                  Formato
                </label>
                <div className="relative">
                  <select
                    id={mobileFormatId}
                    name="format"
                    value={format}
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                    className="bg-neutral-light text-primary-dark focus:ring-primary mobile-filter-select min-h-11 w-full appearance-none rounded-lg border-gray-300 px-4 py-2.5 shadow-sm focus:ring-2 focus:outline-none"
                  >
                    {formatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-primary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    <ArrowDownIcon />
                  </span>
                </div>
              </div>

              {enableExamTypeFilter && (
                <div className="space-y-2">
                  <label
                    htmlFor={mobileExamTypeId}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tipo de examen
                  </label>
                  <div className="relative">
                    <select
                      id={mobileExamTypeId}
                      name="examType"
                      value={examType}
                      onChange={(e) => handleFilterChange('examType', e.target.value)}
                      className="bg-neutral-light text-primary-dark focus:ring-primary mobile-filter-select min-h-11 w-full appearance-none rounded-lg border-gray-300 px-4 py-2.5 shadow-sm focus:ring-2 focus:outline-none"
                    >
                      {examTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-primary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                      <ArrowDownIcon />
                    </span>
                  </div>
                </div>
              )}

              {enableResourceTypeFilter && (
                <div className="space-y-2">
                  <label
                    htmlFor={mobileResourceTypeId}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tipo de producto
                  </label>
                  <div className="relative">
                    <select
                      id={mobileResourceTypeId}
                      name="resourceType"
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="bg-neutral-light text-primary-dark focus:ring-primary mobile-filter-select min-h-11 w-full appearance-none rounded-lg border-gray-300 px-4 py-2.5 shadow-sm focus:ring-2 focus:outline-none"
                    >
                      {resourceTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-primary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                      <ArrowDownIcon />
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor={mobileSortId} className="block text-sm font-medium text-gray-700">
                  Ordenar por
                </label>
                <div className="relative">
                  <select
                    id={mobileSortId}
                    name="sort"
                    value={sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="bg-neutral-light text-primary-dark focus:ring-primary mobile-filter-select min-h-11 w-full appearance-none rounded-lg border-gray-300 px-4 py-2.5 shadow-sm focus:ring-2 focus:outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-primary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    <ArrowDownIcon />
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => applyFilters()}
                className="bg-primary hover:bg-primary-dark apply-filters-btn flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 font-medium text-white transition-colors duration-300"
              >
                <span>Aplicar filtros</span>
                <span className="ml-2">
                  <ArrowRightIcon />
                </span>
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="bg-neutral hover:bg-neutral-dark clear-filters-btn mt-2 flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2 font-medium text-gray-700 transition-colors duration-300"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          <div className="hidden flex-1 flex-wrap items-center gap-4 md:flex">
            <div className="relative flex items-center">
              <div className="bg-primary/10 mr-2 flex items-center rounded-full p-1.5">
                <FilterIcon />
              </div>
              <div className="relative">
                <select
                  name="level"
                  value={level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="bg-neutral-light text-primary-dark focus:ring-primary filter-select min-h-11 appearance-none rounded-lg px-4 py-2.5 pr-8 shadow-sm transition-all duration-300 hover:shadow focus:ring-2 focus:outline-none"
                  aria-label="Filtrar por nivel"
                >
                  {levelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-primary pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                  <ArrowDownIcon />
                </span>
              </div>
            </div>

            <div className="relative">
              <select
                name="format"
                value={format}
                onChange={(e) => handleFilterChange('format', e.target.value)}
                className="bg-neutral-light text-primary-dark focus:ring-primary filter-select min-h-11 appearance-none rounded-lg px-4 py-2.5 pr-8 shadow-sm transition-all duration-300 hover:shadow focus:ring-2 focus:outline-none"
                aria-label="Filtrar por formato"
              >
                {formatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-primary pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                <ArrowDownIcon />
              </span>
            </div>

            {enableExamTypeFilter && (
              <div className="relative">
                <select
                  name="examType"
                  value={examType}
                  onChange={(e) => handleFilterChange('examType', e.target.value)}
                  className="bg-neutral-light text-primary-dark focus:ring-primary filter-select min-h-11 appearance-none rounded-lg px-4 py-2.5 pr-8 shadow-sm transition-all duration-300 hover:shadow focus:ring-2 focus:outline-none"
                  aria-label="Filtrar por tipo de examen"
                >
                  {examTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-primary pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                  <ArrowDownIcon />
                </span>
              </div>
            )}

            {enableResourceTypeFilter && (
              <div className="relative">
                <select
                  name="resourceType"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="bg-neutral-light text-primary-dark focus:ring-primary filter-select min-h-11 appearance-none rounded-lg px-4 py-2.5 pr-8 shadow-sm transition-all duration-300 hover:shadow focus:ring-2 focus:outline-none"
                  aria-label="Filtrar por tipo de producto"
                >
                  {resourceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-primary pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                  <ArrowDownIcon />
                </span>
              </div>
            )}

            <div className="relative">
              <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
                <SortIcon />
              </div>
              <select
                name="sort"
                value={sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="bg-neutral-light text-primary-dark focus:ring-primary filter-select sort-select min-h-11 appearance-none rounded-lg py-2.5 pr-8 pl-9 shadow-sm transition-all duration-300 hover:shadow focus:ring-2 focus:outline-none"
                aria-label="Ordenar productos"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-primary pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                <ArrowDownIcon />
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => applyFilters()}
              className="bg-primary hover:bg-primary-dark apply-filters-btn flex min-h-11 min-w-[100px] items-center justify-center rounded-lg px-4 py-2.5 text-white shadow-md transition-colors duration-300 hover:shadow-lg"
            >
              Aplicar
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-gray-700 transition-colors duration-300 hover:bg-gray-200"
                aria-label="Limpiar todos los filtros"
              >
                <ClearIcon />
              </button>
            )}
          </div>
        </div>

        {activeTags.length > 0 && (
          <div className="active-filters mt-4 flex flex-wrap gap-2 px-4 md:px-8" aria-live="polite">
            {activeTags.map((tag) => (
              <div
                key={`${tag.name}-${tag.value}`}
                className="bg-primary-light/20 text-primary-dark filter-tag group hover:bg-primary-light/30 inline-flex min-h-11 max-w-full min-w-0 items-center gap-1.5 rounded-full py-1.5 pr-0 pl-3 text-sm transition-colors"
              >
                <span className="text-primary-dark/70 text-xs">{tag.displayName}:</span>
                <span className="min-w-0 font-medium break-all">{tag.label}</span>
                <button
                  type="button"
                  onClick={() => removeFilterTag(tag.name)}
                  className="focus:ring-primary ml-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full group-hover:bg-white/80 focus:ring-2 focus:outline-none"
                  aria-label={`Eliminar filtro ${tag.displayName}: ${tag.label}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default CatalogFilter;
