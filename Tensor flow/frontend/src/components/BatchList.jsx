import React, { useState, useEffect } from 'react'
import { getContract } from '../utils/web3'
import { BATCH_STATUS_LABELS, BATCH_STATUS_COLORS } from '../utils/constants'
import Loading from './Loading'

export default function BatchList({ onSelectBatch, onError }) {
    const [batches, setBatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBatch, setSelectedBatch] = useState(null)

    useEffect(() => {
        fetchBatches()
    }, [])

    const fetchBatches = async () => {
        try {
            setLoading(true)
            const contract = getContract()
            const batchIds = await contract.getAllBatches()

            const batchesData = await Promise.all(
                batchIds.map(async (id) => {
                    const batch = await contract.getBatchInfo(id)
                    return {
                        id,
                        productName: batch.productName,
                        status: batch.status,
                        manufacturer: batch.manufacturer,
                        checkpointCount: batch.checkpointCount,
                        isAuthentic: batch.isAuthentic
                    }
                })
            )

            setBatches(batchesData)
        } catch (error) {
            console.error('Error fetching batches:', error)
            onError('Failed to fetch batches')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectBatch = (batch) => {
        setSelectedBatch(batch)
        onSelectBatch(batch.id)
    }

    if (loading) return <Loading message="Loading batches..." />

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📦 All Batches</h2>
                <button
                    onClick={fetchBatches}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    🔄 Refresh
                </button>
            </div>

            {batches.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No batches found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {batches.map((batch) => (
                        <div
                            key={batch.id}
                            onClick={() => handleSelectBatch(batch)}
                            className={`p-4 border rounded-lg cursor-pointer transition ${selectedBatch?.id === batch.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">{batch.id}</h3>
                                    <p className="text-sm text-gray-600">{batch.productName}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`text-xs px-2 py-1 rounded ${BATCH_STATUS_COLORS[batch.status]}`}>
                                            {BATCH_STATUS_LABELS[batch.status]}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {batch.checkpointCount} checkpoints
                                        </span>
                                        {batch.isAuthentic && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}