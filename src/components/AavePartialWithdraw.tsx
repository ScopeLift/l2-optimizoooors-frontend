import React, { useState, useEffect } from 'react'
import config from '../contractConfig.json'
import {
  useSendTransaction,
  usePrepareSendTransaction,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi'
import { UseContractConfig } from 'wagmi/dist/declarations/src/hooks/contracts/useContract'
import { BigNumber, constants } from 'ethers'
import { parseEther } from 'ethers/lib/utils'

// TODO disable if wallet is not connected

const contractConfig: UseContractConfig = {
  addressOrName: config.address,
  contractInterface: config.abi
}

interface Props {
  withdrawContractAddr: string
}

export default function AavePartialWithdraw({withdrawContractAddr} : Props) {
  const [amount, setAmount] = useState('0')

  const { config: approveATokenConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: 'approve',
    args: [config.address, parseEther(amount)]
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
      gasLimit: 1e6,
    },
  })
  // maybe need to do something like:
  // const {
  //   config,
  //   error: prepareError,
  //   isError: isPrepareError,
  // } = usePrepareContractWrite({
  //   addressOrName: config.address,
  //   contractInterface: [],
  //   functionName: "fallback",
  //   args: ["0x42"],
  // });
  // const { data, error, isError, write
  // } = useContractWrite(config);

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
    <form
      className="outline outline-black outline-solid rounded-md"
      onSubmit={() => approveATokenSpend?.()}
    >
      <input
        aria-label="Amount (AToken)"
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.05"
        value={amount}
      />
      <button className="p-4 mt-2 bg-green-200 rounded-md hover:bg-green-300">
        Partial Withdraw from Aave
      </button>
      {isWithdrawLoading && <div>Check Wallet</div>}
      {isWithdrawSuccess && <div>Withdrawal Succeeded! {JSON.stringify(withdrawData)}</div>}
    </form>
  )
}
