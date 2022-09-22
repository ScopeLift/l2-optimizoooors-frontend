import React, { useState, useEffect } from 'react'
import { SendTransaction } from './SendTransaction'
import aTokenConfig from '../contractConfig.json'
import AaveWithdraw from './AaveWithdraw'
import AavePartialWithdraw from './AavePartialWithdraw'
import {
  useAccount,
  useContractReads,
} from 'wagmi'
import { UseContractConfig } from 'wagmi/dist/declarations/src/hooks/contracts/useContract'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'

const aTokenContract: UseContractConfig = {
  addressOrName: aTokenConfig.address,
  contractInterface: aTokenConfig.abi
}

const depositContractAddr = '0x234b85b4c37760bc9c9b7545201ede4276de6df8'
const withdrawContractAddr = '0x5f7ca09fd143e24e3afbc90c842f0882c9ed7053'

export default function Content() {
  const [aTokenBalance, setATokenBalance] = useState<undefined | BigNumber>();
  const [aTokenWithdrawRouterAllowance, setATokenAllowance] = useState<undefined | BigNumber>();
  const { address: walletAddr } = useAccount();

  const {
    data: readContractData,
    error: readContractError,
    isSuccess: isReadContractSuccess,
    isError: isReadContractError,
  } = useContractReads({
    contracts: [
      {
        ...aTokenContract,
        functionName: 'balanceOf',
        args: [walletAddr],
      },
      {
        ...aTokenContract,
        functionName: 'allowance',
        args: [walletAddr, withdrawContractAddr],
      },
    ],
    allowFailure: false,
  });

  useEffect(() => {
    if (!walletAddr) return;

    if (isReadContractSuccess && readContractData) {
      const balance = (readContractData[0] as unknown) as BigNumber;
      const allowance = (readContractData[1] as unknown) as BigNumber;
      setATokenBalance(balance);
      setATokenAllowance(allowance);
    }

    if (isReadContractError) {
      // TODO handle
    }
    // TODO we need a way to refresh this data only when relevant!
  }, [walletAddr]);

  if (!walletAddr) {
    return (<div>Please connect your wallet to get started.</div>);
  }

  if (!aTokenWithdrawRouterAllowance || !aTokenBalance) {
    return (<div>Fetching balances...</div>);
  }

  return (
    <div>
      <div>aTokenBalance: {formatEther(aTokenBalance)} ETH</div>
      <div>aTokenWithdrawRouterAllowance: {formatEther(aTokenWithdrawRouterAllowance)} ETH</div>

      {/* <SendTransaction to={depositContractAddr} /> */}
      {/* <AaveWithdraw withdrawContractAddr={withdrawContractAddr} /> */}
      <AavePartialWithdraw {...{withdrawContractAddr, aTokenWithdrawRouterAllowance, aTokenBalance}} />
    </div>
  );
}
