import React from 'react'

export default function Navbar({ account, onConnect, onDisconnect }) {
    const truncateAddress = (addr) => {
        if (!addr) return ''
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">T</span>
                    </div>
                    <h1 className="text-2xl font-bold">TraceFlow</h1>
                </div>

                <div className="flex items-center space-x-4">
                    {account ? (
                        <div className="flex items-center space-x-3 bg-blue-700 px-4 py-2 rounded-lg">
                            <span className="text-sm font-mono">{truncateAddress(account)}</span>
                            <button
                                onClick={onDisconnect}
                                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onConnect}
                            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-bold transition"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}