import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <div className={`modal-overlay ${openModal ? 'is-open' : ''}`}>
      <div className="glass-modal">
        <div className="modal-header">
          <h3 className="modal-title gradient-text">Select wallet provider</h3>
        </div>

        <div className="mt-4">
          {activeAddress && (
            <>
              <Account />
              <div className="divider" />
            </>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                data-test-id={`${wallet.id}-connect`}
                className="btn-wallet-option"
                key={`provider-${wallet.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  return wallet.connect()
                }}
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`wallet_icon_${wallet.id}`}
                    src={wallet.metadata.icon}
                    style={{ objectFit: 'contain', width: '30px', height: 'auto' }}
                  />
                )}
                <span>{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>

        <div className="modal-actions">
          <button
            data-test-id="close-wallet-modal"
            className="btn-outline"
            onClick={(e) => {
              e.preventDefault()
              closeModal()
            }}
          >
            Close
          </button>
          {activeAddress && (
            <button
              className="btn-outline btn-danger"
              data-test-id="logout"
              onClick={async (e) => {
                e.preventDefault()
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
export default ConnectWallet
