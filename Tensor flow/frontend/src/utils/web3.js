import { ethers } from 'ethers'
import { CONTRACT_ADDRESS } from './constants.js'
import ABI from './contractABI.json'

let provider
let signer
let contract

export const initWeb3 = async () => {
    if (!window.ethereum) {
        throw new Error('MetaMask not installed')
    }

    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner()
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

    return { provider, signer, contract }
}

export const getProvider = () => provider
export const getSigner = () => signer
export const getContract = () => contract

export const switchNetwork = async (chainId) => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.toBeHex(chainId) }],
        })
    } catch (error) {
        if (error.code === 4902) {
            console.error('Network not added to wallet')
        }
        throw error
    }
}

export const getCurrentAccount = async () => {
    const accounts = await window.ethereum.request({
        method: 'eth_accounts',
    })
    return accounts[0] || null
}

export const requestAccounts = async () => {
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
    })
    return accounts[0]
}