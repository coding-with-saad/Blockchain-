import React, { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ConnectWallet from './components/ConnectWallet'
import CreateBatch from './components/CreateBatch'
import LogCheckpoint from './components/LogCheckpoint'
import VerifyBatch from './components/VerifyBatch'
import BatchList from './components/BatchList'
import JourneyTimeline from './components/JourneyTimeline'
import { getCurrentAccount, requestAccounts, initWeb3 } from './utils/web3'

export default function App() {
    const [account, setAccount] = useState(null)
    const [selectedBatchId, setSelectedBatchId] = useState(null)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        checkIfWalletIsConnected()
        setupEventListeners()
    }, [])

    const checkIfWalletIsConnected = async () => {
        try {
            const currentAccount = await getCurrentAccount()
            if (currentAccount) {
                // IMPORTANT: Initialize Web3 when existing account is found
                await initWeb3()
                setAccount(currentAccount)
            }
        } catch (error) {
            console.error('Error checking wallet:', error)
        }
    }

    const setupEventListeners = () => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    setAccount(null)
                } else {
                    setAccount(accounts[0])
                }
            })

            window.ethereum.on('chainChanged', () => {
                window.location.reload()
            })
        }
    }

    const handleConnect = async () => {
        try {
            const accounts = await requestAccounts()
            await initWeb3()
            setAccount(accounts[0])
            showMessage('success', 'Wallet connected successfully!')
        } catch (error) {
            showMessage('error', error.message || 'Failed to connect wallet')
        }
    }

    const handleDisconnect = () => {
        setAccount(null)
        setSelectedBatchId(null)
        showMessage('info', 'Wallet disconnected')
    }

    const showMessage = (type, text) => {
        setMessage({ type, text })
        setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }

    const handleBatchCreated = (batchId) => {
        showMessage('success', `Batch ${batchId} created successfully!`)
    }

    const handleCheckpointLogged = (batchId) => {
        showMessage('success', `Checkpoint logged for batch ${batchId}!`)
        setSelectedBatchId(batchId)
    }

    const handleBatchVerified = (batchId) => {
        showMessage('success', `Batch ${batchId} verified successfully!`)
    }

    const handleSelectBatch = (batchId) => {
        setSelectedBatchId(batchId)
    }

    const handleError = (error) => {
        showMessage('error', error)
    }

    if (!account) {
        return <ConnectWallet onConnect={handleConnect} onError={handleError} />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar account={account} onConnect={handleConnect} onDisconnect={handleDisconnect} />

            {/* Message Toast */}
            {message.text && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-40 ${message.type === 'success' ? 'bg-green-500' :
                    message.type === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                    }`}>
                    {message.text}
                </div>
            )}

            <main className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-1 space-y-6">
                        <CreateBatch onBatchCreated={handleBatchCreated} onError={handleError} />
                        <LogCheckpoint onCheckpointLogged={handleCheckpointLogged} onError={handleError} />
                        <VerifyBatch onBatchVerified={handleBatchVerified} onError={handleError} />
                    </div>

                    {/* Right Column - Lists and Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        <BatchList onSelectBatch={handleSelectBatch} onError={handleError} />
                        <JourneyTimeline batchId={selectedBatchId} onError={handleError} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p>TraceFlow © 2024 | Blockchain Supply Chain Tracking</p>
                </div>
            </footer>
        </div>
    )
}