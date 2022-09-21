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

  const { config: ApproveToken } = usePrepareContractWrite({
    ...contractConfig,
    functionName: 'approve',
    args: [config.address, constants.MaxUint256 ]
  })

  const { data: DataApproveToken,
    isLoading: isApproveTokenLoading,
    isSuccess: isApproveTokenSuccess,
    write
  } = useContractWrite(ApproveToken)

  const withdrawSubmit = () => {
    const writeReturnValue = write?.()
  }

  // Withdraw token

  const { config: withdrawConfig } = usePrepareSendTransaction({
    request: {
      to: withdrawContractAddr,
      value: 0,
      gasLimit: 1e6
    },
  })

  const { data: withdrawData,
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    sendTransaction: sendWithdrawTransaction } =
    useSendTransaction(withdrawConfig)

  useEffect(() => {
    console.log('gary', isApproveTokenSuccess, sendWithdrawTransaction, isWithdrawSuccess);

    if(isApproveTokenSuccess && sendWithdrawTransaction) {
      sendWithdrawTransaction?.()
      console.log('gary', isApproveTokenSuccess, sendWithdrawTransaction, isWithdrawSuccess);
    }

  },[isApproveTokenSuccess, sendWithdrawTransaction])


  return (
    <div>
      <button onClick={() => withdrawSubmit()}>
        Withdraw from Aave
      </button>
    </div>
  )
}
