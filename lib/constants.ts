export const SERIES_TYPES = [
    "Manga",
    "Manhwa",
    "Manhua",
    "Novel",
    "One Shot",
    "Doujinshi"
] as const;

export const SERIES_STATUS = [
    { value: "ongoing", label: "En Emisión" },
    { value: "completed", label: "Completado" },
    { value: "hiatus", label: "Hiatus" },
    { value: "dropped", label: "Cancelado" },
] as const;

export const DEMOGRAPHICS = [
    "Shonen",
    "Seinen",
    "Shoujo",
    "Josei",
    "Kodomo"
] as const;

export const GENRES = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Ecchi",
    "Fantasy",
    "Harem",
    "Historical",
    "Horror",
    "Isekai",
    "Martial Arts",
    "Mecha",
    "Mystery",
    "Psychological",
    "Romance",
    "School Life",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Tragedy",
    "Yaoi",
    "Yuri"
] as const;

export const SORT_OPTIONS = [
    { value: "latest", label: "Recientes" },
    { value: "oldest", label: "Más antiguos" },
    { value: "alphabetical_asc", label: "A-Z" },
    { value: "alphabetical_desc", label: "Z-A" },
    // Popularity needs a view count or similar metric implemented in backend
] as const;
