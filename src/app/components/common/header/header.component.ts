declare let window: any;
import { Component, Renderer2, NgZone, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../services/wallet.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  destroyedCount: number = 0;
  leftCount: number = 432;
  walletAddress: string | null = null;
  isHamburgerOpen: boolean = false;

  constructor(
    private walletService: WalletService,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
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
        
        // Desktop flow - use the response directly from wallet service
        console.log('Wallet connection response:', res);
        
        if (res && res.publicKey) {
          this.walletAddress = res.publicKey.toString();
          this.cdr.detectChanges();
          console.log('Wallet connected successfully:', this.walletAddress);
        } else {
          this.walletAddress = null;
          console.error('No public key in response:', res);
          alert('Failed to connect to Phantom. Please try again.');
        }
      }).catch(err => {
        console.error('Error connecting wallet', err);
        alert('Error connecting to Phantom wallet.');
      });
    });
  }

  toggleHamburgerMenu(): void {
    this.isHamburgerOpen = !this.isHamburgerOpen;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}