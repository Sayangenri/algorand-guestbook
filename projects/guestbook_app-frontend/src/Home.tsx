import { useWallet, Wallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AppCalls from './components/AppCalls'
import GuestbookMessages from './components/GuestbookMessages'
import { ellipseAddress } from './utils/ellipseAddress'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const { activeAddress, wallets } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleDemoModal = () => {
    setOpenDemoModal(!openDemoModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          On-Chain Guestbook
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeAddress ? (
            <>
              <span className="wallet-address">{ellipseAddress(activeAddress)}</span>
              <button className="btn-premium" onClick={toggleAppCallsModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Sign Guestbook
              </button>
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
        <GuestbookMessages refreshTrigger={refreshTrigger} />
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
      <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} onSubmitSuccess={handleRefresh} />
    </div>
  )
}

export default Home
