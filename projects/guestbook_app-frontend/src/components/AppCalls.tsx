import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { GuestbookAppContractClient } from '../contracts/GuestbookAppContract'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  onSubmitSuccess: () => void
}

const APP_ID = BigInt(import.meta.env.VITE_GUESTBOOK_APP_ID)

const AppCalls = ({ onSubmitSuccess }: AppCallsInterface) => {
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      enqueueSnackbar(`Error: ${message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-title gradient-text" style={{ marginBottom: '1rem' }}>Sign the Guestbook</h2>
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <p className="text-subtitle" style={{ marginBottom: '2rem' }}>Leave your mark on the Algorand blockchain</p>
      
      <textarea
        className="input-premium mb-4"
        placeholder="Your message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        rows={4}
        style={{ width: '100%', fontSize: '1.125rem' }}
      />
      
      <button 
        className="btn-premium" 
        onClick={(e) => { e.preventDefault(); submitMessage(); }} 
        disabled={loading || !messageText.trim()}
        style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}
      >
        {loading ? (
          <span className="spinner"></span>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Sign Guestbook
          </>
        )}
      </button>
      </div>
    </div>
  )
}

export default AppCalls
