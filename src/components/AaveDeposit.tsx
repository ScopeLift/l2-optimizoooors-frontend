import { useRef, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
  useAccount,
  useBalance,
} from 'wagmi'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import Modal from './Modal'
interface Props {
  depositContractAddr: string;
}

export default function AaveDeposit({ depositContractAddr }: Props) {
  const [amount, setAmount] = useState('')
  const [debouncedValue] = useDebounce(amount, 500)
  const [depositMax, setDepositMax] = useState<boolean>(false);
  const { address: walletAddr } = useAccount();
  const { data: balanceData } = useBalance({ addressOrName: walletAddr });
  const ethBalance = balanceData?.value;
  const [openModal, setOpenModal] = useState(false)

  const depositInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (depositInput.current) depositInput.current!.focus()});

  const depositAmount = () => {
    if (!debouncedValue) return;
    const approximateGasNeeded = parseEther("0.000049");
    if (depositMax && !ethBalance) return;
    return depositMax ? ethBalance!.sub(approximateGasNeeded) : parseEther(debouncedValue);
  }

  const { config } = usePrepareSendTransaction({
    request: {
      to: depositContractAddr,
      value: depositAmount(),
      gasLimit: 1e6 // needed to avoid ethers complaining
    },
  })
  const { data, sendTransaction } = useSendTransaction(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const setMaxDeposit = () => {
    setDepositMax(true);
    if (ethBalance) setAmount(formatEther(ethBalance).substring(0,12));
  };

  useEffect(() => {
    if(isSuccess) {
      setOpenModal(true);
    }
  },[isSuccess])

  const handleClose = () => {
    setOpenModal(false);
  }

  return (
    <form
      className="pb-2"
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
              setDepositMax(false);
              setAmount(e.target.value);
            }}
            ref={depositInput}
            placeholder="0.0"
            value={amount}
            className="tailwind-input"
          />
        </div>

          <button
            onClick={(event) => {
              event.preventDefault();
              setMaxDeposit();
            }}
            className='tailwind-btn-secondary w-18 mx-2'>
            Max
          </button>
          <button disabled={isLoading || !sendTransaction || !depositContractAddr || !amount} className='tailwind-btn w-28'>
            Deposit
          </button>

        {/* {isSuccess && (
          <button disabled={isLoading || !sendTransaction || !to || !amount} className='tailwind-btn'>
          <a href={`https://optimistic.etherscan.io/tx/${data?.hash}`} target="_blank" rel="noreferrer">Etherscan</a>
          </button>
        )} */}
        <Modal openState={openModal} handleClose={handleClose} txType='Deposit' txHash={data?.hash}/>
      </div>
    </form>
  )
}
