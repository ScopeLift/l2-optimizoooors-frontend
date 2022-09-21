import { SendTransaction } from './SendTransaction'
import AaveWithdraw from './AaveWithdraw'

const depositContractAddr = '0x234b85b4c37760bc9c9b7545201ede4276de6df8'
const withdrawContractAddr = '0x5f7ca09fd143e24e3afbc90c842f0882c9ed7053'

export default function Content() {
  return (
    <div>
      <SendTransaction to={depositContractAddr} />
      <AaveWithdraw withdrawContractAddr={withdrawContractAddr} />
    </div>
  )
}
