import React from 'react';
import logo from "../logos/optimizooor-logo.png"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Header() {
  // const { address: walletAddr, isDisconnected } = useAccount();
  return (
    <div className="flex justify-between mb-10 p-3">
      <img alt='logo' src={logo} className="w-60"></img>
      <ConnectButton />
    </div>
  )
}
