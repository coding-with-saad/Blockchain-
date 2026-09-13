export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
export const NETWORK_ID = parseInt(import.meta.env.VITE_NETWORK_ID)

export const BATCH_STATUS = {
    CREATED: 0,
    IN_TRANSIT: 1,
    DELIVERED: 2,
    VERIFIED: 3
}

export const BATCH_STATUS_LABELS = {
    0: 'Created',
    1: 'In Transit',
    2: 'Delivered',
    3: 'Verified'
}

export const BATCH_STATUS_COLORS = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-purple-100 text-purple-800',
    3: 'bg-green-100 text-green-800'
}

export const MIN_TEMP = -10
export const MAX_TEMP = 45