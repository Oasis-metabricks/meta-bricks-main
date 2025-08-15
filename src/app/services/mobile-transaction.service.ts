import { Injectable } from '@angular/core';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

export interface MobileTransactionRequest {
  from: PublicKey;
  to: PublicKey;
  amount: number;
  memo?: string;
}

export interface MobileTransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MobileTransactionService {
  private readonly SOLANA_RPC = 'https://api.devnet.solana.com';
  private readonly PHANTOM_DEEP_LINK_BASE = 'https://phantom.app/ul/v1/transfer';

  constructor() {}

  createMobileTransactionLink(request: MobileTransactionRequest): string {
    const params = new URLSearchParams({
      recipient: request.to.toString(),
      amount: request.amount.toString(),
      token: 'SOL',
      network: 'devnet'
    });

    if (request.memo) {
      params.set('memo', request.memo);
    }

    return `${this.PHANTOM_DEEP_LINK_BASE}?${params.toString()}`;
  }

  createTransactionUrl(request: MobileTransactionRequest): string {
    const deepLink = this.createMobileTransactionLink(request);
    return deepLink;
  }

  createSimplePaymentLink(request: MobileTransactionRequest): string {
    // Create a simple payment deep link for Phantom mobile
    const params = new URLSearchParams({
      recipient: request.to.toString(),
      amount: request.amount.toString(),
      token: 'SOL'
    });

    return `https://phantom.app/ul/v1/transfer?${params.toString()}`;
  }

  handleTransactionReturn(): { success: boolean; signature?: string; error?: string } {
    // Check URL parameters for transaction result
    const urlParams = new URLSearchParams(window.location.search);
    const signature = urlParams.get('signature');
    const error = urlParams.get('error');
    const success = urlParams.get('success');

    if (signature && success === 'true') {
      return { success: true, signature };
    } else if (error) {
      return { success: false, error };
    } else {
      return { success: false, error: 'Unknown transaction result' };
    }
  }

  createMintingDeepLink(brickId: number, price: number): string {
    const params = new URLSearchParams({
      action: 'mint',
      brickId: brickId.toString(),
      price: price.toString(),
      timestamp: Date.now().toString()
    });

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  isReturningFromMinting(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('action') === 'mint';
  }

  getMintingParams(): { brickId?: number; price?: number; timestamp?: number } {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('action') === 'mint') {
      return {
        brickId: parseInt(urlParams.get('brickId') || '0'),
        price: parseFloat(urlParams.get('price') || '0'),
        timestamp: parseInt(urlParams.get('timestamp') || '0')
      };
    }
    
    return {};
  }

  cleanupMintingParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    url.searchParams.delete('brickId');
    url.searchParams.delete('price');
    url.searchParams.delete('timestamp');
    
    window.history.replaceState({}, document.title, url.toString());
  }

  validateTransactionRequest(request: MobileTransactionRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.from) {
      errors.push('From address is required');
    }

    if (!request.to) {
      errors.push('To address is required');
    }

    if (request.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (request.amount > 100) {
      errors.push('Amount cannot exceed 100 SOL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
