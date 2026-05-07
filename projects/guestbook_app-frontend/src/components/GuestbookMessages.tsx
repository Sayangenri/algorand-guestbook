import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect, useState } from 'react'
import { GuestbookAppContractClient, Message } from '../contracts/GuestbookAppContract'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ellipseAddress } from '../utils/ellipseAddress'
import algosdk from 'algosdk'

interface GuestbookEntry {
  index: number
  sender: string
  text: string
  timestamp: bigint
}

interface GuestbookMessagesProps {
  refreshTrigger: number
}

const APP_ID = BigInt(import.meta.env.VITE_GUESTBOOK_APP_ID)

const GuestbookMessages = ({ refreshTrigger }: GuestbookMessagesProps) => {
  const [messages, setMessages] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { transactionSigner, activeAddress } = useWallet()

  const loadMessages = async () => {
    setLoading(true)
    setError(null)

    try {
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const indexerConfig = getIndexerConfigFromViteEnvironment()
      const algorand = AlgorandClient.fromConfig({
        algodConfig,
        indexerConfig,
      })
      algorand.setDefaultSigner(transactionSigner)

      const client = new GuestbookAppContractClient({
        appId: APP_ID,
        defaultSender: activeAddress || algosdk.getApplicationAddress(APP_ID).toString(),
        algorand,
      })

      const countResult = await client.send.getMessageCount()
      const count = Number(countResult.return)

      const loadedMessages: GuestbookEntry[] = []
      for (let i = 1; i <= count; i++) {
        const result = await client.send.getMessage({ args: { index: BigInt(i) } })
        const msg = result.return
        if (msg) {
          loadedMessages.push({
            index: i,
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp,
          })
        }
      }

      setMessages(loadedMessages.reverse())
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load messages'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [refreshTrigger])

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner spinner-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)' }}>
        <p style={{ color: '#f87171' }}>Error loading messages: {error}</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-title gradient-text">Guestbook Entries ({messages.length})</h2>
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✍️</div>
          <p className="text-subtitle">No messages yet. Be the first to sign the guestbook!</p>
        </div>
      ) : (
        <div>
          {messages.map((msg) => (
            <div key={msg.index} className="glass-panel message-card">
              <p className="message-text">{msg.text}</p>
              <div className="message-footer">
                <span className="message-sender">{ellipseAddress(msg.sender)}</span>
                <span>{formatDate(msg.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GuestbookMessages
