# Metabricks Wallet

A beautifully designed, user-centric wallet that integrates with the OASIS ecosystem and follows the Metabricks design patterns. Built on the foundation of the Bloom wallet architecture and adapted for the Metabricks community.

## Features

### 🔐 **Wallet Management**
- **Multi-Chain Support**: Ethereum, Solana, Polygon, Arbitrum
- **Create New Wallets**: Generate new wallets with secure key generation
- **Import Existing Wallets**: Import wallets from private keys or seed phrases
- **Wallet Organization**: Manage multiple wallets per avatar

### 👤 **Avatar Integration**
- **OASIS Avatar System**: Full integration with OASIS avatars
- **Karma Display**: Show avatar karma and achievements
- **Profile Management**: Update avatar information and preferences

### 🎨 **NFT Management**
- **Metabricks NFTs**: Display and manage your Metabricks NFT collection
- **Multi-Chain NFTs**: Support for NFTs across different blockchains
- **NFT Metadata**: Rich NFT information and display

### 💰 **Transaction Management**
- **Send Tokens**: Transfer tokens between wallets
- **Transaction History**: Complete transaction logs and status
- **Gas Optimization**: Smart gas estimation and optimization

### 🎯 **OASIS API Integration**
- **Avatar API**: Full avatar management and authentication
- **Wallet API**: Multi-provider wallet operations
- **Keys API**: Secure key management and storage
- **Data API**: Holon data operations and storage

## Design Philosophy

The Metabricks Wallet follows the established Metabricks design patterns:

- **Color Scheme**: Uses the signature Metabricks blue (#343BE6) and cyan (#B0FFEC)
- **Typography**: Follows the 'Mek' font family for consistency
- **Layout**: Grid-based section layout matching the main Metabricks site
- **Responsive**: Mobile-first design with responsive breakpoints
- **Accessibility**: High contrast and clear visual hierarchy

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/bloomwalletio/bloom.git
   cd bloom
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Wallet**
   ```bash
   npm run build
   ```

## Configuration

### OASIS API Setup

1. **Get API Key**: Obtain your OASIS API key from [api.oasisplatform.world](http://api.oasisplatform.world)

2. **Update Configuration**: Add your API key to the services:
   ```typescript
   // In oasis.service.ts and wallet.service.ts
   private apiKey = 'your-oasis-api-key-here';
   ```

3. **API Endpoint**: The wallet connects to the OASIS API at `http://api.oasisplatform.world`

### Blockchain Configuration

The wallet supports multiple blockchain networks:

- **Ethereum**: Mainnet and testnets
- **Solana**: Mainnet and devnet
- **Polygon**: Mainnet and Mumbai testnet
- **Arbitrum**: One and Nova networks

## Usage

### Creating a New Wallet

1. Click "Create Wallet" button
2. Enter wallet name and select blockchain type
3. Set a secure password
4. Confirm wallet creation

### Importing an Existing Wallet

1. Click "Import Wallet" button
2. Enter private key or seed phrase
3. Set wallet name and password
4. Complete import process

### Managing NFTs

1. Navigate to the "NFTs" tab
2. View your Metabricks NFT collection
3. Click on NFTs for detailed information
4. Manage NFT metadata and properties

### Sending Transactions

1. Select source wallet
2. Enter recipient address
3. Specify amount and token
4. Review and confirm transaction

## Architecture

### Component Structure

```
metabricks-wallet/
├── metabricks-wallet.component.ts      # Main component logic
├── metabricks-wallet.component.html    # Component template
├── metabricks-wallet.component.scss    # Component styles
├── metabricks-wallet.module.ts         # Angular module
└── README.md                           # This file
```

### Service Layer

- **OASISService**: Core OASIS API integration
- **WalletService**: Wallet operations and transactions
- **AvatarService**: Avatar management and authentication

### Data Flow

1. **User Authentication** → AvatarService
2. **Wallet Operations** → WalletService
3. **NFT Management** → OASISService
4. **Data Storage** → OASIS Providers

## Security Features

- **Local Key Storage**: Private keys stored locally only
- **Password Protection**: Wallet encryption with user passwords
- **Secure Communication**: HTTPS API communication
- **Session Management**: Secure token-based authentication

## Development

### Prerequisites

- Node.js 16+
- Angular 15+
- TypeScript 4.8+

### Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Code Style

The wallet follows the existing Metabricks code style:

- **TypeScript**: Strict typing and interfaces
- **Angular**: Component-based architecture
- **SCSS**: Modular CSS with BEM methodology
- **Responsive**: Mobile-first design approach

## Integration

### With Metabricks Website

The wallet integrates seamlessly with the existing Metabricks website:

- **Shared Styling**: Uses the same CSS variables and design tokens
- **Navigation**: Integrates with existing navigation patterns
- **Authentication**: Shares avatar authentication state
- **Data Sync**: Real-time synchronization with OASIS backend

### With OASIS Ecosystem

Full integration with the OASIS platform:

- **Avatar System**: Complete avatar lifecycle management
- **Multi-Provider**: Support for all OASIS storage providers
- **Cross-Chain**: Seamless cross-blockchain operations
- **Data Interoperability**: Full OASIS data API support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [OASIS API Docs](https://docs.oasisplatform.world)
- **Community**: [Metabricks Discord](https://discord.gg/metabricks)
- **Issues**: [GitHub Issues](https://github.com/metabricks/wallet/issues)

## Roadmap

### Phase 1 (Current)
- ✅ Basic wallet functionality
- ✅ OASIS API integration
- ✅ Metabricks styling
- ✅ Multi-chain support

### Phase 2 (Next)
- 🔄 Advanced NFT management
- 🔄 DeFi integration
- 🔄 Mobile app
- 🔄 Hardware wallet support

### Phase 3 (Future)
- 📋 Cross-chain bridges
- 📋 Social features
- 📋 Governance tools
- 📋 Advanced analytics

---

Built with ❤️ by the Metabricks community and powered by the OASIS platform.
