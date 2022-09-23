import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Content from "./components/Content";
import logo from "./logos/optimizooor-logo.png"

const { chains, provider } = configureChains(
  [chain.optimism],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={darkTheme({
        accentColor: '#ad3030',
        accentColorForeground: 'white',
        fontStack: 'system',
        overlayBlur: 'small',
      })}>
        <div className="h-screen bg-no-repeat bg-cover bg-center bg-[url('/images/ring-nebula.png')]">
          <div className="flex justify-between p-3">
            <img alt='logo' src={logo} className="w-60 -mt-24 -ml-4"></img>
            <div>
              <ConnectButton />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Content />
          </div>

          <div className="absolute inset-x-0 bottom-0 rounded-xl overflow-auto p-8">
            <div className="flex flex-col mx-auto space-y-4 font-mono text-white text-lg font-bold leading-6 max-w-xs">
              <div className="p-4 rounded-lg flex items-center justify-center">
                <a href="https://www.scopelift.co/">© ScopeLift 2022</a>
              </div>
            </div>
          </div>

        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
