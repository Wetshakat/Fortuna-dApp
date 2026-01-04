import { http } from "wagmi";
import { baseSepolia } from "viem/chains";
import { createConfig } from "@privy-io/wagmi";

export const wagmiConfig = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(),
    },
});
