import React, { useState } from 'react'
import { getContract } from '../utils/web3'
import Loading from './Loading'

export default function CreateBatch({ onBatchCreated, onError }) {
    const [formData, setFormData] = useState({
        batchId: '',
        productName: '',
        productCategory: '',
        manufacturingLocation: '',
        estimatedDeliveryDate: ''
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

        if (!formData.batchId || !formData.productName || !formData.productCategory ||
            !formData.manufacturingLocation || !formData.estimatedDeliveryDate) {
            onError('All fields are required')
            return
        }

        try {
            setLoading(true)
            const contract = getContract()

            // Convert date to Unix timestamp
            const deliveryDate = Math.floor(new Date(formData.estimatedDeliveryDate).getTime() / 1000)

            const tx = await contract.createBatch(
                formData.batchId,
                formData.productName,
                formData.productCategory,
                formData.manufacturingLocation,
                deliveryDate
            )

            await tx.wait()

            onBatchCreated(formData.batchId)
            setFormData({
                batchId: '',
                productName: '',
                productCategory: '',
                manufacturingLocation: '',
                estimatedDeliveryDate: ''
            })
        } catch (error) {
            console.error('Error creating batch:', error)
            onError(error.message || 'Failed to create batch')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Create Batch</h2>

            {loading && <Loading message="Creating batch..." />}

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        placeholder="e.g., Gold Bars"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Category *</label>
                    <input
                        type="text"
                        name="productCategory"
                        value={formData.productCategory}
                        onChange={handleChange}
                        placeholder="e.g., Precious Metal"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Location *</label>
                    <input
                        type="text"
                        name="manufacturingLocation"
                        value={formData.manufacturingLocation}
                        onChange={handleChange}
                        placeholder="e.g., Mumbai, India"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date *</label>
                    <input
                        type="datetime-local"
                        name="estimatedDeliveryDate"
                        value={formData.estimatedDeliveryDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    Create Batch
                </button>
            </form>
        </div>
    )
}