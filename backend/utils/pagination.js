const getPagination = query => { // ?page=1&perPage=10 -> numeri sempre validi
    const page = Math.max(parseInt(query.page) || 1, 1) // almeno 1, con un numero negativo skip() va in errore
    const perPage = Math.min(Math.max(parseInt(query.perPage) || 10, 1), 100) // tra 1 e 100
    return {
        page,
        perPage,
        skip: (page - 1) * perPage,
    }
}

const toPage = (data, totalResults, { page, perPage }) => ({ // la stessa forma per ogni lista paginata
    data,
    page,
    perPage,
    totalPages: Math.ceil(totalResults / perPage),
    totalResults,
})

module.exports = {
    getPagination,
    toPage,
}
