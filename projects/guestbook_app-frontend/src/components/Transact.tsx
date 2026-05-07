import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Transact = ({ openModal, setModalState }: TransactInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()

  const { transactionSigner, activeAddress } = useWallet()

  const handleSubmitAlgo = async () => {
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      return
    }

    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const result = await algorand.send.payment({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: receiverAddress,
        amount: algo(1),
      })
      enqueueSnackbar(`Transaction sent: ${result.txIds[0]}`, { variant: 'success' })
      setReceiverAddress('')
    } catch (e) {
      enqueueSnackbar('Failed to send transaction', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <div className={`modal-overlay ${openModal ? 'is-open' : ''}`}>
      <div className="glass-modal">
        <div className="modal-header">
          <h3 className="modal-title gradient-text">Send payment transaction</h3>
        </div>
        
        <input
          type="text"
          data-test-id="receiver-address"
          placeholder="Provide wallet address"
          className="input-premium mb-4 mt-4"
          value={receiverAddress}
          onChange={(e) => {
            setReceiverAddress(e.target.value)
          }}
        />
        
        <div className="modal-actions">
          <button className="btn-outline" onClick={(e) => { e.preventDefault(); setModalState(!openModal); }}>
            Close
          </button>
          <button
            data-test-id="send-algo"
            className="btn-premium"
            onClick={(e) => { e.preventDefault(); handleSubmitAlgo(); }}
            disabled={receiverAddress.length !== 58 || loading}
          >
            {loading ? <span className="spinner" /> : 'Send 1 Algo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Transact
