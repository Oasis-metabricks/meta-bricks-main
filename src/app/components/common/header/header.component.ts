declare let window: any;
import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../services/wallet.service';
import { AvatarService } from '../../../services/avatar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  destroyedCount: number = 0;
  walletAddress: string | null = null;
  isHamburgerOpen: boolean = false;
  
  // Avatar Modal State
  showAvatarModal: boolean = false;
  showWalletModal: boolean = false;
  activeAvatarTab: 'login' | 'create' = 'login';
  isAvatarLoading: boolean = false;
  isAvatarConnected: boolean = false;
  avatarSuccessMessage: string = '';
  avatarErrorMessage: string = '';
  
  // Form Data
  loginData = {
    username: '',
    password: ''
  };
  
  avatarData = {
    username: '',
    email: '',
    password: '',
    avatarType: '',
    createdOASISType: '',
    acceptTerms: false
  };

  constructor(
    private router: Router,
    private walletService: WalletService,
    private avatarService: AvatarService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.checkWalletConnection();
    this.checkAvatarConnection();
  }

  ngOnDestroy() {
    this.destroyedCount++;
  }

  // Avatar Modal Methods
  openAvatarModal() {
    this.showAvatarModal = true;
    this.resetAvatarForms();
  }

  closeAvatarModal() {
    this.showAvatarModal = false;
    this.resetAvatarForms();
    this.clearAvatarMessages();
  }

  openWalletModal() {
    this.showWalletModal = true;
  }

  closeWalletModal() {
    this.showWalletModal = false;
  }

  setAvatarTab(tab: 'login' | 'create') {
    this.activeAvatarTab = tab;
    this.clearAvatarMessages();
  }

  resetAvatarForms() {
    this.loginData = { username: '', password: '' };
    this.avatarData = { username: '', email: '', password: '', avatarType: '', createdOASISType: '', acceptTerms: false };
  }

  clearAvatarMessages() {
    this.avatarSuccessMessage = '';
    this.avatarErrorMessage = '';
  }

  async loginAvatar() {
    if (!this.loginData.username || !this.loginData.password) {
      this.avatarErrorMessage = 'Please fill in all fields';
      return;
    }

    this.isAvatarLoading = true;
    this.clearAvatarMessages();

    try {
      const result = await this.avatarService.loginAvatar(this.loginData.username, this.loginData.password);
      this.avatarSuccessMessage = 'Avatar connected successfully!';
      this.isAvatarConnected = true;
      this.closeAvatarModal();
      this.cdr.detectChanges();
    } catch (error: any) {
      this.avatarErrorMessage = error.message || 'Login failed. Please try again.';
    } finally {
      this.isAvatarLoading = false;
    }
  }

  async createAvatar() {
    if (!this.avatarData.username || !this.avatarData.email || !this.avatarData.password || !this.avatarData.avatarType || !this.avatarData.createdOASISType) {
      this.avatarErrorMessage = 'Please fill in all required fields';
      return;
    }

    if (!this.avatarData.acceptTerms) {
      this.avatarErrorMessage = 'Please accept the terms and conditions';
      return;
    }
    
    this.isAvatarLoading = true;
    this.clearAvatarMessages();

    try {
      const result = await this.avatarService.createAvatar(this.avatarData);
      this.avatarSuccessMessage = 'Avatar created successfully!';
      this.isAvatarConnected = true;
      this.closeAvatarModal();
      this.cdr.detectChanges();
    } catch (error: any) {
      this.avatarErrorMessage = error.message || 'Avatar creation failed. Please try again.';
    } finally {
      this.isAvatarLoading = false;
    }
  }

  checkAvatarConnection() {
    this.avatarService.getAvatarState().subscribe(avatar => {
      this.isAvatarConnected = !!avatar;
      this.cdr.detectChanges();
    });
  }

  // Wallet Methods
  checkWalletConnection() {
    this.walletService.checkWalletConnected().then((publicKey: any) => {
      if (publicKey) {
        this.walletAddress = publicKey.toString();
        this.cdr.detectChanges();
      }
    });
  }

  async connectWallet() {
    try {
      const publicKey = await this.walletService.connectWallet();
      if (publicKey) {
        this.walletAddress = publicKey.toString();
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

  toggleHamburger() {
    this.isHamburgerOpen = !this.isHamburgerOpen;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  toggleHamburgerMenu() {
    this.toggleHamburger();
  }
}