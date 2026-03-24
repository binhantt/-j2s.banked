// CV Security Middleware
export class CVSecurity {
  
  // Kiểm tra quyền truy cập CV
  static canAccessCV(cv: any, currentUserId: number, accessType: 'owner' | 'hr' = 'owner'): boolean {
    if (!cv || !currentUserId) {
      console.warn('CVSecurity: Missing CV or user ID');
      return false;
    }

    const isOwner = cv.userId === currentUserId;
    
    switch (cv.visibility) {
      case 'private':
        // Chỉ chủ sở hữu
        return isOwner;
        
      case 'application_only':
        // Chủ sở hữu hoặc HR có đơn ứng tuyển
        if (isOwner) return true;
        if (accessType === 'hr') {
          // TODO: Kiểm tra HR có đơn ứng tuyển từ candidate không
          return true; // Tạm thời cho phép HR
        }
        return false;
        
      case 'public':
        // Mọi người đều có thể xem (nhưng vẫn cần token)
        return true;
        
      default:
        console.warn('CVSecurity: Invalid visibility:', cv.visibility);
        return false;
    }
  }

  // Tạo secure URL với validation
  static buildSecureURL(filename: string, viewerId: number, token: string, embed: boolean = true): string {
    if (!filename || !viewerId || !token) {
      throw new Error('CVSecurity: Missing required parameters for secure URL');
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${baseUrl}/uploads/cv/${filename}?viewerId=${viewerId}&embed=${embed}&token=${token}`;
  }

  // Validate token format
  static isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Token should be base64 URL-safe format, minimum 20 characters
    const tokenRegex = /^[A-Za-z0-9_-]{20,}$/;
    return tokenRegex.test(token);
  }

  // Log security events
  static logSecurityEvent(event: string, details: any) {
    console.log(`[CV_SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Validate access attempt (basic version without token)
  static validateBasicAccess(cvId: number, viewerId: number): boolean {
    if (!cvId || !viewerId) {
      this.logSecurityEvent('INVALID_ACCESS_ATTEMPT', {
        cvId, viewerId, reason: 'Missing cvId or viewerId'
      });
      return false;
    }

    this.logSecurityEvent('BASIC_ACCESS_VALIDATED', {
      cvId, viewerId
    });
    return true;
  }

  // Validate access attempt (full version with token)
  static validateAccess(cvId: number, viewerId: number, token: string): boolean {
    if (!cvId || !viewerId || !token) {
      this.logSecurityEvent('INVALID_ACCESS_ATTEMPT', {
        cvId, viewerId, hasToken: !!token
      });
      return false;
    }

    if (!this.isValidTokenFormat(token)) {
      this.logSecurityEvent('INVALID_TOKEN_FORMAT', {
        cvId, viewerId, tokenLength: token?.length
      });
      return false;
    }

    this.logSecurityEvent('ACCESS_VALIDATED', {
      cvId, viewerId, tokenValid: true
    });
    return true;
  }

  // Check if URL is from trusted source
  static isTrustedReferrer(referrer?: string): boolean {
    if (!referrer) return true; // Allow null referrer for iframe

    const trustedDomains = [
      'localhost:3000',
      'localhost:8080',
      // Add your production domains here
    ];

    return trustedDomains.some(domain => referrer.includes(domain));
  }

  // Generate security headers for CV requests
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
}

// Hook để sử dụng trong React components
export const useCVSecurity = () => {
  const checkAccess = (cv: any, currentUserId: number, accessType: 'owner' | 'hr' = 'owner') => {
    return CVSecurity.canAccessCV(cv, currentUserId, accessType);
  };

  const buildSecureURL = (filename: string, viewerId: number, token: string, embed: boolean = true) => {
    return CVSecurity.buildSecureURL(filename, viewerId, token, embed);
  };

  const validateBasicAccess = (cvId: number, viewerId: number) => {
    return CVSecurity.validateBasicAccess(cvId, viewerId);
  };

  const validateAccess = (cvId: number, viewerId: number, token: string) => {
    return CVSecurity.validateAccess(cvId, viewerId, token);
  };

  return {
    checkAccess,
    buildSecureURL,
    validateBasicAccess,
    validateAccess,
    logSecurityEvent: CVSecurity.logSecurityEvent
  };
};