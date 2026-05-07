import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { GuestbookAppContractClient } from '../contracts/GuestbookAppContract'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
  onSubmitSuccess: () => void
}

const APP_ID = BigInt(import.meta.env.VITE_GUESTBOOK_APP_ID)

const AppCalls = ({ openModal, setModalState, onSubmitSuccess }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [messageText, setMessageText] = useState<string>('')
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const submitMessage = async () => {
    if (!activeAddress || !transactionSigner || !messageText.trim()) return
    setLoading(true)

    try {
      const client = new GuestbookAppContractClient({
        appId: APP_ID,
        defaultSender: activeAddress,
        algorand,
      })

      await client.send.submitMessage({ args: { text: messageText } })

      enqueueSnackbar('Message submitted successfully!', { variant: 'success' })
      setMessageText('')
      onSubmitSuccess()
      setModalState(false)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      enqueueSnackbar(`Error: ${message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`modal-overlay ${openModal ? 'is-open' : ''}`}>
      <div className="glass-modal">
        <div className="modal-header">
          <h3 className="modal-title gradient-text">Sign the Guestbook</h3>
          <p className="text-subtitle">Write your message to the on-chain guestbook</p>
        </div>
        
        <textarea
          className="input-premium mb-4"
          placeholder="Your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={4}
        />
        
        <div className="modal-actions">
          <button className="btn-outline" onClick={(e) => { e.preventDefault(); setModalState(false); }}>
            Cancel
          </button>
          <button 
            className="btn-premium" 
            onClick={(e) => { e.preventDefault(); submitMessage(); }} 
            disabled={loading || !messageText.trim()}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                Submit Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppCalls
