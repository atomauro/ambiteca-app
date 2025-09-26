import { ethers } from 'ethers';
import { PERLA_VERDE_ABI } from './abi';
import { getContractConfig, DEFAULT_CHAIN_ID, type SupportedChainId } from './config';

// Tipos para las transacciones
export interface MintForDeliveryParams {
  to: string;
  amount: string; // En wei (usar ethers.parseEther para convertir)
  deliveryId: string;
}

export interface MintFromAmbitecaParams {
  to: string;
  amount: string;
  deliveryId: string;
}

export interface BridgeMintParams {
  to: string;
  amount: string;
  bridgeId: string;
}

export interface TransactionResult {
  hash: string;
  wait: () => Promise<ethers.TransactionReceipt>;
}

// Cliente para interactuar con el contrato PerlaVerde
export class PerlaVerdeClient {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private chainId: SupportedChainId;

  constructor(
    providerOrSigner: ethers.Provider | ethers.Signer,
    chainId: SupportedChainId = DEFAULT_CHAIN_ID
  ) {
    this.chainId = chainId;
    const config = getContractConfig(chainId);
    
    if (!config.PERLA_VERDE_PROXY) {
      throw new Error(`No contract address configured for chain ${chainId}`);
    }

    if ('provider' in providerOrSigner) {
      // Es un signer
      this.signer = providerOrSigner;
      this.provider = providerOrSigner.provider!;
    } else {
      // Es un provider
      this.provider = providerOrSigner;
    }

    this.contract = new ethers.Contract(
      config.PERLA_VERDE_PROXY,
      PERLA_VERDE_ABI,
      this.signer || this.provider
    );
  }

  // === FUNCIONES DE LECTURA ===

  async getName(): Promise<string> {
    return await this.contract.name();
  }

  async getSymbol(): Promise<string> {
    return await this.contract.symbol();
  }

  async getDecimals(): Promise<number> {
    return await this.contract.decimals();
  }

  async getTotalSupply(): Promise<bigint> {
    return await this.contract.totalSupply();
  }

  async getBalance(address: string): Promise<bigint> {
    return await this.contract.balanceOf(address);
  }

  async getVersion(): Promise<string> {
    return await this.contract.version();
  }

  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }

  async getTokenBridge(): Promise<string> {
    return await this.contract.tokenBridge();
  }

  async isPaused(): Promise<boolean> {
    return await this.contract.paused();
  }

  async hasRole(role: string, account: string): Promise<boolean> {
    return await this.contract.hasRole(role, account);
  }

  async canMint(account: string): Promise<boolean> {
    return await this.contract.canMint(account);
  }

  async isAmbitecaAuthorized(ambiteca: string): Promise<boolean> {
    return await this.contract.isAmbitecaAuthorized(ambiteca);
  }

  // Obtener roles
  async getMinterRole(): Promise<string> {
    return await this.contract.MINTER_ROLE();
  }

  async getBridgeRole(): Promise<string> {
    return await this.contract.BRIDGE_ROLE();
  }

  async getAmbitecaRole(): Promise<string> {
    return await this.contract.AMBITECA_ROLE();
  }

  async getUpgraderRole(): Promise<string> {
    return await this.contract.UPGRADER_ROLE();
  }

  // === FUNCIONES DE ESCRITURA ===

  private requireSigner(): ethers.Signer {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }
    return this.signer;
  }

  async transfer(to: string, amount: string): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.transfer(to, amount);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async approve(spender: string, amount: string): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.approve(spender, amount);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async mint(to: string, amount: string): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.mint(to, amount);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async mintForDelivery(params: MintForDeliveryParams): Promise<TransactionResult> {
    this.requireSigner();
    const deliveryIdBytes = ethers.id(params.deliveryId);
    const tx = await this.contract.mintForDelivery(
      params.to,
      params.amount,
      deliveryIdBytes
    );
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async mintFromAmbiteca(params: MintFromAmbitecaParams): Promise<TransactionResult> {
    this.requireSigner();
    const deliveryIdBytes = ethers.id(params.deliveryId);
    const tx = await this.contract.mintFromAmbiteca(
      params.to,
      params.amount,
      deliveryIdBytes
    );
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async bridgeMint(params: BridgeMintParams): Promise<TransactionResult> {
    this.requireSigner();
    const bridgeIdBytes = ethers.id(params.bridgeId);
    const tx = await this.contract.bridgeMint(
      params.to,
      params.amount,
      bridgeIdBytes
    );
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async setAmbitecaAuthorization(ambiteca: string, authorized: boolean): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.setAmbitecaAuthorization(ambiteca, authorized);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async pause(): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.pause();
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async unpause(): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.unpause();
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async grantRole(role: string, account: string): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.grantRole(role, account);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async revokeRole(role: string, account: string): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.revokeRole(role, account);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async burn(amount: string): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.burn(amount);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  // === UTILIDADES ===

  getContractAddress(): string {
    return this.contract.target as string;
  }

  getChainId(): SupportedChainId {
    return this.chainId;
  }

  getExplorerUrl(txHash?: string): string {
    const config = getContractConfig(this.chainId);
    const baseUrl = config.EXPLORER_URL;
    
    if (txHash) {
      return `${baseUrl}/tx/${txHash}`;
    }
    
    return `${baseUrl}/address/${this.getContractAddress()}`;
  }

  // Formatear cantidades
  static formatTokens(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals);
  }

  static parseTokens(amount: string, decimals: number = 18): string {
    return ethers.parseUnits(amount, decimals).toString();
  }
}
