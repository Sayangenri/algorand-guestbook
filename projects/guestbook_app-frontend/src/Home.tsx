import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AppCalls from './components/AppCalls'
import GuestbookMessages from './components/GuestbookMessages'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const { activeAddress } = useWallet()

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

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">On-Chain Guestbook</a>
        </div>
        <div className="flex-none">
          {activeAddress ? (
            <button className="btn btn-ghost btn-primary" onClick={toggleAppCallsModal}>
              Sign Guestbook
            </button>
          ) : (
            <button className="btn btn-ghost btn-primary" onClick={toggleWalletModal}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-2xl">
        <GuestbookMessages refreshTrigger={refreshTrigger} />
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
      <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} onSubmitSuccess={handleRefresh} />
    </div>
  )
}

export default Home
