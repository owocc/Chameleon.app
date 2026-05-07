import { useState } from 'react'

function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  const hasTouchscreen = window.matchMedia('(pointer: coarse)').matches
  const isSmallScreen = window.innerWidth < 768
  const isMobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  return (hasTouchscreen && isSmallScreen) || isMobileUA
}

/**
 * 检测当前设备是否为手机端。
 * 用于自动过滤桌面模板，仅显示移动端模板。
 */
export function useIsMobile(): boolean {
  const [isMobile] = useState(() => checkIsMobile())
  return isMobile
}
