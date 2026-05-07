import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect, useState } from 'react'
import { GuestbookAppContractClient, Message } from '../contracts/GuestbookAppContract'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ellipseAddress } from '../utils/ellipseAddress'

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
        defaultSender: activeAddress ?? undefined,
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
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading messages: {error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Guestbook Entries ({messages.length})</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500">No messages yet. Be the first to sign the guestbook!</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.index} className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span className="font-mono">{ellipseAddress(msg.sender)}</span>
                  <span>{formatDate(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GuestbookMessages
