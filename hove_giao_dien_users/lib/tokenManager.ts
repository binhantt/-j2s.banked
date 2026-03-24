// Token Manager - Quản lý token với session storage và lifecycle
export class TokenManager {
  private static readonly TOKEN_KEY_PREFIX = 'cv_access_token_';
  private static readonly TOKEN_USAGE_KEY_PREFIX = 'cv_token_used_';
  private static readonly VISIBILITY_CHANGE_HANDLER = 'tokenVisibilityHandler';

  // Lưu token vào session storage (persist qua F5)
  static saveToken(cvId: number, token: string): void {
    if (typeof window === 'undefined') return;
    
    const tokenKey = this.TOKEN_KEY_PREFIX + cvId;
    const usageKey = this.TOKEN_USAGE_KEY_PREFIX + cvId;
    
    try {
      sessionStorage.setItem(tokenKey, token);
      sessionStorage.setItem(usageKey, 'false'); // Chưa sử dụng
      
      // Setup listener để clear token khi chuyển tab/window
      this.setupVisibilityListener(cvId);
      
      console.log(`[TokenManager] Token saved for CV ${cvId}`);
    } catch (error) {
      console.error('[TokenManager] Failed to save token:', error);
    }
  }

  // Lấy token từ session storage
  static getToken(cvId: number): string | null {
    if (typeof window === 'undefined') return null;
    
    const tokenKey = this.TOKEN_KEY_PREFIX + cvId;
    const usageKey = this.TOKEN_USAGE_KEY_PREFIX + cvId;
    
    try {
      const token = sessionStorage.getItem(tokenKey);
      const isUsed = sessionStorage.getItem(usageKey) === 'true';
      
      if (!token) {
        console.log(`[TokenManager] No token found for CV ${cvId}`);
        return null;
      }
      
      if (isUsed) {
        console.log(`[TokenManager] Token already used for CV ${cvId}`);
        this.clearToken(cvId);
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('[TokenManager] Failed to get token:', error);
      return null;
    }
  }

  // Đánh dấu token đã được sử dụng (one-time use)
  static markTokenAsUsed(cvId: number): void {
    if (typeof window === 'undefined') return;
    
    const usageKey = this.TOKEN_USAGE_KEY_PREFIX + cvId;
    
    try {
      sessionStorage.setItem(usageKey, 'true');
      console.log(`[TokenManager] Token marked as used for CV ${cvId}`);
    } catch (error) {
      console.error('[TokenManager] Failed to mark token as used:', error);
    }
  }

  // Kiểm tra token đã được sử dụng chưa
  static isTokenUsed(cvId: number): boolean {
    if (typeof window === 'undefined') return true;
    
    const usageKey = this.TOKEN_USAGE_KEY_PREFIX + cvId;
    
    try {
      return sessionStorage.getItem(usageKey) === 'true';
    } catch (error) {
      console.error('[TokenManager] Failed to check token usage:', error);
      return true;
    }
  }

  // Xóa token
  static clearToken(cvId: number): void {
    if (typeof window === 'undefined') return;
    
    const tokenKey = this.TOKEN_KEY_PREFIX + cvId;
    const usageKey = this.TOKEN_USAGE_KEY_PREFIX + cvId;
    
    try {
      sessionStorage.removeItem(tokenKey);
      sessionStorage.removeItem(usageKey);
      console.log(`[TokenManager] Token cleared for CV ${cvId}`);
    } catch (error) {
      console.error('[TokenManager] Failed to clear token:', error);
    }
  }

  // Xóa tất cả token
  static clearAllTokens(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.TOKEN_KEY_PREFIX) || key.startsWith(this.TOKEN_USAGE_KEY_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
      console.log('[TokenManager] All tokens cleared');
    } catch (error) {
      console.error('[TokenManager] Failed to clear all tokens:', error);
    }
  }

