import { useRef, useEffect, useState } from 'react'
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

  const depositInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (depositInput.current) depositInput.current!.focus()});

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
      <div className="flex bg-gray-100 rounded-xl p-4">
        <div>
          <input
            type="number"
            step="0.000001"
            aria-label="Amount (ether)"
            onChange={(e) => {
              setAmount(e.target.value)
              }
            }
            ref={depositInput}
            placeholder="0.0"
            value={amount}
            className="tailwind-input"
          />
        </div>

          <button disabled={isLoading || !sendTransaction || !to || !amount} className='tailwind-btn w-24'>
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
