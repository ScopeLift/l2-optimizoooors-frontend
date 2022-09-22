import React, { useEffect } from 'react'
import config from '../contractConfig.json'
import { useSendTransaction, usePrepareSendTransaction, useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi'
import { UseContractConfig } from 'wagmi/dist/declarations/src/hooks/contracts/useContract'
import { BigNumber, constants } from 'ethers'


const contractConfig: UseContractConfig = {
  addressOrName: config.address,
  contractInterface: config.abi
}

interface Props {
  withdrawContractAddr: string
}

export default function AaveWithdraw({withdrawContractAddr} : Props) {

  const { config: approveATokenConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: 'approve',
    args: [config.address, constants.MaxUint256 ]
  })

  const {
    data: DataApproveToken,
    isLoading: isApproveTokenLoading,
    isSuccess: isApproveTokenSuccess,
    write: approveATokenSpend,
  } = useContractWrite(approveATokenConfig)

  // Withdraw token
  const { config: withdrawConfig } = usePrepareSendTransaction({
    request: {
      to: withdrawContractAddr,
      value: 0,
      gasLimit: 1e6
    },
  })

  const {
    data: withdrawData,
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    sendTransaction: sendWithdrawTransaction
  } = useSendTransaction(withdrawConfig);

  useEffect(() => {
    if(isApproveTokenSuccess && sendWithdrawTransaction) {
      sendWithdrawTransaction?.()
    }
  },[isApproveTokenSuccess, sendWithdrawTransaction])


  return (
    <div>
      <button className="btn" onClick={() => approveATokenSpend?.()}>
        Withdraw from Aave
      </button>
      {isWithdrawLoading && <div>Check Wallet</div>}
      {isWithdrawSuccess && <div>Withdrawal Succeeded! {JSON.stringify(withdrawData)}</div>}
    </div>
  )
}
