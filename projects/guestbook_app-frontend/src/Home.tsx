import { useWallet, Wallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AppCalls from './components/AppCalls'
import GuestbookMessages from './components/GuestbookMessages'
import { ellipseAddress } from './utils/ellipseAddress'
import logo from './assets/algorand-logomark-black-RGB.png'

interface HomeProps { }

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const { activeAddress, wallets } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleDemoModal = () => {
    setOpenDemoModal(!openDemoModal)
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDisconnect = async () => {
    const activeWallet = wallets?.find((w: Wallet) => w.isActive)
    if (activeWallet) {
      await activeWallet.disconnect()
    } else {
      localStorage.removeItem('@txnlab/use-wallet:v3')
      window.location.reload()
    }
  }

  return (
    <div className="app-container">
      <nav className="glass-navbar">
        <a href="#" className="navbar-brand">
          <img src={logo} alt="Algorand Logo" width="48" height="48" style={{ objectFit: 'contain' }} />
          On Chain Guestbook
        </a>

        <div className="navbar-actions">
          {activeAddress ? (
            <>
              <span className="wallet-address">{ellipseAddress(activeAddress)}</span>
              <button className="btn-outline" onClick={handleDisconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button className="btn-outline" onClick={toggleWalletModal}>
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      <div className="content-wrapper">
        <div className="left-panel">
          {activeAddress ? (
            <AppCalls onSubmitSuccess={handleRefresh} />
          ) : (
            <div>
              <h2 className="text-title gradient-text" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Sign the Guestbook</h2>
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', opacity: 0.5 }}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 0 0 4h16"></path></svg>
                <p className="text-subtitle" style={{ marginBottom: '2rem' }}>Please connect your Algorand wallet to leave a message.</p>
                <button className="btn-premium" onClick={toggleWalletModal} style={{ width: '100%' }}>
                  Connect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="right-panel">
          <GuestbookMessages refreshTrigger={refreshTrigger} />
        </div>
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
    </div>
  )
}

export default Home
