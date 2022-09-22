import React, { useState, useEffect } from 'react'
import aTokenConfig from '../contractConfig.json'
import {
  useAccount,
  useSendTransaction,
  usePrepareSendTransaction,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi'
import { UseContractConfig } from 'wagmi/dist/declarations/src/hooks/contracts/useContract'
import { BigNumber, constants } from 'ethers'
import { parseEther } from 'ethers/lib/utils'

const aTokenContract: UseContractConfig = {
  addressOrName: aTokenConfig.address,
  contractInterface: aTokenConfig.abi
}

interface Props {
  withdrawContractAddr: string;
  aTokenBalance: BigNumber;
  aTokenWithdrawRouterAllowance: BigNumber;
}

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

  const parsedAmount = (): BigNumber => {
    if (amount) return parseEther(parseFloat(amount).toString());
    return parseEther("0");
  }

  const { config: approveATokenConfig } = usePrepareContractWrite({
    ...aTokenContract,
    functionName: 'approve',
    args: [withdrawContractAddr, parsedAmount()]
  })

  const {
    data: DataApproveToken,
    isLoading: isApproveTokenLoading,
    isSuccess: isApproveTokenSuccess,
    write: approveATokenSpend,
  } = useContractWrite(approveATokenConfig)

  const approveATokenSpendIfNecessary = () => {
    setWithdrawClicked(true);

    // We don't need to approve if there is already sufficient allowance.
    if (aTokenWithdrawRouterAllowance.lt(parsedAmount())) {
      approveATokenSpend?.();
    } else {
      setReadyForWithdraw(true);
    }
  }

  const dataForWithdrawTx = ():string => {
    const percent = parsedAmount().mul("100").div(aTokenBalance);
    // We multiply by 255 because that is the maximum value that can be stored
    // in 2 bytes. So we express the percentage in terms of 255. In a better
    // version of this algorithm, we would dynamically determine the data length
    // in bytes necessary to acheive a certain level of fidelity with the
    // user-specified amount. For this demo, being able to specify amounts only
    // in 0.4 percentage increments (100/255) is good enough.
    return percent.mul("255").div("100").toHexString();
  }

  // Withdraw token
  const { config: withdrawConfig } = usePrepareSendTransaction({
    request: {
      to: withdrawContractAddr,
      value: 0,
      data: dataForWithdrawTx(),
      gasLimit: 1e6,
    },
  })

  const {
    data: withdrawData,
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    sendTransaction: sendWithdrawTransaction
  } = useSendTransaction(withdrawConfig);

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

  if (isWithdrawSuccess) {
    return(
      <div>
        Withdrawal Succeeded! View on <a href={`https://optimistic.etherscan.io/tx/${withdrawData?.hash}`}>Etherscan</a>
      </div>
    );
  }

  return (
    <form
      className="outline outline-black outline-solid rounded-md w-1/2"
      onSubmit={(event) => {
        event.preventDefault();
        approveATokenSpendIfNecessary();
      }}
    >
      <input
        className="p-4"
        aria-label="Amount (AToken)"
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.05"
        value={amount}
      />
      <button className="p-4 m-2 bg-green-200 rounded-md hover:bg-green-300">
        Partial Withdraw from Aave
      </button>
    </form>
  )
}
