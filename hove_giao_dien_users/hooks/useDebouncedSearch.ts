/**
 * useDebouncedSearch — Hook chống spam API khi user gõ liên tục
 *
 * Khi user gõ "developer" trong search input:
 * - KHÔNG CÓ debounce: 9 API calls (d, de, dev, deve, devel, ... developer)
 * - CÓ debounce 400ms:    1 API call  (sau khi user dừng gõ 400ms)
 *
 * Hiệu năng: Giảm ~90% API requests cho search
 */
import { useState, useEffect, useRef } from 'react';

/**
 * @param value - Giá trị hiện tại (thường là input value)
 * @param delay - Độ trễ ms trước khi debounced value update (default: 400ms)
 * @returns Giá trị đã debounce — chỉ update khi user ngừng gõ
 *
 * @example
 * const debouncedSearch = useDebouncedSearch(searchText);
 * useEffect(() => {
 *   if (debouncedSearch.length >= 2) {
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 */
export function useDebouncedSearch(
  value: string,
  delay: number = 400
): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Mỗi khi value thay đổi → reset timer
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: clear timer nếu value thay đổi trước khi delay xong
    // → chỉ gọi API khi user thực sự ngừng gõ
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedValue — Phiên bản generic cho bất kỳ giá trị nào
 *
 * @param value - Giá trị cần debounce
 * @param delay - Độ trễ ms
 */
export function useDebouncedValue<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback — Chỉ gọi callback SAU khi debounce xong
 *
 * @param callback - Function cần debounce
 * @param delay - Độ trễ ms
 *
 * @example
 * const debouncedSearch = useDebouncedCallback((text) => {
 *   api.search(text);
 * }, 400);
 *
 * // Khi user gõ → callback CHỈ được gọi sau 400ms không gõ
 * <Input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 400
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Cập nhật callback ref khi callback thay đổi
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return (...args: Parameters<T>) => {
    // Xóa timer cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Đặt timer mới
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };
}
