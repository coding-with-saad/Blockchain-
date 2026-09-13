import React, { useState } from 'react'
import { getContract } from '../utils/web3'
import Loading from './Loading'

export default function LogCheckpoint({ onCheckpointLogged, onError }) {
    const [formData, setFormData] = useState({
        batchId: '',
        location: '',
        temperature: '',
        notes: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.batchId || !formData.location || formData.temperature === '') {
            onError('Batch ID, Location, and Temperature are required')
            return
        }

        const temp = parseInt(formData.temperature)
        if (temp < -50 || temp > 60) {
            onError('Temperature must be between -50 and 60 Celsius')
            return
        }

        try {
            setLoading(true)
            const contract = getContract()

            const tx = await contract.logCheckpoint(
                formData.batchId,
                formData.location,
                temp,
                formData.notes
            )

            await tx.wait()

            onCheckpointLogged(formData.batchId)
            setFormData({
                batchId: '',
                location: '',
                temperature: '',
                notes: ''
            })
        } catch (error) {
            console.error('Error logging checkpoint:', error)
            onError(error.message || 'Failed to log checkpoint')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📍 Log Checkpoint</h2>

            {loading && <Loading message="Logging checkpoint..." />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID *</label>
                    <input
                        type="text"
                        name="batchId"
                        value={formData.batchId}
                        onChange={handleChange}
                        placeholder="e.g., GOLD-001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Delhi, India"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C) *</label>
                    <input
                        type="number"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        placeholder="e.g., 28"
                        min="-50"
                        max="60"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Range: -50°C to 60°C</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="e.g., Good condition, stable temperature"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    Log Checkpoint
                </button>
            </form>
        </div>
    )
}