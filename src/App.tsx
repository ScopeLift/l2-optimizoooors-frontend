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
import Content from "./components/Content";
import Header from "./components/Header";

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
        accentColor: '#4F46E5',
        accentColorForeground: 'white',
        fontStack: 'system',
        overlayBlur: 'small',
      })}>
        <div className="h-screen bg-no-repeat bg-cover bg-center bg-[url('/images/ring-nebula.png')]">
          <Header />

          <div className="flex justify-center items-center text-2xl drop-shadow-2xl">
            <Content />
          </div>

          <div className="absolute inset-x-0 bottom-0 rounded-xl overflow-auto p-8">
            <div className="flex flex-col mx-auto space-y-4 font-mono text-white text-2xl font-bold leading-6 max-w-xs">
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
