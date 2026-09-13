import React, { useState } from 'react'
import { getContract } from '../utils/web3'
import Loading from './Loading'

export default function VerifyBatch({ onBatchVerified, onError }) {
    const [batchId, setBatchId] = useState('')
    const [loading, setLoading] = useState(false)
    const [verified, setVerified] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!batchId.trim()) {
            onError('Batch ID is required')
            return
        }

        try {
            setLoading(true)
            setVerified(false)
            const contract = getContract()

            const tx = await contract.verifyBatch(batchId)
            await tx.wait()

            setVerified(true)
            onBatchVerified(batchId)
            setBatchId('')

            setTimeout(() => setVerified(false), 3000)
        } catch (error) {
            console.error('Error verifying batch:', error)
            onError(error.message || 'Failed to verify batch')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ Verify Batch</h2>

            {loading && <Loading message="Verifying batch..." />}

            {verified && (
                <div className="bg-green-50 border border-green-500 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center">
                    <span className="text-2xl mr-3">✓</span>
                    <div>
                        <p className="font-bold">Batch Verified!</p>
                        <p className="text-sm">Batch {batchId} has been successfully verified as authentic.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID *</label>
                    <input
                        type="text"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        placeholder="e.g., GOLD-001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                    <p><strong>Info:</strong> Verifying a batch confirms its authenticity based on checkpoint records and temperature integrity.</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    Verify Batch
                </button>
            </form>
        </div>
    )
}