  // Setup listener để clear token khi chuyển tab/window
  private static setupVisibilityListener(cvId: number): void {
    if (typeof window === 'undefined') return;
    
    // Remove existing listener nếu có
    this.removeVisibilityListener();
    
    const handleVisibilityChange = async () => {
      console.log(`[TokenManager] Visibility changed - document.hidden: ${document.hidden}`);
      if (document.hidden) {
        // Tab bị ẩn (chuyển sang tab khác)
        console.log(`[TokenManager] Tab hidden, clearing token for CV ${cvId}`);
        
        // Gọi API để invalidate token trên server
        await this.invalidateTokenOnServer(cvId);
        
        // Clear token local
        TokenManager.clearToken(cvId);
      } else {
        console.log(`[TokenManager] Tab visible again for CV ${cvId}`);
      }
    };

    const handleBeforeUnload = async () => {
      // Trước khi rời khỏi trang
      console.log(`[TokenManager] Page unloading, clearing token for CV ${cvId}`);
      
      // Gọi API để invalidate token trên server
      await this.invalidateTokenOnServer(cvId);
      
      TokenManager.clearToken(cvId);
    };

    const handlePageHide = async () => {
      // Khi trang bị ẩn (chuyển tab, minimize window)
      console.log(`[TokenManager] Page hide event, clearing token for CV ${cvId}`);
      
      // Gọi API để invalidate token trên server
      await this.invalidateTokenOnServer(cvId);
      
      TokenManager.clearToken(cvId);
    };

    const handleFocusOut = async () => {
      // Khi window mất focus
      console.log(`[TokenManager] Window blur event, clearing token for CV ${cvId}`);
      
      // Gọi API để invalidate token trên server (với delay để tránh false positive)
      setTimeout(async () => {
        if (document.hidden) {
          await this.invalidateTokenOnServer(cvId);
          TokenManager.clearToken(cvId);
        }
      }, 100);
    };

    // Add multiple listeners để đảm bảo token bị clear
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleFocusOut);
    
    // Store references để có thể remove sau
    (window as any)[this.VISIBILITY_CHANGE_HANDLER] = {
      visibilityChange: handleVisibilityChange,
      beforeUnload: handleBeforeUnload,
      pageHide: handlePageHide,
      focusOut: handleFocusOut,
      cvId
    };

    console.log(`[TokenManager] Visibility listeners setup for CV ${cvId}`);
  }

  // Gọi API để invalidate token trên server
  private static async invalidateTokenOnServer(cvId: number): Promise<void> {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY_PREFIX + cvId);
      if (!token) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Gọi API invalidate token
      await fetch(`${baseUrl}/api/cv/invalidate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          cvId: cvId
        })
      });
      
      console.log(`[TokenManager] Token invalidated on server for CV ${cvId}`);
    } catch (error) {
      console.error('[TokenManager] Failed to invalidate token on server:', error);
    }
  }

  // Remove visibility listener
  private static removeVisibilityListener(): void {
    if (typeof window === 'undefined') return;
    
    const handler = (window as any)[this.VISIBILITY_CHANGE_HANDLER];
    if (handler) {
      document.removeEventListener('visibilitychange', handler.visibilityChange);
      window.removeEventListener('beforeunload', handler.beforeUnload);
      window.removeEventListener('pagehide', handler.pageHide);
      window.removeEventListener('blur', handler.focusOut);
      delete (window as any)[this.VISIBILITY_CHANGE_HANDLER];
      console.log(`[TokenManager] Visibility listeners removed for CV ${handler.cvId}`);
    }
  }

  // Validate token format
  static isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Token should be base64 URL-safe format, minimum 20 characters
    const tokenRegex = /^[A-Za-z0-9_-]{20,}$/;
    return tokenRegex.test(token);
  }

  // Get token info (for debugging)
  static getTokenInfo(cvId: number): { hasToken: boolean; isUsed: boolean; token?: string } {
    const token = this.getToken(cvId);
    const isUsed = this.isTokenUsed(cvId);
    
    return {
      hasToken: !!token,
      isUsed,
      token: token ? token.substring(0, 10) + '...' : undefined
    };
  }
}

// Hook để sử dụng trong React components
export const useTokenManager = (cvId?: number) => {
  const saveToken = (token: string) => {
    if (!cvId) throw new Error('CV ID is required');
    TokenManager.saveToken(cvId, token);
  };

  const getToken = () => {
    if (!cvId) return null;
    return TokenManager.getToken(cvId);
  };

  const markAsUsed = () => {
    if (!cvId) return;
    TokenManager.markTokenAsUsed(cvId);
  };

  const clearToken = () => {
    if (!cvId) return;
    TokenManager.clearToken(cvId);
  };

  const isUsed = () => {
    if (!cvId) return true;
    return TokenManager.isTokenUsed(cvId);
  };

  const getTokenInfo = () => {
    if (!cvId) return { hasToken: false, isUsed: true };
    return TokenManager.getTokenInfo(cvId);
  };

  return {
    saveToken,
    getToken,
    markAsUsed,
    clearToken,
    isUsed,
    getTokenInfo,
    isValidFormat: TokenManager.isValidTokenFormat
  };
};