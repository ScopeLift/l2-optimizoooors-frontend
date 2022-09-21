import { useEffect, useState } from 'react'
import { useSendTransaction, usePrepareSendTransaction, useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi'
import { BigNumber, constants } from 'ethers'
import { hexlify } from 'ethers/lib/utils'
import { SendTransaction } from './SendTransaction'
import { UseContractConfig } from 'wagmi/dist/declarations/src/hooks/contracts/useContract'
import config from '../contractConfig.json'
import AaveWithdraw from './AaveWithdraw'

const contractConfig: UseContractConfig = {
  addressOrName: config.address,
  contractInterface: config.abi
}

const depositContractAddr = '0x234b85b4c37760bc9c9b7545201ede4276de6df8'
const withdrawContractAddr = '0x5f7ca09fd143e24e3afbc90c842f0882c9ed7053'

export default function Content() {

  const [ needApproval, setNeedApproval ] = useState<boolean>(false);


  useEffect(() => {
    console.log(needApproval);
  }, [])

  const { data } = useContractRead({
    ...contractConfig,
    functionName: 'allowance',
    args: ['0x3f3c8dB1487469E8091cb210e9cf16D0Af0dE6FC', withdrawContractAddr]
  })

  const { config: ApproveToken } = usePrepareContractWrite({
    ...contractConfig,
    functionName: 'approve',
    args: [withdrawContractAddr, constants.MaxUint256 ]
  })
  const { data: DataApproveToken,
    isLoading: isApproveTokenLoading,
    isSuccess: isApproveTokenSuccess,
    write
  } = useContractWrite(ApproveToken)

  console.log(data?._hex);

  const { config: withdrawConfig } = usePrepareSendTransaction({
    request: {
      to: '0x5f7ca09fd143e24e3afbc90c842f0882c9ed7053',
      value: 0,
      gasLimit: 3e5
    },
  })

  const { data: withdrawData,
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    sendTransaction: sendWithdrawTransaction } =
    useSendTransaction(withdrawConfig)
  ///////////////////////////////////////////////////////////////

  return (
    <div>
      {/* <button disabled={!sendTransaction} onClick={() => sendTransaction?.()}>
        Deposit Eth into Aave
      </button>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>} */}
      <button disabled={!sendWithdrawTransaction} onClick={() => sendWithdrawTransaction?.()}>
        Withdraw Eth out of Aave
      </button>
      {isWithdrawLoading && <div>Check Wallet</div>}
      {isWithdrawSuccess && <div>Transaction: {JSON.stringify(withdrawData)}</div>}
      <SendTransaction to={depositContractAddr} />
      <AaveWithdraw withdrawContractAddr={withdrawContractAddr} />
      <button disabled={!write} onClick={() => write?.()}>
        Approve Token
      </button>
      <h1 className="text-3xl underline">
      Hello world!
      </h1>
    </div>
  )
}