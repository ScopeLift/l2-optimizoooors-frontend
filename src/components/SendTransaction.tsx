import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from 'wagmi'
import { parseEther } from 'ethers/lib/utils'

interface Props {
  to: string
}

export const SendTransaction = ({ to }: Props) => {
  const [debouncedTo] = useDebounce(to, 500)
  const [amount, setAmount] = useState('')
  const [debouncedValue] = useDebounce(amount, 500)

  const { config } = usePrepareSendTransaction({
    request: {
      to: debouncedTo,
      value: debouncedValue ? parseEther(debouncedValue) : undefined,
    },
  })
  const { data, sendTransaction } = useSendTransaction(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        sendTransaction?.()
      }}
    >
      <div className="flex flex-col items-center">
      <div>
      <input
        aria-label="Amount (ether)"
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.05"
        value={amount}
        className="box-content py-2 px-3 outline-none ring-none focus: ring-gray-500 focus:ring-2 rounded-full"
      />
      </div>
      <button disabled={isLoading || !sendTransaction || !to || !amount} className='btn mt-2'>
        {isLoading ? 'Depositing...' : 'Deposit'}
      </button>
      {isSuccess && (
        <div>
          Successfully sent {amount} ether to {to}
          <div>
            <a href={`https://optimistic.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
      </div>
    </form>
  )
}