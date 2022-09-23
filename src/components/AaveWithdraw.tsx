import React, { useState, useEffect } from 'react'
import aTokenConfig from '../contractConfig.json'
import {
  useAccount,
  useSendTransaction,
  usePrepareSendTransaction,
  useContractReads,
  usePrepareContractWrite,
  useWaitForTransaction,
  useContractWrite
} from 'wagmi'
import { UseContractConfig } from 'wagmi/dist/declarations/src/hooks/contracts/useContract'
import { BigNumber, constants } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'

const aTokenContract: UseContractConfig = {
  addressOrName: aTokenConfig.address,
  contractInterface: aTokenConfig.abi
}

interface Props {
  withdrawContractAddr: string;
  aTokenBalance: BigNumber;
  aTokenWithdrawRouterAllowance: BigNumber;
}

// We use this number b/c the hex value is "0x80....(all zeros)" which saves
// gas and its obnoxiously big, so it's just as good as a true max allowance.
const MAX_ALLOWANCE = BigNumber.from("2").pow("255");

export default function AavePartialWithdraw(
  {
    withdrawContractAddr,
    aTokenBalance,
    aTokenWithdrawRouterAllowance,
  } : Props
) {
  const [amount, setAmount] = useState<string | undefined>();
  const [readyForWithdraw, setReadyForWithdraw] = useState<boolean>(false);
  const [withdrawClicked, setWithdrawClicked] = useState<boolean>(false);
  const [withdrawMax, setWithdrawMax] = useState<boolean>(false);

  const parsedAmount = (): BigNumber => {
    if (amount) return parseEther(parseFloat(amount).toString());
    return parseEther("0");
  }

  const { config: approveATokenConfig } = usePrepareContractWrite({
    ...aTokenContract,
    functionName: 'approve',
    args: [
      withdrawContractAddr,
      MAX_ALLOWANCE,
    ]
  })

  const {
    data: DataApproveToken,
    isLoading: isApproveTokenLoading,
    isSuccess: isApproveTokenSuccess,
    write: approveATokenSpend,
  } = useContractWrite(approveATokenConfig)

  const approveATokenSpendIfNecessary = () => {
    setWithdrawClicked(true);

    if (aTokenWithdrawRouterAllowance.gt(aTokenBalance)) {
      // We don't need to approve if there is already sufficient allowance.
      setReadyForWithdraw(true);
    } else {
      approveATokenSpend?.();
    }
  }

  const dataForWithdrawTx = () => {
    if(aTokenBalance.eq('0')) return {};

    // The contract will withdraw everything if no data is passed.
    if(withdrawMax) return {};

    const percent = parsedAmount().mul("100").div(aTokenBalance);
    // We multiply by 255 because that is the maximum value that can be stored
    // in 2 bytes. So we express the percentage in terms of 255. In a better
    // version of this algorithm, we would dynamically determine the data length
    // in bytes necessary to acheive a certain level of fidelity with the
    // user-specified amount. For this demo, being able to specify amounts only
    // in 0.4 percentage increments (100/255) is good enough.
    const hexData = percent.mul("255").div("100").toHexString();

    return {data: hexData};
  }

  // Withdraw token
  const { config: withdrawConfig } = usePrepareSendTransaction({
    request: {
      to: withdrawContractAddr,
      value: 0,
      // needed to avoid ethers yelling at us
      gasLimit: 1e6,
      ...dataForWithdrawTx(),
    },
  })

  const {
    data: withdrawData,
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    sendTransaction: sendWithdrawTransaction
  } = useSendTransaction(withdrawConfig);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: withdrawData?.hash,
  })

  useEffect(() => {
    if(isApproveTokenSuccess) setReadyForWithdraw(true)
  }, [isApproveTokenSuccess])

  useEffect(() => {
    if (readyForWithdraw && withdrawClicked) {
      sendWithdrawTransaction?.();
      setReadyForWithdraw(false);
      setWithdrawClicked(true);
    }
  }, [readyForWithdraw, withdrawClicked])

  const setMaxWithdraw = () => {
    setWithdrawMax(true);
    setAmount(formatEther(aTokenBalance).substring(0,12));
  };

  // if (isWithdrawSuccess) {
  //   return(
  //     <div>
  //       Withdrawal Succeeded! View on <a href={`https://optimistic.etherscan.io/tx/${withdrawData?.hash}`}>Etherscan</a>
  //     </div>
  //   );
  // }

  return (
    <form
      className="flex bg-gray-100 rounded-xl p-4"
      onSubmit={(event) => {
        event.preventDefault();
        approveATokenSpendIfNecessary();
      }}
    >
      <input
        type="number"
        step="0.000001"
        className="tailwind-input"
        aria-label="Amount (AToken)"
        onChange={(e) => {
          setWithdrawMax(false);
          setAmount(e.target.value);
        }}
        placeholder="0.0"
        value={amount}
      />

      <button
        onClick={(event) => {
          event.preventDefault();
          setMaxWithdraw();
        }}
        className='tailwind-btn-secondary w-18 mx-2' >
          Max
      </button>
      <button disabled={isWithdrawLoading || !sendWithdrawTransaction || !amount} className="tailwind-btn w-28">
        Withdraw
      </button>
    </form>
  )
}
