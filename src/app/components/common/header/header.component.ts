declare let window: any;
import { Component, Renderer2, NgZone, ChangeDetectorRef, OnInit } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public walletAddress: string | null = null;

  constructor(
    private walletService: WalletService,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Check for mobile wallet return flow first
    const mobileWalletInfo = this.walletService.handleMobileWalletReturn();
    if (mobileWalletInfo) {
      this.walletAddress = mobileWalletInfo;
      this.cdr.detectChanges();
      return;
    }
    
    // Check for existing wallet connection
    this.walletService.checkWalletConnected().then((publicKey: any) => {
      if (publicKey) {
        this.walletAddress = publicKey.toString();
        this.cdr.detectChanges();
      }
    });
  }

  connectWallet() {
    this.ngZone.run(() => {
      this.walletService.connectWallet().then(res => {
        // Check if this is a mobile connection
        if (res && res.mobile) {
          console.log('Mobile wallet connection initiated');
          alert('Opening Phantom app... Please return to this page after connecting your wallet.');
          return;
        }
        
        // Desktop flow
        console.log('Phantom state after connect:', window.solana);

        if (window.solana && window.solana.isConnected && window.solana.publicKey) {
          this.walletAddress = window.solana.publicKey.toString();
          this.cdr.detectChanges();
        } else {
          this.walletAddress = null;
          alert('Failed to connect to Phantom. Please try again.');
        }
        const targetElement = this.renderer.selectRootElement('#target-element', true);
        this.renderer.setStyle(targetElement, 'color', 'green');
      }).catch(err => {
        console.error('Error connecting wallet', err);
        alert('Error connecting to Phantom wallet.');
      });
    });
  }
}