const getTotalPaidByCurrentUser = (username, paidBy) => {
    const userId = Object.keys(paidBy).find((key) => paidBy[key].username === username)
    return paidBy[userId]?.totalPaid || 0
}

export {
    getTotalPaidByCurrentUser,
}