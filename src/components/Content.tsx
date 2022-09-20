import React from 'react'
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi'
import { BigNumber } from 'ethers'

export default function Content() {

  const { config: depositConfig } = usePrepareSendTransaction({
    request: { to: '0x234b85b4c37760bc9c9b7545201ede4276de6df8', value: BigNumber.from('20000000000000000') },
  })

  const { config: withdrawConfig } = usePrepareSendTransaction({
    request: { to: '0x5f7ca09fd143e24e3afbc90c842f0882c9ed7053', value: BigNumber.from('0') },
  })

  const { data, isLoading, isSuccess, sendTransaction } =
    useSendTransaction(depositConfig)

  const { data: withdrawData,
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    sendTransaction: sendWithdrawTransaction } =
  useSendTransaction(withdrawConfig)

  return (
    <div>
      <button disabled={!sendTransaction} onClick={() => sendTransaction?.()}>
        Deposit Eth into Aave
      </button>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      <button disabled={!sendWithdrawTransaction} onClick={() => sendWithdrawTransaction?.()}>
        Withdraw Eth into Aave
      </button>
      {isWithdrawLoading && <div>Check Wallet</div>}
      {isWithdrawSuccess && <div>Transaction: {JSON.stringify(withdrawData)}</div>}
    </div>
  )
}