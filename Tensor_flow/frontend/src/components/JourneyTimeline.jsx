import React, { useState, useEffect } from 'react'
import { getContract } from '../utils/web3'
import { MIN_TEMP, MAX_TEMP } from '../utils/constants'
import Loading from './Loading'

export default function JourneyTimeline({ batchId, onError }) {
    const [batch, setBatch] = useState(null)
    const [checkpoints, setCheckpoints] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (batchId) {
            fetchBatchData()
        }
    }, [batchId])

    const fetchBatchData = async () => {
        try {
            setLoading(true)
            const contract = getContract()

            const batchInfo = await contract.getBatchInfo(batchId)
            const checkpointsData = await contract.getCheckpoints(batchId)

            setBatch(batchInfo)
            setCheckpoints(checkpointsData)
        } catch (error) {
            console.error('Error fetching batch data:', error)
            onError('Failed to load batch journey')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (timestamp) => {
        return new Date(parseInt(timestamp) * 1000).toLocaleString()
    }

    const getTemperatureColor = (temp) => {
        if (temp < MIN_TEMP || temp > MAX_TEMP) {
            return 'text-red-600'
        }
        return 'text-green-600'
    }

    const getTempStatus = (temp) => {
        if (temp < MIN_TEMP) return '❄️ Too Cold'
        if (temp > MAX_TEMP) return '🔥 Too Hot'
        return '✓ Safe'
    }

    if (!batchId) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-center py-8">Select a batch to view journey</p>
            </div>
        )
    }

    if (loading) return <Loading message="Loading journey..." />

    if (!batch) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-center py-8">No batch data found</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Journey Timeline</h2>

            {/* Batch Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-600">Batch ID</p>
                        <p className="font-bold text-gray-800">{batch.batchId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Product</p>
                        <p className="font-bold text-gray-800">{batch.productName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Category</p>
                        <p className="font-bold text-gray-800">{batch.productCategory}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Checkpoints</p>
                        <p className="font-bold text-gray-800">{checkpoints.length}</p>
                    </div>
                </div>
            </div>

            {/* Temperature Stats */}
            {checkpoints.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                        <p className="text-xs text-gray-600">Min Temp</p>
                        <p className={`text-lg font-bold ${getTemperatureColor(batch.minTemp)}`}>
                            {batch.minTemp}°C
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                        <p className="text-xs text-gray-600">Avg Temp</p>
                        <p className="text-lg font-bold text-green-600">{batch.avgTemp}°C</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                        <p className="text-xs text-gray-600">Max Temp</p>
                        <p className={`text-lg font-bold ${getTemperatureColor(batch.maxTemp)}`}>
                            {batch.maxTemp}°C
                        </p>
                    </div>
                </div>
            )}

            {/* Timeline */}
            {checkpoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No checkpoints logged yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative">
                        {checkpoints.map((checkpoint, index) => (
                            <div key={index} className="flex gap-4">
                                {/* Timeline dot */}
                                <div className="relative flex flex-col items-center">
                                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                                    {index < checkpoints.length - 1 && (
                                        <div className="w-1 bg-blue-300 flex-grow" style={{ height: '60px' }}></div>
                                    )}
                                </div>

                                {/* Checkpoint info */}
                                <div className="flex-1 pb-4">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-800">{checkpoint.location}</h4>
                                            <span className="text-xs text-gray-500">{formatDate(checkpoint.timestamp)}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <p className="text-xs text-gray-600">Temperature</p>
                                                <p className={`font-bold ${getTemperatureColor(checkpoint.temperature)}`}>
                                                    {checkpoint.temperature}°C
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Status</p>
                                                <p className="font-bold text-sm">{getTempStatus(checkpoint.temperature)}</p>
                                            </div>
                                        </div>

                                        {checkpoint.notes && (
                                            <p className="text-sm text-gray-700 bg-white rounded p-2 border-l-2 border-blue-500">
                                                {checkpoint.notes}
                                            </p>
                                        )}

                                        {checkpoint.tempAlert && (
                                            <div className="mt-2 bg-yellow-50 border border-yellow-300 rounded p-2 text-xs text-yellow-800">
                                                ⚠️ Temperature anomaly detected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quality Summary */}
            {checkpoints.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                        <strong>Quality Report:</strong>
                    </p>
                    {batch.hasAnomalies ? (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                            <p className="text-yellow-800">
                                ⚠️ This batch has temperature anomalies. Review checkpoints for details.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                            <p className="text-green-800">
                                ✓ All checkpoints within safe temperature range (-10°C to 45°C).
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}