import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const Account = () => {
  const { activeAddress } = useWallet()
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  return (
    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <span className="text-label">Address: </span>
        <a className="message-sender" style={{ textDecoration: 'none' }} target="_blank" href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}>
          {ellipseAddress(activeAddress)}
        </a>
      </div>
      <div>
        <span className="text-label">Network: </span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{networkName}</span>
      </div>
    </div>
  )
}

export default Account
