import React from 'react'
import { requestAccounts, initWeb3 } from '../utils/web3'

export default function ConnectWallet({ onConnect, onError }) {
    const handleConnect = async () => {
        try {
            if (!window.ethereum) {
                onError('MetaMask not installed. Please install MetaMask.')
                return
            }

            const account = await requestAccounts()
            await initWeb3()
            onConnect(account)
        } catch (error) {
            console.error('Connection error:', error)
            onError(error.message || 'Failed to connect wallet')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-white font-bold">⛓️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">TraceFlow</h1>
                    <p className="text-gray-600">Blockchain Supply Chain Tracker</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                        <strong>Welcome!</strong> Connect your MetaMask wallet to track product journeys on the blockchain.
                    </p>
                </div>

                <button
                    onClick={handleConnect}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
                >
                    🦊 Connect MetaMask
                </button>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Sepolia Testnet Required</p>
                </div>
            </div>
        </div>
    )
}