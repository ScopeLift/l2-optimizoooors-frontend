import React, { useState, useEffect } from 'react'
import aTokenConfig from '../contractConfig.json'
import AaveWithdraw from './AaveWithdraw'
import AaveDeposit from './AaveDeposit'
import {
  useAccount,
  useContractReads,
} from 'wagmi'
import { UseContractConfig } from 'wagmi/dist/declarations/src/hooks/contracts/useContract'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import AaveLogo from "../logos/aave-logo.png"
import ConnextLogo from "../logos/connext-logo.png"
import SuperfluidLogo from "../logos/superfluid-logo.png"
import { ConnectButton } from '@rainbow-me/rainbowkit';

const aTokenContract: UseContractConfig = {
  addressOrName: aTokenConfig.address,
  contractInterface: aTokenConfig.abi
}

const depositContractAddr = '0x234b85b4c37760bc9c9b7545201ede4276de6df8'
const withdrawContractAddr = '0x5f7ca09fd143e24e3afbc90c842f0882c9ed7053'

export default function Content() {
  const [aTokenBalance, setATokenBalance] = useState<undefined | BigNumber>();
  const [aTokenWithdrawRouterAllowance, setATokenAllowance] = useState<undefined | BigNumber>();
  const [select, setSelect] = useState<string>('Aave');
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
    return (
      <div className="flex flex-col w-200px items-center">
        <ConnectButton />
      </div>
    );
  }

  if (!aTokenWithdrawRouterAllowance || !aTokenBalance) {
    return (
      <div className="rounded-3xl p-5 my-auto w-80 flex flex-col items-center space-y-2 text-white">
        <div>Fetching balances...</div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-5 my-auto w-80 flex flex-col items-center space-y-2 bg-white">

      <div className="flex flex-inline justify-center items-center space-y-2 mb-2 -mt-2">
        {select === 'Aave' && <label><img src={AaveLogo} alt='aave-logo' className="w-8 mt-2"></img></label>}
        {select === 'Connext' && <label><img src={ConnextLogo} alt='aave-logo' className="w-8 mt-2"></img></label>}
        {select === 'Superfluid' && <label><img src={SuperfluidLogo} alt='aave-logo' className="w-8 mt-2"></img></label>}

        <select
          onChange={e => setSelect(e.target.value)}
          className='flex-inline outline-none bg-transparent ring-none focus: ring-white focus:ring-1 rounded-full text-center py-2 px-0 pl-2'
        >
          <option value='Aave'>Aave</option>
          <option value='Connext'>Connext</option>
          <option value='Superfluid'>Superfluid</option>
        </select>
      </div>

      {/* <div>aTokenBalance: {formatEther(aTokenBalance)} ETH</div>
      <div>aTokenWithdrawRouterAllowance: {formatEther(aTokenWithdrawRouterAllowance)} ETH</div> */}

      <AaveDeposit {...{depositContractAddr}} />
      <AaveWithdraw {...{withdrawContractAddr, aTokenWithdrawRouterAllowance, aTokenBalance}} />
    </div>
  );
}
