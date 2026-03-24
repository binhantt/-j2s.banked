import { useState, useEffect } from 'react';
import { companyApi, CompanyWithDomain, CompanyBasicInfo } from '@/lib/companyApi';

export const useCompanyWithDomain = (companyId?: number) => {
  const [company, setCompany] = useState<CompanyWithDomain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadCompany();
    }
  }, [companyId]);

  const loadCompany = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await companyApi.getCompanyWithDomain(companyId);
      setCompany(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin công ty');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  return { company, loading, error, refetch: loadCompany };
};

export const useCompanyWithDomainByHrId = (hrId?: number) => {
  const [company, setCompany] = useState<CompanyWithDomain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hrId) {
      loadCompany();
    }
  }, [hrId]);

  const loadCompany = async () => {
    if (!hrId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await companyApi.getCompanyWithDomainByHrId(hrId);
      setCompany(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin công ty');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  return { company, loading, error, refetch: loadCompany };
};

export const useCompanyBasicInfo = (companyId?: number) => {
  const [company, setCompany] = useState<CompanyBasicInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadCompany();
    }
  }, [companyId]);

  const loadCompany = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await companyApi.getCompanyBasicInfo(companyId);
      setCompany(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin công ty');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  return { company, loading, error, refetch: loadCompany };
};

export const useCompanyBasicInfoByHrId = (hrId?: number) => {
  const [company, setCompany] = useState<CompanyBasicInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hrId) {
      loadCompany();
    }
  }, [hrId]);

  const loadCompany = async () => {
    if (!hrId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await companyApi.getCompanyBasicInfoByHrId(hrId);
      setCompany(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin công ty');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  return { company, loading, error, refetch: loadCompany };
};