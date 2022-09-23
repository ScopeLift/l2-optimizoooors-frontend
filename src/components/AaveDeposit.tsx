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

export default function AaveDeposit({ to }: Props) {
  const [debouncedTo] = useDebounce(to, 500)
  const [amount, setAmount] = useState('')
  const [debouncedValue] = useDebounce(amount, 500)

  const { config } = usePrepareSendTransaction({
    request: {
      to: debouncedTo,
      value: debouncedValue ? parseEther(debouncedValue) : undefined,
      gasLimit: 1e6
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
      <div className="flex items-center">
      <div>
        <input
          type="number"
          step="0.000000000000000001"
          aria-label="Amount (ether)"
          onChange={(e) => {
            setAmount(e.target.value)
            }
          }
          placeholder="0.05"
          value={amount}
          className="box-content py-2 px-4 w-20 h-5 mr-2 outline-none bg-transparent ring-none
          focus: border-indigo-500 focus:ring-indigo-500 focus:ring-1 rounded-full [appearance:textfield] text-center
          disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
        invalid:border-red-500 invalid:text-red-600
        focus:invalid:border-red-500 focus:invalid:ring-red-500
        "
        />

      </div>
      <button disabled={isLoading || !sendTransaction || !to || !amount} className='tailwind-btn'>
        {isLoading ? 'Depositing...' : 'Deposit'}
      </button>
      {/* {isSuccess && (
        <button disabled={isLoading || !sendTransaction || !to || !amount} className='tailwind-btn'>
        <a href={`https://optimistic.etherscan.io/tx/${data?.hash}`} target="_blank" rel="noreferrer">Etherscan</a>
        </button>
      )} */}
      </div>
    </form>
  )
}