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
    <dialog id="submit_message_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Sign the Guestbook</h3>
        <p className="py-4">Write your message to the on-chain guestbook</p>
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={4}
        />
        <div className="modal-action">
          <button className="btn" onClick={() => setModalState(false)}>
            Close
          </button>
          <button className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={submitMessage} disabled={loading || !messageText.trim()}>
            {loading ? <span className="loading loading-spinner" /> : 'Submit Message'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
